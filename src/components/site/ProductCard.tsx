import { type CategoryMeta, categoryLabel, DEFAULT_CATEGORIES } from '../../lib/categories'
import type { Product } from '../../lib/types'
import { ProductCarousel } from './ProductCarousel'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  categories?: CategoryMeta[]
}

const PRICE_FORMATTER = new Intl.NumberFormat('ru-RU')

export function ProductCard({ product, onAddToCart, categories = DEFAULT_CATEGORIES }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card__media">
        <ProductCarousel product={product} />
      </div>
      <div className="product-card__body">
        <div className="product-card__top">
          <span className="product-card__category">{categoryLabel(product.category, categories)}</span>
          {product.priceRub !== null && (
            <span className="product-card__price">{PRICE_FORMATTER.format(product.priceRub)} ₽</span>
          )}
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => onAddToCart(product)}>
          В корзину
        </button>
      </div>
    </article>
  )
}
