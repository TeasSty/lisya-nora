import { useId } from 'react'
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

/** Game-icons silhouette as a recolored glyph (alpha mask). */
function ShelfGlyph({
  src,
  x,
  y,
  size,
  fill,
}: {
  src: string
  x: number
  y: number
  size: number
  fill: string
}) {
  const reactId = useId().replace(/:/g, '')
  const maskId = `shelf-mask-${reactId}`

  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={size}
          height={size}
          // alpha: opaque pixels of the icon reveal the fill
          style={{ maskType: 'alpha' }}
        >
          <image href={src} width={size} height={size} preserveAspectRatio="xMidYMid meet" />
        </mask>
      </defs>
      <rect width={size} height={size} fill={fill} mask={`url(#${maskId})`} />
    </g>
  )
}

function ShelfArt() {
  const vase = assetPath('icons/shelf/porcelain-vase.svg')
  const earrings = assetPath('icons/shelf/earrings.svg')
  const puppet = assetPath('icons/shelf/puppet.svg')
  const owl = assetPath('icons/shelf/owl.svg')
  const scarab = assetPath('icons/shelf/gold-scarab.svg')

  return (
    <svg viewBox="0 0 300 280" role="img" aria-labelledby="shelf-art-title">
      <title id="shelf-art-title">Полки магазина: керамика, украшения, кукла, кованая сова и оберег</title>
      <defs>
        <linearGradient id="woodShelf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a9663a" />
          <stop offset="100%" stopColor="#7c4526" />
        </linearGradient>
      </defs>

      <ellipse cx="150" cy="130" rx="150" ry="120" fill="var(--color-fox-tint)" opacity="0.35" />

      <Shelf y={70} />
      <Shelf y={190} />

      {/* верхняя полка: керамика + украшения — вся полка в семействе fox */}
      <ShelfGlyph src={vase} x={46} y={14} size={56} fill="var(--color-fox)" />
      <ShelfGlyph src={earrings} x={188} y={16} size={52} fill="var(--color-fox-dark)" />

      {/* нижняя полка: кукла + ковка + оберег */}
      <ShelfGlyph src={puppet} x={36} y={132} size={56} fill="var(--color-fox-deep)" />
      <ShelfGlyph src={owl} x={128} y={134} size={52} fill="var(--color-fox-dark)" />
      <ShelfGlyph src={scarab} x={214} y={136} size={50} fill="var(--color-fox)" />
    </svg>
  )
}

const FACTS = [
  {
    title: 'Изделия с выставок и ручная работа',
    text: 'В магазине преимущественно представлены изделия с выставок, изделия ручной работы, редкие и уникальные вещи со своим особенным волшебством.',
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
    title: 'Найти нас очень легко',
    text: 'Магазин «Лисья нора» находится в самом сердце старого города, на улице Краснофлотской, дом 4а. Рядом со статуей монаха.',
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
