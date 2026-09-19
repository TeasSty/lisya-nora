import type { ReactNode } from 'react'
import { assetPath } from '../../lib/assetPath'
import { CategoryGlyph } from './ProductPattern'

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
        <CategoryGlyph category="jewelry" />
      </CategoryBadge>
      <CategoryBadge label="Обереги" className="hero-den__badge--tr">
        <CategoryGlyph category="charms" />
      </CategoryBadge>
      <CategoryBadge label="Кузница" className="hero-den__badge--bl">
        <CategoryGlyph category="forge" />
      </CategoryBadge>
      <CategoryBadge label="Зверята" className="hero-den__badge--br">
        <CategoryGlyph category="curiosities" />
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
            куклы-зверята и обереги — всё <strong>ручной работы</strong>. А ещё здесь
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
