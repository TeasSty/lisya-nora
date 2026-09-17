import { useState } from 'react'
import { FoxMark } from './FoxMark'

const NAV_LINKS = [
  { href: '#nora', label: 'Каталог' },
  { href: '#o-magazine', label: 'О магазине' },
  { href: '#otzyvy', label: 'Отзывы' },
  { href: '#gde-my', label: 'Где мы' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a href="#top" className="site-header__brand" aria-label="Лисья нора — на главную">
          <FoxMark />
          <span>Лисья нора</span>
        </a>

        <ul className="site-header__nav">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <div className="site-header__actions">
          <a className="site-header__phone" href="tel:+79213326427">
            +7 921 332-64-27
          </a>
          <button
            type="button"
            className="site-header__menu-btn"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setIsOpen((v) => !v)}
          >
            <span style={{ transform: isOpen ? 'translateY(6px) rotate(45deg)' : 'none' }} />
            <span style={{ opacity: isOpen ? 0 : 1 }} />
            <span style={{ transform: isOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </div>

      <nav id="mobile-nav" className={`site-mobile-nav ${isOpen ? 'is-open' : ''}`}>
        <ul className="site-mobile-nav__list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setIsOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="tel:+79213326427" onClick={() => setIsOpen(false)}>
              Позвонить: +7 921 332-64-27
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
