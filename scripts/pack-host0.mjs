/**
 * Собирает папку dist/host0 для загрузки в public_html на Host-0:
 * - статика из dist/client (включая .htaccess из public/)
 * - PHP API из api/
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const clientDir = path.join(root, "dist", "client")
const apiSrc = path.join(root, "api")
const outDir = path.join(root, "dist", "host0")

function copyRecursive(src, dest, { skipNames = [] } = {}) {
  if (!fs.existsSync(src)) {
    throw new Error(`Нет источника: ${src}`)
  }
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (skipNames.includes(entry.name)) continue
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyRecursive(from, to, { skipNames })
    } else {
      fs.copyFileSync(from, to)
    }
  }
}

if (!fs.existsSync(clientDir)) {
  console.error("Сначала соберите фронт: npm run build:regru")
  process.exit(1)
}

fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(outDir, { recursive: true })
copyRecursive(clientDir, outDir)
copyRecursive(apiSrc, path.join(outDir, "api"), {
  skipNames: ["config.php", "cache"],
})
fs.mkdirSync(path.join(outDir, "api", "cache"), { recursive: true })
fs.writeFileSync(path.join(outDir, "api", "cache", ".htaccess"), `<IfModule mod_authz_core.c>
  Require all denied
</IfModule>
`)
fs.copyFileSync(
  path.join(apiSrc, "config.example.php"),
  path.join(outDir, "api", "config.example.php"),
)

// Fallback htaccess если Vite не скопировал
if (!fs.existsSync(path.join(outDir, ".htaccess"))) {
  fs.copyFileSync(path.join(root, "deploy", "htaccess-public_html"), path.join(outDir, ".htaccess"))
}

console.log("Готово: dist/host0 — залейте содержимое в public_html")
console.log("Не забудьте: api/config.php (из config.example.php) + импорт mysql/schema.sql")
