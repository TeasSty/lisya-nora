import type { ProductCategory } from '../../lib/categories'

interface ProductPatternProps {
  category: ProductCategory
  className?: string
}

const BLOB_BY_CATEGORY: Record<ProductCategory, string> = {
  jewelry: '#f0d9c6',
  watches: '#e4ddc3',
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
    case 'watches':
      return (
        <g {...common}>
          <circle cx="60" cy="52" r="24" />
          <path d="M60 52 L60 38" />
          <path d="M60 52 L70 58" />
          <path d="M52 20 L68 20" />
          <path d="M55 20 L55 28" />
          <path d="M65 20 L65 28" />
        </g>
      )
    case 'curiosities':
      return (
        <g {...common}>
          <circle cx="44" cy="34" r="10" />
          <path d="M51 41 L78 68" />
          <path d="M68 58 L74 52" />
          <path d="M74 64 L82 56" />
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
