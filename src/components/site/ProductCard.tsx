import { CATEGORY_META } from '../../lib/categories'
import type { Product } from '../../lib/types'
import { ProductPattern } from './ProductPattern'

interface ProductCardProps {
  product: Product
  onOrder: (product: Product) => void
}

export function ProductCard({ product, onOrder }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card__media">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <ProductPattern category={product.category} />
        )}
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{CATEGORY_META[product.category].label}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => onOrder(product)}>
          Оставить заявку
        </button>
      </div>
    </article>
  )
}
