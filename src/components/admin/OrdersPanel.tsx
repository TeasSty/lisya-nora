import { useEffect, useMemo, useState } from 'react'
import {
  ApiError,
  fetchAdminOrders,
  updateOrderStatus,
  updateOrderTracking,
} from '../../lib/api'
import { normalizeAdminOrder, formatOrderItemLine } from '../../lib/orderItems'
import { buildOzonShipmentDocument, buildTrackingMessage, getOzonCopyFields } from '../../lib/ozonShipment'
import type { AdminOrder } from '../../lib/types'

function formatDate(iso: string): string {
  try {
    const value = iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z'
    return new Date(value).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/** Нормализует ввод: убирает №/# и пробелы. */
function normalizeIdQuery(raw: string): string {
  return raw.trim().replace(/^[№#]+/, '').replace(/\s+/g, '')
}

/** Поиск по номеру заявки сайта и по номеру отправления Ozon. */
function orderMatchesQuery(order: AdminOrder, raw: string): boolean {
  const q = normalizeIdQuery(raw)
  if (!q) return true
  const idStr = String(order.id)
  if (idStr === q || idStr.includes(q)) return true
  const track = (order.trackingNumber ?? '').replace(/\s+/g, '')
  if (!track) return false
  const qLower = q.toLowerCase()
  const trackLower = track.toLowerCase()
  return trackLower === qLower || trackLower.includes(qLower)
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function OrdersPanel() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [orderNotes, setOrderNotes] = useState<Record<number, string>>({})
  const [trackingDrafts, setTrackingDrafts] = useState<Record<number, string>>({})
  const [idQuery, setIdQuery] = useState('')

  function load() {
    setIsLoading(true)
    setError(null)
    fetchAdminOrders()
      .then((res) => {
        const next = res.orders.map((order) => normalizeAdminOrder(order))
        setOrders(next)
        setTrackingDrafts(
          Object.fromEntries(next.map((order) => [order.id, order.trackingNumber ?? ''])),
        )
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Не удалось загрузить заявки'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function flashOrderNote(orderId: number, text: string) {
    setOrderNotes((prev) => ({ ...prev, [orderId]: text }))
  }

  async function toggleStatus(order: AdminOrder) {
    const nextStatus = order.status === 'new' ? 'done' : 'new'
    setBusyId(order.id)
    try {
      await updateOrderStatus(order.id, nextStatus)
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)))
      flashOrderNote(
        order.id,
        nextStatus === 'done' ? 'Отмечена выполненной' : 'Вернули в новые',
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось обновить заявку')
    } finally {
      setBusyId(null)
    }
  }

  async function handleCopyOzonField(value: string) {
    await copyText(value)
  }

  async function handleCopyOzon(order: AdminOrder) {
    await copyText(buildOzonShipmentDocument(order))
  }

  async function handleCopyClientMessage(order: AdminOrder) {
    const withTrack = {
      ...order,
      trackingNumber: trackingDrafts[order.id] ?? order.trackingNumber ?? '',
    }
    await copyText(buildTrackingMessage(withTrack))
  }

  async function handleSaveTracking(order: AdminOrder) {
    const value = (trackingDrafts[order.id] ?? '').trim()
    setBusyId(order.id)
    try {
      await updateOrderTracking(order.id, value)
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, trackingNumber: value } : o)),
      )
      flashOrderNote(
        order.id,
        value ? 'Номер отправления Ozon сохранён' : 'Номер отправления Ozon очищен',
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось сохранить номер отправления')
    } finally {
      setBusyId(null)
    }
  }

  const newCount = orders.filter((order) => order.status === 'new').length
  const hasIdQuery = normalizeIdQuery(idQuery).length > 0
  const filteredOrders = useMemo(
    () => orders.filter((order) => orderMatchesQuery(order, idQuery)),
    [orders, idQuery],
  )

  return (
    <div className="admin-card">
      <div className="admin-card__head">
        <h2>
          Заявки с сайта
          {!isLoading && !error && <span className="admin-card__count">{orders.length}</span>}
        </h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={load}>
          Обновить
        </button>
      </div>

      {!isLoading && !error && orders.length > 0 && (
        <>
          <div className="order-search">
            <label htmlFor="order-id-search">Поиск по № сайта или Ozon</label>
            <input
              id="order-id-search"
              type="search"
              autoComplete="off"
              spellCheck={false}
              placeholder="№ заявки сайта или номер отправления Ozon"
              value={idQuery}
              onChange={(e) => setIdQuery(e.target.value)}
            />
          </div>

          <p className="order-row__meta order-list__summary">
            Новых: <strong>{newCount}</strong>
            {hasIdQuery && (
              <>
                {' '}
                · Найдено: <strong>{filteredOrders.length}</strong>
              </>
            )}
          </p>
        </>
      )}

      {isLoading && (
        <div className="admin-empty">
          <strong>Заглядываем в заявки…</strong>
          Подождите секунду.
        </div>
      )}
      {!isLoading && error && (
        <div className="admin-empty" role="alert">
          <strong>Не получилось загрузить</strong>
          {error}
        </div>
      )}
      {!isLoading && !error && orders.length === 0 && (
        <div className="admin-empty">
          <strong>Заявок пока нет</strong>
          Как только кто-то оставит заявку на сайте, она появится здесь.
        </div>
      )}
      {!isLoading && !error && orders.length > 0 && filteredOrders.length === 0 && (
        <div className="admin-empty">
          <strong>Ничего не найдено</strong>
          Проверьте номер сайта / Ozon или очистите поиск.
        </div>
      )}

      {!isLoading && !error && filteredOrders.length > 0 && (
        <div className="order-list">
          {filteredOrders.map((order) => {
            const items = normalizeAdminOrder(order).items
            const ozonNumber = (trackingDrafts[order.id] ?? order.trackingNumber ?? '').trim()
            return (
              <article className="order-row" key={order.id}>
                {orderNotes[order.id] && (
                  <p className="order-row__toast" role="status">
                    {orderNotes[order.id]}
                  </p>
                )}
                <div className="order-row__top">
                  <div className="order-row__heading">
                    <div className="order-row__ids">
                      {ozonNumber ? (
                        <span className="order-row__id order-row__id--ozon" title="Номер отправления Ozon">
                          Ozon №{ozonNumber}
                        </span>
                      ) : (
                        <span className="order-row__id order-row__id--pending">Ozon — ещё нет</span>
                      )}
                      <span className="order-row__id order-row__id--site" title="Номер заявки на сайте">
                        Сайт №{order.id}
                      </span>
                    </div>
                    <span className="order-row__name">{order.name}</span>
                  </div>
                  <span className={`status-pill status-pill--${order.status}`}>
                    {order.status === 'new' ? 'Новая' : 'Выполнена'}
                  </span>
                </div>

                {items.length === 1 ? (
                  <span className="order-row__product">{formatOrderItemLine(items[0])}</span>
                ) : (
                  <ul className="order-row__items">
                    {items.map((item, index) => (
                      <li key={`${order.id}-${index}-${item.productName}`}>
                        {formatOrderItemLine(item)}
                      </li>
                    ))}
                  </ul>
                )}

                <span className="order-row__meta">
                  <a href={`tel:${order.phone.replace(/\s+/g, '')}`}>{order.phone}</a> ·{' '}
                  {formatDate(order.createdAt)}
                </span>

                <div className="order-row__ship">
                  <dl className="order-row__ship-list">
                    <div>
                      <dt>Город</dt>
                      <dd>{order.city?.trim() || '—'}</dd>
                    </div>
                    <div>
                      <dt>Адрес</dt>
                      <dd>{order.address?.trim() || '—'}</dd>
                    </div>
                    <div>
                      <dt>ПВЗ Ozon</dt>
                      <dd>{order.pickupPoint?.trim() || '—'}</dd>
                    </div>
                  </dl>
                </div>

                {order.comment && <p className="order-row__comment">«{order.comment}»</p>}

                <div className="order-row__ozon-fields">
                  <p className="order-row__ozon-fields-title">В приложение Ozon — по полям</p>
                  <ul className="ozon-copy-list">
                    {getOzonCopyFields(order).map((field) => (
                      <li key={`${order.id}-${field.id}`} className="ozon-copy-row">
                        <div className="ozon-copy-row__text">
                          <span className="ozon-copy-row__label">{field.label}</span>
                          <span className="ozon-copy-row__value">{field.value}</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleCopyOzonField(field.value)}
                        >
                          Копировать
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="order-row__track">
                  <label htmlFor={`track-${order.id}`}>Номер отправления Ozon</label>
                  <div className="order-row__track-row">
                    <input
                      id={`track-${order.id}`}
                      type="text"
                      value={trackingDrafts[order.id] ?? ''}
                      onChange={(e) =>
                        setTrackingDrafts((prev) => ({ ...prev, [order.id]: e.target.value }))
                      }
                      placeholder="Например 12345678-0001 — из кабинета Ozon"
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={busyId === order.id}
                      onClick={() => handleSaveTracking(order)}
                    >
                      Сохранить
                    </button>
                  </div>
                </div>

                <div className="order-row__actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleCopyOzon(order)}>
                    Скопировать всё текстом
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleCopyClientMessage(order)}
                  >
                    Сообщение клиенту
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={busyId === order.id}
                    onClick={() => toggleStatus(order)}
                  >
                    {order.status === 'new' ? 'Отметить выполненной' : 'Вернуть в новые'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
