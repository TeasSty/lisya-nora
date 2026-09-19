import { Hono, type MiddlewareHandler } from 'hono'
import { clearSessionCookie, createSessionCookie, isSessionValid, timingSafeEqual } from './auth.js'
import {
  isOzonDeliveryConfigured,
  searchOzonPvz,
} from './ozonDelivery.js'
import {
  PRODUCT_CATEGORIES,
  type OrderItemPayload,
  type OrderRow,
  type ProductCategory,
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

/** Мягкий лимит в памяти изолята; на проде лучше Cloudflare Rate Limiting. */
const RATE_WINDOWS_MS = 10 * 60 * 1000
const RATE_ORDERS_MAX = 5
const RATE_LOGIN_MAX = 10

const app = new Hono<{ Bindings: Env }>()

const rateBuckets = new Map<string, { count: number; resetAt: number }>()

function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP')?.trim() || 'unknown'
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

function toPublicProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    imageUrl: row.image_url,
    priceRub: row.price_rub,
  }
}

function toAdminProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    imageUrl: row.image_url,
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
    productId: row.product_id,
    productName: row.product_name,
    ...(items ? { items } : {}),
    comment: row.comment,
    status: row.status,
    createdAt: row.created_at,
  }
}

function isValidCategory(value: unknown): value is ProductCategory {
  return typeof value === 'string' && (PRODUCT_CATEGORIES as readonly string[]).includes(value)
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
      'SELECT id, name, description, category, image_url, price_rub, is_active, sort_order, created_at FROM products WHERE is_active = 1 ORDER BY sort_order ASC, id ASC',
    ).all<ProductRow>()
    return c.json({ products: results.map(toPublicProduct) })
  } catch (error) {
    console.error('GET /api/products failed', error)
    return c.json({ error: 'Не удалось загрузить каталог' }, 500)
  }
})

app.get('/api/ozon/pvz/status', (c) => {
  return c.json({
    configured: isOzonDeliveryConfigured(c.env),
    mapUrl: 'https://www.ozon.ru/info/map/',
  })
})

app.get('/api/ozon/pvz', async (c) => {
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
      productId?: unknown
      productName?: unknown
      items?: unknown
      comment?: unknown
    }>()

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const city = typeof body.city === 'string' ? body.city.trim() : ''
    const address = typeof body.address === 'string' ? body.address.trim() : ''
    const pickupPoint = typeof body.pickupPoint === 'string' ? body.pickupPoint.trim() : ''
    const comment = typeof body.comment === 'string' ? body.comment.trim() : ''

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
      'INSERT INTO orders (customer_name, phone, city, address, pickup_point, product_id, product_name, items_json, comment, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(name, phone, city, address, pickupPoint, productId, productName, itemsJson, comment, 'new')
      .run()

    return c.json({ ok: true })
  } catch (error) {
    console.error('POST /api/orders failed', error)
    return c.json({ error: 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.' }, 500)
  }
})

// ---------- Авторизация администратора ----------

app.post('/api/admin/login', async (c) => {
  const limited = checkRateLimit(`login:${clientIp(c.req.raw)}`, RATE_LOGIN_MAX)
  if (!limited.ok) {
    c.header('Retry-After', String(limited.retryAfterSec))
    return c.json({ error: 'Слишком много попыток входа. Подождите и попробуйте снова.' }, 429)
  }

  try {
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
  c.header('Set-Cookie', clearSessionCookie(isHttps(c.req.raw)))
  return c.json({ ok: true })
})

app.get('/api/admin/session', async (c) => {
  const valid = await isSessionValid(c.req.header('Cookie'), c.env.SESSION_SECRET)
  return c.json({ authenticated: valid })
})

// ---------- Защищённые маршруты панели администратора ----------

const requireAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const valid = await isSessionValid(c.req.header('Cookie'), c.env.SESSION_SECRET)
  if (!valid) {
    return c.json({ error: 'Требуется вход' }, 401)
  }
  await next()
}

app.use('/api/admin/orders/*', requireAuth)
app.use('/api/admin/orders', requireAuth)
app.use('/api/admin/products/*', requireAuth)
app.use('/api/admin/products', requireAuth)

app.get('/api/admin/orders', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, customer_name, phone, city, address, pickup_point, tracking_number, product_id, product_name, items_json, comment, status, created_at FROM orders ORDER BY created_at DESC, id DESC',
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
      await c.env.DB.prepare('UPDATE orders SET tracking_number = ? WHERE id = ?')
        .bind(trackingNumber, id)
        .run()
      return c.json({ ok: true })
    }

    const status = body.status
    if (status !== 'new' && status !== 'done') {
      return c.json({ error: 'Некорректный статус' }, 400)
    }

    await c.env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(status, id).run()
    return c.json({ ok: true })
  } catch (error) {
    console.error('PATCH /api/admin/orders/:id failed', error)
    return c.json({ error: 'Не удалось обновить заявку' }, 500)
  }
})

app.get('/api/admin/products', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, name, description, category, image_url, price_rub, is_active, sort_order, created_at FROM products ORDER BY sort_order ASC, id ASC',
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
      priceRub?: unknown
      isActive?: unknown
      sortOrder?: unknown
    }>()

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    const category = body.category
    const imageResult = normalizeImageUrl(body.imageUrl)
    if (imageResult && typeof imageResult === 'object' && 'error' in imageResult) {
      return c.json({ error: imageResult.error }, 400)
    }
    const imageUrl = imageResult
    const priceRub = parsePriceRub(body.priceRub)
    const isActive = body.isActive !== false
    const sortOrder = typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder) ? body.sortOrder : 0

    if (!name || name.length > 200) return c.json({ error: 'Укажите название товара' }, 400)
    if (!isValidCategory(category)) return c.json({ error: 'Некорректная категория' }, 400)
    if (description.length > 1000) return c.json({ error: 'Описание слишком длинное' }, 400)

    const result = await c.env.DB.prepare(
      'INSERT INTO products (name, description, category, image_url, price_rub, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id',
    )
      .bind(name, description, category, imageUrl, priceRub, isActive ? 1 : 0, sortOrder)
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
      priceRub?: unknown
      isActive?: unknown
      sortOrder?: unknown
    }>()

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    const category = body.category
    const imageResult = normalizeImageUrl(body.imageUrl)
    if (imageResult && typeof imageResult === 'object' && 'error' in imageResult) {
      return c.json({ error: imageResult.error }, 400)
    }
    const imageUrl = imageResult
    const priceRub = parsePriceRub(body.priceRub)
    const isActive = body.isActive !== false
    const sortOrder = typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder) ? body.sortOrder : 0

    if (!name || name.length > 200) return c.json({ error: 'Укажите название товара' }, 400)
    if (!isValidCategory(category)) return c.json({ error: 'Некорректная категория' }, 400)
    if (description.length > 1000) return c.json({ error: 'Описание слишком длинное' }, 400)

    await c.env.DB.prepare(
      'UPDATE products SET name = ?, description = ?, category = ?, image_url = ?, price_rub = ?, is_active = ?, sort_order = ? WHERE id = ?',
    )
      .bind(name, description, category, imageUrl, priceRub, isActive ? 1 : 0, sortOrder, id)
      .run()

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

    await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run()
    return c.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/admin/products/:id failed', error)
    return c.json({ error: 'Не удалось удалить товар' }, 500)
  }
})

app.notFound((c) => c.json({ error: 'Не найдено' }, 404))

export default app
