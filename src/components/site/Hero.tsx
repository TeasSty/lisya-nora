function HeroStage() {
  return (
    <svg viewBox="0 0 380 380" role="img" aria-labelledby="hero-stage-title">
      <title id="hero-stage-title">Вход в нору с рыжей лисой и подарками вокруг</title>
      <ellipse cx="190" cy="330" rx="150" ry="18" fill="#e4cba0" opacity="0.6" />
      <path
        d="M60 330 C60 190 100 90 190 90 C280 90 320 190 320 330 Z"
        fill="var(--color-forest)"
      />
      <path
        d="M90 330 C90 205 122 128 190 128 C258 128 290 205 290 330 Z"
        fill="var(--color-forest-dark)"
      />
      <path
        d="M118 330 C118 220 144 162 190 162 C236 162 262 220 262 330 Z"
        fill="var(--color-fox-tint)"
      />

      {/* Лииса выглядывает из норы */}
      <g transform="translate(150,236) scale(2.1)">
        <path d="M14 26 L22 4 L30 22 Z" fill="var(--color-fox)" />
        <path d="M50 26 L42 4 L34 22 Z" fill="var(--color-fox)" />
        <path
          d="M32 14 C46 14 54 28 50 42 C47 54 38 58 32 58 C26 58 17 54 14 42 C10 28 18 14 32 14 Z"
          fill="var(--color-fox)"
        />
        <path
          d="M32 34 C40 34 44 42 41 50 C39 55 35 57 32 57 C29 57 25 55 23 50 C20 42 24 34 32 34 Z"
          fill="var(--color-fox-tint)"
        />
        <circle cx="24" cy="32" r="2.6" fill="#2b2019" />
        <circle cx="40" cy="32" r="2.6" fill="#2b2019" />
        <path d="M32 46 L28 50 L36 50 Z" fill="#2b2019" />
      </g>

      {/* сокровища норы вокруг входа */}
      <g stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <g transform="translate(46,150)">
          <circle r="16" fill="var(--color-gold)" stroke="none" opacity="0.35" />
          <path d="M-6 4 L0 -8 L6 4 Z" />
          <path d="M-6 4 L6 4" />
        </g>
        <g transform="translate(320,140)">
          <circle r="18" fill="var(--color-fox)" stroke="none" opacity="0.3" />
          <circle r="7" cx="-4" cy="-4" />
          <path d="M1 1 L14 14" />
        </g>
        <g transform="translate(60,270)">
          <circle r="16" fill="var(--color-forest)" stroke="none" opacity="0.25" />
          <path d="M-8 4 L0 -6 L8 4 Z" />
          <path d="M-6 4 L-6 10 L6 10 L6 4" />
        </g>
        <g transform="translate(316,270)">
          <circle r="15" fill="var(--color-gold)" stroke="none" opacity="0.3" />
          <path d="M-7 3 L-2 -6 L2 2 L7 -4" />
        </g>
      </g>
    </svg>
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
            «Лисья нора» — магазин уникальных подарков в старом Выборге. Украшения, часы, обереги
            и диковинки — всё <strong>ручной работы</strong>, всё штучное. А ещё здесь служит
            рыжий сотрудник по имени Лииса.
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
        <div className="hero__stage" aria-hidden="true">
          <HeroStage />
        </div>
      </div>
    </section>
  )
}
