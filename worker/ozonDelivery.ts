/**
 * Прокси к Ozon Delivery for Business API (не Seller API).
 * Документация: https://docs.ozon.ru/api/ozon-delivery/
 *
 * Секреты (wrangler secret put / .dev.vars):
 *   OZON_DELIVERY_CLIENT_ID
 *   OZON_DELIVERY_CLIENT_SECRET
 * Опционально: OZON_DELIVERY_SCOPE (по умолчанию delivery-api.all)
 *
 * Ключи берутся в кабинете «Ozon Доставка для бизнеса» (частное приложение),
 * а не Client-Id/Api-Key из seller.ozon.ru.
 */

const TOKEN_URL = 'https://xapi.ozon.ru/oauth/token'
const API_BASE = 'https://api-delivery.ozon.ru'
const CATALOG_CACHE_URL = 'https://lisya-nora.internal/ozon-pvz-catalog-v2'
/** Как часто пытаемся обновить справочник в фоне (сутки). */
const CATALOG_REFRESH_AFTER_SEC = 86_400
/** Сколько хранить ответ в Cache API — по сути «пока не вытеснят». */
const CATALOG_STORE_MAX_AGE_SEC = 365 * 86_400
const LIST_PAGE_LIMIT = 100
const INFO_BATCH = 100
const MAX_LIST_PAGES = 80
const SEARCH_LIMIT = 40

/** Запасной снимок в памяти изолята, если Cache API пуст/вытеснен. */
let memoryCatalog: { fetchedAtMs: number; points: OzonPvzPoint[] } | null = null

export interface OzonDeliveryEnv {
  OZON_DELIVERY_CLIENT_ID?: string
  OZON_DELIVERY_CLIENT_SECRET?: string
  OZON_DELIVERY_SCOPE?: string
}

export interface OzonPvzPoint {
  id: number
  name: string
  address: string
  type: string
  isActive: boolean
  lat: number | null
  lon: number | null
}

interface TokenCache {
  accessToken: string
  expiresAtMs: number
}

let tokenCache: TokenCache | null = null

export function isOzonDeliveryConfigured(env: OzonDeliveryEnv): boolean {
  return Boolean(env.OZON_DELIVERY_CLIENT_ID?.trim() && env.OZON_DELIVERY_CLIENT_SECRET?.trim())
}

function scopesFromEnv(env: OzonDeliveryEnv): string[] {
  const raw = env.OZON_DELIVERY_SCOPE?.trim()
  if (!raw) return ['delivery-api.all']
  return raw.split(/[\s,]+/).filter(Boolean)
}

async function getAccessToken(env: OzonDeliveryEnv): Promise<string> {
  const clientId = env.OZON_DELIVERY_CLIENT_ID!.trim()
  const clientSecret = env.OZON_DELIVERY_CLIENT_SECRET!.trim()
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAtMs - now > 60_000) {
    return tokenCache.accessToken
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: scopesFromEnv(env),
    }),
  })

  const data = (await response.json().catch(() => null)) as {
    access_token?: unknown
    expires_in?: unknown
    message?: unknown
  } | null

  if (!response.ok || !data || typeof data.access_token !== 'string') {
    const detail = typeof data?.message === 'string' ? data.message : `HTTP ${response.status}`
    throw new Error(`Ozon OAuth: ${detail}`)
  }

  // В Delivery API expires_in — абсолютный Unix timestamp (сек).
  const expiresIn = data.expires_in
  let expiresAtMs: number
  if (typeof expiresIn === 'number' && Number.isFinite(expiresIn)) {
    expiresAtMs = expiresIn > 1_000_000_000 ? expiresIn * 1000 : now + expiresIn * 1000
  } else {
    expiresAtMs = now + 50 * 60 * 1000
  }

  tokenCache = { accessToken: data.access_token, expiresAtMs }
  return data.access_token
}

async function ozonPost(
  env: OzonDeliveryEnv,
  path: string,
  payload: Record<string, unknown>,
  cookieHeader?: string,
): Promise<{ data: Record<string, unknown>; setCookie: string | null }> {
  const token = await getAccessToken(env)
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
  if (cookieHeader) headers.Cookie = cookieHeader

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    redirect: 'manual',
  })

  // Ozon иногда отвечает 302/307 testcookie — повторяем с Cookie.
  if (response.status === 302 || response.status === 307) {
    const setCookie = response.headers.get('set-cookie')
    if (!setCookie) throw new Error('Ozon testcookie redirect без Set-Cookie')
    return ozonPost(env, path, payload, setCookie.split(';')[0])
  }

  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null
  if (!response.ok || !data) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : typeof (data?.error as { message?: unknown } | undefined)?.message === 'string'
          ? String((data!.error as { message: string }).message)
          : `HTTP ${response.status}`
    throw new Error(`Ozon API ${path}: ${message}`)
  }

  return { data, setCookie: response.headers.get('set-cookie') }
}

function parsePoint(row: Record<string, unknown>): OzonPvzPoint | null {
  const id = row.delivery_point_id
  const name = row.name
  const address = row.full_address
  const type = row.type
  const isActive = row.is_active
  if (
    typeof id !== 'number' ||
    !Number.isFinite(id) ||
    typeof name !== 'string' ||
    typeof address !== 'string' ||
    typeof type !== 'string' ||
    typeof isActive !== 'boolean'
  ) {
    return null
  }

  let lat: number | null = null
  let lon: number | null = null
  const coordinates = row.coordinates
  if (coordinates && typeof coordinates === 'object') {
    const c = coordinates as Record<string, unknown>
    if (typeof c.latitude === 'number' && typeof c.longitude === 'number') {
      lat = c.latitude
      lon = c.longitude
    }
  }

  return { id, name, address, type, isActive, lat, lon }
}

async function listPageIds(
  env: OzonDeliveryEnv,
  cursor: string | null,
): Promise<{ ids: number[]; nextCursor: string | null }> {
  const { data } = await ozonPost(env, '/v1/delivery-point/list', {
    pagination: { cursor, limit: LIST_PAGE_LIMIT },
  })

  const raw = data.delivery_points
  const ids: number[] = []
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue
      const id = (item as Record<string, unknown>).delivery_point_id
      if (typeof id === 'number' && Number.isFinite(id) && id > 0) ids.push(id)
    }
  }

  const next = data.next_cursor
  return { ids, nextCursor: typeof next === 'string' && next ? next : null }
}

async function infoPoints(env: OzonDeliveryEnv, ids: number[]): Promise<OzonPvzPoint[]> {
  if (ids.length === 0) return []
  const { data } = await ozonPost(env, '/v1/delivery-point/info', {
    delivery_point_ids: ids,
  })
  const raw = data.delivery_points
  const points: OzonPvzPoint[] = []
  if (!Array.isArray(raw)) return points
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const point = parsePoint(item as Record<string, unknown>)
    if (point) points.push(point)
  }
  return points
}

export async function buildOzonPvzCatalog(env: OzonDeliveryEnv): Promise<OzonPvzPoint[]> {
  const points: OzonPvzPoint[] = []
  let cursor: string | null = null

  for (let page = 0; page < MAX_LIST_PAGES; page++) {
    const { ids, nextCursor } = await listPageIds(env, cursor)
    if (ids.length === 0) break

    for (let i = 0; i < ids.length; i += INFO_BATCH) {
      const batch = ids.slice(i, i + INFO_BATCH)
      const batchPoints = await infoPoints(env, batch)
      for (const point of batchPoints) {
        if (point.isActive) points.push(point)
      }
    }

    if (!nextCursor) break
    cursor = nextCursor
  }

  return points
}

interface CatalogCachePayload {
  fetchedAt: string
  points: OzonPvzPoint[]
}

async function readCatalogCache(): Promise<{ points: OzonPvzPoint[]; fetchedAtMs: number } | null> {
  try {
    const cached = await caches.default.match(CATALOG_CACHE_URL)
    if (cached) {
      const data = (await cached.json()) as CatalogCachePayload | OzonPvzPoint[]
      if (Array.isArray(data) && data.length > 0) {
        const fetchedAtMs = Date.now()
        memoryCatalog = { fetchedAtMs, points: data }
        return { points: data, fetchedAtMs }
      }
      if (
        data &&
        !Array.isArray(data) &&
        Array.isArray(data.points) &&
        data.points.length > 0
      ) {
        const fetchedAtMs = Date.parse(data.fetchedAt) || Date.now()
        memoryCatalog = { fetchedAtMs, points: data.points }
        return { points: data.points, fetchedAtMs }
      }
    }
  } catch {
    // fall through to memory
  }

  if (memoryCatalog && memoryCatalog.points.length > 0) {
    return memoryCatalog
  }
  return null
}

async function writeCatalogCache(points: OzonPvzPoint[]): Promise<void> {
  if (points.length === 0) return

  const fetchedAt = new Date().toISOString()
  const fetchedAtMs = Date.parse(fetchedAt) || Date.now()
  memoryCatalog = { fetchedAtMs, points }

  try {
    const body = JSON.stringify({ fetchedAt, points } satisfies CatalogCachePayload)
    await caches.default.put(
      CATALOG_CACHE_URL,
      new Response(body, {
        headers: {
          'Content-Type': 'application/json',
          // Долгое хранение: поиск продолжает работать со «старым» списком,
          // даже если суточный лимит Ozon кончился.
          'Cache-Control': `public, max-age=${CATALOG_STORE_MAX_AGE_SEC}`,
        },
      }),
    )
  } catch (error) {
    console.error('Ozon PVZ catalog cache write failed', error)
  }
}

export async function refreshOzonPvzCatalog(env: OzonDeliveryEnv): Promise<void> {
  const points = await buildOzonPvzCatalog(env)
  // Пишем только успешный полный снимок — при ошибке API старый кэш не трогаем.
  await writeCatalogCache(points)
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase('ru-RU').replace(/\s+/g, ' ')
}

export function filterPvzByCity(points: OzonPvzPoint[], city: string): OzonPvzPoint[] {
  const needle = normalizeSearch(city)
  if (needle.length < 2) return []

  const scored: Array<{ point: OzonPvzPoint; score: number }> = []
  for (const point of points) {
    const hay = normalizeSearch(`${point.address} ${point.name}`)
    if (!hay.includes(needle)) continue
    // Адрес важнее названия точки
    const score = normalizeSearch(point.address).includes(needle) ? 2 : 1
    scored.push({ point, score })
  }

  scored.sort((a, b) => b.score - a.score || a.point.address.localeCompare(b.point.address, 'ru'))
  return scored.slice(0, SEARCH_LIMIT).map((row) => row.point)
}

export type PvzSearchResult =
  | { ok: true; points: OzonPvzPoint[]; cached: true; stale?: boolean }
  | { ok: true; points: []; warming: true }
  | { ok: false; error: string; code: 'not_configured' | 'ozon_error' }

function scheduleCatalogRefresh(
  env: OzonDeliveryEnv,
  executionCtx?: { waitUntil: (promise: Promise<unknown>) => void },
) {
  if (!executionCtx) return
  executionCtx.waitUntil(
    refreshOzonPvzCatalog(env).catch((error) => {
      console.error('Ozon PVZ catalog refresh failed', error)
    }),
  )
}

export async function searchOzonPvz(
  env: OzonDeliveryEnv,
  city: string,
  executionCtx?: { waitUntil: (promise: Promise<unknown>) => void },
): Promise<PvzSearchResult> {
  if (!isOzonDeliveryConfigured(env)) {
    return { ok: false, error: 'API Ozon Delivery не настроен', code: 'not_configured' }
  }

  const cached = await readCatalogCache()
  if (cached) {
    const ageSec = (Date.now() - cached.fetchedAtMs) / 1000
    const stale = ageSec > CATALOG_REFRESH_AFTER_SEC
    if (stale) {
      scheduleCatalogRefresh(env, executionCtx)
    }
    return {
      ok: true,
      points: filterPvzByCity(cached.points, city),
      cached: true,
      stale,
    }
  }

  // Первого снимка ещё нет — прогреваем; поиск пока пустой (есть fallback на карту).
  scheduleCatalogRefresh(env, executionCtx)
  return { ok: true, points: [], warming: true }
}
