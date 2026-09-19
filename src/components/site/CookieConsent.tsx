import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const CONSENT_KEY = 'lisya-nora-cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(CONSENT_KEY) !== '1') {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, '1')
    } catch {
      /* ignore quota / private mode */
    }
    setVisible(false)
  }

  return (
    <div className="cookie-consent" role="dialog" aria-live="polite" aria-label="Уведомление о cookies">
      <p className="cookie-consent__text">
        Сайт использует cookies и локальное хранилище браузера — для корзины и удобства работы.
        Подробнее в{' '}
        <Link to="/privacy">политике персональных данных</Link>.
      </p>
      <div className="cookie-consent__actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={accept}>
          Понятно
        </button>
      </div>
    </div>
  )
}
