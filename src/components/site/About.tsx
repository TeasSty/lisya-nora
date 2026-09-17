import { useReveal } from '../../lib/useReveal'

function Shelf({ y }: { y: number }) {
  return (
    <g>
      <rect x="16" y={y} width="284" height="16" rx="4" fill="url(#woodShelf)" />
      <rect x="16" y={y + 16} width="284" height="6" fill="#241a13" opacity="0.35" />
      <path
        d={`M28 ${y + 4} h30 M96 ${y + 6} h44 M190 ${y + 4} h60`}
        stroke="#5a3a22"
        strokeWidth="1.4"
        opacity="0.5"
      />
    </g>
  )
}

function ShelfArt() {
  return (
    <svg viewBox="0 0 340 380" role="img" aria-labelledby="shelf-art-title">
      <title id="shelf-art-title">
        Полка с керамикой, кованой совой и куклой-зверушкой, рядом сидит лиса Лииса
      </title>
      <defs>
        <linearGradient id="woodShelf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a9663a" />
          <stop offset="100%" stopColor="#7c4526" />
        </linearGradient>
        <linearGradient id="foxFurSide" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#d9743f" />
          <stop offset="60%" stopColor="var(--color-fox)" />
          <stop offset="100%" stopColor="#9c4a24" />
        </linearGradient>
      </defs>

      {/* тёплое пятно света у полок */}
      <ellipse cx="150" cy="150" rx="150" ry="140" fill="var(--color-fox-tint)" opacity="0.35" />

      <Shelf y={70} />
      <Shelf y={190} />

      {/* верхняя полка: керамическая всячница + оберег-подвеска */}
      <g transform="translate(70,66)">
        <path
          d="M-22 0 C-22 -18 -10 -30 0 -30 C10 -30 22 -18 22 0 C22 6 18 10 12 10 L-12 10 C-18 10 -22 6 -22 0 Z"
          fill="var(--color-fox)"
        />
        <ellipse cx="0" cy="-30" rx="9" ry="4" fill="var(--color-fox-dark)" />
        <path d="M-14 -6 C-8 -2 8 -2 14 -6" stroke="#7a3a1c" strokeWidth="1.6" fill="none" opacity="0.6" />
      </g>
      <g transform="translate(245,58)" stroke="var(--color-ink)" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 -20 L4 -6 L18 -6 L7 2 L11 16 L0 8 L-11 16 L-7 2 L-18 -6 L-4 -6 Z" fill="var(--color-gold)" stroke="var(--color-ink)" />
      </g>

      {/* средняя полка: кованая сова + кукла-зверушка */}
      <g transform="translate(80,192)" stroke="var(--color-ink)" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-13 -20 C-15 -28 -13 -34 -8 -38 C-8 -30 -7 -24 -6 -18 Z" fill="var(--color-fox)" stroke="none" />
        <path d="M13 -20 C15 -28 13 -34 8 -38 C8 -30 7 -24 6 -18 Z" fill="var(--color-fox)" stroke="none" />
        <path d="M0 -22 C16 -22 24 -8 22 6 C20 20 10 28 0 28 C-10 28 -20 20 -22 6 C-24 -8 -16 -22 0 -22 Z" fill="var(--color-fox-tint)" />
        <circle cx="-7" cy="-2" r="5" fill="var(--color-paper)" />
        <circle cx="7" cy="-2" r="5" fill="var(--color-paper)" />
        <circle cx="-7" cy="-2" r="2.2" fill="var(--color-ink)" stroke="none" />
        <circle cx="7" cy="-2" r="2.2" fill="var(--color-ink)" stroke="none" />
        <path d="M0 4 L-4 10 L4 10 Z" fill="var(--color-gold)" />
      </g>
      <g transform="translate(232,196)">
        <path
          d="M0 -18 C14 -18 22 -6 20 8 C18 22 10 30 0 30 C-10 30 -18 22 -20 8 C-22 -6 -14 -18 0 -18 Z"
          fill="#c7a173"
        />
        <circle cx="-13" cy="-14" r="6" fill="#c7a173" />
        <circle cx="13" cy="-14" r="6" fill="#c7a173" />
        <circle cx="-6" cy="-2" r="2" fill="var(--color-ink)" />
        <circle cx="6" cy="-2" r="2" fill="var(--color-ink)" />
        <path d="M-4 8 C-1 11 1 11 4 8" stroke="var(--color-ink)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>

      {/* Лииса сидит у полок */}
      <g transform="translate(150,300)">
        {/* хвост */}
        <path
          d="M50 40 C86 30 96 -6 76 -22 C92 -10 92 24 60 44 Z"
          fill="url(#foxFurSide)"
        />
        <path d="M78 -14 C84 -6 84 10 70 22" stroke="var(--color-fox-tint)" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.7" />
        {/* тело (сидит) */}
        <path
          d="M-46 46 C-52 6 -30 -30 0 -30 C30 -30 52 6 46 46 C40 62 -40 62 -46 46 Z"
          fill="url(#foxFurSide)"
        />
        {/* уши */}
        <path d="M-26 -34 C-30 -54 -26 -70 -14 -80 C-12 -62 -10 -46 -6 -32 Z" fill="url(#foxFurSide)" />
        <path d="M26 -34 C30 -54 26 -70 14 -80 C12 -62 10 -46 6 -32 Z" fill="url(#foxFurSide)" />
        <path d="M-21 -40 C-22 -54 -20 -64 -13 -71 C-13 -60 -12 -48 -10 -38 Z" fill="var(--color-fox-tint)" />
        <path d="M21 -40 C22 -54 20 -64 13 -71 C13 -60 12 -48 10 -38 Z" fill="var(--color-fox-tint)" />
        {/* голова */}
        <path
          d="M0 -36 C22 -36 34 -18 33 2 C32 20 20 34 0 34 C-20 34 -32 20 -33 2 C-34 -18 -22 -36 0 -36 Z"
          fill="url(#foxFurSide)"
        />
        {/* мордочка */}
        <path
          d="M0 -6 C13 -6 20 4 19 14 C18 24 10 32 0 32 C-10 32 -18 24 -19 14 C-20 4 -13 -6 0 -6 Z"
          fill="var(--color-fox-tint)"
        />
        {/* глаза */}
        <path d="M-14 -8 C-11 -12 -4 -12 -2 -8 C-6 -5 -11 -5 -14 -8 Z" fill="#2b2019" />
        <path d="M14 -8 C11 -12 4 -12 2 -8 C6 -5 11 -5 14 -8 Z" fill="#2b2019" />
        <circle cx="-9" cy="-9" r="1.1" fill="#fbf3e4" />
        <circle cx="9" cy="-9" r="1.1" fill="#fbf3e4" />
        {/* нос и рот */}
        <path d="M-3 8 L0 3 L3 8 L0 11 Z" fill="#2b2019" />
        <path d="M0 11 L0 15 M0 15 C-4 18 -6 18 -9 16 M0 15 C4 18 6 18 9 16" stroke="#2b2019" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  )
}

const FACTS = [
  {
    title: 'Ручная работа, без исключений',
    text: 'Каждая вещь на полке — от мастера, а не с конвейера. Одна вещь обычно означает один автор.',
  },
  {
    title: 'В штате — рыжая Лииса',
    text: 'В группе магазина честно предупреждают: здесь служит хвостатый сотрудник по имени Лииса. Это не шутка ради шутки, а часть атмосферы.',
  },
  {
    title: 'Бесплатная фотозона',
    text: 'Гости отдельно отмечают её в отзывах на 2ГИС — сюда действительно заходят не только за покупкой.',
  },
  {
    title: 'Для тех, кто в Выборге проездом',
    text: 'Рядом со старым городом — удобно зайти на пять минут между крепостью и обедом и найти подарок, который не купить в сетевом магазине.',
  },
]

export function About() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section id="o-magazine" className="section">
      <div className="container">
        <div className="about__grid reveal" ref={ref}>
          <div className="about__art" aria-hidden="true">
            <ShelfArt />
          </div>

          <div>
            <span className="eyebrow">Не только магазин</span>
            <h2>В норе всегда тепло</h2>
            <ul className="about__facts">
              {FACTS.map((fact) => (
                <li key={fact.title}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12.5 L9.5 17 L19 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>
                    <strong>{fact.title}.</strong> {fact.text}
                  </span>
                </li>
              ))}
            </ul>
            <p className="about__quote">«У нас всегда тепло и вам всегда рады»</p>
          </div>
        </div>
      </div>
    </section>
  )
}
