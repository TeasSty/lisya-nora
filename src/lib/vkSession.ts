/** Сессия VK ID в sessionStorage — только для оформления заявки, не админ-вход. */

export interface VkSessionUser {
  vkUserId: string
  firstName: string
  lastName: string
  avatarUrl: string
  profileUrl: string
}

const STORAGE_KEY = 'lisya-nora-vk-session'
const SESSION_EVENT = 'lisya-nora-vk-session'

export function vkProfileUrl(userId: string | number): string {
  const id = String(userId).replace(/\D/g, '')
  return id ? `https://vk.com/id${id}` : 'https://vk.com/'
}

export function getVkSession(): VkSessionUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<VkSessionUser>
    if (!parsed.vkUserId || typeof parsed.vkUserId !== 'string') return null
    return {
      vkUserId: parsed.vkUserId,
      firstName: typeof parsed.firstName === 'string' ? parsed.firstName : '',
      lastName: typeof parsed.lastName === 'string' ? parsed.lastName : '',
      avatarUrl: typeof parsed.avatarUrl === 'string' ? parsed.avatarUrl : '',
      profileUrl:
        typeof parsed.profileUrl === 'string' && parsed.profileUrl
          ? parsed.profileUrl
          : vkProfileUrl(parsed.vkUserId),
    }
  } catch {
    return null
  }
}

function emitVkSession(user: VkSessionUser | null): void {
  window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: user }))
}

export function setVkSession(user: VkSessionUser): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  emitVkSession(user)
}

export function clearVkSession(): void {
  sessionStorage.removeItem(STORAGE_KEY)
  emitVkSession(null)
}

/** Подписка на вход/выход VK в этой вкладке (шапка + форма заявки). */
export function subscribeVkSession(onChange: (user: VkSessionUser | null) => void): () => void {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<VkSessionUser | null>).detail
    onChange(detail === undefined ? getVkSession() : detail)
  }
  window.addEventListener(SESSION_EVENT, handler)
  return () => window.removeEventListener(SESSION_EVENT, handler)
}

export function displayVkName(user: Pick<VkSessionUser, 'firstName' | 'lastName'>): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
}

export function displayVkInitials(user: Pick<VkSessionUser, 'firstName' | 'lastName'>): string {
  const a = user.firstName.trim().charAt(0)
  const b = user.lastName.trim().charAt(0)
  const initials = `${a}${b}`.toUpperCase()
  return initials || 'VK'
}

/** Поля профиля для submitOrder — пустой объект, если гость без входа. */
export function readVkFieldsForOrder(): {
  vkUserId?: string
  vkFirstName?: string
  vkLastName?: string
  vkAvatarUrl?: string
  vkProfileUrl?: string
} {
  const session = getVkSession()
  if (!session) return {}
  return {
    vkUserId: session.vkUserId,
    vkFirstName: session.firstName,
    vkLastName: session.lastName,
    vkAvatarUrl: session.avatarUrl,
    vkProfileUrl: session.profileUrl,
  }
}
