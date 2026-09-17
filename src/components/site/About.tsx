import { useReveal } from '../../lib/useReveal'

function ShelfArt() {
  return (
    <svg viewBox="0 0 320 300" role="img" aria-labelledby="shelf-art-title">
      <title id="shelf-art-title">Полка с подарками и лисой рядом</title>
      <rect x="20" y="70" width="280" height="14" rx="6" fill="var(--color-fox)" />
      <rect x="20" y="170" width="280" height="14" rx="6" fill="var(--color-fox)" />

      {/* верхняя полка: часы + оберег */}
      <circle cx="80" cy="46" r="22" fill="none" stroke="var(--color-ink)" strokeWidth="3.2" />
      <path d="M80 46 L80 32 M80 46 L90 52" stroke="var(--color-ink)" strokeWidth="3.2" strokeLinecap="round" />
      <path
        d="M210 20 L216 32 L229 32 L219 40 L223 53 L210 45 L197 53 L201 40 L191 32 L204 32 Z"
        fill="var(--color-gold)"
      />

      {/* средняя полка: домик + ключ */}
      <g transform="translate(70,120)" stroke="var(--color-ink)" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-16 30 L0 12 L16 30" />
        <path d="M-10 28 L-10 46 L10 46 L10 28" />
      </g>
      <g transform="translate(220,132)" stroke="var(--color-ink)" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="0" cy="0" r="10" />
        <path d="M7 7 L28 28" />
        <path d="M20 20 L26 14 M25 25 L31 19" />
      </g>

      {/* нижняя полка: Лииса сидит рядом */}
      <g transform="translate(150,190) scale(2.4)">
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
