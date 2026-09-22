import { useCallback, useState } from 'react'
import { type CategoryMeta, categoryLabel, DEFAULT_CATEGORIES } from '../../lib/categories'
import type { Product } from '../../lib/types'
import { ProductCarousel } from './ProductCarousel'
import { ProductDetailModal } from './ProductDetailModal'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  categories?: CategoryMeta[]
}

const PRICE_FORMATTER = new Intl.NumberFormat('ru-RU')

export function ProductCard({ product, onAddToCart, categories = DEFAULT_CATEGORIES }: ProductCardProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [openAtIndex, setOpenAtIndex] = useState(0)

  const openDetail = useCallback((index: number) => {
    setOpenAtIndex(index)
    setDetailOpen(true)
  }, [])

  return (
    <>
      <article className="product-card">
        <div className="product-card__media">
          <ProductCarousel
            product={product}
            onActivate={openDetail}
            onIndexChange={setGalleryIndex}
          />
        </div>
        <div className="product-card__body">
          <div className="product-card__top">
            <span className="product-card__category">{categoryLabel(product.category, categories)}</span>
            {product.priceRub !== null && (
              <span className="product-card__price">{PRICE_FORMATTER.format(product.priceRub)} ₽</span>
            )}
          </div>
          <h3>
            <button
              type="button"
              className="product-card__title-btn"
              onClick={() => openDetail(galleryIndex)}
            >
              {product.name}
            </button>
          </h3>
          {product.description.trim() && (
            <button
              type="button"
              className="product-card__desc-btn"
              onClick={() => openDetail(galleryIndex)}
            >
              {product.description}
            </button>
          )}
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onAddToCart(product)}>
            В корзину
          </button>
        </div>
      </article>

      {detailOpen && (
        <ProductDetailModal
          product={product}
          initialImageIndex={openAtIndex}
          categories={categories}
          onClose={() => setDetailOpen(false)}
          onAddToCart={onAddToCart}
        />
      )}
    </>
  )
}
