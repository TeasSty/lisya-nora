// Категории подобраны под реальный ассортимент магазина (см. товары сообщества
// ВКонтакте vk.com/lissi_nora) — не шаблонный список "украшения/часы/сувениры".
export const PRODUCT_CATEGORIES = ['jewelry', 'forge', 'curiosities', 'charms', 'decor', 'misc'] as const

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
    short: 'броши, венки, осколки фарфора',
  },
  forge: {
    id: 'forge',
    room: 'Кузница',
    label: 'Кованые фигуры',
    short: 'звери и фигуры из металла',
  },
  curiosities: {
    id: 'curiosities',
    room: 'Полка зверят',
    label: 'Куклы и зверята',
    short: 'лисы, пони, куклы — коллекционные',
  },
  charms: {
    id: 'charms',
    room: 'Уголок оберегов',
    label: 'Обереги и талисманы',
    short: 'кедровые обереги, символы дома',
  },
  decor: {
    id: 'decor',
    room: 'Горница керамики',
    label: 'Керамика и панно',
    short: 'вазы, лошадки, панно для дома',
  },
  misc: {
    id: 'misc',
    room: 'Общий ход',
    label: 'Разное',
    short: 'то, что не поместилось в комнаты',
  },
}

export const CATEGORY_ORDER: ProductCategory[] = ['jewelry', 'forge', 'curiosities', 'charms', 'decor', 'misc']
