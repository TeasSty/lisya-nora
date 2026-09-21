/**
 * Import page-2+ VK market products (offset≥24) that the public storefront
 * does not lazy-load. Source: scripts/vk-market-full.json from anonym market.get.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public', 'images', 'products')
const full = JSON.parse(fs.readFileSync(path.join(__dirname, 'vk-market-full.json'), 'utf8'))
const manifestPath = path.join(__dirname, 'vk-images-manifest.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

/** Already in catalog (by VK id or known slug). */
const SKIP_IDS = new Set([
  14016777, 14016775, 13961147, 13961130, 13852714, 13852713, 13739028,
  13555640, 13555062, 13555055, 13555049, 13517555, 13517503, 13517468,
  13517449, 13517433, 13517421, 13517363, 13517359, 13517121, 13517115,
  13517108, 13517061,
])

/** Upgrade carousels for items already on site with a single photo. */
const UPGRADE = {
  13517060: { base: 'sobaka-eva', name: 'Собака Ева, ковка', category: 'forge' },
  13517059: { base: 'mne-tolko-sprosit', name: '«Мне только спросить», ковка', category: 'forge' },
}

const NEW = {
  13556087: { base: 'chudo-mishanya', name: 'Чудо Мишаня', category: 'dolls' },
  13513937: { base: 'vsyachnitsa-ovechki', name: 'Всячница керамика', category: 'ceramics' },
  13517056: { base: 'stranniki', name: 'Странники', category: 'dolls' },
  13517053: { base: 'babka-yozhka-louhi', name: 'Бабка Ёжка и Лоухи', category: 'dolls' },
  13517052: { base: 'lisy-pape-mashe', name: 'Лисы из папье-маше', category: 'dolls' },
  13517049: { base: 'svetilnik-domik', name: 'Светильник-домик, керамика', category: 'ceramics' },
  13517047: { base: 'muhomor-na-udachu', name: 'Мухомор на удачу', category: 'ceramics' },
  13517020: { base: 'zhelud-keramika', name: 'Желудь, керамика', category: 'ceramics' },
  13517001: { base: 'muhomor-kolokolchik', name: 'Мухомор-колокольчик, керамика', category: 'ceramics' },
  13516999: { base: 'broshka-brelok', name: 'Брошка-брелок', category: 'jewelry' },
  13516996: { base: 'broshki-vyazanye', name: 'Брошки вязаные', category: 'jewelry' },
  13514210: { base: 'lyagushka-podskazushka', name: 'Лягушка Подсказушка', category: 'jewelry' },
  13514203: { base: 'gnomik-villi', name: 'Гномик Выборгский Вилли', category: 'dolls' },
  13514199: { base: 'brelok-gnomik', name: 'Брелок гномик Выборгский', category: 'jewelry' },
  13513995: { base: 'domik-svetilnik', name: 'Домик-светильник, керамика', category: 'ceramics' },
  13513985: { base: 'figurka-moryaka', name: 'Фигурка моряка', category: 'dolls' },
  13513975: { base: 'suvenir-keramika', name: 'Сувенир из керамики', category: 'ceramics' },
  13513927: { base: 'svetilnik-keramika', name: 'Светильник, керамика', category: 'ceramics' },
  13513881: { base: 'svistulka-kot', name: 'Свистулька-кот, глина', category: 'ceramics' },
  13513616: { base: 'keramicheskiy-kon', name: 'Керамический конь', category: 'ceramics' },
  13513598: { base: 'semechko-dela', name: 'Семечко вашего будущего дела', category: 'seeds' },
  13513529: { base: 'semechko-doma-mini', name: 'Семечко будущего дома (мини)', category: 'seeds' },
}

function preferHiRes(urls) {
  const scored = []
  for (const u of urls) {
    if (!u || /type=market_thumb/i.test(u) && !/ig2\//i.test(u)) {
      // keep thumb only as fallback later
    }
    let score = 0
    if (/ig2\//i.test(u)) score += 50
    if (/cs=1920/.test(u)) score += 40
    if (/cs=1280/.test(u)) score += 30
    if (/size=1200/.test(u)) score += 20
    if (/type=market_thumb/i.test(u)) score -= 30
    if (/impg\//i.test(u) && !/ig2\//i.test(u)) score += 5
    // normalize to largest
    let url = u
    if (/cs=\d+x\d+/.test(url)) url = url.replace(/cs=\d+x\d+/, 'cs=1280x0')
    else if (/as=/.test(url) && !/cs=/.test(url)) url += (url.includes('?') ? '&' : '?') + 'cs=1280x0'
    scored.push({ url, score, key: url.split('?')[0] })
  }
  scored.sort((a, b) => b.score - a.score)
  const out = []
  const seen = new Set()
  for (const s of scored) {
    if (seen.has(s.key)) continue
    seen.add(s.key)
    out.push(s.url)
  }
  return out
}

function fileNames(base, count) {
  return Array.from({ length: count }, (_, i) => (i === 0 ? `${base}.webp` : `${base}-${i + 1}.webp`))
}

async function downloadBuffer(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Referer: 'https://vk.ru/',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function toWebp(buf, dest) {
  await sharp(buf)
    .rotate()
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(dest)
}

fs.mkdirSync(outDir, { recursive: true })

const byId = new Map(full.products.map((p) => [p.id, p]))
const targets = []

for (const [idStr, meta] of Object.entries(UPGRADE)) {
  const id = Number(idStr)
  const p = byId.get(id)
  if (p) targets.push({ ...meta, product: p, upgrade: true })
}
for (const [idStr, meta] of Object.entries(NEW)) {
  const id = Number(idStr)
  if (SKIP_IDS.has(id)) continue
  const p = byId.get(id)
  if (p) targets.push({ ...meta, product: p, upgrade: false })
}

console.log('targets', targets.length)

const added = []
for (const t of targets) {
  const urls = preferHiRes(t.product.photos || [])
  // Cap at 8 carousel images
  const use = urls.slice(0, 8)
  console.log(`→ ${t.base} (${use.length} photos) ${t.product.title}`)
  const names = fileNames(t.base, use.length)
  const saved = []
  for (let i = 0; i < use.length; i++) {
    const dest = path.join(outDir, names[i])
    try {
      const buf = await downloadBuffer(use[i])
      await toWebp(buf, dest)
      saved.push(`/images/products/${names[i]}`)
      console.log('  ok', names[i], buf.length)
    } catch (err) {
      console.error('  fail', names[i], err.message)
    }
  }
  if (!saved.length) {
    console.error('  NO IMAGES', t.base)
    continue
  }

  const entry = {
    base: t.base,
    title: t.name,
    priceRub: t.product.priceRub,
    description: (t.product.description || '').trim(),
    images: saved,
    category: t.category,
    vkId: t.product.id,
  }

  const idx = manifest.findIndex((m) => m.base === t.base)
  if (idx >= 0) manifest[idx] = { ...manifest[idx], ...entry }
  else manifest.push(entry)

  added.push({ ...entry, upgrade: t.upgrade })
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
fs.writeFileSync(
  path.join(__dirname, 'vk-new-products.json'),
  JSON.stringify({ added: added.filter((a) => !a.upgrade), upgraded: added.filter((a) => a.upgrade) }, null, 2),
  'utf8',
)
console.log(
  'done: added',
  added.filter((a) => !a.upgrade).length,
  'upgraded',
  added.filter((a) => a.upgrade).length,
  'images',
  added.reduce((s, a) => s + a.images.length, 0),
)
