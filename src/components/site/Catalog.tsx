import { useMemo, useState } from 'react'
import { type CategoryMeta, DEFAULT_CATEGORIES } from '../../lib/categories'
import type { Product } from '../../lib/types'
import type { RoomId } from './BurrowMap'
import { ProductCard } from './ProductCard'

interface CatalogProps {
  products: Product[]
  isLoading: boolean
  loadError: string | null
  selected: RoomId
  onSelect: (room: RoomId) => void
  onAddToCart: (product: Product) => void
  categories?: CategoryMeta[]
}

export function Catalog({
  products,
  isLoading,
  loadError,
  selected,
  onSelect,
  onAddToCart,
  categories = DEFAULT_CATEGORIES,
}: CatalogProps) {
  const [query, setQuery] = useState('')
  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  )

  const filtered = useMemo(() => {
    const byCategory = selected === 'all' ? products : products.filter((p) => p.category === selected)
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return byCategory
    return byCategory.filter(
      (p) => p.name.toLowerCase().includes(trimmed) || p.description.toLowerCase().includes(trimmed),
    )
  }, [products, selected, query])

  return (
    <div>
      <div className="catalog__toolbar">
        <div className="catalog__chips" role="group" aria-label="Категории товаров">
          <button
            type="button"
            className={`chip ${selected === 'all' ? 'is-active' : ''}`}
            aria-pressed={selected === 'all'}
            onClick={() => onSelect('all')}
          >
            Все
          </button>
          {sorted.map((category) => (
            <button
              type="button"
              key={category.id}
              className={`chip ${selected === category.id ? 'is-active' : ''}`}
              aria-pressed={selected === category.id}
              onClick={() => onSelect(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <label className="catalog__search">
          <span className="visually-hidden">Поиск по каталогу</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21 L16.5 16.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Найти в каталоге…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {isLoading && <p className="catalog__empty">Заглядываем на полки…</p>}

      {!isLoading && loadError && <p className="catalog__empty">{loadError}</p>}

      {!isLoading && !loadError && filtered.length === 0 && (
        <p className="catalog__empty">
          {query.trim()
            ? 'Ничего не нашлось — попробуйте другое слово или посмотрите другую комнату.'
            : 'В этой комнате пока пусто — заходите позже, полки уже наполняются.'}
        </p>
      )}

      {!isLoading && !loadError && filtered.length > 0 && (
        <div className="catalog__grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              categories={categories}
            />
          ))}
        </div>
      )}
    </div>
  )
}
