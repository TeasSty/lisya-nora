/**
 * Подсказки адресов по-русски.
 * 1) Nominatim + Accept-Language: ru (основной)
 * 2) Photon — запасной: локализуем город, отбрасываем латиницу
 * Ранжирование: город из запроса → номер дома → улица.
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

/** Известные города (нормализованные) → каноническое имя для сравнения. */
const KNOWN_CITIES: Array<{ key: string; canonical: string }> = (() => {
  const map = new Map<string, string>()
  const add = (raw: string, canonical: string) => {
    const key = normalizeRu(raw)
    if (key.length >= 2) map.set(key, canonical)
  }
  for (const key of Object.keys(CITY_BIAS)) {
    add(key, key === 'спб' || key === 'петербург' ? 'санкт-петербург' : key)
  }
  for (const ru of Object.values(PLACE_RU)) {
    if (/область|край|республика/i.test(ru)) continue
    add(ru, ru)
  }
  add('санкт петербург', 'санкт-петербург')
  add('великий новгород', 'новгород')
  add('нижний новгород', 'нижний')
  add('тверь', 'твер')
  return [...map.entries()]
    .map(([key, canonical]) => ({ key, canonical: normalizeRu(canonical) }))
    .sort((a, b) => b.key.length - a.key.length)
})()

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

const STREET_PREFIX_RE =
  /^(ул\.|улица|пр\.|проспект|пер\.|переулок|б-р|бульвар|ш\.|шоссе|наб\.|набережная|пл\.|площадь|проезд|туп\.|тупик)\s+/i

const STREET_KEYWORD_RE =
  /^(ул\.?|улица|пр\.?|проспект|пер\.?|переулок|б-р|бульвар|ш\.?|шоссе|наб\.?|набережная|пл\.?|площадь|проезд|туп\.?|тупик|д\.?|дом)$/i

interface QueryParts {
  city: string | null
  cityCanonical: string | null
  streetToken: string | null
  houseNumber: string | null
  cityExplicit: boolean
}

function normalizeRu(value: string): string {
  return value
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g, 'е')
    .replace(/[«»"']/g, '')
    .trim()
}

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

function matchKnownCity(text: string): { key: string; canonical: string } | null {
  const normalized = normalizeRu(text)
  for (const entry of KNOWN_CITIES) {
    if (normalized === entry.key || normalized.startsWith(`${entry.key} `)) {
      return entry
    }
  }
  return null
}

/**
 * Разбираем «кострома ленина 101» → город / улица / дом.
 * Город: известный из списка или кириллическое слово перед улицей.
 */
export function parseAddressQuery(query: string): QueryParts {
  const raw = query.trim()
  const tokens = normalizeRu(raw)
    .split(/[\s,]+/)
    .filter(Boolean)

  let city: string | null = null
  let cityCanonical: string | null = null
  let cityExplicit = false
  let rest = tokens

  if (tokens.length >= 2) {
    // Двухсловные города: «санкт петербург», «нижний новгород»
    const two = `${tokens[0]} ${tokens[1]}`
    const knownTwo = matchKnownCity(two)
    if (knownTwo && knownTwo.key.includes(' ')) {
      city = tokens.slice(0, 2).join(' ')
      cityCanonical = knownTwo.canonical
      cityExplicit = true
      rest = tokens.slice(2)
    } else {
      const knownOne = matchKnownCity(tokens[0])
      if (knownOne) {
        city = tokens[0]
        cityCanonical = knownOne.canonical
        cityExplicit = true
        rest = tokens.slice(1)
      } else if (
        hasCyrillic(tokens[0]) &&
        !STREET_KEYWORD_RE.test(tokens[0]) &&
        !/^\d/.test(tokens[0])
      ) {
        // Ведущий топоним до ключевых слов улицы
        city = tokens[0]
        cityCanonical = normalizeRu(tokens[0])
        cityExplicit = true
        rest = tokens.slice(1)
      }
    }
  }

  let houseNumber: string | null = null
  const streetBits: string[] = []
  for (const token of rest) {
    if (STREET_KEYWORD_RE.test(token)) continue
    const house = token.match(/^(\d+[а-яa-z]?)$/i)
    if (house) {
      houseNumber = house[1]
      continue
    }
    if (hasCyrillic(token) || /^[a-z]+$/i.test(token)) {
      streetBits.push(token)
    }
  }

  return {
    city,
    cityCanonical,
    streetToken: streetBits.length > 0 ? streetBits.join(' ') : null,
    houseNumber,
    cityExplicit,
  }
}

function citiesCompatible(queryCanonical: string, resultCity: string | null): boolean {
  if (!resultCity) return false
  const result = normalizeRu(resultCity)
  if (!result) return false
  if (result === queryCanonical) return true
  if (result.includes(queryCanonical) || queryCanonical.includes(result)) return true
  // «твер» ↔ «тверь», «новгород» ↔ «великий новгород»
  const known = matchKnownCity(resultCity)
  if (known && known.canonical === queryCanonical) return true
  return false
}

function extractHouseFromStreetLine(streetLine: string): string | null {
  const match = streetLine.match(/\bд\.\s*(\d+[а-яa-z]?)/i)
  return match ? match[1].toLocaleLowerCase('ru-RU') : null
}

function scoreSuggestion(item: AddressSuggestion, parts: QueryParts): number {
  let score = 0
  const label = normalizeRu(item.label)
  const street = normalizeRu(item.streetLine)
  const resultHouse = extractHouseFromStreetLine(item.streetLine)

  if (parts.cityCanonical && parts.cityExplicit) {
    if (citiesCompatible(parts.cityCanonical, item.city)) {
      score += 10_000
    } else {
      score -= 50_000
    }
  }

  if (parts.houseNumber) {
    const want = parts.houseNumber.toLocaleLowerCase('ru-RU')
    if (resultHouse === want) score += 5_000
    else if (resultHouse && resultHouse.startsWith(want)) score += 1_500
    else if (resultHouse) score -= 2_000
    else score -= 500
  }

  if (parts.streetToken) {
    const token = normalizeRu(parts.streetToken)
    if (street.includes(token) || label.includes(token)) score += 2_000
    else score -= 1_000
  }

  // Предпочитаем полные адреса с улицей
  if (item.streetLine) score += 50
  return score
}

function rankAndFilterSuggestions(
  items: AddressSuggestion[],
  query: string,
): AddressSuggestion[] {
  const parts = parseAddressQuery(query)
  const scored = items.map((item) => ({ item, score: scoreSuggestion(item, parts) }))

  if (parts.cityExplicit && parts.cityCanonical) {
    const inCity = scored.filter((row) => citiesCompatible(parts.cityCanonical!, row.item.city))
    if (inCity.length > 0) {
      return inCity
        .sort((a, b) => b.score - a.score)
        .map((row) => row.item)
    }
    // Нет ни одного результата в указанном городе — не подсовываем чужие города
    return []
  }

  return scored
    .filter((row) => row.score > -40_000)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.item)
}

function biasForQuery(query: string): { lat: number; lon: number } {
  const parts = parseAddressQuery(query)
  if (parts.cityCanonical) {
    for (const [city, bias] of Object.entries(CITY_BIAS)) {
      if (normalizeRu(city) === parts.cityCanonical || parts.cityCanonical.includes(normalizeRu(city))) {
        return bias
      }
    }
  }
  const lower = normalizeRu(query)
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

function buildNominatimSearchUrl(query: string): URL {
  const parts = parseAddressQuery(query)
  const url = new URL(NOMINATIM_URL)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '12')
  url.searchParams.set('countrycodes', 'ru')
  url.searchParams.set('accept-language', 'ru')

  // Структурированный запрос, когда город явно указан — меньше чужих «Ленина» по области
  if (parts.cityExplicit && parts.city && parts.streetToken) {
    const street = parts.houseNumber
      ? `${parts.streetToken} ${parts.houseNumber}`
      : parts.streetToken
    url.searchParams.set('street', street)
    url.searchParams.set('city', parts.city)
    url.searchParams.set('country', 'Россия')
  } else {
    url.searchParams.set('q', `${query.trim()}, Россия`)
  }

  return url
}

async function suggestViaNominatim(
  query: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> {
  const url = buildNominatimSearchUrl(query)

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
  return rankAndFilterSuggestions(results, query)
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
  const parts = parseAddressQuery(query)
  // Photon: уточняем запрос городом в конце, чтобы fuzzy по улице не уводил в соседние города
  const photonQ =
    parts.cityExplicit && parts.city && parts.streetToken
      ? joinParts([
          parts.streetToken,
          parts.houseNumber,
          parts.city,
          'Россия',
        ])
      : `${query.trim()}, Россия`

  const url = new URL(PHOTON_URL)
  url.searchParams.set('q', photonQ)
  url.searchParams.set('limit', '12')
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
  return rankAndFilterSuggestions(results, query)
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
