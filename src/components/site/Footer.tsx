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
            <nav aria-label="Контакты" className="site-footer__contacts">
              <ul className="site-footer__links">
                <li>
                  <a href={`tel:${MERCHANT.phoneTel}`}>{MERCHANT.phoneDisplay}</a>
                </li>
                <li>
                  <a href={MERCHANT.vkUrl} target="_blank" rel="noreferrer">
                    ВКонтакте
                  </a>
                </li>
              </ul>
              <p className="site-footer__place">
                <a href="#gde-my">{MERCHANT.addressShort}</a>
              </p>
            </nav>

            <div className="site-footer__legal">
              <p className="site-footer__legal-ids">
                <strong>{MERCHANT.legalName}</strong>
                <span>
                  ИНН {MERCHANT.inn} · ОГРНИП {MERCHANT.ogrnip}
                </span>
              </p>
              <p className="site-footer__legal-address">{MERCHANT.address}</p>
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
