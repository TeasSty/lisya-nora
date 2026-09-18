import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

  if (checkingSession) {
    return (
      <div className="admin-shell">
        <p className="admin-checking">Открываем панель…</p>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <Link to="/" className="admin-topbar__brand" aria-label="На сайт «Лисья нора»">
          <FoxMark />
          <div>
            <span>Лисья нора</span>
            <small>Панель администратора</small>
          </div>
        </Link>
        <div className="admin-topbar__actions">
          <Link to="/" className="btn btn-ghost btn-sm">
            На сайт
          </Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </header>

      <div className="admin-content">
        <div className="admin-intro">
          <span className="eyebrow">Рабочая нора</span>
          <h1>Заявки и каталог</h1>
        </div>

        <div className="admin-tabs" role="tablist" aria-label="Разделы панели">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'orders'}
            className={`chip ${tab === 'orders' ? 'is-active' : ''}`}
            onClick={() => setTab('orders')}
          >
            Заявки
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'products'}
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
