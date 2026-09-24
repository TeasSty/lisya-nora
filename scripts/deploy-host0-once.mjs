/**
 * One-shot host0 deploy. Reads .env.deploy (or process.env). Never overwrites api/config.php; skips uploads/.
 */
import { readFileSync, existsSync, createReadStream, statSync, readdirSync } from 'node:fs'
import { join, relative, posix, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = join(root, '.env.deploy')
const localRoot = join(root, 'dist', 'host0')

function loadEnv(path) {
  const out = {}
  if (!existsSync(path)) return out
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 0) continue
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return out
}

function envGet(fileEnv, key) {
  return process.env[key] || fileEnv[key] || ''
}

function walk(dir, base = dir, files = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name)
    if (name.isDirectory()) walk(p, base, files)
    else files.push(p)
  }
  return files
}

function shouldSkip(relPosix) {
  if (relPosix === 'api/config.php') return 'preserve remote api/config.php'
  if (relPosix === 'uploads' || relPosix.startsWith('uploads/')) return 'skip uploads/'
  return null
}

async function trySftp(host, user, pass, remoteCandidates) {
  const SftpClient = (await import('ssh2-sftp-client')).default
  const sftp = new SftpClient()
  console.log(`[sftp] connecting ${user}@${host}:22 ...`)
  await sftp.connect({
    host,
    port: 22,
    username: user,
    password: pass,
    readyTimeout: 20000,
  })
  console.log('[sftp] connected')

  let remoteRoot = null
  for (const cand of remoteCandidates) {
    try {
      const exists = await sftp.exists(cand)
      console.log(`[sftp] exists ${cand}: ${exists}`)
      if (exists) {
        remoteRoot = cand.replace(/\/$/, '')
        break
      }
    } catch (e) {
      console.log(`[sftp] probe ${cand}: ${e.message}`)
    }
  }
  if (!remoteRoot) {
    try {
      const home = await sftp.list('.')
      console.log('[sftp] cwd listing:', home.map((x) => x.name).join(', '))
    } catch {}
    await sftp.end()
    throw new Error('remote dir not found among candidates')
  }
  console.log(`[sftp] using remote root: ${remoteRoot}`)

  const files = walk(localRoot)
  const uploaded = []
  const skipped = []
  for (const abs of files) {
    const rel = relative(localRoot, abs).split(/\\|\//).join('/')
    const skip = shouldSkip(rel)
    if (skip) {
      skipped.push({ rel, reason: skip })
      continue
    }
    const remote = posix.join(remoteRoot, rel)
    const remoteDir = posix.dirname(remote)
    await sftp.mkdir(remoteDir, true)
    await sftp.fastPut(abs, remote)
    uploaded.push(rel)
    console.log(`[sftp] put ${rel}`)
  }

  await sftp.end()
  return { protocol: 'sftp', host, user, remoteRoot, uploaded, skipped }
}

async function tryFtp(host, user, pass, remoteCandidates, secureMode = false) {
  const ftp = await import('basic-ftp')
  const client = new ftp.Client(25000)
  client.ftp.verbose = false
  const label = secureMode ? 'ftps' : 'ftp'
  console.log(`[${label}] connecting ${user}@${host}:21 (secure=${secureMode}) ...`)
  await client.access({
    host,
    user,
    password: pass,
    secure: secureMode,
    secureOptions: secureMode ? { rejectUnauthorized: false } : undefined,
  })
  console.log(`[${label}] connected`)

  let remoteRoot = null
  for (const cand of remoteCandidates) {
    try {
      await client.cd(cand)
      remoteRoot = cand.replace(/\/$/, '')
      console.log(`[${label}] cd ok: ${cand}`)
      break
    } catch (e) {
      console.log(`[${label}] cd fail ${cand}: ${e.message}`)
    }
  }
  if (!remoteRoot) {
    try {
      const list = await client.list()
      console.log(`[${label}] cwd listing:`, list.map((x) => x.name).join(', '))
    } catch {}
    client.close()
    throw new Error('remote dir not found among candidates')
  }

  await client.cd(remoteRoot)

  const files = walk(localRoot)
  const uploaded = []
  const skipped = []
  for (const abs of files) {
    const rel = relative(localRoot, abs).split(/\\|\//).join('/')
    const skip = shouldSkip(rel)
    if (skip) {
      skipped.push({ rel, reason: skip })
      continue
    }
    const remote = posix.join(remoteRoot, rel)
    await client.ensureDir(posix.dirname(remote))
    await client.cd(remoteRoot)
    const parts = rel.split('/')
    if (parts.length > 1) {
      await client.ensureDir(posix.join(remoteRoot, ...parts.slice(0, -1)))
      await client.cd(remoteRoot)
    }
    await client.uploadFrom(createReadStream(abs), remote)
    uploaded.push(rel)
    console.log(`[${label}] put ${rel}`)
  }

  client.close()
  return { protocol: label, host, user, remoteRoot, uploaded, skipped }
}

async function main() {
  const fileEnv = loadEnv(envPath)
  const userBase = envGet(fileEnv, 'FTP_USER')
  const pass = envGet(fileEnv, 'FTP_PASS')
  const prefer = (envGet(fileEnv, 'FTP_PROTOCOL') || 'ftp').toLowerCase()

  const hosts = [
    ...new Set(
      [
        envGet(fileEnv, 'FTP_HOST'),
        '37.140.192.106',
        envGet(fileEnv, 'FTP_ALT_HOST'),
        'server64.hosting.reg.ru',
        'ftp.lisanoravbg.ru',
      ].filter(Boolean),
    ),
  ]

  const users = [
    ...new Set(
      [
        userBase,
        userBase && !userBase.includes('@') ? `${userBase}@server64.hosting.reg.ru` : null,
        userBase && !userBase.includes('@') ? `${userBase}@ftp.lisanoravbg.ru` : null,
      ].filter(Boolean),
    ),
  ]

  const remoteCandidates = [
    envGet(fileEnv, 'FTP_REMOTE_DIR'),
    '/www/lisanoravbg.ru',
    'www/lisanoravbg.ru',
    '/home/u3633327/www/lisanoravbg.ru',
    'public_html',
    '/public_html',
  ].filter(Boolean)

  if (!statSync(localRoot).isDirectory()) {
    throw new Error(`missing ${localRoot}`)
  }

  if (!userBase || !pass) {
    throw new Error('FTP_USER / FTP_PASS missing')
  }

  console.log(`[deploy] hosts=${hosts.join(',')} users=${users.join(',')} prefer=${prefer}`)

  const errors = []
  for (const host of hosts) {
    for (const user of users) {
      const attempts = []
      if (prefer === 'sftp') {
        attempts.push(['sftp', () => trySftp(host, user, pass, remoteCandidates)])
        attempts.push(['ftp', () => tryFtp(host, user, pass, remoteCandidates, false)])
        attempts.push(['ftps', () => tryFtp(host, user, pass, remoteCandidates, true)])
      } else if (prefer === 'ftps') {
        attempts.push(['ftps', () => tryFtp(host, user, pass, remoteCandidates, true)])
        attempts.push(['ftp', () => tryFtp(host, user, pass, remoteCandidates, false)])
        attempts.push(['sftp', () => trySftp(host, user, pass, remoteCandidates)])
      } else {
        attempts.push(['ftp', () => tryFtp(host, user, pass, remoteCandidates, false)])
        attempts.push(['ftps', () => tryFtp(host, user, pass, remoteCandidates, true)])
        attempts.push(['sftp', () => trySftp(host, user, pass, remoteCandidates)])
      }

      for (const [name, run] of attempts) {
        try {
          const result = await run()
          console.log(
            JSON.stringify(
              {
                ok: true,
                ...result,
                uploadedCount: result.uploaded.length,
                skippedCount: result.skipped.length,
              },
              null,
              2,
            ),
          )
          return
        } catch (e) {
          console.error(`[${name}] ${user}@${host} failed:`, e.message)
          errors.push(`${name} ${user}@${host}: ${e.message}`)
        }
      }
    }
  }
  console.error(JSON.stringify({ ok: false, errors }, null, 2))
  process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
