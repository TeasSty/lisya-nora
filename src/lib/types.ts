import type { ProductCategory } from './categories'

export interface Product {
  id: number
  name: string
  description: string
  category: ProductCategory
  imageUrl: string | null
}

export interface AdminProduct extends Product {
  isActive: boolean
  sortOrder: number
  createdAt: string
}

export interface AdminOrder {
  id: number
  name: string
  phone: string
  productId: number | null
  productName: string
  comment: string
  status: 'new' | 'done'
  createdAt: string
}
