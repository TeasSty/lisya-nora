import type { ProductCategory } from './categories'

export interface Product {
  id: number
  name: string
  description: string
  category: ProductCategory
  /** Обложка / первое фото (обратная совместимость). */
  imageUrl: string | null
  /** Все фото карусели; если пусто — берём imageUrl. */
  imageUrls?: string[]
  /** Цена в рублях — только если она реально указана продавцом, иначе null. */
  priceRub: number | null
}

/** Список URL фото для карточки / админки. */
export function productImageList(product: Pick<Product, 'imageUrl' | 'imageUrls'>): string[] {
  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    return product.imageUrls.filter((url) => typeof url === 'string' && url.trim().length > 0)
  }
  return product.imageUrl ? [product.imageUrl] : []
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
  /** Город получения (для Ozon). */
  city?: string
  /** Точный адрес клиента (улица, дом — чтобы не путать ПВЗ). */
  address?: string
  /** Адрес / название пункта выдачи Ozon. */
  pickupPoint?: string
  /** Трек-номер после оформления отправки. */
  trackingNumber?: string
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
