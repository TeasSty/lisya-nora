/**
 * Node-сервер для VPS / Node-хостинга reg.ru:
 * тот же Hono API (worker/) + статика Vite + SQLite.
 */
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { config as loadEnv } from "dotenv"
import workerApp from "../worker/index.js"
import { applyMigrations, createD1Like, openSqlite } from "./sqlite-d1.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")

loadEnv({ path: path.join(rootDir, ".env") })

const PORT = Number(process.env.PORT || 3000)
const HOST = process.env.HOST || "0.0.0.0"
const DB_PATH = process.env.DATABASE_PATH || path.join(rootDir, "data", "lisya-nora.sqlite")
const CLIENT_DIR = process.env.CLIENT_DIR || path.join(rootDir, "dist", "client")
const MIGRATIONS_DIR = path.join(rootDir, "migrations")

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    console.error(`Задайте переменную окружения ${name} (см. .env.example)`)
    process.exit(1)
  }
  return value
}

const ADMIN_PASSWORD = requireEnv("ADMIN_PASSWORD")
const SESSION_SECRET = requireEnv("SESSION_SECRET")

if (SESSION_SECRET.length < 16) {
  console.error("SESSION_SECRET должен быть не короче 16 символов")
  process.exit(1)
}

if (!fs.existsSync(CLIENT_DIR)) {
  console.error(
    `Нет собранного фронтенда: ${CLIENT_DIR}\nСначала: npm run build:regru`,
  )
  process.exit(1)
}

const sqlite = openSqlite(DB_PATH)
const applied = applyMigrations(sqlite, MIGRATIONS_DIR)
if (applied === 0) {
  console.log("миграции уже применены")
}

const env = {
  DB: createD1Like(sqlite) as never,
  ADMIN_PASSWORD,
  SESSION_SECRET,
  OZON_DELIVERY_CLIENT_ID: process.env.OZON_DELIVERY_CLIENT_ID,
  OZON_DELIVERY_CLIENT_SECRET: process.env.OZON_DELIVERY_CLIENT_SECRET,
  OZON_DELIVERY_SCOPE: process.env.OZON_DELIVERY_SCOPE,
}

const executionCtx = {
  waitUntil(promise: Promise<unknown>) {
    void promise.catch((error) => console.error("background task failed", error))
  },
  passThroughOnException() {},
}

const gateway = new Hono()

gateway.all("/api/*", (c) => workerApp.fetch(c.req.raw, env as never, executionCtx as never))

const staticRoot = path.relative(process.cwd(), CLIENT_DIR).replaceAll("\\", "/") || "."

gateway.use(
  "/*",
  serveStatic({
    root: staticRoot,
  }),
)

gateway.notFound(async (c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: "Не найдено" }, 404)
  }
  const indexPath = path.join(CLIENT_DIR, "index.html")
  const html = await fs.promises.readFile(indexPath, "utf8")
  return c.html(html)
})

serve(
  {
    fetch: gateway.fetch,
    port: PORT,
    hostname: HOST,
  },
  (info) => {
    console.log(`Лисья нора: http://${HOST}:${info.port}`)
    console.log(`SQLite: ${DB_PATH}`)
    console.log(`Статика: ${CLIENT_DIR}`)
  },
)
