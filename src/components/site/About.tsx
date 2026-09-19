import { useReveal } from '../../lib/useReveal'
import { assetPath } from '../../lib/assetPath'

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
    <svg viewBox="0 0 340 280" role="img" aria-labelledby="shelf-art-title">
      <title id="shelf-art-title">Полки магазина с керамикой, кованой совой и оберегом</title>
      <defs>
        <linearGradient id="woodShelf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a9663a" />
          <stop offset="100%" stopColor="#7c4526" />
        </linearGradient>
      </defs>

      <ellipse cx="150" cy="130" rx="150" ry="120" fill="var(--color-fox-tint)" opacity="0.35" />

      <Shelf y={70} />
      <Shelf y={190} />

      {/* верхняя полка: керамика + оберег */}
      <g transform="translate(70,66)">
        <path
          d="M-22 0 C-22 -18 -10 -30 0 -30 C10 -30 22 -18 22 0 C22 6 18 10 12 10 L-12 10 C-18 10 -22 6 -22 0 Z"
          fill="var(--color-fox)"
        />
        <ellipse cx="0" cy="-30" rx="9" ry="4" fill="var(--color-fox-dark)" />
      </g>
      <g transform="translate(210,40)" stroke="var(--color-ink)" strokeWidth="2" fill="none">
        <path d="M0 0 L0 22" />
        <path d="M0 22 L-10 38 L0 34 L10 38 Z" fill="var(--color-gold)" stroke="none" />
        <circle cx="0" cy="0" r="5" fill="var(--color-gold)" stroke="none" />
      </g>

      {/* нижняя полка: домик + ключ + кованая сова */}
      <g transform="translate(78,168)" stroke="var(--color-ink)" strokeWidth="2.2" fill="none">
        <path d="M-18 34 V10 L0 -6 L18 10 V34 Z" />
        <rect x="-6" y="18" width="12" height="16" />
      </g>
      <g transform="translate(160,178)" stroke="var(--color-ink)" strokeWidth="2.2" fill="none">
        <circle cx="0" cy="0" r="8" />
        <path d="M0 8 V28 M0 20 H8 M0 28 H6" />
      </g>
      <g transform="translate(250,170)" fill="var(--color-ink)">
        <ellipse cx="0" cy="8" rx="18" ry="22" />
        <circle cx="-7" cy="-10" r="7" />
        <circle cx="7" cy="-10" r="7" />
        <circle cx="-7" cy="-10" r="2.5" fill="var(--color-paper)" />
        <circle cx="7" cy="-10" r="2.5" fill="var(--color-paper)" />
        <path d="M-3 4 L0 10 L3 4" fill="var(--color-gold)" />
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
          <div className="about__art">
            <div className="about__portrait">
              <img
                src={assetPath('images/fox-liisa.webp')}
                alt="Рыжая лиса — символ магазина «Лисья нора»"
                width={900}
                height={1350}
                loading="lazy"
                decoding="async"
              />
            </div>
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
            <p className="about__quote">В самом сердце старого города</p>
          </div>
        </div>
      </div>
    </section>
  )
}
