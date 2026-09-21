/**
 * Regenerate src/data/demoProducts.ts from vk-images-manifest.json.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'vk-images-manifest.json'), 'utf8'))

const CATEGORY = {
  'vorona-krasotka': 'dolls',
  'semeystvo-voron': 'dolls',
  'vsyachnitsa-keramika': 'ceramics',
  'keramika-vsyachnitsa-2027': 'ceramics',
  'loshadki-keramika': 'ceramics',
  'keramicheskie-figurki': 'ceramics',
  'panno-derevo': 'ceramics',
  'unikalnye-ukrashenia': 'jewelry',
  'ukrashenia-farfor': 'jewelry',
  'venok-kozhanyh-tsvetov': 'jewelry',
  'broshi-kozha': 'jewelry',
  'broshka-keramika': 'jewelry',
  'sova-kovka': 'forge',
  'sobaka-eva': 'forge',
  'mne-tolko-sprosit': 'forge',
  'shamany-lisitsy': 'dolls',
  poni: 'dolls',
  'vorona-karkusha': 'dolls',
  krolik: 'dolls',
  'igrushka-medved': 'dolls',
  'istoricheskie-kukly': 'dolls',
  'baba-yaga': 'dolls',
  'semechko-doma': 'seeds',
  'kedr-talisman': 'wood',
  duhi: 'perfume',
  // Hidden page (offset ≥ 24) of VK market.get
  stranniki: 'dolls',
  'babka-yozhka-louhi': 'dolls',
  'lisy-pape-mashe': 'dolls',
  'svetilnik-domik': 'ceramics',
  'muhomor-na-udachu': 'ceramics',
  'zhelud-keramika': 'ceramics',
  'muhomor-kolokolchik': 'ceramics',
  'broshka-brelok': 'jewelry',
  'broshki-vyazanye': 'jewelry',
  'lyagushka-podskazushka': 'jewelry',
  'gnomik-villi': 'dolls',
  'brelok-gnomik': 'jewelry',
  'domik-svetilnik': 'ceramics',
  'figurka-moryaka': 'dolls',
  'suvenir-keramika': 'ceramics',
  'svetilnik-keramika': 'ceramics',
  'svistulka-kot': 'ceramics',
  'keramicheskiy-kon': 'ceramics',
  'semechko-dela': 'seeds',
  'semechko-doma-mini': 'seeds',
  'chudo-mishanya': 'dolls',
  'vsyachnitsa-ovechki': 'ceramics',
}

/** Stable site names (cleaner than raw VK titles). */
const NAME = {
  'vorona-krasotka': 'Ворона красотка',
  'semeystvo-voron': 'Семейство Ворон',
  'vsyachnitsa-keramika': 'Всячница керамика',
  'keramika-vsyachnitsa-2027': 'Керамика-всячница, символ 2027 года',
  'loshadki-keramika': 'Лошадки, керамика',
  'keramicheskie-figurki': 'Керамические фигурки: драконы и лошади',
  'panno-derevo': 'Панно керамика с деревом',
  'unikalnye-ukrashenia': 'Уникальные украшения из осколков старинной посуды',
  'ukrashenia-farfor': 'Украшения из фрагментов фарфоровой посуды',
  'venok-kozhanyh-tsvetov': 'Венок из кожаных цветов',
  'broshi-kozha': 'Броши из кожи',
  'broshka-keramika': 'Брошка керамика',
  'sova-kovka': 'Сова, ковка',
  'sobaka-eva': 'Собака Ева, ковка',
  'mne-tolko-sprosit': '«Мне только спросить», ковка',
  'shamany-lisitsy': 'Магические шаманы-лисицы',
  poni: 'А пони тоже кони',
  'vorona-karkusha': 'Ворона Каркуша',
  krolik: 'Кролик ручной работы',
  'igrushka-medved': 'Игрушка коллекционная — под заказ',
  'istoricheskie-kukly': 'Исторические куклы',
  'baba-yaga': 'Баба Яга — под заказ',
  'semechko-doma': 'Семечко вашего будущего дома',
  'kedr-talisman': 'Кедр — семейный талисман',
  duhi: 'Духи',
  stranniki: 'Странники',
  'babka-yozhka-louhi': 'Бабка Ёжка и Лоухи',
  'lisy-pape-mashe': 'Лисы из папье-маше',
  'svetilnik-domik': 'Светильник-домик, керамика',
  'muhomor-na-udachu': 'Мухомор на удачу',
  'zhelud-keramika': 'Желудь, керамика',
  'muhomor-kolokolchik': 'Мухомор-колокольчик, керамика',
  'broshka-brelok': 'Брошка-брелок',
  'broshki-vyazanye': 'Брошки вязаные',
  'lyagushka-podskazushka': 'Лягушка Подсказушка',
  'gnomik-villi': 'Гномик Выборгский Вилли',
  'brelok-gnomik': 'Брелок гномик Выборгский',
  'domik-svetilnik': 'Домик-светильник, керамика',
  'figurka-moryaka': 'Фигурка моряка',
  'suvenir-keramika': 'Сувенир из керамики',
  'svetilnik-keramika': 'Светильник, керамика',
  'svistulka-kot': 'Свистулька-кот, глина',
  'keramicheskiy-kon': 'Керамический конь',
  'semechko-dela': 'Семечко вашего будущего дела',
  'semechko-doma-mini': 'Семечко будущего дома (мини)',
  'chudo-mishanya': 'Чудо Мишаня',
  'vsyachnitsa-ovechki': 'Всячница керамика',
}

const FALLBACK_DESC = {
  'sobaka-eva': 'Кованая собака Ева. Авторская работа кузнеца.',
  'mne-tolko-sprosit':
    'Кованая авторская работа. Эмоции в металле, проработанные детали и лёгкий юмор. Хорошая идея подарка.',
  'broshki-vyazanye': 'Вязаные брошки ручной работы.',
}

/** Preferred catalog order. */
const ORDER = [
  'vorona-krasotka',
  'semeystvo-voron',
  'stranniki',
  'babka-yozhka-louhi',
  'lisy-pape-mashe',
  'gnomik-villi',
  'figurka-moryaka',
  'chudo-mishanya',
  'vsyachnitsa-keramika',
  'vsyachnitsa-ovechki',
  'keramika-vsyachnitsa-2027',
  'loshadki-keramika',
  'keramicheskie-figurki',
  'keramicheskiy-kon',
  'svetilnik-domik',
  'domik-svetilnik',
  'svetilnik-keramika',
  'muhomor-na-udachu',
  'muhomor-kolokolchik',
  'zhelud-keramika',
  'suvenir-keramika',
  'svistulka-kot',
  'panno-derevo',
  'unikalnye-ukrashenia',
  'ukrashenia-farfor',
  'venok-kozhanyh-tsvetov',
  'broshi-kozha',
  'broshka-keramika',
  'broshka-brelok',
  'broshki-vyazanye',
  'lyagushka-podskazushka',
  'brelok-gnomik',
  'sova-kovka',
  'sobaka-eva',
  'mne-tolko-sprosit',
  'shamany-lisitsy',
  'poni',
  'vorona-karkusha',
  'krolik',
  'igrushka-medved',
  'istoricheskie-kukly',
  'baba-yaga',
  'semechko-doma',
  'semechko-doma-mini',
  'semechko-dela',
  'kedr-talisman',
  'duhi',
]

const byBase = new Map(manifest.map((m) => [m.base, m]))

function esc(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function paths(images) {
  return images.map((p) => String(p).replace(/^\//, ''))
}

let id = 1
const blocks = []

for (const base of ORDER) {
  const m = byBase.get(base)
  if (!m) {
    console.warn('missing', base)
    continue
  }
  const imgs = paths(m.images)
  if (!imgs.length) {
    console.warn('no images', base)
    continue
  }
  const imageUrls = imgs.map((p) => `assetPath('${p}')`).join(',\n      ')
  const desc = (FALLBACK_DESC[base] || m.description || '').trim() || NAME[base]
  blocks.push(`  {
    id: ${id++},
    name: '${esc(NAME[base])}',
    description: '${esc(desc)}',
    category: '${m.category || CATEGORY[base]}',
    imageUrl: assetPath('${imgs[0]}'),
    imageUrls: [
      ${imageUrls}
    ],
    priceRub: ${m.priceRub ?? 'null'},
  }`)
}

const out = `import { assetPath } from '../lib/assetPath'
import type { Product } from '../lib/types'

// Полный ассортимент VK Market (47 позиций, market.get + anonym token).
// Витрина без скролла отдаёт только первые 24; остальные — со 2-й страницы API.
export const DEMO_PRODUCTS: Product[] = [
${blocks.join(',\n')}
]
`

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'demoProducts.ts'), out, 'utf8')
console.log('wrote demoProducts.ts with', id - 1, 'products')
