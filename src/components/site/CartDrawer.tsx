import { useEffect, useId, useRef } from 'react'
import { useCart } from '../../lib/cart'

const PRICE_FORMATTER = new Intl.NumberFormat('ru-RU')

export function CartDrawer() {
  const { items, isOpen, closeCart, removeProduct, clear, openCheckout, count } = useCart()
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.querySelector<HTMLElement>('button')?.focus()
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeCart()
        return
      }

      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return

      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, a[href], input, textarea, select',
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
  }, [isOpen, closeCart])

  if (!isOpen) return null

  return (
    <div
      className="cart-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeCart()
      }}
    >
      <div
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
      >
        <div className="cart-drawer__head">
          <h2 id={titleId}>Корзина{count > 0 ? ` · ${count}` : ''}</h2>
          <button type="button" className="modal-panel__close" onClick={closeCart} aria-label="Закрыть корзину">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <p className="cart-drawer__empty">Пока пусто — добавьте находки из каталога.</p>
        ) : (
          <>
            <ul className="cart-drawer__list">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="cart-drawer__item">
                  <div className="cart-drawer__item-main">
                    <strong>{product.name}</strong>
                    <span>
                      {quantity > 1 ? `${quantity} шт.` : '1 шт.'}
                      {product.priceRub != null
                        ? ` · ${PRICE_FORMATTER.format(product.priceRub)} ₽`
                        : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeProduct(product.id)}
                    aria-label={`Убрать «${product.name}» из корзины`}
                  >
                    Убрать
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-drawer__actions">
              <button type="button" className="btn btn-primary" onClick={openCheckout}>
                Оформить заявку
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
                Очистить корзину
              </button>
            </div>
            <p className="cart-drawer__note">
              Без оплаты онлайн — оставляете заявку, и мы свяжемся с вами.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
