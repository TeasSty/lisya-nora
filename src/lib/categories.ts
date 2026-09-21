/** Категории витрины — список Инны. Id стабильны; подписи правятся в админке. */
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

export type DefaultProductCategory = (typeof PRODUCT_CATEGORIES)[number]
/** Id категории — строка; в демо и live список может расширяться через админку. */
export type ProductCategory = string

export interface CategoryMeta {
  id: ProductCategory
  /** Название «комнаты» на карте норы */
  room: string
  /** Название категории в фильтрах и админке */
  label: string
  short: string
  sortOrder: number
}

export const DEFAULT_CATEGORIES: CategoryMeta[] = [
  {
    id: 'seeds',
    room: 'Домики-семена',
    label: 'Домики-семена',
    short: 'символы будущего дома',
    sortOrder: 10,
  },
  {
    id: 'ceramics',
    room: 'Керамика',
    label: 'Керамика',
    short: 'вазы, фигурки, панно',
    sortOrder: 20,
  },
  {
    id: 'forge',
    room: 'Работы кузнеца',
    label: 'Работы кузнеца',
    short: 'звери и фигуры из металла',
    sortOrder: 30,
  },
  {
    id: 'dolls',
    room: 'Куклы коллекционные',
    label: 'Куклы коллекционные',
    short: 'лисы, пони, куклы',
    sortOrder: 40,
  },
  {
    id: 'jewelry',
    room: 'Украшения',
    label: 'Украшения',
    short: 'броши, венки, осколки фарфора',
    sortOrder: 50,
  },
  {
    id: 'perfume',
    room: 'Духи',
    label: 'Духи',
    short: 'ароматы из Карелии',
    sortOrder: 60,
  },
  {
    id: 'wood',
    room: 'Дерево',
    label: 'Дерево',
    short: 'кедр и деревянные обереги',
    sortOrder: 70,
  },
  {
    id: 'candles',
    room: 'Свечи',
    label: 'Свечи',
    short: 'тёплый свет для дома',
    sortOrder: 80,
  },
  {
    id: 'highlights',
    room: 'Самое интересное',
    label: 'Самое интересное',
    short: 'избранные находки норы',
    sortOrder: 90,
  },
]

export const CATEGORY_META: Record<DefaultProductCategory, CategoryMeta> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((category) => [category.id, category]),
) as Record<DefaultProductCategory, CategoryMeta>

export const CATEGORY_ORDER: DefaultProductCategory[] = DEFAULT_CATEGORIES.map(
  (category) => category.id as DefaultProductCategory,
)

export function findCategoryMeta(
  id: string,
  categories: CategoryMeta[] = DEFAULT_CATEGORIES,
): CategoryMeta | undefined {
  return categories.find((category) => category.id === id) ?? CATEGORY_META[id as DefaultProductCategory]
}

export function categoryLabel(
  id: string,
  categories: CategoryMeta[] = DEFAULT_CATEGORIES,
): string {
  return findCategoryMeta(id, categories)?.label ?? id
}

/** Транслит id из названия при создании категории в админке. */
export function slugifyCategoryId(label: string): string {
  const map: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  }
  const lower = label.trim().toLowerCase()
  let out = ''
  for (const ch of lower) {
    if (map[ch] !== undefined) out += map[ch]
    else if (/[a-z0-9]/.test(ch)) out += ch
    else if (ch === ' ' || ch === '-' || ch === '_') out += '-'
  }
  return out.replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'category'
}
