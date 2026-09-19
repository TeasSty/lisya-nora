/**
 * Подсказки адресов по-русски.
 * 1) Nominatim + Accept-Language: ru (основной)
 * 2) Photon — запасной: локализуем город, отбрасываем латиницу
 */

export interface AddressSuggestion {
  id: string
  label: string
  city: string | null
  streetLine: string
  detail: string
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const PHOTON_URL = 'https://photon.komoot.io/api/'
const DEFAULT_BIAS = { lat: 60.71305, lon: 28.7348 }

const CITY_BIAS: Record<string, { lat: number; lon: number }> = {
  выборг: { lat: 60.71305, lon: 28.7348 },
  мурманск: { lat: 68.9585, lon: 33.0827 },
  'санкт-петербург': { lat: 59.9343, lon: 30.3351 },
  петербург: { lat: 59.9343, lon: 30.3351 },
  спб: { lat: 59.9343, lon: 30.3351 },
  москва: { lat: 55.7558, lon: 37.6173 },
  кострома: { lat: 57.7676, lon: 40.9269 },
  петрозаводск: { lat: 61.7849, lon: 34.3469 },
  архангельск: { lat: 64.5393, lon: 40.5187 },
  новгород: { lat: 58.5228, lon: 31.2698 },
  псков: { lat: 57.8194, lon: 28.3318 },
  вологда: { lat: 59.2239, lon: 39.8839 },
  ярославль: { lat: 57.6261, lon: 39.8845 },
  твер: { lat: 56.8587, lon: 35.9176 },
  калуга: { lat: 54.5293, lon: 36.2754 },
  тула: { lat: 54.1931, lon: 37.6173 },
  рязань: { lat: 54.6292, lon: 39.7363 },
  нижний: { lat: 56.2965, lon: 43.9361 },
  казань: { lat: 55.7961, lon: 49.1064 },
  екатеринбург: { lat: 56.8389, lon: 60.6057 },
  новосибирск: { lat: 55.0084, lon: 82.9357 },
  краснодар: { lat: 45.0355, lon: 38.9753 },
  сочи: { lat: 43.6028, lon: 39.7342 },
  калининград: { lat: 54.7104, lon: 20.4522 },
}

const PLACE_RU: Record<string, string> = {
  // Города
  kostroma: 'Кострома',
  murmansk: 'Мурманск',
  moscow: 'Москва',
  vyborg: 'Выборг',
  arkhangelsk: 'Архангельск',
  petrozavodsk: 'Петрозаводск',
  'saint petersburg': 'Санкт-Петербург',
  'st petersburg': 'Санкт-Петербург',
  'st. petersburg': 'Санкт-Петербург',
  petersburg: 'Санкт-Петербург',
  'veliky novgorod': 'Великий Новгород',
  novgorod: 'Великий Новгород',
  pskov: 'Псков',
  vologda: 'Вологда',
  yaroslavl: 'Ярославль',
  tver: 'Тверь',
  kaluga: 'Калуга',
  tula: 'Тула',
  ryazan: 'Рязань',
  'nizhny novgorod': 'Нижний Новгород',
  kazan: 'Казань',
  yekaterinburg: 'Екатеринбург',
  ekaterinburg: 'Екатеринбург',
  novosibirsk: 'Новосибирск',
  krasnodar: 'Краснодар',
  sochi: 'Сочи',
  kaliningrad: 'Калининград',
  chelyabinsk: 'Челябинск',
  samara: 'Самара',
  rostov: 'Ростов-на-Дону',
  'rostov-on-don': 'Ростов-на-Дону',
  voronezh: 'Воронеж',
  perm: 'Пермь',
  ufa: 'Уфа',
  krasnoyarsk: 'Красноярск',
  vladivostok: 'Владивосток',
  irkutsk: 'Иркутск',
  omsk: 'Омск',
  tomsk: 'Томск',
  barnaul: 'Барнаул',
  kirov: 'Киров',
  ivanovo: 'Иваново',
  smolensk: 'Смоленск',
  kursk: 'Курск',
  belgorod: 'Белгород',
  bryansk: 'Брянск',
  oryol: 'Орёл',
  orel: 'Орёл',
  lipetsk: 'Липецк',
  tambov: 'Тамбов',
  saratov: 'Саратов',
  volgograd: 'Волгоград',
  astrakhan: 'Астрахань',
  // Области / субъекты
  'kostroma oblast': 'Костромская область',
  'murmansk oblast': 'Мурманская область',
  'moscow oblast': 'Московская область',
  'leningrad oblast': 'Ленинградская область',
  'arkhangelsk oblast': 'Архангельская область',
  'novgorod oblast': 'Новгородская область',
  'pskov oblast': 'Псковская область',
  'vologda oblast': 'Вологодская область',
  'yaroslavl oblast': 'Ярославская область',
  'tver oblast': 'Тверская область',
  'kaluga oblast': 'Калужская область',
  'tula oblast': 'Тульская область',
  'ryazan oblast': 'Рязанская область',
  'nizhny novgorod oblast': 'Нижегородская область',
  'chelyabinsk oblast': 'Челябинская область',
  'kaliningrad oblast': 'Калининградская область',
  'krasnodar krai': 'Краснодарский край',
  'republic of karelia': 'Республика Карелия',
  karelia: 'Республика Карелия',
  komi: 'Республика Коми',
  'republic of komi': 'Республика Коми',
  'republic of tatarstan': 'Республика Татарстан',
  tatarstan: 'Республика Татарстан',
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

const STREET_PREFIX_RE = /^(ул\.|улица|пр\.|проспект|пер\.|переулок|б-р|бульвар|ш\.|шоссе|наб\.|набережная|пл\.|площадь|проезд|туп\.|тупик)\s+/i

function joinParts(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ')
}

function hasCyrillic(value: string): boolean {
  return /[А-Яа-яЁё]/.test(value)
}

function isMostlyLatin(value: string): boolean {
  const letters = value.replace(/[^A-Za-zА-Яа-яЁё]/g, '')
  if (!letters) return false
  const latin = (letters.match(/[A-Za-z]/g) ?? []).length
  return latin / letters.length > 0.45
}

function localizePlace(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const trimmed = value.trim()
  if (hasCyrillic(trimmed) && !isMostlyLatin(trimmed)) return trimmed
  const mapped = PLACE_RU[trimmed.toLocaleLowerCase('en-US')]
  if (mapped) return mapped
  // Неизвестный латинский топоним — не показываем как есть
  if (isMostlyLatin(trimmed) || !hasCyrillic(trimmed)) return null
  return trimmed
}

/** Нормализуем «улица Шагова» → «ул. Шагова», дом → «д. N». */
function formatStreetLine(road: string, house: string | null): string | null {
  let name = road.trim()
  if (!name) return null
  if (isMostlyLatin(name)) return null

  if (!STREET_PREFIX_RE.test(name) && hasCyrillic(name)) {
    name = `ул. ${name}`
  } else {
    name = name
      .replace(/^улица\s+/i, 'ул. ')
      .replace(/^проспект\s+/i, 'пр. ')
      .replace(/^переулок\s+/i, 'пер. ')
      .replace(/^бульвар\s+/i, 'б-р ')
      .replace(/^шоссе\s+/i, 'ш. ')
      .replace(/^набережная\s+/i, 'наб. ')
      .replace(/^площадь\s+/i, 'пл. ')
  }

  if (!hasCyrillic(name)) return null
  return joinParts([name, house ? `д. ${house}` : null])
}

function biasForQuery(query: string): { lat: number; lon: number } {
  const lower = query.toLocaleLowerCase('ru-RU')
  for (const [city, bias] of Object.entries(CITY_BIAS)) {
    if (lower.includes(city)) return bias
  }
  return DEFAULT_BIAS
}

interface NominatimItem {
  place_id?: number
  display_name?: string
  type?: string
  class?: string
  address?: Record<string, string>
}

function nominatimToSuggestion(item: NominatimItem, index: number): AddressSuggestion | null {
  const address = item.address
  if (!address) return null

  const cls = item.class ?? ''
  if (cls === 'amenity' || cls === 'shop' || cls === 'tourism' || cls === 'office') return null

  const roadRaw = address.road || address.pedestrian || address.residential || null
  const house = address.house_number || null
  const city = localizePlace(
    address.city || address.town || address.village || address.municipality || null,
  )
  const state = localizePlace(address.state)
  const district = localizePlace(address.city_district || address.suburb)

  if (!roadRaw && city) {
    return {
      id: `n-city-${item.place_id ?? index}`,
      label: city,
      city,
      streetLine: '',
      detail: joinParts([city, state]) || city,
    }
  }

  if (!roadRaw) return null

  const streetLine = formatStreetLine(roadRaw, house)
  if (!streetLine) return null

  const label = joinParts([city, streetLine]) || streetLine
  if (!hasCyrillic(label) || isMostlyLatin(label)) return null

  return {
    id: `n-${item.place_id ?? index}`,
    label,
    city,
    streetLine,
    detail: joinParts([streetLine, district, city, state]) || label,
  }
}

async function suggestViaNominatim(
  query: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> {
  const url = new URL(NOMINATIM_URL)
  url.searchParams.set('q', `${query.trim()}, Россия`)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '8')
  url.searchParams.set('countrycodes', 'ru')
  url.searchParams.set('accept-language', 'ru')

  const response = await fetch(url.toString(), {
    signal,
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'ru-RU,ru;q=0.9',
    },
  })
  if (!response.ok) return []

  const rows = (await response.json()) as NominatimItem[]
  if (!Array.isArray(rows)) return []

  const seen = new Set<string>()
  const results: AddressSuggestion[] = []
  for (let i = 0; i < rows.length; i++) {
    const suggestion = nominatimToSuggestion(rows[i], i)
    if (!suggestion) continue
    const key = suggestion.label.toLocaleLowerCase('ru-RU')
    if (seen.has(key)) continue
    seen.add(key)
    results.push(suggestion)
  }
  return results
}

function photonToSuggestion(
  properties: Record<string, unknown>,
  index: number,
): AddressSuggestion | null {
  const osmKey = typeof properties.osm_key === 'string' ? properties.osm_key : ''
  if (SKIP_OSM_KEYS.has(osmKey)) return null

  const street = typeof properties.street === 'string' ? properties.street : null
  const name = typeof properties.name === 'string' ? properties.name : null
  const houseRaw = properties.housenumber
  const house =
    typeof houseRaw === 'string' ? houseRaw : typeof houseRaw === 'number' ? String(houseRaw) : null
  const type = typeof properties.type === 'string' ? properties.type : ''

  const city = localizePlace(
    (typeof properties.city === 'string' && properties.city) ||
      (typeof properties.town === 'string' && properties.town) ||
      (typeof properties.village === 'string' && properties.village) ||
      null,
  )
  const state = localizePlace(typeof properties.state === 'string' ? properties.state : null)

  const roadRaw =
    street ||
    (type === 'city' || type === 'town' || type === 'village' ? null : name) ||
    null

  if (!roadRaw && city) {
    return {
      id: `p-city-${index}`,
      label: city,
      city,
      streetLine: '',
      detail: joinParts([city, state]),
    }
  }
  if (!roadRaw) return null

  // Латинские улицы (Shagova Street / Severnoi Pravdy Street) — не показываем
  const streetLine = formatStreetLine(roadRaw, house)
  if (!streetLine) return null

  const label = joinParts([city, streetLine]) || streetLine
  if (!hasCyrillic(label) || isMostlyLatin(label)) return null

  return {
    id: `p-${index}-${label}`,
    label,
    city,
    streetLine,
    detail: joinParts([streetLine, city, state]) || label,
  }
}

async function suggestViaPhoton(
  query: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> {
  const bias = biasForQuery(query)
  const url = new URL(PHOTON_URL)
  url.searchParams.set('q', `${query.trim()}, Россия`)
  url.searchParams.set('limit', '10')
  url.searchParams.set('lat', String(bias.lat))
  url.searchParams.set('lon', String(bias.lon))
  // Photon не принимает lang=ru — локализуем и фильтруем сами

  const response = await fetch(url.toString(), {
    signal,
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
    const suggestion = photonToSuggestion(props, i)
    if (!suggestion) continue
    const key = suggestion.label.toLocaleLowerCase('ru-RU')
    if (seen.has(key)) continue
    seen.add(key)
    results.push(suggestion)
  }
  return results
}

export async function suggestFullAddresses(
  query: string,
  options: { signal?: AbortSignal } = {},
): Promise<AddressSuggestion[]> {
  const trimmed = query.trim()
  if (trimmed.length < 3) return []

  try {
    const fromNominatim = await suggestViaNominatim(trimmed, options.signal)
    if (fromNominatim.length > 0) return fromNominatim
  } catch {
    // fallback ниже
  }

  try {
    return await suggestViaPhoton(trimmed, options.signal)
  } catch {
    return []
  }
}

export function extractCityFromFullAddress(full: string): string {
  const parts = full
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length === 0) return ''

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
