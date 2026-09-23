import { useEffect, useState } from 'react'
import { useCart } from '../../lib/cart'
import { FoxMark } from './FoxMark'
import { VkLoginBlock } from './VkLoginBlock'

const NAV_LINKS = [
  { href: '#nora', label: 'Каталог' },
  { href: '#o-magazine', label: 'О магазине' },
  { href: '#otzyvy', label: 'Отзывы' },
  { href: '#gde-my', label: 'Где мы' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { count, openCart } = useCart()

  useEffect(() => {
    if (!isOpen) return

    const nav = document.getElementById('mobile-nav')
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        return
      }

      if (event.key !== 'Tab' || !nav) return
      const focusable = nav.querySelectorAll<HTMLElement>('a[href], button')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.classList.add('nav-open')
    nav?.querySelector<HTMLElement>('a[href], button')?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('nav-open')
    }
  }, [isOpen])

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a
          href={import.meta.env.BASE_URL}
          className="site-header__brand"
          aria-label="Лисья нора — на главную"
          onClick={(event) => {
            event.preventDefault()
            if (window.location.hash) {
              const { pathname, search } = window.location
              window.history.replaceState(null, '', `${pathname}${search}`)
            }
            document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <FoxMark />
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

          <VkLoginBlock variant="header" />

          <button
            type="button"
            className="site-header__cart"
            onClick={openCart}
            aria-label={count > 0 ? `Корзина, ${count} товар(ов)` : 'Открыть корзину'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M6 8h12l-1 11H7L6 8Z" strokeLinejoin="round" />
              <path d="M9 8V7a3 3 0 0 1 6 0v1" strokeLinecap="round" />
            </svg>
            {count > 0 && <span className="site-header__cart-count">{count > 99 ? '99+' : count}</span>}
          </button>

          <button
            type="button"
            className={`site-header__menu-btn${isOpen ? ' is-open' : ''}`}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setIsOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        className={`site-mobile-nav${isOpen ? ' is-open' : ''}`}
        inert={!isOpen ? true : undefined}
        aria-hidden={!isOpen}
      >
        <ul className="site-mobile-nav__list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setIsOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="site-mobile-nav__cart"
              onClick={() => {
                setIsOpen(false)
                openCart()
              }}
            >
              Корзина{count > 0 ? ` (${count})` : ''}
            </button>
          </li>
          <li className="site-mobile-nav__vk" onClick={() => setIsOpen(false)}>
            <VkLoginBlock variant="header" />
          </li>
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
