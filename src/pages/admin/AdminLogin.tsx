import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin, adminSession, ApiError, DEMO_ADMIN_PASSWORD } from '../../lib/api'
import { DEMO_MODE } from '../../lib/config'
import { FoxMark } from '../../components/site/FoxMark'

export function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    adminSession()
      .then((res) => {
        if (res.authenticated) navigate('/admin/dashboard', { replace: true })
      })
      .catch(() => undefined)
      .finally(() => setCheckingSession(false))
  }, [navigate])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await adminLogin(password)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось войти')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="admin-login-page">
        <p className="admin-checking">Проверяем вход…</p>
      </div>
    )
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <FoxMark />
        <h1>Панель «Лисьей норы»</h1>
        <p className="lead">Вход только для сотрудников магазина</p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="admin-password">Пароль</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'Входим…' : 'Войти'}
          </button>
        </form>

        {DEMO_MODE && (
          <p className="admin-login-hint">
            Демо-режим: пароль <code>{DEMO_ADMIN_PASSWORD}</code>
          </p>
        )}
      </div>
    </div>
  )
}
