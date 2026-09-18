import { useEffect, useState } from 'react'
import {
  ApiError,
  fetchAdminOrders,
  updateOrderStatus,
  updateOrderTracking,
} from '../../lib/api'
import { normalizeAdminOrder, formatOrderItemLine } from '../../lib/orderItems'
import { buildOzonShipmentDocument, buildTrackingMessage } from '../../lib/ozonShipment'
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
  const [copyNote, setCopyNote] = useState<string | null>(null)
  const [trackingDrafts, setTrackingDrafts] = useState<Record<number, string>>({})

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

  async function toggleStatus(order: AdminOrder) {
    const nextStatus = order.status === 'new' ? 'done' : 'new'
    setBusyId(order.id)
    try {
      await updateOrderStatus(order.id, nextStatus)
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось обновить заявку')
    } finally {
      setBusyId(null)
    }
  }

  async function handleCopyOzon(order: AdminOrder) {
    const ok = await copyText(buildOzonShipmentDocument(order))
    setCopyNote(ok ? `Документ для Ozon по заявке №${order.id} скопирован` : 'Не удалось скопировать')
  }

  async function handleCopyClientMessage(order: AdminOrder) {
    const withTrack = {
      ...order,
      trackingNumber: trackingDrafts[order.id] ?? order.trackingNumber ?? '',
    }
    const ok = await copyText(buildTrackingMessage(withTrack))
    setCopyNote(ok ? `Сообщение клиенту по заявке №${order.id} скопировано` : 'Не удалось скопировать')
  }

  async function handleSaveTracking(order: AdminOrder) {
    const value = (trackingDrafts[order.id] ?? '').trim()
    setBusyId(order.id)
    try {
      await updateOrderTracking(order.id, value)
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, trackingNumber: value } : o)),
      )
      setCopyNote(`Трек по заявке №${order.id} сохранён`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось сохранить трек')
    } finally {
      setBusyId(null)
    }
  }

  const newCount = orders.filter((order) => order.status === 'new').length

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
        <p className="order-row__meta" style={{ marginBottom: 14 }}>
          Новых: <strong>{newCount}</strong>
          {copyNote && (
            <>
              {' '}
              · <span className="order-row__copy-note">{copyNote}</span>
            </>
          )}
        </p>
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

      {!isLoading && !error && orders.length > 0 && (
        <div className="order-list">
          {orders.map((order) => {
            const items = normalizeAdminOrder(order).items
            return (
              <article className="order-row" key={order.id}>
                <div className="order-row__top">
                  <span className="order-row__name">{order.name}</span>
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
                  <p>
                    <strong>Город:</strong> {order.city?.trim() || '—'}
                  </p>
                  <p>
                    <strong>Адрес:</strong> {order.address?.trim() || '—'}
                  </p>
                  <p>
                    <strong>ПВЗ Ozon:</strong> {order.pickupPoint?.trim() || '—'}
                  </p>
                </div>

                {order.comment && <p className="order-row__comment">«{order.comment}»</p>}

                <div className="order-row__track">
                  <label htmlFor={`track-${order.id}`}>Трек-номер</label>
                  <div className="order-row__track-row">
                    <input
                      id={`track-${order.id}`}
                      type="text"
                      value={trackingDrafts[order.id] ?? ''}
                      onChange={(e) =>
                        setTrackingDrafts((prev) => ({ ...prev, [order.id]: e.target.value }))
                      }
                      placeholder="Вставьте трек из Ozon"
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
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handleCopyOzon(order)}>
                    Скопировать для Ozon
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
