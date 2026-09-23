/**
 * Generate mysql/schema.sql product seed + additive seed from src/data/demoProducts.ts
 * Paths stored as /images/... (Host-0 / Cloudflare root; not GitHub Pages base).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = fs.readFileSync(path.join(root, 'src/data/demoProducts.ts'), 'utf8')

const blocks = [
  ...src.matchAll(
    /\{\s*id:\s*(\d+),\s*name:\s*'((?:\\'|[^'])*)',\s*description:\s*'((?:\\'|[^'])*)',\s*category:\s*'([^']+)',\s*imageUrl:\s*assetPath\('([^']+)'\),\s*imageUrls:\s*\[([\s\S]*?)\],\s*priceRub:\s*(\d+)/g,
  ),
]

function unesc(s) {
  return s.replace(/\\'/g, "'")
}

function sqlStr(s) {
  return `'${unesc(s).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`
}

function toPublicPath(p) {
  const clean = p.replace(/^\//, '')
  return `/${clean}`
}

const rows = []
for (const m of blocks) {
  const id = Number(m[1])
  const name = unesc(m[2])
  const desc = unesc(m[3])
  const cat = m[4]
  const img = toPublicPath(m[5])
  const price = Number(m[7])
  const urls = [...m[6].matchAll(/assetPath\('([^']+)'\)/g)].map((x) => toPublicPath(x[1]))
  const imageUrls = urls.length ? urls : [img]
  rows.push({
    id,
    name,
    desc,
    cat,
    imageUrl: img,
    imageUrls,
    price,
    sort: id * 10,
  })
}

if (rows.length < 40) {
  console.error(`Expected 40+ products, got ${rows.length}`)
  process.exit(1)
}

const union = rows
  .map((r, i) => {
    const urlsJson = sqlStr(JSON.stringify(r.imageUrls))
    if (i === 0) {
      return `  SELECT ${sqlStr(r.name)} AS name, ${sqlStr(r.desc)} AS description, ${sqlStr(r.cat)} AS category,
    ${sqlStr(r.imageUrl)} AS image_url,
    ${urlsJson} AS image_urls, ${r.price} AS price_rub, 1 AS is_active, ${r.sort} AS sort_order`
    }
    return `  UNION ALL SELECT ${sqlStr(r.name)}, ${sqlStr(r.desc)}, ${sqlStr(r.cat)},
    ${sqlStr(r.imageUrl)}, ${urlsJson}, ${r.price}, 1, ${r.sort}`
  })
  .join('\n')

const schemaInsert = `-- Полный ассортимент из src/data/demoProducts.ts (${rows.length} позиций).
INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT * FROM (
${union}
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
`

const additive = `-- Additive full catalog sync for Host-0 (safe: does not DROP orders).
-- Inserts missing products by name from demoProducts (${rows.length}).
SET NAMES utf8mb4;

${rows
  .map(
    (r) => `INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
SELECT ${sqlStr(r.name)}, ${sqlStr(r.desc)}, ${sqlStr(r.cat)}, ${sqlStr(r.imageUrl)}, ${sqlStr(JSON.stringify(r.imageUrls))}, ${r.price}, 1, ${r.sort}
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = ${sqlStr(r.name)} LIMIT 1);
`,
  )
  .join('\n')}
`

const schemaPath = path.join(root, 'mysql/schema.sql')
let schema = fs.readFileSync(schemaPath, 'utf8')
const marker = '-- Базовый ассортимент'
const idx = schema.indexOf(marker)
if (idx < 0) {
  console.error('Could not find product seed marker in schema.sql')
  process.exit(1)
}
schema = `${schema.slice(0, idx).trimEnd()}\n\n${schemaInsert}`
fs.writeFileSync(schemaPath, schema)
fs.writeFileSync(path.join(root, 'mysql/seed_products_full.sql'), additive)
console.log(`Wrote ${rows.length} products into schema.sql and seed_products_full.sql`)
