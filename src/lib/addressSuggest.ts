/**
 * Подсказки адресов (Photon / OSM).
 * Без ключа; названия регионов переводим на русский вручную
 * (Photon не умеет lang=ru).
 */

export interface AddressSuggestion {
  id: string
  /** Полная строка в поле адреса */
  label: string
  /** Город для заявки / Ozon */
  city: string | null
  /** Улица и дом без города */
  streetLine: string
  detail: string
}

const PHOTON_URL = 'https://photon.komoot.io/api/'
const DEFAULT_BIAS = { lat: 60.71305, lon: 28.7348 }

const CITY_BIAS: Record<string, { lat: number; lon: number }> = {
  выборг: { lat: 60.71305, lon: 28.7348 },
  мурманск: { lat: 68.9585, lon: 33.0827 },
  'санкт-петербург': { lat: 59.9343, lon: 30.3351 },
  петербург: { lat: 59.9343, lon: 30.3351 },
  спб: { lat: 59.9343, lon: 30.3351 },
  москва: { lat: 55.7558, lon: 37.6173 },
  петрозаводск: { lat: 61.7849, lon: 34.3469 },
  архангельск: { lat: 64.5393, lon: 40.5187 },
}

const PLACE_RU: Record<string, string> = {
  'murmansk oblast': 'Мурманская область',
  murmansk: 'Мурманск',
  'leningrad oblast': 'Ленинградская область',
  'saint petersburg': 'Санкт-Петербург',
  'st petersburg': 'Санкт-Петербург',
  'st. petersburg': 'Санкт-Петербург',
  moscow: 'Москва',
  'moscow oblast': 'Московская область',
  'arkhangelsk oblast': 'Архангельская область',
  arkhangelsk: 'Архангельск',
  'republic of karelia': 'Республика Карелия',
  karelia: 'Республика Карелия',
  komi: 'Республика Коми',
  'republic of komi': 'Республика Коми',
  'chelyabinsk oblast': 'Челябинская область',
  vyborg: 'Выборг',
  petrozavodsk: 'Петрозаводск',
}

const SKIP_OSM_KEYS = new Set([
  'shop',
  'amenity',
  'tourism',
  'office',
  'craft',
  'leisure',
  'historic',
  'healthcare',
  'club',
  'aeroway',
])

function joinParts(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ')
}

function localizePlace(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const trimmed = value.trim()
  return PLACE_RU[trimmed.toLocaleLowerCase('en-US')] ?? trimmed
}

function biasForQuery(query: string): { lat: number; lon: number } {
  const lower = query.toLocaleLowerCase('ru-RU')
  for (const [city, bias] of Object.entries(CITY_BIAS)) {
    if (lower.includes(city)) return bias
  }
  return DEFAULT_BIAS
}

function isStreetLike(properties: Record<string, unknown>): boolean {
  const osmKey = typeof properties.osm_key === 'string' ? properties.osm_key : ''
  if (SKIP_OSM_KEYS.has(osmKey)) return false

  const type = typeof properties.type === 'string' ? properties.type : ''
  if (type === 'house' || type === 'street' || type === 'district') return true

  const street = typeof properties.street === 'string' ? properties.street : null
  const house =
    typeof properties.housenumber === 'string' || typeof properties.housenumber === 'number'
  if (street) return true
  if (house && typeof properties.name === 'string') return true

  // Город / посёлок — только если явно place
  if (osmKey === 'place' && (type === 'city' || type === 'town' || type === 'village')) return true

  return false
}

function formatSuggestion(
  properties: Record<string, unknown>,
  index: number,
): AddressSuggestion | null {
  if (!isStreetLike(properties)) return null

  const street = typeof properties.street === 'string' ? properties.street : null
  const name = typeof properties.name === 'string' ? properties.name : null
  const houseRaw = properties.housenumber
  const house =
    typeof houseRaw === 'string' ? houseRaw : typeof houseRaw === 'number' ? String(houseRaw) : null

  const city = localizePlace(
    (typeof properties.city === 'string' && properties.city) ||
      (typeof properties.town === 'string' && properties.town) ||
      (typeof properties.village === 'string' && properties.village) ||
      null,
  )
  const state = localizePlace(
    typeof properties.state === 'string' ? properties.state : null,
  )
  const district = localizePlace(
    typeof properties.district === 'string' ? properties.district : null,
  )

  const type = typeof properties.type === 'string' ? properties.type : ''
  const road =
    street ||
    (type === 'city' || type === 'town' || type === 'village' ? null : name) ||
    null

  // Чистый город без улицы — тоже ок для начала ввода
  if (!road && city) {
    const label = joinParts([city, state])
    return {
      id: `place-${index}-${label}`,
      label: city,
      city,
      streetLine: '',
      detail: label,
    }
  }

  if (!road) return null

  const streetLine = joinParts([road, house ? `д. ${house}` : null])
  const label = joinParts([city, streetLine]) || streetLine
  const detail = joinParts([streetLine, district, city, state])

  return {
    id: `${index}-${label}`,
    label,
    city,
    streetLine,
    detail: detail || label,
  }
}

async function fetchPhoton(
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<Array<{ properties?: Record<string, unknown> }>> {
  const url = new URL(PHOTON_URL)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const response = await fetch(url.toString(), {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) return []

  const data = (await response.json()) as {
    features?: Array<{ properties?: Record<string, unknown> }>
  }
  return Array.isArray(data.features) ? data.features : []
}

/** Один поиск: город + улица + дом в одной строке. */
export async function suggestFullAddresses(
  query: string,
  options: { signal?: AbortSignal } = {},
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim()
  if (trimmed.length < 3) return []

  const bias = biasForQuery(trimmed)
  const features = await fetchPhoton(
    {
      q: `${trimmed}, Россия`,
      limit: '10',
      lat: String(bias.lat),
      lon: String(bias.lon),
    },
    options.signal,
  )

  const seen = new Set<string>()
  const results: AddressSuggestion[] = []
  for (let i = 0; i < features.length; i++) {
    const props = features[i]?.properties
    if (!props) continue
    const suggestion = formatSuggestion(props, i)
    if (!suggestion) continue
    const key = suggestion.label.toLocaleLowerCase('ru-RU')
    if (seen.has(key)) continue
    seen.add(key)
    results.push(suggestion)
  }
  return results
}

/** Достаём город из полной строки, если подсказку не выбирали. */
export function extractCityFromFullAddress(full: string): string {
  const parts = full
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length === 0) return ''

  // Часто: «Мурманск, ул. …» или «ул. …, Мурманск»
  const first = parts[0]
  const last = parts[parts.length - 1]
  if (!/ул\.|улица|пр\.|проспект|пер\.|д\./i.test(first) && first.length >= 2) {
    return first.replace(/^г\.?\s+/i, '')
  }
  if (parts.length > 1 && !/ул\.|улица|пр\.|д\./i.test(last)) {
    return last.replace(/^г\.?\s+/i, '')
  }
  return first.replace(/^г\.?\s+/i, '')
}
