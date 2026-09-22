import { useEffect, useId, useRef } from 'react'
import { type CategoryMeta, categoryLabel, DEFAULT_CATEGORIES } from '../../lib/categories'
import type { Product } from '../../lib/types'
import { ProductCarousel } from './ProductCarousel'

interface ProductDetailModalProps {
  product: Product
  initialImageIndex?: number
  onClose: () => void
  onAddToCart: (product: Product) => void
  categories?: CategoryMeta[]
}

const PRICE_FORMATTER = new Intl.NumberFormat('ru-RU')

export function ProductDetailModal({
  product,
  initialImageIndex = 0,
  onClose,
  onAddToCart,
  categories = DEFAULT_CATEGORIES,
}: ProductDetailModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.querySelector<HTMLElement>('button.modal-panel__close')?.focus()
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [onClose])

  return (
    <div
      className="modal-overlay product-detail-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="modal-panel product-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
      >
        <button
          type="button"
          className="modal-panel__close"
          onClick={onClose}
          aria-label="Закрыть товар"
        >
          ×
        </button>

        <div className="product-detail__gallery">
          <ProductCarousel
            product={product}
            className="product-carousel--detail"
            initialIndex={initialImageIndex}
          />
        </div>

        <div className="product-detail__body">
          <div className="product-detail__meta">
            <span className="product-card__category">{categoryLabel(product.category, categories)}</span>
            {product.priceRub !== null && (
              <span className="product-card__price">{PRICE_FORMATTER.format(product.priceRub)} ₽</span>
            )}
          </div>
          <h3 id={titleId}>{product.name}</h3>
          {product.description.trim() && <p className="product-detail__desc">{product.description}</p>}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onAddToCart(product)
            }}
          >
            В корзину
          </button>
        </div>
      </div>
    </div>
  )
}
