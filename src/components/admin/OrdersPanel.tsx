import { useEffect, useState } from 'react'
import { ApiError, fetchAdminOrders, updateOrderStatus } from '../../lib/api'
import type { AdminOrder } from '../../lib/types'

function formatDate(iso: string): string {
  try {
    return new Date(iso.replace(' ', 'T') + 'Z').toLocaleString('ru-RU', {
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

export function OrdersPanel() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  function load() {
    setIsLoading(true)
    fetchAdminOrders()
      .then((res) => setOrders(res.orders))
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

  return (
    <div className="admin-card">
      <div className="admin-card__head">
        <h2>Заявки с сайта</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={load}>
          Обновить
        </button>
      </div>

      {isLoading && <p className="admin-empty">Загружаем заявки…</p>}
      {!isLoading && error && <p className="admin-empty">{error}</p>}
      {!isLoading && !error && orders.length === 0 && (
        <p className="admin-empty">Заявок пока нет — как только кто-то оставит заявку на сайте, она появится здесь.</p>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="order-list">
          {orders.map((order) => (
            <div className="order-row" key={order.id}>
              <div className="order-row__top">
                <span className="order-row__name">{order.name}</span>
                <span className={`status-pill status-pill--${order.status}`}>
                  {order.status === 'new' ? 'Новая' : 'Выполнена'}
                </span>
              </div>
              <span className="order-row__product">{order.productName}</span>
              <span className="order-row__meta">
                <a href={`tel:${order.phone.replace(/\s+/g, '')}`}>{order.phone}</a> · {formatDate(order.createdAt)}
              </span>
              {order.comment && <p className="order-row__comment">«{order.comment}»</p>}
              <div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={busyId === order.id}
                  onClick={() => toggleStatus(order)}
                >
                  {order.status === 'new' ? 'Отметить выполненной' : 'Вернуть в новые'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
