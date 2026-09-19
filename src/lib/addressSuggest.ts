/** Подсказки адресов через Photon (OpenStreetMap) — без ключа, как на типичных формах заказа. */

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
/** Выборг — лёгкий bias, чтобы ближние адреса были выше. */
const BIAS_LAT = 60.71305
const BIAS_LON = 28.7348

function joinParts(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ')
}

function formatSuggestion(
  properties: Record<string, unknown>,
  index: number,
): AddressSuggestion | null {
  const street = typeof properties.street === 'string' ? properties.street : null
  const name = typeof properties.name === 'string' ? properties.name : null
  const house = typeof properties.housenumber === 'string' ? properties.housenumber : null
  const city =
    (typeof properties.city === 'string' && properties.city) ||
    (typeof properties.town === 'string' && properties.town) ||
    (typeof properties.village === 'string' && properties.village) ||
    (typeof properties.county === 'string' && properties.county) ||
    null
  const state = typeof properties.state === 'string' ? properties.state : null
  const district = typeof properties.district === 'string' ? properties.district : null

  const road = street || (name && !house ? name : null)
  if (!road && !name) return null

  const streetLine = joinParts([road, house ? `д. ${house}` : null])
  const label = streetLine || name || ''
  if (label.length < 3) return null

  const detail = joinParts([label, district, city, state])
  return {
    id: `${index}-${label}-${city ?? ''}`,
    label,
    city,
    detail: detail || label,
  }
}

export async function suggestAddresses(
  query: string,
  options: { city?: string; signal?: AbortSignal } = {},
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim()
  if (trimmed.length < 3) return []

  const q = options.city?.trim() ? `${options.city.trim()}, ${trimmed}` : trimmed
  const url = new URL(PHOTON_URL)
  url.searchParams.set('q', q)
  url.searchParams.set('lang', 'ru')
  url.searchParams.set('limit', '6')
  url.searchParams.set('lat', String(BIAS_LAT))
  url.searchParams.set('lon', String(BIAS_LON))

  const response = await fetch(url.toString(), {
    signal: options.signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) return []

  const data = (await response.json()) as {
    features?: Array<{ properties?: Record<string, unknown> }>
  }
  if (!Array.isArray(data.features)) return []

  const seen = new Set<string>()
  const results: AddressSuggestion[] = []
  for (let i = 0; i < data.features.length; i++) {
    const props = data.features[i]?.properties
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

  const url = new URL(PHOTON_URL)
  url.searchParams.set('q', trimmed)
  url.searchParams.set('lang', 'ru')
  url.searchParams.set('limit', '8')
  url.searchParams.set('lat', String(BIAS_LAT))
  url.searchParams.set('lon', String(BIAS_LON))

  const response = await fetch(url.toString(), {
    signal: options.signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) return []

  const data = (await response.json()) as {
    features?: Array<{ properties?: Record<string, unknown> }>
  }
  if (!Array.isArray(data.features)) return []

  const seen = new Set<string>()
  const results: AddressSuggestion[] = []
  for (let i = 0; i < data.features.length; i++) {
    const props = data.features[i]?.properties
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
