export const PRODUCT_CATEGORIES = ['jewelry', 'forge', 'curiosities', 'charms', 'decor', 'misc'] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export interface ProductRow {
  id: number
  name: string
  description: string
  category: ProductCategory
  image_url: string | null
  price_rub: number | null
  is_active: number
  sort_order: number
  created_at: string
}

export interface OrderItemPayload {
  productId: number | null
  productName: string
  priceRub: number | null
  quantity?: number
}

export interface OrderRow {
  id: number
  customer_name: string
  phone: string
  city: string | null
  address: string | null
  pickup_point: string | null
  tracking_number: string | null
  product_id: number | null
  product_name: string
  items_json: string | null
  comment: string
  status: 'new' | 'done'
  created_at: string
}
