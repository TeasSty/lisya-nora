import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, submitOrder } from '../../lib/api'
import { MERCHANT } from '../../lib/merchant'
import { formatOrderItemLine, productsToOrderItems } from '../../lib/orderItems'
import { isCompleteAddress, isCompletePickupPoint } from '../../lib/ozonShipment'
import type { Product } from '../../lib/types'

export interface CheckoutProduct extends Product {
  quantity?: number
}

interface OrderModalProps {
  products: CheckoutProduct[]
  onClose: () => void
  onSuccess?: () => void
}

const CONSENT_ERROR = 'Нужно согласие на обработку персональных данных'

type FieldKey = 'name' | 'phone' | 'city' | 'address' | 'pickupPoint' | 'consent'

type FieldErrors = Partial<Record<FieldKey, string>>

export function OrderModal({ products, onClose, onSuccess }: OrderModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [pickupPoint, setPickupPoint] = useState('')
  const [comment, setComment] = useState('')
  const [consent, setConsent] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const consentId = useId()

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

  function clearFieldError(key: FieldKey) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    const nextErrors: FieldErrors = {}
    if (!name.trim()) {
      nextErrors.name = 'Подскажите, как к вам обращаться'
    }
    if (phone.trim().length < 5) {
      nextErrors.phone = 'Проверьте номер телефона'
    }
    if (city.trim().length < 2) {
      nextErrors.city = 'Укажите город получения'
    }
    if (!isCompleteAddress(address)) {
      nextErrors.address = 'Укажите точный адрес: улица и номер дома'
    }
    if (!isCompletePickupPoint(pickupPoint)) {
      nextErrors.pickupPoint = 'Укажите полный адрес пункта выдачи Ozon'
    }
    if (!consent) {
      nextErrors.consent = CONSENT_ERROR
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    if (products.length === 0) {
      setFieldErrors({})
      setFormError('Добавьте хотя бы один товар')
      return
    }

    setFieldErrors({})
    setStatus('submitting')
    try {
      await submitOrder({
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
        pickupPoint: pickupPoint.trim(),
        comment: comment.trim(),
        items: productsToOrderItems(products),
      })
      setStatus('done')
      onSuccess?.()
    } catch (err) {
      setStatus('idle')
      setFormError(err instanceof ApiError ? err.message : 'Не удалось отправить заявку')
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
              Перезвоним на {phone} {MERCHANT.responsePromise} ({MERCHANT.hours}).
            </p>
            <p className="form-success__soft">
              Доставка Ozon по выбранному ПВЗ или самовывоз: {MERCHANT.addressShort}.
            </p>
            <p>
              Срочно —{' '}
              <a href={`tel:${MERCHANT.phoneTel}`}>{MERCHANT.phoneDisplay}</a>.
            </p>
            <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={onClose}>
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <h3 id={titleId}>Оставить заявку</h3>
            <p className="modal-panel__hint">
              Укажите адрес и пункт выдачи Ozon — так проще оформить отправку. Наличие подтвердим при звонке.
            </p>
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

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="order-name">Ваше имя</label>
                <input
                  id="order-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'order-name-error' : undefined}
                  onChange={(e) => {
                    setName(e.target.value)
                    clearFieldError('name')
                  }}
                />
                {fieldErrors.name && (
                  <p className="form-error form-error--field" id="order-name-error" role="alert">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="order-phone">Телефон</label>
                <input
                  id="order-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+7 900 000-00-00"
                  value={phone}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={fieldErrors.phone ? 'order-phone-error' : undefined}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    clearFieldError('phone')
                  }}
                />
                {fieldErrors.phone && (
                  <p className="form-error form-error--field" id="order-phone-error" role="alert">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="order-city">Город получения</label>
                <input
                  id="order-city"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Например: Мурманск"
                  value={city}
                  aria-invalid={Boolean(fieldErrors.city)}
                  aria-describedby={fieldErrors.city ? 'order-city-error' : undefined}
                  onChange={(e) => {
                    setCity(e.target.value)
                    clearFieldError('city')
                  }}
                />
                {fieldErrors.city && (
                  <p className="form-error form-error--field" id="order-city-error" role="alert">
                    {fieldErrors.city}
                  </p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="order-address">Точный адрес (улица, дом)</label>
                <input
                  id="order-address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="ул. Ленина, д. 12, кв. 5"
                  value={address}
                  aria-invalid={Boolean(fieldErrors.address)}
                  aria-describedby={fieldErrors.address ? 'order-address-error' : undefined}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    clearFieldError('address')
                  }}
                />
                <p className="field-hint">Нужен полный адрес — без номера дома заявку не отправим.</p>
                {fieldErrors.address && (
                  <p className="form-error form-error--field" id="order-address-error" role="alert">
                    {fieldErrors.address}
                  </p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="order-pvz">Пункт выдачи Ozon</label>
                <textarea
                  id="order-pvz"
                  rows={3}
                  placeholder="Адрес пункта выдачи Ozon"
                  value={pickupPoint}
                  aria-invalid={Boolean(fieldErrors.pickupPoint)}
                  aria-describedby={fieldErrors.pickupPoint ? 'order-pvz-error' : undefined}
                  onChange={(e) => {
                    setPickupPoint(e.target.value)
                    clearFieldError('pickupPoint')
                  }}
                />
                {fieldErrors.pickupPoint && (
                  <p className="form-error form-error--field" id="order-pvz-error" role="alert">
                    {fieldErrors.pickupPoint}
                  </p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="order-comment">Комментарий (необязательно)</label>
                <textarea
                  id="order-comment"
                  placeholder="Например: удобнее постамат у метро"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className={`consent-block${fieldErrors.consent ? ' is-invalid' : ''}`}>
                <label className="consent-field" htmlFor={consentId}>
                  <input
                    id={consentId}
                    type="checkbox"
                    checked={consent}
                    aria-invalid={Boolean(fieldErrors.consent)}
                    aria-describedby={fieldErrors.consent ? `${consentId}-error` : undefined}
                    onChange={(e) => {
                      setConsent(e.target.checked)
                      clearFieldError('consent')
                    }}
                  />
                  <span>
                    Согласен(на) на обработку персональных данных по{' '}
                    <Link to="/privacy" target="_blank" rel="noreferrer">
                      политике
                    </Link>
                  </span>
                </label>
                {fieldErrors.consent && (
                  <p className="form-error form-error--consent" id={`${consentId}-error`} role="alert">
                    {fieldErrors.consent}
                  </p>
                )}
              </div>

              {formError && (
                <p className="form-error" role="alert">
                  {formError}
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
