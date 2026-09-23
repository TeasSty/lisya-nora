/**
 * One-shot host0 deploy. Reads .env.deploy. Never overwrites api/config.php; skips uploads/.
 */
import { readFileSync, createReadStream, statSync, readdirSync } from 'node:fs'
import { join, relative, posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = join(root, '.env.deploy')
const localRoot = join(root, 'dist', 'host0')

function loadEnv(path) {
  const out = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 0) continue
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return out
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
    // list home to discover
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

  // Extra: if remote has uploads/, leave alone (already skipped)
  await sftp.end()
  return { protocol: 'sftp', host, remoteRoot, uploaded, skipped }
}

async function tryFtp(host, user, pass, remoteCandidates) {
  const ftp = await import('basic-ftp')
  const client = new ftp.Client(20000)
  client.ftp.verbose = false
  console.log(`[ftp] connecting ${user}@${host}:21 ...`)
  await client.access({
    host,
    user,
    password: pass,
    secure: false,
  })
  console.log('[ftp] connected')

  let remoteRoot = null
  for (const cand of remoteCandidates) {
    try {
      await client.cd(cand)
      remoteRoot = cand.replace(/\/$/, '')
      console.log(`[ftp] cd ok: ${cand}`)
      break
    } catch (e) {
      console.log(`[ftp] cd fail ${cand}: ${e.message}`)
    }
  }
  if (!remoteRoot) {
    try {
      const list = await client.list()
      console.log('[ftp] cwd listing:', list.map((x) => x.name).join(', '))
    } catch {}
    client.close()
    throw new Error('remote dir not found among candidates')
  }

  // Ensure we are at remote root for relative uploads
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
    const remoteDir = posix.dirname(remote)
    await client.ensureDir(remoteDir)
    await client.cd(remoteRoot) // ensureDir may leave us elsewhere
    // basic-ftp uploadFrom needs to reopen path — use absolute from root via cd
    const parts = rel.split('/')
    if (parts.length > 1) {
      await client.ensureDir(posix.join(remoteRoot, ...parts.slice(0, -1)))
      await client.cd(remoteRoot)
    }
    await client.uploadFrom(createReadStream(abs), remote)
    uploaded.push(rel)
    console.log(`[ftp] put ${rel}`)
  }

  client.close()
  return { protocol: 'ftp', host, remoteRoot, uploaded, skipped }
}

async function main() {
  const env = loadEnv(envPath)
  const user = env.FTP_USER
  const pass = env.FTP_PASS
  const hosts = [...new Set([env.FTP_HOST, env.FTP_ALT_HOST, '37.140.192.106'].filter(Boolean))]
  const remoteCandidates = [
    env.FTP_REMOTE_DIR,
    '/www/lisanoravbg.ru',
    'www/lisanoravbg.ru',
    '/home/u3633327/www/lisanoravbg.ru',
    'public_html',
    '/public_html',
  ].filter(Boolean)

  if (!statSync(localRoot).isDirectory()) {
    throw new Error(`missing ${localRoot}`)
  }

  const errors = []
  for (const host of hosts) {
    try {
      const result = await trySftp(host, user, pass, remoteCandidates)
      console.log(JSON.stringify({ ok: true, ...result, uploadedCount: result.uploaded.length, skippedCount: result.skipped.length }, null, 2))
      return
    } catch (e) {
      console.error(`[sftp] ${host} failed:`, e.message)
      errors.push(`sftp ${host}: ${e.message}`)
    }
    try {
      const result = await tryFtp(host, user, pass, remoteCandidates)
      console.log(JSON.stringify({ ok: true, ...result, uploadedCount: result.uploaded.length, skippedCount: result.skipped.length }, null, 2))
      return
    } catch (e) {
      console.error(`[ftp] ${host} failed:`, e.message)
      errors.push(`ftp ${host}: ${e.message}`)
    }
  }
  console.error(JSON.stringify({ ok: false, errors }, null, 2))
  process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
