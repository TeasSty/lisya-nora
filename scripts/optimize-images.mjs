import sharp from 'sharp'
import { readdirSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const SRC_DIR = 'tmp_raw_images'
const OUT_DIR = 'public/images/products'
const MAX_WIDTH = 800

mkdirSync(OUT_DIR, { recursive: true })

const files = readdirSync(SRC_DIR).filter((f) => f.endsWith('.jpg'))

for (const file of files) {
  const slug = file.replace(/\.jpg$/, '')
  const inPath = join(SRC_DIR, file)
  const outPath = join(OUT_DIR, `${slug}.webp`)

  const image = sharp(inPath)
  const meta = await image.metadata()
  const width = meta.width && meta.width > MAX_WIDTH ? MAX_WIDTH : meta.width

  await image.resize({ width }).webp({ quality: 76 }).toFile(outPath)
  console.log(`${slug}: ${meta.width}x${meta.height} -> ${outPath}`)
}

console.log(`Done. Processed ${files.length} images.`)
