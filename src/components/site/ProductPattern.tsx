import type { ProductCategory } from '../../lib/categories'

interface ProductPatternProps {
  category: ProductCategory
  className?: string
}

const BLOB_BY_CATEGORY: Record<ProductCategory, string> = {
  jewelry: '#f0d9c6',
  forge: '#e4ddc3',
  curiosities: '#e6d7c2',
  charms: '#dee2cd',
  decor: '#f2ddc3',
  misc: '#ecdfca',
}

function CategoryIcon({ category, stroke = 'var(--color-ink)' }: { category: ProductCategory; stroke?: string }) {
  const common = {
    fill: 'none',
    stroke,
    strokeWidth: 3.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (category) {
    case 'jewelry':
      // Брошь / камень в оправе
      return (
        <g {...common}>
          <circle cx="60" cy="58" r="22" />
          <circle cx="60" cy="58" r="10" />
          <path d="M60 20 L60 36" />
          <path d="M48 28 L60 36 L72 28" />
          <path d="M52 48 L60 36 L68 48" />
        </g>
      )
    case 'forge':
      // Молот и наковальня
      return (
        <g {...common}>
          <path d="M30 84 H90" />
          <path d="M40 84 V70 H80 V84" />
          <path d="M48 70 H72 V58 H48 Z" />
          <path d="M66 56 L82 34" />
          <path d="M74 28 H98 V42 H86 Z" />
        </g>
      )
    case 'curiosities':
      // Лиса в профиль
      return (
        <g {...common}>
          <path d="M38 78 C38 52 48 34 68 34 C86 34 94 48 94 62 C94 78 82 88 66 88 C52 88 38 84 38 78 Z" />
          <path d="M68 34 L78 16 L86 34" />
          <path d="M56 34 L48 18 L62 34" />
          <circle cx="78" cy="56" r="2.8" fill={stroke} stroke="none" />
          <path d="M94 62 L108 54" />
          <path d="M70 72 C74 76 82 76 86 70" />
        </g>
      )
    case 'charms':
      // Талисман / оберег на шнурке
      return (
        <g {...common}>
          <path d="M60 18 C48 18 40 28 40 40 C40 50 48 56 60 62 C72 56 80 50 80 40 C80 28 72 18 60 18 Z" />
          <path d="M60 62 V92" />
          <circle cx="60" cy="42" r="8" />
          <path d="M60 34 V50 M52 42 H68" />
        </g>
      )
    case 'decor':
      // Ваза
      return (
        <g {...common}>
          <path d="M44 36 H76" />
          <path d="M48 36 C48 44 44 50 42 60 C40 74 46 90 60 90 C74 90 80 74 78 60 C76 50 72 44 72 36" />
          <path d="M52 28 H68 V36" />
          <path d="M50 54 H70" />
        </g>
      )
    default:
      // Флакон / диковинка
      return (
        <g {...common}>
          <path d="M52 28 H68 V40" />
          <path d="M56 18 H64 V28" />
          <path d="M44 40 H76 V52 C76 78 68 92 60 92 C52 92 44 78 44 52 Z" />
          <path d="M52 58 H68" />
        </g>
      )
  }
}

/** Иконка категории без подложки — используется в карте норы и чипах фильтра. */
export function CategoryGlyph({ category, className }: ProductPatternProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <CategoryIcon category={category} stroke="currentColor" />
    </svg>
  )
}

/**
 * Осознанная замена фотографии товара, пока реальных фото нет:
 * тёплое пятно фирменного цвета + рисованная иконка категории.
 * Как только появятся настоящие фотографии — просто укажите imageUrl
 * в панели администратора, и карточка покажет фото вместо этого узора.
 */
export function ProductPattern({ category, className }: ProductPatternProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <path
        d="M20 60 C20 30 40 14 62 16 C90 18 104 38 100 62 C96 88 74 104 50 100 C26 96 20 86 20 60 Z"
        fill={BLOB_BY_CATEGORY[category]}
      />
      <CategoryIcon category={category} />
    </svg>
  )
}
