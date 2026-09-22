import { CART_MAX_QUANTITY, useCart } from '../../lib/cart'
import type { Product } from '../../lib/types'

interface AddToCartControlProps {
  product: Product
  /** Compact control for product cards; default is full-size (detail modal). */
  size?: 'sm' | 'md'
  className?: string
}

export function AddToCartControl({ product, size = 'md', className = '' }: AddToCartControlProps) {
  const { items, addProduct, setQuantity, count } = useCart()
  const quantity = items.find((item) => item.product.id === product.id)?.quantity ?? 0

  if (quantity <= 0) {
    return (
      <button
        type="button"
        className={`btn btn-primary${size === 'sm' ? ' btn-sm' : ''}${className ? ` ${className}` : ''}`}
        onClick={() => addProduct(product)}
      >
        В корзину
      </button>
    )
  }

  const stepperClass = [
    'qty-stepper',
    size === 'sm' ? 'qty-stepper--sm' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={stepperClass} role="group" aria-label={`В корзине: ${product.name}`}>
      <button
        type="button"
        className="qty-stepper__btn"
        aria-label={`Убрать одну единицу «${product.name}»`}
        onClick={() => setQuantity(product.id, quantity - 1)}
      >
        −
      </button>
      <span className="qty-stepper__value" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        className="qty-stepper__btn"
        aria-label={`Добавить ещё «${product.name}»`}
        disabled={quantity >= CART_MAX_QUANTITY}
        onClick={() => setQuantity(product.id, quantity + 1)}
      >
        +
      </button>
      {size === 'md' && (
        <span className="qty-stepper__hint" aria-live="polite">
          в корзине · всего {count}
        </span>
      )}
    </div>
  )
}
