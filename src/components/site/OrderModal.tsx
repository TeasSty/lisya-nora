import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { ApiError, submitOrder } from '../../lib/api'
import { formatOrderItemLine, productsToOrderItems } from '../../lib/orderItems'
import type { Product } from '../../lib/types'

export interface CheckoutProduct extends Product {
  quantity?: number
}

interface OrderModalProps {
  products: CheckoutProduct[]
  onClose: () => void
  onSuccess?: () => void
}

export function OrderModal({ products, onClose, onSuccess }: OrderModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.querySelector<HTMLElement>('input')?.focus()
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
        'button, input, textarea, select, a[href]',
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Подскажите, как к вам обращаться')
      return
    }
    if (phone.trim().length < 5) {
      setError('Проверьте номер телефона')
      return
    }
    if (products.length === 0) {
      setError('Добавьте хотя бы один товар')
      return
    }

    setStatus('submitting')
    try {
      await submitOrder({
        name: name.trim(),
        phone: phone.trim(),
        comment: comment.trim(),
        items: productsToOrderItems(products),
      })
      setStatus('done')
      onSuccess?.()
    } catch (err) {
      setStatus('idle')
      setError(err instanceof ApiError ? err.message : 'Не удалось отправить заявку')
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panelRef}>
        <button type="button" className="modal-panel__close" onClick={onClose} aria-label="Закрыть форму">
          ×
        </button>

        {status === 'done' ? (
          <div className="form-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 12.5 L9.5 18 L20 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 id={titleId}>Заявка отправлена</h3>
            <p>
              Мы свяжемся с вами по телефону {phone}. Если вопрос срочный — звоните сами:{' '}
              <a href="tel:+79213326427">+7 921 332-64-27</a>.
            </p>
            <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={onClose}>
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <h3 id={titleId}>Оставить заявку</h3>
            <div className="modal-panel__products" aria-label="Выбранные товары">
              <p className="modal-panel__product">
                {products.length === 1 ? 'Товар:' : `Товары (${products.length}):`}
              </p>
              <ul className="modal-panel__product-list">
                {products.map((product) => (
                  <li key={product.id}>
                    {formatOrderItemLine({
                      productId: product.id,
                      productName: product.name,
                      priceRub: product.priceRub,
                      quantity: product.quantity ?? 1,
                    })}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="order-name">Ваше имя</label>
                <input
                  id="order-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="order-phone">Телефон</label>
                <input
                  id="order-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+7 900 000-00-00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="order-comment">Комментарий (необязательно)</label>
                <textarea
                  id="order-comment"
                  placeholder="Например: нужен другой размер, могу забрать сегодня после 17:00"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="btn btn-primary" disabled={status === 'submitting'} style={{ width: '100%' }}>
                {status === 'submitting' ? 'Отправляем…' : 'Отправить заявку'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
