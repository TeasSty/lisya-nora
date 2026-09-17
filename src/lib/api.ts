import type { ProductCategory } from './categories'
import { DEMO_MODE } from './config'
import { DEMO_PRODUCTS } from '../data/demoProducts'
import type { AdminOrder, AdminProduct, Product } from './types'

class ApiError extends Error {}

/** Небольшая задержка, чтобы состояния загрузки/отправки выглядели естественно в демо-режиме. */
function demoDelay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

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
  if (DEMO_MODE) return demoDelay({ products: DEMO_PRODUCTS }, 350)
  return request('/api/products')
}

export interface OrderPayload {
  name: string
  phone: string
  productId: number | null
  productName: string
  comment: string
}

export function submitOrder(payload: OrderPayload): Promise<{ ok: true }> {
  if (DEMO_MODE) {
    // Демо-этап: заявка не сохраняется на сервере, показываем только UX отправки.
    // Реальное сохранение появится вместе с панелью администратора (см. README).
    console.info('[демо] заявка получена (без сохранения на сервере):', payload)
    return demoDelay({ ok: true as const }, 700)
  }
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function adminLogin(password: string): Promise<{ ok: true }> {
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
  return request('/api/admin/orders')
}

export function updateOrderStatus(id: number, status: 'new' | 'done'): Promise<{ ok: true }> {
  return request(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
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
