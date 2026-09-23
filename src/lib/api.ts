import type { CategoryMeta, ProductCategory } from './categories'
import { normalizeAdminOrder, summarizeProductNames } from './orderItems'
import type { AdminOrder, AdminProduct, OrderItem, Product } from './types'

class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null

  if (!response.ok) {
    throw new ApiError(data?.error ?? 'Что-то пошло не так. Попробуйте ещё раз.')
  }

  return data as T
}

export { ApiError }

export function fetchProducts(): Promise<{ products: Product[] }> {
  return request('/api/products')
}

export function fetchCategories(): Promise<{ categories: CategoryMeta[] }> {
  return request('/api/categories')
}

export interface OrderPayload {
  name: string
  phone: string
  city: string
  address: string
  pickupPoint: string
  /** Предпочтительный канал: vk | telegram | whatsapp | call | sms */
  contactChannel: string
  /** Ник / ссылка для канала (необязательно). */
  contactHandle?: string
  comment: string
  /** Новые заявки: список позиций из корзины. */
  items: OrderItem[]
  /** Legacy-поля для совместимости со старым API. */
  productId?: number | null
  productName?: string
  /** Опциональный профиль VK ID (гость без входа — поля не передаём). */
  vkUserId?: string
  vkFirstName?: string
  vkLastName?: string
  vkAvatarUrl?: string
  vkProfileUrl?: string
}

function normalizeOptionalText(value: unknown, maxLen: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLen)
}

function normalizeOrderPayload(payload: OrderPayload): {
  name: string
  phone: string
  city: string
  address: string
  pickupPoint: string
  contactChannel: string
  contactHandle: string
  comment: string
  items: OrderItem[]
  productId: number | null
  productName: string
  vkUserId: string | null
  vkFirstName: string | null
  vkLastName: string | null
  vkAvatarUrl: string | null
  vkProfileUrl: string | null
} {
  const items =
    payload.items?.length > 0
      ? payload.items.map((item) => ({
          productId: item.productId ?? null,
          productName: item.productName.trim(),
          priceRub: item.priceRub ?? null,
          quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
        }))
      : payload.productName
        ? [
            {
              productId: payload.productId ?? null,
              productName: payload.productName.trim(),
              priceRub: null,
              quantity: 1,
            },
          ]
        : []

  const validItems = items.filter((item) => item.productName.length > 0)
  const productName = summarizeProductNames(validItems)
  const productId = validItems.length === 1 ? validItems[0].productId : null

  const vkUserId = normalizeOptionalText(payload.vkUserId, 64)
  const vkFirstName = vkUserId ? normalizeOptionalText(payload.vkFirstName, 120) : null
  const vkLastName = vkUserId ? normalizeOptionalText(payload.vkLastName, 120) : null
  const vkAvatarUrl = vkUserId ? normalizeOptionalText(payload.vkAvatarUrl, 1000) : null
  const vkProfileUrl = vkUserId ? normalizeOptionalText(payload.vkProfileUrl, 300) : null

  return {
    name: payload.name,
    phone: payload.phone,
    city: payload.city?.trim() ?? '',
    address: payload.address?.trim() ?? '',
    pickupPoint: payload.pickupPoint?.trim() ?? '',
    contactChannel: payload.contactChannel?.trim() ?? '',
    contactHandle: payload.contactHandle?.trim() ?? '',
    comment: payload.comment,
    items: validItems,
    productId,
    productName,
    vkUserId,
    vkFirstName,
    vkLastName,
    vkAvatarUrl,
    vkProfileUrl,
  }
}

export interface OzonPvzStatus {
  configured: boolean
  mapUrl: string
}

export interface OzonPvzSearchResponse {
  configured: boolean
  warming: boolean
  points: Array<{
    id: number
    name: string
    address: string
    type: string
    isActive: boolean
    lat: number | null
    lon: number | null
  }>
  mapUrl: string
  message?: string
  error?: string
  code?: string
}

export function fetchOzonPvzStatus(): Promise<OzonPvzStatus> {
  return request('/api/ozon/pvz/status')
}

export async function searchOzonPvz(city: string): Promise<OzonPvzSearchResponse> {
  const query = city.trim()
  const response = await fetch(`/api/ozon/pvz?city=${encodeURIComponent(query)}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  })
  const data = (await response.json().catch(() => null)) as OzonPvzSearchResponse | null

  if (!data) {
    throw new ApiError('Не удалось загрузить пункты выдачи Ozon')
  }

  // 503 (не настроен) и 502 (ошибка Ozon) отдаём в UI как обычный ответ с fallback на карту.
  if (!response.ok && response.status !== 503 && response.status !== 502) {
    throw new ApiError(data.error ?? 'Не удалось загрузить пункты выдачи Ozon')
  }

  return {
    configured: Boolean(data.configured),
    warming: Boolean(data.warming),
    points: Array.isArray(data.points) ? data.points : [],
    mapUrl: data.mapUrl || 'https://www.ozon.ru/info/map/',
    message: data.message,
    error: data.error,
    code: data.code,
  }
}

export function submitOrder(payload: OrderPayload): Promise<{ ok: true }> {
  const normalized = normalizeOrderPayload(payload)
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(normalized),
  })
}

export async function adminLogin(password: string): Promise<{ ok: true }> {
  return request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export function adminLogout(): Promise<{ ok: true }> {
  return request('/api/admin/logout', { method: 'POST' })
}

export function adminSession(): Promise<{ authenticated: boolean }> {
  return request('/api/admin/session')
}

export function fetchAdminOrders(): Promise<{ orders: AdminOrder[] }> {
  return request('/api/admin/orders').then((res) => ({
    orders: (res as { orders: AdminOrder[] }).orders.map((order) => normalizeAdminOrder(order)),
  }))
}

export function updateOrderStatus(id: number, status: 'new' | 'done'): Promise<{ ok: true }> {
  return request(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function updateOrderTracking(id: number, trackingNumber: string): Promise<{ ok: true }> {
  return request(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ trackingNumber: trackingNumber.trim() }),
  })
}

export function fetchAdminProducts(): Promise<{ products: AdminProduct[] }> {
  return request('/api/admin/products')
}

export interface ProductInput {
  name: string
  description: string
  category: ProductCategory
  imageUrl: string
  /** Все фото карусели; если пусто — используется imageUrl. */
  imageUrls?: string[]
  priceRub: number | null
  isActive: boolean
  sortOrder: number
}

export function createAdminProduct(payload: ProductInput): Promise<{ ok: true; id: number }> {
  return request('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAdminProduct(id: number, payload: ProductInput): Promise<{ ok: true }> {
  return request(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteAdminProduct(id: number): Promise<{ ok: true }> {
  return request(`/api/admin/products/${id}`, { method: 'DELETE' })
}

export function fetchAdminCategories(): Promise<{ categories: CategoryMeta[] }> {
  return request('/api/admin/categories')
}

export interface CategoryInput {
  id?: string
  room?: string
  label: string
  short: string
  sortOrder: number
}

export function createAdminCategory(payload: CategoryInput): Promise<{ ok: true; id: string }> {
  return request('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAdminCategory(id: string, payload: CategoryInput): Promise<{ ok: true }> {
  return request(`/api/admin/categories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteAdminCategory(id: string): Promise<{ ok: true }> {
  return request(`/api/admin/categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
