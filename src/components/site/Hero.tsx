import type { ReactNode } from 'react'

/** Круглый бейдж категории — единый визуальный язык с иконками карточек товаров. */
function Badge({
  cx,
  cy,
  r,
  rotate = 0,
  fill,
  children,
}: {
  cx: number
  cy: number
  r: number
  rotate?: number
  fill: string
  children: ReactNode
}) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rotate})`} filter="url(#badgeShadow)">
      <circle r={r} fill={fill} stroke="var(--color-paper)" strokeWidth="3" />
      <g stroke="var(--color-ink)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {children}
      </g>
    </g>
  )
}

function HeroStage() {
  return (
    <svg viewBox="0 0 420 460" role="img" aria-labelledby="hero-stage-title">
      <title id="hero-stage-title">
        Рыжая лиса выглядывает из норы, а вокруг — украшения, кованые фигуры, куклы-зверята и обереги
      </title>
      <defs>
        <radialGradient id="denGlow" cx="50%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#ffe9c9" />
          <stop offset="55%" stopColor="var(--color-fox-tint)" />
          <stop offset="100%" stopColor="#caa06f" />
        </radialGradient>
        <linearGradient id="archOuter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3c5c48" />
          <stop offset="100%" stopColor="var(--color-forest-dark)" />
        </linearGradient>
        <linearGradient id="archInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a6b54" />
          <stop offset="100%" stopColor="var(--color-forest)" />
        </linearGradient>
        <linearGradient id="foxFur" x1="0.15" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#d9743f" />
          <stop offset="55%" stopColor="var(--color-fox)" />
          <stop offset="100%" stopColor="#9c4a24" />
        </linearGradient>
        <filter id="badgeShadow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2b2019" floodOpacity="0.28" />
        </filter>
        <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* тень на земле */}
      <ellipse cx="210" cy="404" rx="150" ry="16" fill="#3a2a1d" opacity="0.18" filter="url(#soft)" />

      {/* холм норы: дёрн со слоями и корнями */}
      <path
        d="M55 392 C55 230 118 110 210 110 C302 110 365 230 365 392 Z"
        fill="url(#archOuter)"
      />
      <path
        d="M90 392 C90 250 140 148 210 148 C280 148 330 250 330 392 Z"
        fill="url(#archInner)"
      />
      {/* дерновая кромка холма */}
      <g stroke="#2c4636" strokeWidth="3" strokeLinecap="round" opacity="0.55">
        <path d="M70 200 l7 -10 M84 178 l7 -11 M100 158 l6 -11 M120 140 l6 -10" />
        <path d="M350 200 l-7 -10 M336 178 l-7 -11 M320 158 l-6 -11 M300 140 l-6 -10" />
      </g>
      {/* корешки, пронизывающие холм */}
      <g stroke="#26392c" strokeWidth="2.5" fill="none" opacity="0.45" strokeLinecap="round">
        <path d="M110 380 C130 320 120 260 150 210" />
        <path d="M310 380 C288 320 300 260 268 210" />
        <path d="M150 392 C160 350 145 300 168 260" />
      </g>

      {/* вход в нору со светом внутри */}
      <path d="M126 392 C126 268 160 188 210 188 C260 188 294 268 294 392 Z" fill="url(#denGlow)" />

      {/* Лииса выглядывает из норы */}
      <g>
        {/* уши: внешние + внутренние */}
        <path d="M150 208 C146 176 150 150 168 132 C172 158 176 182 182 204 Z" fill="url(#foxFur)" />
        <path d="M270 208 C274 176 270 150 252 132 C248 158 244 182 238 204 Z" fill="url(#foxFur)" />
        <path d="M158 198 C157 178 160 162 170 150 C171 168 173 184 177 198 Z" fill="var(--color-fox-tint)" />
        <path d="M262 198 C263 178 260 162 250 150 C249 168 247 184 243 198 Z" fill="var(--color-fox-tint)" />

        {/* голова */}
        <path
          d="M210 190 C252 190 276 220 278 258 C280 292 268 320 250 340 C238 354 224 362 210 362
             C196 362 182 354 170 340 C152 320 140 292 142 258 C144 220 168 190 210 190 Z"
          fill="url(#foxFur)"
        />

        {/* тень под мордой для объёма */}
        <ellipse cx="212" cy="336" rx="42" ry="16" fill="#5c2c14" opacity="0.28" filter="url(#soft)" />

        {/* пучки шерсти на щеках */}
        <g fill="var(--color-fox)">
          <path d="M150 258 l-10 -4 l4 -9 l9 4 Z" />
          <path d="M146 278 l-11 -1 l1 -10 l10 2 Z" />
          <path d="M270 258 l10 -4 l-4 -9 l-9 4 Z" />
          <path d="M274 278 l11 -1 l-1 -10 l-10 2 Z" />
        </g>

        {/* светлая морда */}
        <path
          d="M210 262 C232 262 246 280 244 302 C242 322 228 342 210 342 C192 342 178 322 176 302
             C174 280 188 262 210 262 Z"
          fill="var(--color-fox-tint)"
        />

        {/* глаза: миндалевидные, с бликом */}
        <path d="M180 250 C186 244 196 244 200 251 C195 256 184 256 180 250 Z" fill="#2b2019" />
        <path d="M240 250 C234 244 224 244 220 251 C225 256 236 256 240 250 Z" fill="#2b2019" />
        <circle cx="192" cy="249" r="1.6" fill="#fbf3e4" />
        <circle cx="228" cy="249" r="1.6" fill="#fbf3e4" />
        {/* брови-веки */}
        <path d="M178 242 C184 237 194 236 200 240" stroke="#2b2019" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M242 242 C236 237 226 236 220 240" stroke="#2b2019" strokeWidth="2.4" fill="none" strokeLinecap="round" />

        {/* нос и рот */}
        <path d="M204 296 L210 288 L216 296 L210 300 Z" fill="#2b2019" />
        <path d="M210 300 L210 308 M210 308 C204 312 200 313 195 311 M210 308 C216 312 220 313 225 311" stroke="#2b2019" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>

      {/* бейджи категорий — тот же язык, что и на карточках товаров */}
      <Badge cx={78} cy={140} r={34} rotate={-8} fill="var(--color-fox-tint)">
        {/* украшения: кулон */}
        <path d="M-8 -2 L0 -12 L8 -2 L0 14 Z" />
        <path d="M-8 -2 L8 -2" />
      </Badge>

      <Badge cx={352} cy={128} r={30} rotate={6} fill="#dee2cd">
        {/* обереги: звезда-талисман */}
        <path d="M0 -12 L3 -3 L12 -3 L5 3 L7 12 L0 6 L-7 12 L-5 3 L-12 -3 L-3 -3 Z" />
      </Badge>

      <Badge cx={62} cy={286} r={32} rotate={-4} fill="#e4ddc3">
        {/* кузница: молот */}
        <path d="M-10 10 L2 -2 L10 6 L-2 18 Z" />
        <path d="M4 -4 L14 -14" />
        <rect x="10" y="-24" width="14" height="10" rx="2" transform="rotate(45 17 -19)" />
      </Badge>

      <Badge cx={362} cy={300} r={30} rotate={5} fill="#e6d7c2">
        {/* куклы-зверята: мордочка */}
        <path d="M-7 -9 L-11 -16 M7 -9 L11 -16" />
        <circle r="12" cy="0" />
        <circle cx="-4" cy="-2" r="1.6" fill="var(--color-ink)" stroke="none" />
        <circle cx="4" cy="-2" r="1.6" fill="var(--color-ink)" stroke="none" />
        <path d="M-3 6 C-1 8 1 8 3 6" />
      </Badge>
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
        <div className="hero__stage" aria-hidden="true">
          <HeroStage />
        </div>
      </div>
    </section>
  )
}
