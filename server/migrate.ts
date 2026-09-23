/** Одноразовая/повторная прогонка миграций без поднятия HTTP. */
import path from "node:path"
import { fileURLToPath } from "node:url"
import { config as loadEnv } from "dotenv"
import { applyMigrations, openSqlite } from "./sqlite-d1.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")
loadEnv({ path: path.join(rootDir, ".env") })

const DB_PATH = process.env.DATABASE_PATH || path.join(rootDir, "data", "lisya-nora.sqlite")
const db = openSqlite(DB_PATH)
const n = applyMigrations(db, path.join(rootDir, "migrations"))
console.log(n === 0 ? "новых миграций нет" : `применено: ${n}`)
db.close()
