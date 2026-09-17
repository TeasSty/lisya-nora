import type { ProductCategory } from './categories'

export interface Product {
  id: number
  name: string
  description: string
  category: ProductCategory
  imageUrl: string | null
  /** Цена в рублях — только если она реально указана продавцом, иначе null. */
  priceRub: number | null
}

export interface AdminProduct extends Product {
  isActive: boolean
  sortOrder: number
  createdAt: string
}

/** Одна позиция в заявке (корзина может содержать несколько). */
export interface OrderItem {
  productId: number | null
  productName: string
  priceRub: number | null
  /** Количество; у старых заявок может отсутствовать (= 1). */
  quantity?: number
}

export interface AdminOrder {
  id: number
  name: string
  phone: string
  /** Первый товар / legacy — для совместимости со старыми заявками. */
  productId: number | null
  /** Сводка названий или единственный товар (legacy). */
  productName: string
  /** Полный список позиций; у старых заявок может отсутствовать. */
  items?: OrderItem[]
  comment: string
  status: 'new' | 'done'
  createdAt: string
}
