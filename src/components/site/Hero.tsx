import type { ReactNode } from 'react'
import { assetPath } from '../../lib/assetPath'

function CategoryBadge({
  label,
  className,
  children,
}: {
  label: string
  className: string
  children: ReactNode
}) {
  return (
    <span className={`hero-den__badge ${className}`} aria-hidden="true" title={label}>
      {children}
    </span>
  )
}

function HeroStage() {
  return (
    <div className="hero-den">
      <div className="hero-den__arch">
        <div className="hero-den__glow" />
        <img
          className="hero-den__photo"
          src={assetPath('images/fox-liisa.webp')}
          alt=""
          width={900}
          height={1350}
          decoding="async"
          fetchPriority="high"
        />
        <div className="hero-den__rim" aria-hidden="true" />
      </div>

      <CategoryBadge label="Украшения" className="hero-den__badge--tl">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3 L15 9 L21 10 L16.5 14.5 L18 21 L12 17.5 L6 21 L7.5 14.5 L3 10 L9 9 Z" />
        </svg>
      </CategoryBadge>
      <CategoryBadge label="Обереги" className="hero-den__badge--tr">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3 L14 9 L20 9 L15 13 L17 19 L12 15 L7 19 L9 13 L4 9 L10 9 Z" />
        </svg>
      </CategoryBadge>
      <CategoryBadge label="Кузница" className="hero-den__badge--bl">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 16 L12 8 L16 12 L8 20 Z" />
          <path d="M13 7 L19 3" />
          <rect x="16" y="1" width="6" height="4" rx="1" transform="rotate(35 19 3)" />
        </svg>
      </CategoryBadge>
      <CategoryBadge label="Зверята" className="hero-den__badge--br">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="13" r="7" />
          <path d="M8 7 L6 3 M16 7 L18 3" />
          <circle cx="10" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="14" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
      </CategoryBadge>
    </div>
  )
}

export function Hero() {
  return (
    <section id="top" className="hero grain-bg">
      <div className="container hero__inner">
        <div className="hero__copy">
          <span className="hero__badge">
            <strong>4,7 ★</strong> на 2ГИС · Краснофлотская, 4А, Выборг
          </span>
          <h1>
            Волшебство — на расстоянии <em>одной полки</em>
          </h1>
          <p className="hero__lead">
            «Лисья нора» — магазин уникальных подарков в старом Выборге. Керамика, кованые звери,
            куклы-зверята и обереги — всё <strong>ручной работы</strong>, всё штучное. А ещё здесь
            служит рыжий сотрудник по имени Лииса.
          </p>
          <div className="hero__actions">
            <a href="#nora" className="btn btn-primary">
              Исследовать нору
            </a>
            <a href="#gde-my" className="btn btn-ghost">
              Как нас найти
            </a>
          </div>
        </div>
        <div
          className="hero__stage"
          role="img"
          aria-label="Рыжая лиса выглядывает из норы — символ магазина «Лисья нора»"
        >
          <HeroStage />
        </div>
      </div>
    </section>
  )
}
