import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, searchOzonPvz, submitOrder, type OzonPvzSearchResponse } from '../../lib/api'
import { MERCHANT } from '../../lib/merchant'
import { formatOrderItemLine, productsToOrderItems } from '../../lib/orderItems'
import {
  formatPickupPointSelection,
  isCompleteAddress,
  isCompletePickupPoint,
  OZON_PVZ_MAP_URL,
  type OzonPvzPoint,
} from '../../lib/ozonShipment'
import type { Product } from '../../lib/types'

export interface CheckoutProduct extends Product {
  quantity?: number
}

interface OrderModalProps {
  products: CheckoutProduct[]
  onClose: () => void
  onSuccess?: () => void
}

type PvzMode = 'api' | 'map' | 'idle'

const CONSENT_ERROR = 'Нужно согласие на обработку персональных данных'

export function OrderModal({ products, onClose, onSuccess }: OrderModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [pickupPoint, setPickupPoint] = useState('')
  const [comment, setComment] = useState('')
  const [consent, setConsent] = useState(false)
  const [pvzPickerOpen, setPvzPickerOpen] = useState(false)
  const [pvzMode, setPvzMode] = useState<PvzMode>('idle')
  const [pvzQuery, setPvzQuery] = useState('')
  const [pvzPoints, setPvzPoints] = useState<OzonPvzPoint[]>([])
  const [pvzLoading, setPvzLoading] = useState(false)
  const [pvzHint, setPvzHint] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
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
        if (pvzPickerOpen) {
          setPvzPickerOpen(false)
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
  }, [onClose, pvzPickerOpen])

  async function openPvzPicker() {
    setPvzPickerOpen(true)
    setPvzMode('idle')
    setPvzHint(null)
    setPvzPoints([])
    const initialCity = city.trim()
    setPvzQuery(initialCity)
    if (initialCity.length >= 2) {
      await runPvzSearch(initialCity)
    }
  }

  async function runPvzSearch(rawCity: string) {
    const query = rawCity.trim()
    if (query.length < 2) {
      setPvzHint('Введите город — минимум 2 буквы')
      setPvzPoints([])
      setPvzMode('idle')
      return
    }

    setPvzLoading(true)
    setPvzHint(null)
    try {
      const result: OzonPvzSearchResponse = await searchOzonPvz(query)
      if (!result.configured || result.code === 'not_configured') {
        setPvzMode('map')
        setPvzPoints([])
        setPvzHint(
          result.message ??
            'Список ПВЗ через API пока не подключён. Выберите пункт на карте Ozon и вставьте адрес.',
        )
        return
      }

      if (result.warming) {
        setPvzMode('map')
        setPvzPoints([])
        setPvzHint(
          result.message ??
            'Каталог пунктов Ozon обновляется. Можно подождать минуту или выбрать на карте.',
        )
        return
      }

      if (result.error && result.points.length === 0) {
        setPvzMode('map')
        setPvzPoints([])
        setPvzHint(result.error)
        return
      }

      setPvzMode('api')
      setPvzPoints(result.points)
      setPvzHint(
        result.points.length === 0
          ? `В городе «${query}» пунктов не найдено. Проверьте написание или откройте карту Ozon.`
          : null,
      )
    } catch (err) {
      setPvzMode('map')
      setPvzPoints([])
      setPvzHint(err instanceof ApiError ? err.message : 'Не удалось загрузить список ПВЗ')
    } finally {
      setPvzLoading(false)
    }
  }

  function selectPvzPoint(point: OzonPvzPoint) {
    setPickupPoint(formatPickupPointSelection(point))
    if (!city.trim()) {
      // Город из адреса ПВЗ — первая часть до запятой, если поле пустое
      const fromAddress = point.address.split(',')[0]?.trim()
      if (fromAddress) setCity(fromAddress)
    }
    setPvzPickerOpen(false)
  }

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
    if (city.trim().length < 2) {
      setError('Укажите город получения')
      return
    }
    if (!isCompleteAddress(address)) {
      setError('Укажите точный адрес: улица и номер дома')
      return
    }
    if (!isCompletePickupPoint(pickupPoint)) {
      setError('Выберите пункт выдачи Ozon из списка или укажите его полный адрес')
      return
    }
    if (products.length === 0) {
      setError('Добавьте хотя бы один товар')
      return
    }
    if (!consent) {
      setError(CONSENT_ERROR)
      return
    }

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
      setError(err instanceof ApiError ? err.message : 'Не удалось отправить заявку')
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !pvzPickerOpen) onClose()
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
              Без оплаты онлайн. Укажите точный адрес и пункт выдачи Ozon — так магазину проще оформить
              отправку. Наличие подтвердим при звонке.
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
                  onChange={(e) => {
                    setName(e.target.value)
                    if (error) setError(null)
                  }}
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
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (error) setError(null)
                  }}
                />
              </div>

              <div className="form-field">
                <label htmlFor="order-city">Город получения</label>
                <input
                  id="order-city"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Например: Мурманск"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value)
                    if (error) setError(null)
                  }}
                />
              </div>

              <div className="form-field">
                <label htmlFor="order-address">Точный адрес (улица, дом)</label>
                <input
                  id="order-address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="ул. Ленина, д. 12, кв. 5"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    if (error) setError(null)
                  }}
                />
                <p className="field-hint">Нужен полный адрес — без номера дома заявку не отправим.</p>
              </div>

              <div className="form-field">
                <label htmlFor="order-pvz">Пункт выдачи Ozon</label>
                <textarea
                  id="order-pvz"
                  rows={3}
                  placeholder="Выберите ПВЗ из списка или вставьте адрес с карты Ozon"
                  value={pickupPoint}
                  onChange={(e) => {
                    setPickupPoint(e.target.value)
                    if (error) setError(null)
                  }}
                />
                <div className="pvz-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => void openPvzPicker()}>
                    Выбрать пункт Ozon
                  </button>
                  {pickupPoint.trim() && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPickupPoint('')}>
                      Очистить
                    </button>
                  )}
                </div>
                <p className="field-hint">
                  Сначала поиск по городу через API Ozon; если список недоступен — карта на ozon.ru.
                </p>
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

              <div className={`consent-block${error === CONSENT_ERROR ? ' is-invalid' : ''}`}>
                <label className="consent-field" htmlFor={consentId}>
                  <input
                    id={consentId}
                    type="checkbox"
                    checked={consent}
                    aria-invalid={error === CONSENT_ERROR}
                    aria-describedby={error === CONSENT_ERROR ? `${consentId}-error` : undefined}
                    onChange={(e) => {
                      setConsent(e.target.checked)
                      if (error) setError(null)
                    }}
                  />
                  <span>
                    Согласен(на) на обработку персональных данных по{' '}
                    <Link to="/privacy" target="_blank" rel="noreferrer">
                      политике
                    </Link>
                  </span>
                </label>
                {error === CONSENT_ERROR && (
                  <p className="form-error form-error--consent" id={`${consentId}-error`} role="alert">
                    {error}
                  </p>
                )}
              </div>

              {error && error !== CONSENT_ERROR && (
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

      {pvzPickerOpen && (
        <div
          className="pvz-picker"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pvz-picker-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPvzPickerOpen(false)
          }}
        >
          <div className="pvz-picker__panel">
            <button
              type="button"
              className="modal-panel__close"
              onClick={() => setPvzPickerOpen(false)}
              aria-label="Закрыть выбор ПВЗ"
            >
              ×
            </button>
            <h3 id="pvz-picker-title">Пункт выдачи Ozon</h3>

            <div className="pvz-picker__search">
              <div className="form-field" style={{ marginBottom: 0, flex: 1 }}>
                <label htmlFor="pvz-city-search">Город</label>
                <input
                  id="pvz-city-search"
                  type="text"
                  value={pvzQuery}
                  onChange={(e) => setPvzQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void runPvzSearch(pvzQuery)
                    }
                  }}
                  placeholder="Например: Выборг"
                  autoFocus
                />
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={pvzLoading}
                onClick={() => void runPvzSearch(pvzQuery)}
              >
                {pvzLoading ? 'Ищем…' : 'Найти'}
              </button>
            </div>

            {pvzHint && (
              <p className="field-hint" role="status" style={{ marginTop: 10 }}>
                {pvzHint}
              </p>
            )}

            {pvzMode === 'api' && pvzPoints.length > 0 && (
              <ul className="pvz-picker__list" aria-label="Найденные пункты выдачи">
                {pvzPoints.map((point) => (
                  <li key={point.id}>
                    <button type="button" className="pvz-picker__item" onClick={() => selectPvzPoint(point)}>
                      <span className="pvz-picker__item-name">{point.name}</span>
                      <span className="pvz-picker__item-address">{point.address}</span>
                      <span className="pvz-picker__item-meta">
                        #{point.id}
                        {point.type ? ` · ${point.type}` : ''}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="pvz-picker__fallback">
              <a
                className="btn btn-ghost btn-sm"
                href={OZON_PVZ_MAP_URL}
                target="_blank"
                rel="noreferrer"
              >
                Открыть карту Ozon
              </a>
              <div className="form-field" style={{ marginBottom: 0, marginTop: 10 }}>
                <label htmlFor="pvz-paste">Или вставьте адрес с карты</label>
                <textarea
                  id="pvz-paste"
                  rows={2}
                  placeholder="Полный адрес ПВЗ с ozon.ru/info/map"
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 12 }}
                disabled={!isCompletePickupPoint(pickupPoint)}
                onClick={() => setPvzPickerOpen(false)}
              >
                Подтвердить пункт
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
