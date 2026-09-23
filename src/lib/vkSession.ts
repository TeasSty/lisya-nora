/** Сессия VK ID в sessionStorage — только для оформления заявки, не админ-вход. */

export interface VkSessionUser {
  vkUserId: string
  firstName: string
  lastName: string
  avatarUrl: string
  profileUrl: string
}

const STORAGE_KEY = 'lisya-nora-vk-session'

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

export function setVkSession(user: VkSessionUser): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function clearVkSession(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function displayVkName(user: Pick<VkSessionUser, 'firstName' | 'lastName'>): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
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
