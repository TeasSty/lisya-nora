import { lazy, Suspense } from 'react'
import { useReveal } from '../../lib/useReveal'

// Leaflet — не маленькая библиотека, а карта находится ниже первого экрана,
// поэтому грузим её отдельным чанком только тогда, когда она реально нужна.
const StoreMap = lazy(() => import('./StoreMap').then((m) => ({ default: m.StoreMap })))

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
            <Suspense fallback={<div className="store-map__canvas store-map__canvas--loading" />}>
              <StoreMap />
            </Suspense>
            <p className="waymap__caption">
              От Выборгского замка — пара минут пешком.{' '}
              <a
                href={`https://yandex.ru/maps/?text=${mapQuery}`}
                target="_blank"
                rel="noreferrer"
              >
                Открыть в Яндекс Картах
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
