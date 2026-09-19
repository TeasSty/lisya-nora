import { Link } from 'react-router-dom'
import { FoxMark } from './FoxMark'
import { MERCHANT } from '../../lib/merchant'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__main">
          <div className="site-footer__brand" aria-label={MERCHANT.brandName}>
            <FoxMark variant="light" />
          </div>

          <div className="site-footer__content">
            <nav aria-label="Контакты">
              <ul className="site-footer__links">
                <li>
                  <a href={`tel:${MERCHANT.phoneTel}`}>{MERCHANT.phoneDisplay}</a>
                </li>
                <li>
                  <a href={MERCHANT.vkUrl} target="_blank" rel="noreferrer">
                    ВКонтакте
                  </a>
                </li>
                <li>
                  <a href="#gde-my">{MERCHANT.addressShort}</a>
                </li>
              </ul>
            </nav>

            <div className="site-footer__legal">
              <p>
                <strong>{MERCHANT.legalName}</strong>
                <span>
                  ИНН {MERCHANT.inn} · ОГРНИП {MERCHANT.ogrnip}
                </span>
                <span>{MERCHANT.address}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>
            © {new Date().getFullYear()} «{MERCHANT.brandName}» · магазин уникальных подарков
          </span>
          <Link to="/privacy">Политика персональных данных</Link>
        </div>
      </div>
    </footer>
  )
}
