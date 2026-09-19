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
  const [authed, setAuthed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    adminSession()
      .then((res) => {
        if (cancelled) return
        if (!res.authenticated) {
          navigate('/admin', { replace: true })
          return
        }
        setAuthed(true)
        setCheckingSession(false)
      })
      .catch(() => {
        if (!cancelled) navigate('/admin', { replace: true })
      })
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function handleLogout() {
    await adminLogout().catch(() => undefined)
    navigate('/admin', { replace: true })
  }

  if (checkingSession || !authed) {
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
          <small>Панель администратора</small>
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
            id="admin-tab-orders"
            aria-selected={tab === 'orders'}
            aria-controls="admin-panel-orders"
            tabIndex={tab === 'orders' ? 0 : -1}
            className={`chip ${tab === 'orders' ? 'is-active' : ''}`}
            onClick={() => setTab('orders')}
          >
            Заявки
          </button>
          <button
            type="button"
            role="tab"
            id="admin-tab-products"
            aria-selected={tab === 'products'}
            aria-controls="admin-panel-products"
            tabIndex={tab === 'products' ? 0 : -1}
            className={`chip ${tab === 'products' ? 'is-active' : ''}`}
            onClick={() => setTab('products')}
          >
            Товары
          </button>
        </div>

        <div
          role="tabpanel"
          id={tab === 'orders' ? 'admin-panel-orders' : 'admin-panel-products'}
          aria-labelledby={tab === 'orders' ? 'admin-tab-orders' : 'admin-tab-products'}
        >
          {tab === 'orders' ? <OrdersPanel /> : <ProductsPanel />}
        </div>
      </div>
    </div>
  )
}
