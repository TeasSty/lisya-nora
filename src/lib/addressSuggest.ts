/** Подсказки адресов через Photon (OpenStreetMap) — без ключа. */

export interface AddressSuggestion {
  id: string
  /** Строка для поля «точный адрес» */
  label: string
  /** Город, если удалось вытащить */
  city: string | null
  /** Полная подпись в выпадающем списке */
  detail: string
}

const PHOTON_URL = 'https://photon.komoot.io/api/'
/** Выборг — bias по умолчанию, если город не задан. */
const DEFAULT_BIAS = { lat: 60.71305, lon: 28.7348 }

/** Частые города доставки — координаты для привязки поиска. */
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

function joinParts(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ')
}

function normalizeCityKey(city: string): string {
  return city.trim().toLocaleLowerCase('ru-RU').replace(/^г\.?\s+/u, '')
}

function biasForCity(city?: string): { lat: number; lon: number } {
  if (!city?.trim()) return DEFAULT_BIAS
  return CITY_BIAS[normalizeCityKey(city)] ?? DEFAULT_BIAS
}

/** Убираем «ул.» / «улица» — Photon лучше ищет по названию. */
function cleanStreetQuery(query: string): string {
  return query
    .trim()
    .replace(/^(ул\.?|улица|пр\.?|проспект|пер\.?|переулок|б-р|бульвар)\s+/iu, '')
    .trim()
}

function formatSuggestion(
  properties: Record<string, unknown>,
  index: number,
): AddressSuggestion | null {
  const street = typeof properties.street === 'string' ? properties.street : null
  const name = typeof properties.name === 'string' ? properties.name : null
  const house =
    typeof properties.housenumber === 'string'
      ? properties.housenumber
      : typeof properties.housenumber === 'number'
        ? String(properties.housenumber)
        : null
  const city =
    (typeof properties.city === 'string' && properties.city) ||
    (typeof properties.town === 'string' && properties.town) ||
    (typeof properties.village === 'string' && properties.village) ||
    (typeof properties.county === 'string' && properties.county) ||
    null
  const state = typeof properties.state === 'string' ? properties.state : null
  const district = typeof properties.district === 'string' ? properties.district : null

  const road = street || name
  if (!road) return null

  const streetLine = joinParts([road, house ? `д. ${house}` : null])
  const label = streetLine || road
  if (label.length < 2) return null

  const detail = joinParts([label, district, city, state])
  return {
    id: `${index}-${label}-${city ?? ''}`,
    label,
    city,
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
  // lang=ru Photon не поддерживает (только default/de/en/fr) — без lang.

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

export async function suggestAddresses(
  query: string,
  options: { city?: string; signal?: AbortSignal } = {},
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim()
  if (trimmed.length < 3) return []

  const street = cleanStreetQuery(trimmed)
  const searchCore = street.length >= 2 ? street : trimmed
  const city = options.city?.trim()
  const bias = biasForCity(city)
  const q = city ? `${city} ${searchCore}` : searchCore

  const features = await fetchPhoton(
    {
      q,
      limit: '8',
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
    const key = suggestion.detail.toLocaleLowerCase('ru-RU')
    if (seen.has(key)) continue
    seen.add(key)
    results.push(suggestion)
  }
  return results
}

export async function suggestCities(
  query: string,
  options: { signal?: AbortSignal } = {},
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const bias = DEFAULT_BIAS
  const features = await fetchPhoton(
    {
      q: trimmed,
      limit: '8',
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
    const city =
      (typeof props.name === 'string' && props.name) ||
      (typeof props.city === 'string' && props.city) ||
      null
    if (!city) continue
    const key = city.toLocaleLowerCase('ru-RU')
    if (seen.has(key)) continue
    seen.add(key)
    const state = typeof props.state === 'string' ? props.state : null
    results.push({
      id: `city-${i}-${city}`,
      label: city,
      city,
      detail: joinParts([city, state]),
    })
  }
  return results
}
