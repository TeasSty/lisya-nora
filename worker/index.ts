import { Hono, type MiddlewareHandler } from 'hono'
import { clearSessionCookie, createSessionCookie, isSessionValid, timingSafeEqual } from './auth.js'
import {
  isOzonDeliveryConfigured,
  searchOzonPvz,
} from './ozonDelivery.js'
import {
  PRODUCT_CATEGORIES,
  type CategoryRow,
  type OrderItemPayload,
  type OrderRow,
  type ProductRow,
} from './types.js'

interface Env {
  DB: D1Database
  ADMIN_PASSWORD: string
  SESSION_SECRET: string
  /** Ozon Delivery for Business — см. комментарии в worker/ozonDelivery.ts */
  OZON_DELIVERY_CLIENT_ID?: string
  OZON_DELIVERY_CLIENT_SECRET?: string
  OZON_DELIVERY_SCOPE?: string
}

/** Сжатые data URL в D1 без R2; для продакшена лучше вынести фото в R2. */
const MAX_IMAGE_URL_CHARS = 700_000
const MAX_IMAGE_URLS = 12

/** Мягкий лимит в памяти изолята; на проде лучше Cloudflare Rate Limiting. */
const RATE_WINDOWS_MS = 10 * 60 * 1000
const RATE_ORDERS_MAX = 5
const RATE_LOGIN_MAX = 10
const RATE_OZON_PVZ_MAX = 20

const app = new Hono<{ Bindings: Env }>()

const rateBuckets = new Map<string, { count: number; resetAt: number }>()

function clientIp(request: Request): string {
  // На Cloudflare CF-Connecting-IP ставит край — клиент не подделает.
  // X-Forwarded-For намеренно не используем (spoofable на Node без прокси).
  const cf = request.headers.get('CF-Connecting-IP')?.trim()
  if (cf) return cf
  const ray = request.headers.get('CF-Ray')?.trim()
  if (ray) return `ray:${ray}`
  const ua = request.headers.get('User-Agent')?.trim().slice(0, 96)
  return ua ? `ua:${ua}` : 'anon'
}

function requestIsSameOrigin(request: Request): boolean {
  const url = new URL(request.url)
  const expectedHost = url.host.toLowerCase()
  const check = (raw: string): boolean => {
    try {
      const parsed = new URL(raw)
      return parsed.host.toLowerCase() === expectedHost
    } catch {
      return false
    }
  }
  const origin = request.headers.get('Origin')?.trim()
  if (origin) return check(origin)
  const referer = request.headers.get('Referer')?.trim()
  if (referer) return check(referer)
  return false
}

function requireSameOrigin(request: Request): Response | null {
  const method = request.method.toUpperCase()
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return null
  if (!requestIsSameOrigin(request)) {
    return Response.json({ error: 'Некорректный источник запроса' }, { status: 403 })
  }
  return null
}

function secretsConfigured(env: Env): boolean {
  const secret = env.SESSION_SECRET?.trim() ?? ''
  const password = env.ADMIN_PASSWORD ?? ''
  return secret.length >= 16 && password.length > 0
}

function checkRateLimit(key: string, max: number): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now()
  const bucket = rateBuckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOWS_MS })
    return { ok: true }
  }
  if (bucket.count >= max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
  }
  bucket.count += 1
  return { ok: true }
}

function phoneDigitCount(phone: string): number {
  return phone.replace(/\D/g, '').length
}

function isHttps(request: Request): boolean {
  return new URL(request.url).protocol === 'https:'
}

function parseImageUrls(raw: string | null | undefined, fallback: string | null): string[] {
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) {
        const urls = parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        if (urls.length > 0) return urls
      }
    } catch {
      /* ignore */
    }
  }
  return fallback ? [fallback] : []
}

function normalizeImageUrls(value: unknown): string[] | { error: string } {
  if (value === null || value === undefined) return []
  if (!Array.isArray(value)) return { error: 'Некорректный список фото' }
  if (value.length > MAX_IMAGE_URLS) {
    return { error: `Слишком много фото (максимум ${MAX_IMAGE_URLS})` }
  }
  const urls: string[] = []
  for (const entry of value) {
    const result = normalizeImageUrl(entry)
    if (result && typeof result === 'object' && 'error' in result) return result
    if (typeof result === 'string') urls.push(result)
  }
  return urls
}

function toPublicProduct(row: ProductRow) {
  const imageUrls = parseImageUrls(row.image_urls, row.image_url)
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    imageUrl: imageUrls[0] ?? row.image_url,
    imageUrls,
    priceRub: row.price_rub,
  }
}

function toAdminProduct(row: ProductRow) {
  const imageUrls = parseImageUrls(row.image_urls, row.image_url)
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    imageUrl: imageUrls[0] ?? row.image_url,
    imageUrls,
    priceRub: row.price_rub,
    isActive: row.is_active === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }
}

function parsePriceRub(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num) || num < 0) return null
  return Math.round(num)
}

/** Только productId + quantity с клиента; имя/цена подставляются из D1. */
function parseOrderItemRefs(raw: unknown): Array<{ productId: number; quantity: number }> {
  if (!Array.isArray(raw)) return []
  const refs: Array<{ productId: number; quantity: number }> = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const record = entry as Record<string, unknown>
    const productId =
      typeof record.productId === 'number' && Number.isFinite(record.productId)
        ? Math.round(record.productId)
        : typeof record.productId === 'string' && /^\d+$/.test(record.productId.trim())
          ? Number(record.productId.trim())
          : null
    if (productId === null || productId <= 0) continue
    const quantity =
      typeof record.quantity === 'number' && Number.isFinite(record.quantity) && record.quantity > 0
        ? Math.min(99, Math.round(record.quantity))
        : 1
    refs.push({ productId, quantity })
  }
  return refs
}

function parseStoredOrderItems(raw: unknown): OrderItemPayload[] {
  if (!Array.isArray(raw)) return []
  const items: OrderItemPayload[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const record = entry as Record<string, unknown>
    const productName = typeof record.productName === 'string' ? record.productName.trim() : ''
    if (!productName || productName.length > 200) continue
    const productId =
      typeof record.productId === 'number' && Number.isFinite(record.productId) ? record.productId : null
    items.push({
      productId,
      productName,
      priceRub: parsePriceRub(record.priceRub),
      quantity:
        typeof record.quantity === 'number' && Number.isFinite(record.quantity) && record.quantity > 0
          ? Math.min(99, Math.round(record.quantity))
          : 1,
    })
  }
  return items
}

function parseItemsJson(raw: string | null): OrderItemPayload[] | undefined {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as unknown
    const items = parseStoredOrderItems(parsed)
    return items.length > 0 ? items : undefined
  } catch {
    return undefined
  }
}

async function resolveOrderItemsFromDb(
  db: D1Database,
  refs: Array<{ productId: number; quantity: number }>,
): Promise<{ ok: true; items: OrderItemPayload[] } | { ok: false; error: string }> {
  if (refs.length === 0) return { ok: false, error: 'Не выбран товар' }
  if (refs.length > 30) return { ok: false, error: 'Слишком много позиций в заявке' }

  const uniqueIds = [...new Set(refs.map((ref) => ref.productId))]
  const placeholders = uniqueIds.map(() => '?').join(', ')
  const { results } = await db
    .prepare(
      `SELECT id, name, price_rub FROM products WHERE is_active = 1 AND id IN (${placeholders})`,
    )
    .bind(...uniqueIds)
    .all<{ id: number; name: string; price_rub: number | null }>()

  const byId = new Map(results.map((row) => [row.id, row]))
  const items: OrderItemPayload[] = []
  for (const ref of refs) {
    const row = byId.get(ref.productId)
    if (!row) {
      return { ok: false, error: 'Один или несколько товаров недоступны. Обновите каталог и попробуйте снова.' }
    }
    items.push({
      productId: row.id,
      productName: row.name,
      priceRub: row.price_rub,
      quantity: ref.quantity,
    })
  }
  return { ok: true, items }
}

const CONTACT_CHANNELS = new Set(['vk', 'telegram', 'whatsapp', 'call', 'sms'])

function toAdminOrder(row: OrderRow) {
  const items = parseItemsJson(row.items_json)
  return {
    id: row.id,
    name: row.customer_name,
    phone: row.phone,
    city: row.city ?? '',
    address: row.address ?? '',
    pickupPoint: row.pickup_point ?? '',
    trackingNumber: row.tracking_number ?? '',
    contactChannel: row.contact_channel ?? '',
    contactHandle: row.contact_handle ?? '',
    productId: row.product_id,
    productName: row.product_name,
    ...(items ? { items } : {}),
    comment: row.comment,
    status: row.status,
    createdAt: row.created_at,
    vkUserId: row.vk_user_id,
    vkFirstName: row.vk_first_name,
    vkLastName: row.vk_last_name,
    vkAvatarUrl: row.vk_avatar_url,
    vkProfileUrl: row.vk_profile_url,
  }
}

function normalizeOptionalText(value: unknown, maxLen: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLen)
}

/** Клиентский профиль VK — не доверяем полностью, только обрезаем и проверяем форму. */
function parseVkProfile(body: Record<string, unknown>): {
  vkUserId: string | null
  vkFirstName: string | null
  vkLastName: string | null
  vkAvatarUrl: string | null
  vkProfileUrl: string | null
} {
  const vkUserId = normalizeOptionalText(body.vkUserId, 64)
  if (!vkUserId || !/^\d{1,20}$/.test(vkUserId)) {
    return {
      vkUserId: null,
      vkFirstName: null,
      vkLastName: null,
      vkAvatarUrl: null,
      vkProfileUrl: null,
    }
  }

  let vkAvatarUrl = normalizeOptionalText(body.vkAvatarUrl, 1000)
  if (vkAvatarUrl && !/^https:\/\//i.test(vkAvatarUrl)) vkAvatarUrl = null

  let vkProfileUrl = normalizeOptionalText(body.vkProfileUrl, 300)
  if (vkProfileUrl && !/^https:\/\/(m\.)?vk\.(com|ru)\//i.test(vkProfileUrl)) {
    vkProfileUrl = `https://vk.com/id${vkUserId}`
  } else if (!vkProfileUrl) {
    vkProfileUrl = `https://vk.com/id${vkUserId}`
  }

  return {
    vkUserId,
    vkFirstName: normalizeOptionalText(body.vkFirstName, 120),
    vkLastName: normalizeOptionalText(body.vkLastName, 120),
    vkAvatarUrl,
    vkProfileUrl,
  }
}

function toPublicCategory(row: CategoryRow) {
  return {
    id: row.id,
    label: row.label,
    room: row.room,
    short: row.short,
    sortOrder: row.sort_order,
  }
}

/** Транслит slug из русского названия (зеркало src/lib/categories.ts). */
function slugifyCategoryId(label: string): string {
  const map: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  }
  const lower = label.trim().toLowerCase()
  let out = ''
  for (const ch of lower) {
    if (map[ch] !== undefined) out += map[ch]
    else if (/[a-z0-9]/.test(ch)) out += ch
    else if (ch === ' ' || ch === '-' || ch === '_') out += '-'
  }
  return out.replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'category'
}

async function categoryExists(db: D1Database, id: string): Promise<boolean> {
  const row = await db.prepare('SELECT id FROM categories WHERE id = ?').bind(id).first<{ id: string }>()
  if (row) return true
  return (PRODUCT_CATEGORIES as readonly string[]).includes(id)
}

async function isValidCategory(db: D1Database, value: unknown): Promise<boolean> {
  return typeof value === 'string' && value.length > 0 && value.length <= 48 && (await categoryExists(db, value))
}

function normalizeImageUrl(value: unknown): string | null | { error: string } {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string') return { error: 'Некорректная ссылка на фото' }
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > MAX_IMAGE_URL_CHARS) {
    return { error: 'Фото слишком большое. Выберите файл поменьше или сожмите изображение.' }
  }
  if (trimmed.startsWith('data:image/') || /^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed
  }
  return { error: 'Укажите файл, http(s)-ссылку или путь к фото' }
}

// ---------- Публичные маршруты ----------

app.get('/api/products', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, name, description, category, image_url, image_urls, price_rub, is_active, sort_order, created_at FROM products WHERE is_active = 1 ORDER BY sort_order ASC, id ASC',
    ).all<ProductRow>()
    return c.json({ products: results.map(toPublicProduct) })
  } catch (error) {
    console.error('GET /api/products failed', error)
    return c.json({ error: 'Не удалось загрузить каталог' }, 500)
  }
})

app.get('/api/categories', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, label, room, short, sort_order FROM categories ORDER BY sort_order ASC, id ASC',
    ).all<CategoryRow>()
    if (results.length > 0) {
      return c.json({ categories: results.map(toPublicCategory) })
    }
    return c.json({
      categories: PRODUCT_CATEGORIES.map((id, index) => ({
        id,
        label: id,
        room: id,
        short: '',
        sortOrder: (index + 1) * 10,
      })),
    })
  } catch (error) {
    console.error('GET /api/categories failed', error)
    return c.json({ error: 'Не удалось загрузить категории' }, 500)
  }
})

app.get('/api/ozon/pvz/status', (c) => {
  return c.json({
    configured: isOzonDeliveryConfigured(c.env),
    mapUrl: 'https://www.ozon.ru/info/map/',
  })
})

app.get('/api/ozon/pvz', async (c) => {
  const limited = checkRateLimit(`ozon-pvz:${clientIp(c.req.raw)}`, RATE_OZON_PVZ_MAX)
  if (!limited.ok) {
    c.header('Retry-After', String(limited.retryAfterSec))
    return c.json(
      {
        error: 'Слишком много запросов к пунктам Ozon. Подождите немного или откройте карту.',
        code: 'rate_limited',
        configured: isOzonDeliveryConfigured(c.env),
        mapUrl: 'https://www.ozon.ru/info/map/',
        points: [],
      },
      429,
    )
  }

  const city = (c.req.query('city') ?? '').trim()
  if (city.length < 2) {
    return c.json({ error: 'Укажите город для поиска пункта выдачи' }, 400)
  }
  if (city.length > 120) {
    return c.json({ error: 'Слишком длинное название города' }, 400)
  }

  try {
    const result = await searchOzonPvz(c.env, city, c.executionCtx)
    if (!result.ok) {
      const status = result.code === 'not_configured' ? 503 : 502
      return c.json(
        {
          error: result.error,
          code: result.code,
          configured: false,
          mapUrl: 'https://www.ozon.ru/info/map/',
          points: [],
        },
        status,
      )
    }

    if ('warming' in result && result.warming) {
      return c.json({
        configured: true,
        warming: true,
        points: [],
        mapUrl: 'https://www.ozon.ru/info/map/',
        message:
          'Каталог пунктов Ozon обновляется. Подождите около минуты или выберите точку на карте.',
      })
    }

    return c.json({
      configured: true,
      warming: false,
      points: result.points,
      mapUrl: 'https://www.ozon.ru/info/map/',
    })
  } catch (error) {
    console.error('GET /api/ozon/pvz failed', error)
    return c.json(
      {
        error: 'Не удалось получить пункты выдачи Ozon',
        code: 'ozon_error',
        configured: isOzonDeliveryConfigured(c.env),
        mapUrl: 'https://www.ozon.ru/info/map/',
        points: [],
      },
      502,
    )
  }
})

app.post('/api/orders', async (c) => {
  const limited = checkRateLimit(`orders:${clientIp(c.req.raw)}`, RATE_ORDERS_MAX)
  if (!limited.ok) {
    c.header('Retry-After', String(limited.retryAfterSec))
    return c.json({ error: 'Слишком много заявок. Подождите немного и попробуйте снова.' }, 429)
  }

  try {
    const body = await c.req.json<{
      name?: unknown
      phone?: unknown
      city?: unknown
      address?: unknown
      pickupPoint?: unknown
      contactChannel?: unknown
      contactHandle?: unknown
      productId?: unknown
      productName?: unknown
      items?: unknown
      comment?: unknown
      vkUserId?: unknown
      vkFirstName?: unknown
      vkLastName?: unknown
      vkAvatarUrl?: unknown
      vkProfileUrl?: unknown
    }>()

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const city = typeof body.city === 'string' ? body.city.trim() : ''
    const address = typeof body.address === 'string' ? body.address.trim() : ''
    const pickupPoint = typeof body.pickupPoint === 'string' ? body.pickupPoint.trim() : ''
    const contactChannel =
      typeof body.contactChannel === 'string' ? body.contactChannel.trim().toLowerCase() : ''
    const contactHandle = typeof body.contactHandle === 'string' ? body.contactHandle.trim() : ''
    const comment = typeof body.comment === 'string' ? body.comment.trim() : ''
    const vk = parseVkProfile(body as Record<string, unknown>)

    let refs = parseOrderItemRefs(body.items)
    if (refs.length === 0) {
      const legacyId =
        typeof body.productId === 'number' && Number.isFinite(body.productId) && body.productId > 0
          ? Math.round(body.productId)
          : typeof body.productId === 'string' && /^\d+$/.test(body.productId.trim())
            ? Number(body.productId.trim())
            : null
      if (legacyId) refs = [{ productId: legacyId, quantity: 1 }]
    }

    if (!name || name.length > 120) {
      return c.json({ error: 'Укажите имя' }, 400)
    }
    const digits = phoneDigitCount(phone)
    if (!phone || phone.length > 40 || digits < 10 || digits > 15) {
      return c.json({ error: 'Укажите корректный телефон' }, 400)
    }
    if (!city || city.length > 120) {
      return c.json({ error: 'Укажите город получения' }, 400)
    }
    if (!address || address.length < 10 || address.length > 300 || !/\d/.test(address)) {
      return c.json({ error: 'Укажите точный адрес: улица и номер дома' }, 400)
    }
    if (!pickupPoint || pickupPoint.length < 12 || pickupPoint.length > 400 || !/\d/.test(pickupPoint)) {
      return c.json({ error: 'Укажите полный адрес пункта выдачи Ozon' }, 400)
    }
    if (!CONTACT_CHANNELS.has(contactChannel)) {
      return c.json({ error: 'Укажите предпочтительный канал связи' }, 400)
    }
    if (contactHandle.length > 200) {
      return c.json({ error: 'Слишком длинный ник или ссылка для связи' }, 400)
    }
    if (comment.length > 1000) {
      return c.json({ error: 'Комментарий слишком длинный' }, 400)
    }

    const resolved = await resolveOrderItemsFromDb(c.env.DB, refs)
    if (!resolved.ok) {
      return c.json({ error: resolved.error }, 400)
    }
    const items = resolved.items

    const productName = items
      .map((item) =>
        item.quantity && item.quantity > 1
          ? `${item.productName} × ${item.quantity}`
          : item.productName,
      )
      .join(', ')
    if (productName.length > 2000) {
      return c.json({ error: 'Слишком длинный список товаров' }, 400)
    }
    const productId = items.length === 1 ? items[0].productId : null
    const itemsJson = JSON.stringify(items)

    await c.env.DB.prepare(
      `INSERT INTO orders (
        customer_name, phone, city, address, pickup_point,
        contact_channel, contact_handle,
        product_id, product_name, items_json, comment, status,
        vk_user_id, vk_first_name, vk_last_name, vk_avatar_url, vk_profile_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        name,
        phone,
        city,
        address,
        pickupPoint,
        contactChannel,
        contactHandle,
        productId,
        productName,
        itemsJson,
        comment,
        'new',
        vk.vkUserId,
        vk.vkFirstName,
        vk.vkLastName,
        vk.vkAvatarUrl,
        vk.vkProfileUrl,
      )
      .run()

    return c.json({ ok: true })
  } catch (error) {
    console.error('POST /api/orders failed', error)
    return c.json({ error: 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.' }, 500)
  }
})

// ---------- Авторизация администратора ----------

app.post('/api/admin/login', async (c) => {
  const csrf = requireSameOrigin(c.req.raw)
  if (csrf) return csrf

  const limited = checkRateLimit(`login:${clientIp(c.req.raw)}`, RATE_LOGIN_MAX)
  if (!limited.ok) {
    c.header('Retry-After', String(limited.retryAfterSec))
    return c.json({ error: 'Слишком много попыток входа. Подождите и попробуйте снова.' }, 429)
  }

  try {
    if (!secretsConfigured(c.env)) {
      return c.json(
        { error: 'Админ не настроен: задайте ADMIN_PASSWORD и SESSION_SECRET (от 16 символов)' },
        500,
      )
    }

    const body = await c.req.json<{ password?: unknown }>()
    const password = typeof body.password === 'string' ? body.password : ''

    if (!password || !timingSafeEqual(password, c.env.ADMIN_PASSWORD)) {
      return c.json({ error: 'Неверный пароль' }, 401)
    }

    const cookie = await createSessionCookie(c.env.SESSION_SECRET, isHttps(c.req.raw))
    c.header('Set-Cookie', cookie)
    return c.json({ ok: true })
  } catch (error) {
    console.error('POST /api/admin/login failed', error)
    return c.json({ error: 'Не удалось выполнить вход' }, 500)
  }
})

app.post('/api/admin/logout', (c) => {
  const csrf = requireSameOrigin(c.req.raw)
  if (csrf) return csrf
  c.header('Set-Cookie', clearSessionCookie(isHttps(c.req.raw)))
  return c.json({ ok: true })
})

app.get('/api/admin/session', async (c) => {
  const valid =
    secretsConfigured(c.env) && (await isSessionValid(c.req.header('Cookie'), c.env.SESSION_SECRET))
  return c.json({ authenticated: valid })
})

// ---------- Защищённые маршруты панели администратора ----------

const requireAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  if (!secretsConfigured(c.env) || !(await isSessionValid(c.req.header('Cookie'), c.env.SESSION_SECRET))) {
    return c.json({ error: 'Требуется вход' }, 401)
  }
  const csrf = requireSameOrigin(c.req.raw)
  if (csrf) return csrf
  await next()
}

app.use('/api/admin/orders/*', requireAuth)
app.use('/api/admin/orders', requireAuth)
app.use('/api/admin/products/*', requireAuth)
app.use('/api/admin/products', requireAuth)
app.use('/api/admin/categories/*', requireAuth)
app.use('/api/admin/categories', requireAuth)

app.get('/api/admin/orders', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, customer_name, phone, city, address, pickup_point, tracking_number, contact_channel, contact_handle, product_id, product_name, items_json, comment, status, created_at, vk_user_id, vk_first_name, vk_last_name, vk_avatar_url, vk_profile_url FROM orders ORDER BY created_at DESC, id DESC',
    ).all<OrderRow>()
    return c.json({ orders: results.map(toAdminOrder) })
  } catch (error) {
    console.error('GET /api/admin/orders failed', error)
    return c.json({ error: 'Не удалось загрузить заявки' }, 500)
  }
})

app.patch('/api/admin/orders/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (!Number.isFinite(id)) return c.json({ error: 'Некорректный id' }, 400)

    const body = await c.req.json<{ status?: unknown; trackingNumber?: unknown }>()

    if (typeof body.trackingNumber === 'string') {
      const trackingNumber = body.trackingNumber.trim()
      if (trackingNumber.length > 120) {
        return c.json({ error: 'Слишком длинный трек-номер' }, 400)
      }
      const result = await c.env.DB.prepare('UPDATE orders SET tracking_number = ? WHERE id = ?')
        .bind(trackingNumber, id)
        .run()
      if (!result.meta.changes) return c.json({ error: 'Заявка не найдена' }, 404)
      return c.json({ ok: true })
    }

    const status = body.status
    if (status !== 'new' && status !== 'done') {
      return c.json({ error: 'Некорректный статус' }, 400)
    }

    const result = await c.env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?')
      .bind(status, id)
      .run()
    if (!result.meta.changes) return c.json({ error: 'Заявка не найдена' }, 404)
    return c.json({ ok: true })
  } catch (error) {
    console.error('PATCH /api/admin/orders/:id failed', error)
    return c.json({ error: 'Не удалось обновить заявку' }, 500)
  }
})

app.get('/api/admin/products', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, name, description, category, image_url, image_urls, price_rub, is_active, sort_order, created_at FROM products ORDER BY sort_order ASC, id ASC',
    ).all<ProductRow>()
    return c.json({ products: results.map(toAdminProduct) })
  } catch (error) {
    console.error('GET /api/admin/products failed', error)
    return c.json({ error: 'Не удалось загрузить товары' }, 500)
  }
})

app.post('/api/admin/products', async (c) => {
  try {
    const body = await c.req.json<{
      name?: unknown
      description?: unknown
      category?: unknown
      imageUrl?: unknown
      imageUrls?: unknown
      priceRub?: unknown
      isActive?: unknown
      sortOrder?: unknown
    }>()

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    const category = body.category
    const imageUrlsResult = normalizeImageUrls(
      body.imageUrls !== undefined
        ? body.imageUrls
        : body.imageUrl !== undefined && body.imageUrl !== null && body.imageUrl !== ''
          ? [body.imageUrl]
          : [],
    )
    if (imageUrlsResult && typeof imageUrlsResult === 'object' && 'error' in imageUrlsResult) {
      return c.json({ error: imageUrlsResult.error }, 400)
    }
    const imageUrls = imageUrlsResult
    const imageUrl = imageUrls[0] ?? null
    const imageUrlsJson = imageUrls.length > 0 ? JSON.stringify(imageUrls) : null
    const priceRub = parsePriceRub(body.priceRub)
    const isActive = body.isActive !== false
    const sortOrder = typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder) ? body.sortOrder : 0

    if (!name || name.length > 200) return c.json({ error: 'Укажите название товара' }, 400)
    if (!(await isValidCategory(c.env.DB, category))) return c.json({ error: 'Некорректная категория' }, 400)
    if (description.length > 1000) return c.json({ error: 'Описание слишком длинное' }, 400)

    const result = await c.env.DB.prepare(
      'INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id',
    )
      .bind(name, description, category, imageUrl, imageUrlsJson, priceRub, isActive ? 1 : 0, sortOrder)
      .first<{ id: number }>()

    return c.json({ ok: true, id: result?.id })
  } catch (error) {
    console.error('POST /api/admin/products failed', error)
    return c.json({ error: 'Не удалось создать товар' }, 500)
  }
})

app.put('/api/admin/products/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (!Number.isFinite(id)) return c.json({ error: 'Некорректный id' }, 400)

    const body = await c.req.json<{
      name?: unknown
      description?: unknown
      category?: unknown
      imageUrl?: unknown
      imageUrls?: unknown
      priceRub?: unknown
      isActive?: unknown
      sortOrder?: unknown
    }>()

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    const category = body.category
    const imageUrlsResult = normalizeImageUrls(
      body.imageUrls !== undefined
        ? body.imageUrls
        : body.imageUrl !== undefined && body.imageUrl !== null && body.imageUrl !== ''
          ? [body.imageUrl]
          : [],
    )
    if (imageUrlsResult && typeof imageUrlsResult === 'object' && 'error' in imageUrlsResult) {
      return c.json({ error: imageUrlsResult.error }, 400)
    }
    const imageUrls = imageUrlsResult
    const imageUrl = imageUrls[0] ?? null
    const imageUrlsJson = imageUrls.length > 0 ? JSON.stringify(imageUrls) : null
    const priceRub = parsePriceRub(body.priceRub)
    const isActive = body.isActive !== false
    const sortOrder = typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder) ? body.sortOrder : 0

    if (!name || name.length > 200) return c.json({ error: 'Укажите название товара' }, 400)
    if (!(await isValidCategory(c.env.DB, category))) return c.json({ error: 'Некорректная категория' }, 400)
    if (description.length > 1000) return c.json({ error: 'Описание слишком длинное' }, 400)

    const result = await c.env.DB.prepare(
      'UPDATE products SET name = ?, description = ?, category = ?, image_url = ?, image_urls = ?, price_rub = ?, is_active = ?, sort_order = ? WHERE id = ?',
    )
      .bind(name, description, category, imageUrl, imageUrlsJson, priceRub, isActive ? 1 : 0, sortOrder, id)
      .run()

    if (!result.meta.changes) return c.json({ error: 'Товар не найден' }, 404)
    return c.json({ ok: true })
  } catch (error) {
    console.error('PUT /api/admin/products/:id failed', error)
    return c.json({ error: 'Не удалось обновить товар' }, 500)
  }
})

app.delete('/api/admin/products/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'))
    if (!Number.isFinite(id)) return c.json({ error: 'Некорректный id' }, 400)

    const result = await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run()
    if (!result.meta.changes) return c.json({ error: 'Товар не найден' }, 404)
    return c.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/admin/products/:id failed', error)
    return c.json({ error: 'Не удалось удалить товар' }, 500)
  }
})

app.get('/api/admin/categories', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, label, room, short, sort_order FROM categories ORDER BY sort_order ASC, id ASC',
    ).all<CategoryRow>()
    return c.json({ categories: results.map(toPublicCategory) })
  } catch (error) {
    console.error('GET /api/admin/categories failed', error)
    return c.json({ error: 'Не удалось загрузить категории' }, 500)
  }
})

app.post('/api/admin/categories', async (c) => {
  try {
    const body = await c.req.json<{
      id?: unknown
      label?: unknown
      room?: unknown
      short?: unknown
      sortOrder?: unknown
    }>()

    const label = typeof body.label === 'string' ? body.label.trim() : ''
    const room =
      typeof body.room === 'string' && body.room.trim() ? body.room.trim() : label
    const short = typeof body.short === 'string' ? body.short.trim() : ''
    const sortOrder =
      typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder) ? Math.round(body.sortOrder) : 0
    let id = typeof body.id === 'string' ? body.id.trim().toLowerCase() : ''
    if (!id && label) {
      id = slugifyCategoryId(label)
      for (let n = 2; n < 1000 && (await categoryExists(c.env.DB, id)); n++) {
        const suffix = `-${n}`
        id = `${slugifyCategoryId(label).slice(0, Math.max(1, 48 - suffix.length))}${suffix}`
      }
    }

    if (!label || label.length > 80) return c.json({ error: 'Укажите название категории' }, 400)
    if (!/^[a-z][a-z0-9-]{1,47}$/.test(id)) {
      return c.json({ error: 'Id категории: латиница, цифры и дефис, от 2 символов' }, 400)
    }
    if (room.length > 80) return c.json({ error: 'Слишком длинное название комнаты' }, 400)
    if (short.length > 120) return c.json({ error: 'Слишком длинное описание' }, 400)

    try {
      await c.env.DB.prepare(
        'INSERT INTO categories (id, label, room, short, sort_order) VALUES (?, ?, ?, ?, ?)',
      )
        .bind(id, label, room, short, sortOrder)
        .run()
    } catch (error) {
      console.error('POST /api/admin/categories insert failed', error)
      return c.json({ error: 'Категория с таким id уже есть' }, 400)
    }

    return c.json({ ok: true, id })
  } catch (error) {
    console.error('POST /api/admin/categories failed', error)
    return c.json({ error: 'Не удалось создать категорию' }, 500)
  }
})

app.put('/api/admin/categories/:id', async (c) => {
  try {
    const id = c.req.param('id')
    if (!id) return c.json({ error: 'Некорректный id' }, 400)

    const body = await c.req.json<{
      label?: unknown
      room?: unknown
      short?: unknown
      sortOrder?: unknown
    }>()

    const label = typeof body.label === 'string' ? body.label.trim() : ''
    const room =
      typeof body.room === 'string' && body.room.trim() ? body.room.trim() : label
    const short = typeof body.short === 'string' ? body.short.trim() : ''
    const sortOrder =
      typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder) ? Math.round(body.sortOrder) : 0

    if (!label || label.length > 80) return c.json({ error: 'Укажите название категории' }, 400)
    if (room.length > 80) return c.json({ error: 'Слишком длинное название комнаты' }, 400)
    if (short.length > 120) return c.json({ error: 'Слишком длинное описание' }, 400)

    const result = await c.env.DB.prepare(
      'UPDATE categories SET label = ?, room = ?, short = ?, sort_order = ? WHERE id = ?',
    )
      .bind(label, room, short, sortOrder, id)
      .run()

    if (!result.meta.changes) return c.json({ error: 'Категория не найдена' }, 404)
    return c.json({ ok: true })
  } catch (error) {
    console.error('PUT /api/admin/categories/:id failed', error)
    return c.json({ error: 'Не удалось обновить категорию' }, 500)
  }
})

app.delete('/api/admin/categories/:id', async (c) => {
  try {
    const id = c.req.param('id')
    if (!id) return c.json({ error: 'Некорректный id' }, 400)

    const used = await c.env.DB.prepare('SELECT id FROM products WHERE category = ? LIMIT 1')
      .bind(id)
      .first<{ id: number }>()
    if (used) {
      return c.json(
        { error: 'Нельзя удалить: в категории есть товары. Сначала перенесите или удалите их.' },
        400,
      )
    }

    const result = await c.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run()
    if (!result.meta.changes) return c.json({ error: 'Категория не найдена' }, 404)
    return c.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/admin/categories/:id failed', error)
    return c.json({ error: 'Не удалось удалить категорию' }, 500)
  }
})

app.notFound((c) => c.json({ error: 'Не найдено' }, 404))

export default app
