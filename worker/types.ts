export const PRODUCT_CATEGORIES = [
  'seeds',
  'ceramics',
  'forge',
  'dolls',
  'jewelry',
  'perfume',
  'wood',
  'candles',
  'highlights',
] as const

/** Зеркало src/lib/categories.ts — аварийный ответ, если таблица categories пуста. */
export const DEFAULT_CATEGORIES_PUBLIC = [
  {
    id: 'seeds',
    label: 'Домики-семена',
    room: 'Домики-семена',
    short: 'символы будущего дома',
    sortOrder: 10,
  },
  {
    id: 'ceramics',
    label: 'Керамика',
    room: 'Керамика',
    short: 'вазы, фигурки, панно',
    sortOrder: 20,
  },
  {
    id: 'forge',
    label: 'Работы кузнеца',
    room: 'Работы кузнеца',
    short: 'звери и фигуры из металла',
    sortOrder: 30,
  },
  {
    id: 'dolls',
    label: 'Куклы коллекционные',
    room: 'Куклы коллекционные',
    short: 'лисы, пони, куклы',
    sortOrder: 40,
  },
  {
    id: 'jewelry',
    label: 'Украшения',
    room: 'Украшения',
    short: 'броши, венки, осколки фарфора',
    sortOrder: 50,
  },
  {
    id: 'perfume',
    label: 'Духи',
    room: 'Духи',
    short: 'ароматы из Карелии',
    sortOrder: 60,
  },
  {
    id: 'wood',
    label: 'Дерево',
    room: 'Дерево',
    short: 'кедр и деревянные обереги',
    sortOrder: 70,
  },
  {
    id: 'candles',
    label: 'Свечи',
    room: 'Свечи',
    short: 'тёплый свет для дома',
    sortOrder: 80,
  },
  {
    id: 'highlights',
    label: 'Самое интересное',
    room: 'Самое интересное',
    short: 'избранные находки норы',
    sortOrder: 90,
  },
] as const

export type ProductCategory = string

export interface CategoryRow {
  id: string
  label: string
  room: string
  short: string
  sort_order: number
}

export interface ProductRow {
  id: number
  name: string
  description: string
  category: ProductCategory
  image_url: string | null
  /** JSON-массив URL фото (карусель); может отсутствовать в старых БД до миграции. */
  image_urls?: string | null
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
  contact_channel: string | null
  contact_handle: string | null
  product_id: number | null
  product_name: string
  items_json: string | null
  comment: string
  status: 'new' | 'done'
  created_at: string
  vk_user_id: string | null
  vk_first_name: string | null
  vk_last_name: string | null
  vk_avatar_url: string | null
  vk_profile_url: string | null
}
