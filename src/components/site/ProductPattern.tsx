import type { ProductCategory } from '../../lib/categories'
import { assetPath } from '../../lib/assetPath'

interface ProductPatternProps {
  category: ProductCategory
  className?: string
}

const BLOB_BY_CATEGORY: Record<string, string> = {
  seeds: '#dee2cd',
  ceramics: '#f2ddc3',
  forge: '#e4ddc3',
  dolls: '#e6d7c2',
  jewelry: '#f0d9c6',
  perfume: '#e8d5e0',
  wood: '#e5d4bc',
  candles: '#f0e0c0',
  highlights: '#ecd9c8',
}

const DEFAULT_BLOB = '#ecdfca'

/**
 * Иконки комнат норы — SVG (часть из Game-icons.net CC BY 3.0,
 * см. public/icons/rooms/ATTRIBUTION.md).
 * Маска + currentColor: terracotta на креме, светлые на активной кнопке.
 */
export function CategoryGlyph({ category, className }: ProductPatternProps) {
  const url = assetPath(`icons/rooms/${category}.svg`)
  return (
    <span
      className={className ? `category-glyph ${className}` : 'category-glyph'}
      style={{
        WebkitMaskImage: `url("${url}")`,
        maskImage: `url("${url}")`,
      }}
      aria-hidden="true"
    />
  )
}

/**
 * Fallback вместо фото: тёплое пятно + иконка категории.
 * При наличии imageUrl карточка показывает фото.
 */
export function ProductPattern({ category, className }: ProductPatternProps) {
  return (
    <div className={className ? `product-pattern ${className}` : 'product-pattern'} aria-hidden="true">
      <svg className="product-pattern__blob" viewBox="0 0 120 120" aria-hidden="true">
        <path
          d="M20 60 C20 30 40 14 62 16 C90 18 104 38 100 62 C96 88 74 104 50 100 C26 96 20 86 20 60 Z"
          fill={BLOB_BY_CATEGORY[category] ?? DEFAULT_BLOB}
        />
      </svg>
      <CategoryGlyph category={category} className="product-pattern__icon" />
    </div>
  )
}
