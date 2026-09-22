/** Предпочтительный канал связи в заявке. */
export const CONTACT_CHANNEL_IDS = ['vk', 'telegram', 'whatsapp', 'call', 'sms'] as const

export type ContactChannelId = (typeof CONTACT_CHANNEL_IDS)[number]

export const CONTACT_CHANNEL_LABELS: Record<ContactChannelId, string> = {
  vk: 'ВКонтакте',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  call: 'Звонок',
  sms: 'SMS',
}

/** Каналы, где полезен ник/ссылка. */
export function contactChannelNeedsHandle(channel: ContactChannelId | ''): boolean {
  return channel === 'vk' || channel === 'telegram' || channel === 'whatsapp'
}

export function isContactChannelId(value: string): value is ContactChannelId {
  return (CONTACT_CHANNEL_IDS as readonly string[]).includes(value)
}

export function formatContactChannel(
  channel: string | undefined,
  handle?: string | undefined,
): string {
  const id = channel?.trim() ?? ''
  const label = isContactChannelId(id) ? CONTACT_CHANNEL_LABELS[id] : id || '—'
  const nick = handle?.trim()
  if (nick) return `${label} · ${nick}`
  return label
}

export function contactHandlePlaceholder(channel: ContactChannelId | ''): string {
  switch (channel) {
    case 'vk':
      return 'Ссылка или @ник во ВКонтакте'
    case 'telegram':
      return '@ник или номер в Telegram'
    case 'whatsapp':
      return 'Номер WhatsApp, если другой'
    default:
      return 'Ник или ссылка'
  }
}
