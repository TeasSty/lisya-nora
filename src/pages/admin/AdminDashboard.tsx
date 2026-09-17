import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OrdersPanel } from '../../components/admin/OrdersPanel'
import { ProductsPanel } from '../../components/admin/ProductsPanel'
import { FoxMark } from '../../components/site/FoxMark'
import { adminLogout, adminSession } from '../../lib/api'

type Tab = 'orders' | 'products'

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('orders')
  const [checkingSession, setCheckingSession] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    adminSession()
      .then((res) => {
        if (!res.authenticated) navigate('/admin', { replace: true })
      })
      .catch(() => navigate('/admin', { replace: true }))
      .finally(() => setCheckingSession(false))
  }, [navigate])

  async function handleLogout() {
    await adminLogout().catch(() => undefined)
    navigate('/admin', { replace: true })
  }

  if (checkingSession) return null

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar__brand">
          <FoxMark />
          <div>
            <span>Лисья нора</span>
            <small>Панель администратора</small>
          </div>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Выйти
        </button>
      </header>

      <div className="admin-content">
        <div className="admin-tabs">
          <button
            type="button"
            className={`chip ${tab === 'orders' ? 'is-active' : ''}`}
            onClick={() => setTab('orders')}
          >
            Заявки
          </button>
          <button
            type="button"
            className={`chip ${tab === 'products' ? 'is-active' : ''}`}
            onClick={() => setTab('products')}
          >
            Товары
          </button>
        </div>

        {tab === 'orders' ? <OrdersPanel /> : <ProductsPanel />}
      </div>
    </div>
  )
}
