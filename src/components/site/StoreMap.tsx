import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Краснофлотская улица, Выборг — координаты уточнены через геокодер OpenStreetMap
// (сама улица очень короткая, менее 200 м, так что точность вполне достаточная).
const STORE_COORDS: [number, number] = [60.71305, 28.7348]

const PIN_SVG = `
  <svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 2 C8 2 2 9 2 17 C2 27 17 42 17 42 C17 42 32 27 32 17 C32 9 26 2 17 2 Z"
      fill="#c1552a" stroke="#fbf3e4" stroke-width="2.5" />
    <circle cx="17" cy="17" r="7" fill="#fbf3e4" />
  </svg>
`

function createPinIcon(): L.DivIcon {
  return L.divIcon({
    html: PIN_SVG,
    className: 'store-map__pin',
    iconSize: [34, 44],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
  })
}

/**
 * Лёгкая карта на Leaflet + бесплатных тайлах CARTO (без API-ключей).
 * Тон плитки смещён CSS-фильтром в фирменный тёмно-зелёный.
 * Карта «спит» (не перехватывает скролл/жесты страницы), пока её не включат кликом —
 * это особенно важно на мобильных, где иначе палец случайно начинает водить по карте
 * вместо скролла страницы.
 */
export function StoreMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: STORE_COORDS,
      zoom: 16,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      subdomains: 'abc',
      maxZoom: 19,
    }).addTo(map)

    const marker = L.marker(STORE_COORDS, { icon: createPinIcon(), alt: 'Лисья нора, Краснофлотская 4А' })
      .addTo(map)
      .bindPopup('<strong>Лисья нора</strong><br />Краснофлотская, 4А')
    // L.divIcon не поддерживает alt (это не <img>), поэтому имя для скринридера
    // проставляем на DOM-элементе маркера вручную.
    marker.getElement()?.setAttribute('aria-label', 'Лисья нора — Краснофлотская, 4А, Выборг')

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  function activateMap() {
    const map = mapRef.current
    if (!map || isActive) return
    map.dragging.enable()
    map.scrollWheelZoom.enable()
    map.doubleClickZoom.enable()
    map.touchZoom.enable()
    setIsActive(true)
  }

  return (
    <div className="store-map">
      <div ref={containerRef} className="store-map__canvas" role="application" aria-label="Карта: где находится «Лисья нора»" />
      {!isActive && (
        <button type="button" className="store-map__activate" onClick={activateMap}>
          Нажмите, чтобы включить карту
        </button>
      )}
    </div>
  )
}
