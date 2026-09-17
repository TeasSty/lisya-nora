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

export interface OrderRow {
  id: number
  customer_name: string
  phone: string
  product_id: number | null
  product_name: string
  comment: string
  status: 'new' | 'done'
  created_at: string
}
