import type { LucideIcon } from 'lucide-react'
import { Amphora, FlaskConical, Gem, Hammer, Shield, Squirrel } from 'lucide-react'
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

/** Lucide (ISC): gem, hammer, squirrel, shield, amphora, flask — единый stroke-стиль. */
const ICON_BY_CATEGORY: Record<ProductCategory, LucideIcon> = {
  jewelry: Gem,
  forge: Hammer,
  curiosities: Squirrel,
  charms: Shield,
  decor: Amphora,
  misc: FlaskConical,
}

/** Иконка категории без подложки — карта норы и чипы фильтра. */
export function CategoryGlyph({ category, className }: ProductPatternProps) {
  const Icon = ICON_BY_CATEGORY[category]
  return <Icon className={className} aria-hidden="true" strokeWidth={2.25} />
}

/**
 * Fallback вместо фото: тёплое пятно + иконка Lucide.
 * При наличии imageUrl карточка показывает фото.
 */
export function ProductPattern({ category, className }: ProductPatternProps) {
  const Icon = ICON_BY_CATEGORY[category]
  return (
    <div className={className ? `product-pattern ${className}` : 'product-pattern'} aria-hidden="true">
      <svg className="product-pattern__blob" viewBox="0 0 120 120" aria-hidden="true">
        <path
          d="M20 60 C20 30 40 14 62 16 C90 18 104 38 100 62 C96 88 74 104 50 100 C26 96 20 86 20 60 Z"
          fill={BLOB_BY_CATEGORY[category]}
        />
      </svg>
      <Icon className="product-pattern__icon" size={44} strokeWidth={2.25} aria-hidden="true" />
    </div>
  )
}
