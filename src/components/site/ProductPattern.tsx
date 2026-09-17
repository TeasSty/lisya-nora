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
      return (
        <g {...common}>
          <path d="M46 40 L60 24 L74 40 L60 62 Z" />
          <path d="M46 40 L74 40" />
          <path d="M54 40 L60 24 L66 40" />
          <path d="M54 40 L60 62" />
          <path d="M66 40 L60 62" />
        </g>
      )
    case 'forge':
      return (
        <g {...common}>
          <path d="M36 72 L52 56 L64 68 L48 84 Z" />
          <path d="M58 62 L74 46" />
          <rect x="70" y="30" width="20" height="14" rx="2" transform="rotate(45 80 37)" />
          <path d="M40 84 L32 92" />
        </g>
      )
    case 'curiosities':
      return (
        <g {...common}>
          <path d="M42 30 L36 18 M78 30 L84 18" />
          <path d="M38 52 C38 34 48 24 60 24 C72 24 82 34 82 52 C82 70 72 82 60 82 C48 82 38 70 38 52 Z" />
          <circle cx="50" cy="48" r="2.6" fill={stroke} stroke="none" />
          <circle cx="70" cy="48" r="2.6" fill={stroke} stroke="none" />
          <path d="M54 62 C57 66 63 66 66 62" />
        </g>
      )
    case 'charms':
      return (
        <g {...common}>
          <rect x="38" y="22" width="44" height="60" rx="8" />
          <path d="M60 40 L64 50 L74 50 L66 57 L69 68 L60 61 L51 68 L54 57 L46 50 L56 50 Z" />
        </g>
      )
    case 'decor':
      return (
        <g {...common}>
          <path d="M38 56 L60 34 L82 56" />
          <path d="M44 54 L44 80 L76 80 L76 54" />
          <path d="M56 80 L56 64 L64 64 L64 80" />
        </g>
      )
    default:
      return (
        <g {...common}>
          <rect x="36" y="42" width="48" height="38" rx="4" />
          <path d="M36 56 L84 56" />
          <path d="M60 42 L60 80" />
          <path d="M48 42 C48 32 54 26 60 26 C66 26 72 32 72 42" />
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
