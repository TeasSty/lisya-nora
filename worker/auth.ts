// Простая сессия администратора без внешних зависимостей: подписанный
// HMAC-токен во HttpOnly cookie. Никаких паролей и токенов не хранится
// на сервере — только секрет в переменных окружения Worker'а.

export const SESSION_COOKIE_NAME = 'ln_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 8 // 8 часов — рабочий день владелицы магазина

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Сравнение за постоянное время — защита от timing-атак на пароль/подпись.
export function timingSafeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length)
  let diff = a.length === b.length ? 0 : 1
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diff === 0
}

export async function createSessionCookie(secret: string, secureFlag: boolean): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const payload = String(exp)
  const signature = await hmacHex(secret, payload)
  const value = `${payload}.${signature}`
  const parts = [
    `${SESSION_COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ]
  if (secureFlag) parts.push('Secure')
  return parts.join('; ')
}

export function clearSessionCookie(secureFlag: boolean): string {
  const parts = [`${SESSION_COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0']
  if (secureFlag) parts.push('Secure')
  return parts.join('; ')
}

function readCookie(cookieHeader: string | undefined | null, name: string): string | null {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim()
    if (trimmed.startsWith(`${name}=`)) {
      return trimmed.slice(name.length + 1)
    }
  }
  return null
}

export async function isSessionValid(
  cookieHeader: string | undefined | null,
  secret: string,
): Promise<boolean> {
  const value = readCookie(cookieHeader, SESSION_COOKIE_NAME)
  if (!value) return false
  const separatorIndex = value.indexOf('.')
  if (separatorIndex === -1) return false
  const expPart = value.slice(0, separatorIndex)
  const signaturePart = value.slice(separatorIndex + 1)
  const exp = Number(expPart)
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false
  const expectedSignature = await hmacHex(secret, expPart)
  return timingSafeEqual(signaturePart, expectedSignature)
}
