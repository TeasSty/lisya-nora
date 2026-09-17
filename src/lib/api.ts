import type { ProductCategory } from './categories'
import { DEMO_MODE } from './config'
import { DEMO_PRODUCTS } from '../data/demoProducts'
import type { AdminOrder, AdminProduct, Product } from './types'

class ApiError extends Error {}

const DEMO_SESSION_KEY = 'lisya-nora-demo-admin'
const DEMO_PRODUCTS_KEY = 'lisya-nora-demo-products'
const DEMO_ORDERS_KEY = 'lisya-nora-demo-orders'
/** Пароль только для локального демо-просмотра панели. В проде пароль живёт на сервере. */
export const DEMO_ADMIN_PASSWORD = 'lisya'

function demoDelay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function isDemoAuthenticated(): boolean {
  return sessionStorage.getItem(DEMO_SESSION_KEY) === '1'
}

function requireDemoAuth(): void {
  if (!isDemoAuthenticated()) {
    throw new ApiError('Нужно войти в панель')
  }
}

function toAdminProducts(products: Product[]): AdminProduct[] {
  return products.map((product, index) => ({
    ...product,
    isActive: true,
    sortOrder: index,
    createdAt: new Date().toISOString(),
  }))
}

function readDemoProducts(): AdminProduct[] {
  try {
    const raw = localStorage.getItem(DEMO_PRODUCTS_KEY)
    if (raw) return JSON.parse(raw) as AdminProduct[]
  } catch {
    /* ignore */
  }
  const seeded = toAdminProducts(DEMO_PRODUCTS)
  localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(seeded))
  return seeded
}

function writeDemoProducts(products: AdminProduct[]): void {
  localStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(products))
}

function readDemoOrders(): AdminOrder[] {
  try {
    const raw = localStorage.getItem(DEMO_ORDERS_KEY)
    if (raw) return JSON.parse(raw) as AdminOrder[]
  } catch {
    /* ignore */
  }
  return []
}

function writeDemoOrders(orders: AdminOrder[]): void {
  localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(orders))
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
  if (DEMO_MODE) {
    const products = readDemoProducts()
      .filter((p) => p.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ isActive: _a, sortOrder: _s, createdAt: _c, ...product }) => product)
    return demoDelay({ products }, 350)
  }
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
    const orders = readDemoOrders()
    const next: AdminOrder = {
      id: Date.now(),
      name: payload.name,
      phone: payload.phone,
      productId: payload.productId,
      productName: payload.productName,
      comment: payload.comment,
      status: 'new',
      createdAt: new Date().toISOString(),
    }
    writeDemoOrders([next, ...orders])
    return demoDelay({ ok: true as const }, 700)
  }
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function adminLogin(password: string): Promise<{ ok: true }> {
  if (DEMO_MODE) {
    await demoDelay(null, 400)
    if (password.trim() !== DEMO_ADMIN_PASSWORD) {
      throw new ApiError('Неверный пароль. Для демо используйте: lisya')
    }
    sessionStorage.setItem(DEMO_SESSION_KEY, '1')
    return { ok: true as const }
  }
  return request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export function adminLogout(): Promise<{ ok: true }> {
  if (DEMO_MODE) {
    sessionStorage.removeItem(DEMO_SESSION_KEY)
    return demoDelay({ ok: true as const }, 200)
  }
  return request('/api/admin/logout', { method: 'POST' })
}

export function adminSession(): Promise<{ authenticated: boolean }> {
  if (DEMO_MODE) return demoDelay({ authenticated: isDemoAuthenticated() }, 150)
  return request('/api/admin/session')
}

export function fetchAdminOrders(): Promise<{ orders: AdminOrder[] }> {
  if (DEMO_MODE) {
    requireDemoAuth()
    return demoDelay({ orders: readDemoOrders() }, 300)
  }
  return request('/api/admin/orders')
}

export function updateOrderStatus(id: number, status: 'new' | 'done'): Promise<{ ok: true }> {
  if (DEMO_MODE) {
    requireDemoAuth()
    const orders = readDemoOrders().map((order) => (order.id === id ? { ...order, status } : order))
    writeDemoOrders(orders)
    return demoDelay({ ok: true as const }, 250)
  }
  return request(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function fetchAdminProducts(): Promise<{ products: AdminProduct[] }> {
  if (DEMO_MODE) {
    requireDemoAuth()
    return demoDelay(
      {
        products: [...readDemoProducts()].sort((a, b) => a.sortOrder - b.sortOrder),
      },
      300,
    )
  }
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
  if (DEMO_MODE) {
    requireDemoAuth()
    const products = readDemoProducts()
    const id = Date.now()
    products.push({
      id,
      ...payload,
      imageUrl: payload.imageUrl || null,
      createdAt: new Date().toISOString(),
    })
    writeDemoProducts(products)
    return demoDelay({ ok: true as const, id }, 350)
  }
  return request('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAdminProduct(id: number, payload: ProductInput): Promise<{ ok: true }> {
  if (DEMO_MODE) {
    requireDemoAuth()
    const products = readDemoProducts().map((product) =>
      product.id === id
        ? {
            ...product,
            ...payload,
            imageUrl: payload.imageUrl || null,
          }
        : product,
    )
    writeDemoProducts(products)
    return demoDelay({ ok: true as const }, 350)
  }
  return request(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteAdminProduct(id: number): Promise<{ ok: true }> {
  if (DEMO_MODE) {
    requireDemoAuth()
    writeDemoProducts(readDemoProducts().filter((product) => product.id !== id))
    return demoDelay({ ok: true as const }, 250)
  }
  return request(`/api/admin/products/${id}`, { method: 'DELETE' })
}
