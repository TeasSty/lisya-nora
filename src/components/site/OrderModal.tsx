import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { extractCityFromFullAddress } from '../../lib/addressSuggest'
import { ApiError, submitOrder } from '../../lib/api'
import { MERCHANT } from '../../lib/merchant'
import { formatOrderItemLine, productsToOrderItems } from '../../lib/orderItems'
import { isCompleteAddress, isCompletePickupPoint } from '../../lib/ozonShipment'
import type { Product } from '../../lib/types'
import { AddressSuggestInput } from './AddressSuggestInput'

export interface CheckoutProduct extends Product {
  quantity?: number
}

interface OrderModalProps {
  products: CheckoutProduct[]
  onClose: () => void
  onSuccess?: () => void
}

const CONSENT_ERROR = 'Нужно согласие на обработку персональных данных'
const NAME_ERROR = 'Подскажите, как к вам обращаться'
const PHONE_ERROR = 'Проверьте номер телефона'
const ADDRESS_ERROR = 'Укажите город, улицу и номер дома'
const PICKUP_ERROR = 'Укажите полный адрес пункта выдачи Ozon'

type FieldKey = 'name' | 'phone' | 'address' | 'pickupPoint' | 'consent'

type FieldErrors = Partial<Record<FieldKey, string>>

function isValidName(value: string): boolean {
  return value.trim().length > 0
}

function isValidPhone(value: string): boolean {
  const digits = value.trim().replace(/\D/g, '').length
  return digits >= 10 && digits <= 15
}

function validateOrderFields(input: {
  name: string
  phone: string
  address: string
  pickupPoint: string
  consent: boolean
}): FieldErrors {
  const next: FieldErrors = {}
  if (!isValidName(input.name)) next.name = NAME_ERROR
  if (!isValidPhone(input.phone)) next.phone = PHONE_ERROR
  if (!isCompleteAddress(input.address)) next.address = ADDRESS_ERROR
  if (!isCompletePickupPoint(input.pickupPoint)) next.pickupPoint = PICKUP_ERROR
  if (!input.consent) next.consent = CONSENT_ERROR
  return next
}

export function OrderModal({ products, onClose, onSuccess }: OrderModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  /** Город из подсказки — уходит в заявку, в форме отдельного поля нет. */
  const [cityFromSuggest, setCityFromSuggest] = useState<string | null>(null)
  const [pickupPoint, setPickupPoint] = useState('')
  const [comment, setComment] = useState('')
  const [consent, setConsent] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'review' | 'submitting' | 'done'>('idle')
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const consentId = useId()

  const statusRef = useRef(status)
  statusRef.current = status

  const resolvedCity =
    cityFromSuggest?.trim() || extractCityFromFullAddress(address) || 'не указан'

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    if (status === 'idle') {
      panelRef.current?.querySelector<HTMLElement>('input')?.focus()
    }
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (statusRef.current === 'submitting') return
        if (statusRef.current === 'review') {
          setStatus('idle')
          return
        }
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
  }, [onClose, status])

  function clearFieldError(key: FieldKey) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  /** После попытки отправки ошибка снимается только когда поле стало валидным. */
  function clearErrorIfValid(key: FieldKey, isValid: boolean) {
    if (isValid) clearFieldError(key)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    const nextErrors = validateOrderFields({ name, phone, address, pickupPoint, consent })
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
    setStatus('review')
  }

  async function confirmAndSend() {
    setFormError(null)

    const nextErrors = validateOrderFields({ name, phone, address, pickupPoint, consent })
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setStatus('idle')
      return
    }

    if (products.length === 0) {
      setFormError('Добавьте хотя бы один товар')
      setStatus('idle')
      return
    }

    setStatus('submitting')
    try {
      await submitOrder({
        name: name.trim(),
        phone: phone.trim(),
        city: resolvedCity,
        address: address.trim(),
        pickupPoint: pickupPoint.trim(),
        comment: comment.trim(),
        items: productsToOrderItems(products),
      })
      setStatus('done')
      onSuccess?.()
    } catch (err) {
      setStatus('review')
      setFormError(err instanceof ApiError ? err.message : 'Не удалось отправить заявку')
    }
  }

  function requestClose() {
    if (status === 'submitting') return
    onClose()
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose()
      }}
    >
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panelRef}>
        <button
          type="button"
          className="modal-panel__close"
          onClick={requestClose}
          aria-label="Закрыть форму"
          disabled={status === 'submitting'}
        >
          ×
        </button>

        {status === 'done' ? (
          <div className="form-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 12.5 L9.5 18 L20 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 id={titleId}>Заявка отправлена</h3>
            <div className="form-success__body">
              <p>
                Перезвоним на <strong>{phone}</strong> {MERCHANT.responsePromise} ({MERCHANT.hours}).
              </p>
              <p className="form-success__soft">
                Доставка Ozon по выбранному ПВЗ или самовывоз: {MERCHANT.addressShort}.
              </p>
              <p>
                Срочно —{' '}
                <a href={`tel:${MERCHANT.phoneTel}`}>{MERCHANT.phoneDisplay}</a>
              </p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm form-success__close" onClick={onClose}>
              Закрыть
            </button>
          </div>
        ) : status === 'review' || status === 'submitting' ? (
          <div className="order-review">
            <h3 id={titleId}>Проверьте данные</h3>
            <p className="modal-panel__hint">
              Если что-то неверно — вернитесь и поправьте. После подтверждения заявка уйдёт в магазин.
            </p>

            <dl className="order-review__list">
              <div>
                <dt>Товары</dt>
                <dd>
                  <ul className="order-review__products">
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
                </dd>
              </div>
              <div>
                <dt>Имя</dt>
                <dd>{name.trim()}</dd>
              </div>
              <div>
                <dt>Телефон</dt>
                <dd>{phone.trim()}</dd>
              </div>
              <div>
                <dt>Город</dt>
                <dd>{resolvedCity}</dd>
              </div>
              <div>
                <dt>Адрес</dt>
                <dd>{address.trim()}</dd>
              </div>
              <div>
                <dt>ПВЗ Ozon</dt>
                <dd>{pickupPoint.trim()}</dd>
              </div>
              {comment.trim() && (
                <div>
                  <dt>Комментарий</dt>
                  <dd>{comment.trim()}</dd>
                </div>
              )}
            </dl>

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            <div className="order-review__actions">
              <button
                type="button"
                className="btn btn-ghost"
                disabled={status === 'submitting'}
                onClick={() => {
                  setFormError(null)
                  setStatus('idle')
                }}
              >
                Изменить
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={status === 'submitting'}
                onClick={() => void confirmAndSend()}
              >
                {status === 'submitting' ? 'Отправляем…' : 'Всё верно, отправить'}
              </button>
            </div>
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
                    const next = e.target.value
                    setName(next)
                    clearErrorIfValid('name', isValidName(next))
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
                    const next = e.target.value
                    setPhone(next)
                    clearErrorIfValid('phone', isValidPhone(next))
                  }}
                />
                {fieldErrors.phone && (
                  <p className="form-error form-error--field" id="order-phone-error" role="alert">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <AddressSuggestInput
                id="order-address"
                label="Адрес (город, улица, дом)"
                placeholder="Мурманск, ул. Ленина, д. 12"
                autoComplete="street-address"
                value={address}
                invalid={Boolean(fieldErrors.address)}
                describedBy={fieldErrors.address ? 'order-address-error' : undefined}
                hint="Начните вводить — выберите из списка или допишите квартиру."
                error={fieldErrors.address ?? null}
                errorId="order-address-error"
                onChange={(next) => {
                  setAddress(next)
                  setCityFromSuggest(null)
                  clearErrorIfValid('address', isCompleteAddress(next))
                }}
                onPickSuggestion={(item) => {
                  setAddress(item.label)
                  setCityFromSuggest(item.city)
                  clearErrorIfValid('address', isCompleteAddress(item.label))
                }}
              />

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
                    const next = e.target.value
                    setPickupPoint(next)
                    clearErrorIfValid('pickupPoint', isCompletePickupPoint(next))
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
                      const next = e.target.checked
                      setConsent(next)
                      clearErrorIfValid('consent', next)
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

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Проверить и отправить
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
