/**
 * Обёртка better-sqlite3 под API Cloudflare D1 (prepare/bind/all/first/run),
 * чтобы тот же worker/index.ts работал на Node (VPS reg.ru) без переписывания SQL.
 */
import Database from "better-sqlite3"
import fs from "node:fs"
import path from "node:path"

type SqlValue = string | number | null | bigint | ArrayBuffer | Uint8Array

export type SqliteDatabase = InstanceType<typeof Database>

interface StatementApi {
  bind(...values: unknown[]): BoundStatement
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
  first<T = Record<string, unknown>>(): Promise<T | null>
  run(): Promise<{ success: true; meta: { changes: number; last_row_id: number | bigint } }>
}

interface BoundStatement {
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
  first<T = Record<string, unknown>>(): Promise<T | null>
  run(): Promise<{ success: true; meta: { changes: number; last_row_id: number | bigint } }>
}

export interface D1Like {
  prepare(sql: string): StatementApi
}

function toSqlParams(values: unknown[]): SqlValue[] {
  return values.map((value) => {
    if (value === undefined) return null
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "bigint" ||
      value instanceof Uint8Array ||
      value instanceof ArrayBuffer
    ) {
      return value as SqlValue
    }
    if (typeof value === "boolean") return value ? 1 : 0
    return String(value)
  })
}

function createStatement(db: SqliteDatabase, sql: string): StatementApi {
  const runWith = (values: unknown[]) => {
    const params = toSqlParams(values)
    const stmt = db.prepare(sql)
    return {
      async all<T = Record<string, unknown>>() {
        const results = (params.length > 0 ? stmt.all(...params) : stmt.all()) as T[]
        return { results }
      },
      async first<T = Record<string, unknown>>() {
        const row = (params.length > 0 ? stmt.get(...params) : stmt.get()) as T | undefined
        return row ?? null
      },
      async run() {
        const info = params.length > 0 ? stmt.run(...params) : stmt.run()
        return {
          success: true as const,
          meta: {
            changes: info.changes,
            last_row_id: info.lastInsertRowid,
          },
        }
      },
    }
  }

  return {
    bind(...values: unknown[]) {
      return runWith(values)
    },
    all: () => runWith([]).all(),
    first: () => runWith([]).first(),
    run: () => runWith([]).run(),
  }
}

export function openSqlite(dbPath: string): SqliteDatabase {
  fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true })
  const db = new Database(dbPath)
  db.pragma("journal_mode = WAL")
  db.pragma("foreign_keys = ON")
  return db
}

export function createD1Like(db: SqliteDatabase): D1Like {
  return {
    prepare(sql: string) {
      return createStatement(db, sql)
    },
  }
}

/** Применяет SQL-файлы из migrations/ по имени (как wrangler d1 migrations). */
export function applyMigrations(db: SqliteDatabase, migrationsDir: string): number {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _node_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  const files = fs
    .readdirSync(migrationsDir)
    .filter((name) => /^\d+.*\.sql$/i.test(name))
    .sort()

  const applied = new Set(
    (db.prepare("SELECT id FROM _node_migrations").all() as Array<{ id: string }>).map(
      (row) => row.id,
    ),
  )

  let count = 0
  for (const file of files) {
    if (applied.has(file)) continue
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8")
    const run = db.transaction(() => {
      // D1-миграции иногда делают ADD COLUMN на колонку, уже попавшую в более
      // ранний файл (например price_rub в 0001 и снова в 0004). На чистой SQLite
      // игнорируем duplicate column, чтобы apply с нуля был идемпотентен.
      for (const statement of splitSqlStatements(sql)) {
        try {
          db.exec(statement)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          if (/duplicate column name/i.test(message)) continue
          throw error
        }
      }
      db.prepare("INSERT INTO _node_migrations (id) VALUES (?)").run(file)
    })
    run()
    count += 1
    console.log(`миграция применена: ${file}`)
  }
  return count
}

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = []
  let current = ""
  for (const line of sql.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("--")) continue
    current += (current ? "\n" : "") + line
    if (trimmed.endsWith(";")) {
      const stmt = current.trim()
      if (stmt) statements.push(stmt)
      current = ""
    }
  }
  const tail = current.trim()
  if (tail) statements.push(tail)
  return statements
}

