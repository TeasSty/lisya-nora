import { useReveal } from '../../lib/useReveal'

function WaySketch() {
  return (
    <svg viewBox="0 0 320 260" role="img" aria-labelledby="way-sketch-title">
      <title id="way-sketch-title">Схематичная зарисовка пути от Выборгского замка до магазина</title>
      {/* силуэт замка как ориентир старого города */}
      <g transform="translate(30,40)" fill="var(--color-bg)" opacity="0.92">
        <rect x="0" y="40" width="70" height="50" />
        <rect x="10" y="10" width="18" height="80" />
        <polygon points="10,10 19,-6 28,10" />
        <rect x="44" y="0" width="16" height="90" />
        <polygon points="44,0 52,-14 60,0" />
      </g>

      {/* пунктирная тропа */}
      <path
        d="M95 95 C140 120 150 150 190 165 C220 175 230 190 250 205"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="3"
        strokeDasharray="2 12"
        strokeLinecap="round"
      />

      {/* булавка «Лисья нора» */}
      <g transform="translate(250,205)">
        <path
          d="M0 0 C-16 -16 -16 -34 0 -34 C16 -34 16 -16 0 0 Z"
          fill="var(--color-fox)"
        />
        <circle cx="0" cy="-24" r="7" fill="var(--color-bg)" />
      </g>

      <text x="20" y="150" fill="var(--color-bg)" opacity="0.7" fontSize="13" fontFamily="Manrope, sans-serif">
        Выборгский замок
      </text>
      <text x="196" y="240" fill="var(--color-bg)" fontSize="13" fontFamily="Manrope, sans-serif" fontWeight="700">
        Краснофлотская, 4А
      </text>
    </svg>
  )
}

export function Location() {
  const ref = useReveal<HTMLDivElement>()
  const mapQuery = encodeURIComponent('Лисья нора магазин подарков Краснофлотская 4а Выборг')

  return (
    <section id="gde-my" className="section">
      <div className="container">
        <div className="section__head reveal" ref={ref}>
          <span className="eyebrow">Как нас найти</span>
          <h2>Центр Выборга, рядом со старым городом</h2>
          <p>Заходите — без предварительной записи, просто по расписанию магазина.</p>
        </div>

        <div className="location__grid">
          <div className="location__card">
            <div className="location__row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z" />
                <circle cx="12" cy="10" r="2.6" />
              </svg>
              <div>
                <strong>Краснофлотская улица, 4А</strong>
                <span>1 этаж, Центральный микрорайон, Выборг</span>
              </div>
            </div>

            <div className="location__row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3.5 2" strokeLinecap="round" />
              </svg>
              <div>
                <strong>Ежедневно, 11:00–19:00</strong>
                <span>без выходных</span>
              </div>
            </div>

            <div className="location__row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 5c0 8.284 6.716 15 15 15l3-4-6-3-2 2c-2.5-1-4-2.5-5-5l2-2-3-6-4 3Z" />
              </svg>
              <div>
                <strong>
                  <a href="tel:+79213326427">+7 921 332-64-27</a>
                </strong>
                <span>звонок или сообщение — как удобнее</span>
              </div>
            </div>

            <div className="location__actions">
              <a
                className="btn btn-primary"
                href={`https://2gis.ru/search/${mapQuery}`}
                target="_blank"
                rel="noreferrer"
              >
                Открыть на 2ГИС
              </a>
              <a className="btn btn-ghost" href="https://vk.com/lissi_nora" target="_blank" rel="noreferrer">
                Группа ВКонтакте
              </a>
            </div>
          </div>

          <div className="waymap">
            <div aria-hidden="true">
              <WaySketch />
            </div>
            <p className="waymap__caption">Схематично: от Выборгского замка — пара минут пешком до норы.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
