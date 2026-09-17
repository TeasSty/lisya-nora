export const PRODUCT_CATEGORIES = [
  'jewelry',
  'watches',
  'curiosities',
  'charms',
  'decor',
  'misc',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

interface CategoryMeta {
  id: ProductCategory
  /** Название «комнаты» на карте норы */
  room: string
  /** Название категории в фильтрах и админке */
  label: string
  short: string
}

export const CATEGORY_META: Record<ProductCategory, CategoryMeta> = {
  jewelry: {
    id: 'jewelry',
    room: 'Шкатулка с украшениями',
    label: 'Украшения',
    short: 'украшения ручной работы',
  },
  watches: {
    id: 'watches',
    room: 'Часовой чулан',
    label: 'Часы',
    short: 'часы',
  },
  curiosities: {
    id: 'curiosities',
    room: 'Полка диковинок',
    label: 'Диковинки',
    short: 'старинные ключи, коллекционные редкости',
  },
  charms: {
    id: 'charms',
    room: 'Уголок оберегов',
    label: 'Обереги и подсказки судьбы',
    short: 'обереги, гадальные карты',
  },
  decor: {
    id: 'decor',
    room: 'Горница сувениров',
    label: 'Сувениры и декор',
    short: 'домики, магниты, декор',
  },
  misc: {
    id: 'misc',
    room: 'Общий ход',
    label: 'Разное',
    short: 'подарки на любой вкус',
  },
}

export const CATEGORY_ORDER: ProductCategory[] = [
  'jewelry',
  'watches',
  'curiosities',
  'charms',
  'decor',
  'misc',
]
