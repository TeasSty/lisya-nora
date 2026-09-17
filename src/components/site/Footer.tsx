import { Link } from 'react-router-dom'
import { DEMO_MODE } from '../../lib/config'
import { FoxMark } from './FoxMark'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <FoxMark />
            <span>Лисья нора</span>
          </div>

          <nav aria-label="Контакты">
            <ul className="site-footer__links">
              <li>
                <a href="tel:+79213326427">+7 921 332-64-27</a>
              </li>
              <li>
                <a href="https://vk.com/lissi_nora" target="_blank" rel="noreferrer">
                  ВКонтакте
                </a>
              </li>
              <li>
                <a href="#gde-my">Краснофлотская, 4А, Выборг</a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} «Лисья нора» · магазин уникальных подарков</span>
          {!DEMO_MODE && <Link to="/admin">Вход для сотрудников</Link>}
        </div>
      </div>
    </footer>
  )
}
