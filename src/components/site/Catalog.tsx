import { CATEGORY_META, CATEGORY_ORDER } from '../../lib/categories'
import type { Product } from '../../lib/types'
import type { RoomId } from './BurrowMap'
import { ProductCard } from './ProductCard'

interface CatalogProps {
  products: Product[]
  isLoading: boolean
  loadError: string | null
  selected: RoomId
  onSelect: (room: RoomId) => void
  onOrder: (product: Product) => void
}

export function Catalog({ products, isLoading, loadError, selected, onSelect, onOrder }: CatalogProps) {
  const filtered = selected === 'all' ? products : products.filter((p) => p.category === selected)

  return (
    <div>
      <div className="catalog__chips" role="tablist" aria-label="Категории товаров">
        <button
          type="button"
          className={`chip ${selected === 'all' ? 'is-active' : ''}`}
          onClick={() => onSelect('all')}
        >
          Все
        </button>
        {CATEGORY_ORDER.map((category) => (
          <button
            type="button"
            key={category}
            className={`chip ${selected === category ? 'is-active' : ''}`}
            onClick={() => onSelect(category)}
          >
            {CATEGORY_META[category].label}
          </button>
        ))}
      </div>

      {isLoading && <p className="catalog__empty">Заглядываем на полки…</p>}

      {!isLoading && loadError && <p className="catalog__empty">{loadError}</p>}

      {!isLoading && !loadError && filtered.length === 0 && (
        <p className="catalog__empty">В этой комнате пока пусто — заходите позже, полки уже наполняются.</p>
      )}

      {!isLoading && !loadError && filtered.length > 0 && (
        <div className="catalog__grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onOrder={onOrder} />
          ))}
        </div>
      )}
    </div>
  )
}
