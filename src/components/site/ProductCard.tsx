import { CATEGORY_META } from '../../lib/categories'
import type { Product } from '../../lib/types'
import { ProductPattern } from './ProductPattern'

interface ProductCardProps {
  product: Product
  onOrder: (product: Product) => void
}

const PRICE_FORMATTER = new Intl.NumberFormat('ru-RU')

export function ProductCard({ product, onOrder }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card__media">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" decoding="async" />
        ) : (
          <ProductPattern category={product.category} />
        )}
      </div>
      <div className="product-card__body">
        <div className="product-card__top">
          <span className="product-card__category">{CATEGORY_META[product.category].label}</span>
          {product.priceRub !== null && (
            <span className="product-card__price">{PRICE_FORMATTER.format(product.priceRub)} ₽</span>
          )}
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => onOrder(product)}>
          Оставить заявку
        </button>
      </div>
    </article>
  )
}
