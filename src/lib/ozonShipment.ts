import { parseAddressQuery } from './addressSuggest'
import { formatContactChannel } from './contactChannel'
import { formatOrderItemLine, normalizeAdminOrder } from './orderItems'
import type { AdminOrder } from './types'

const PRICE_FORMATTER = new Intl.NumberFormat('ru-RU')

/** Официальная карта пунктов выдачи Ozon (fallback, если Delivery API не подключён). */
export const OZON_PVZ_MAP_URL = 'https://www.ozon.ru/info/map/'

/** Публичная точка из Worker-прокси `/api/ozon/pvz`. */
export interface OzonPvzPoint {
  id: number
  name: string
  address: string
  type: string
  isActive: boolean
  lat: number | null
  lon: number | null
}

/** Сохраняем в заявку: id (если есть) + название + адрес. */
export function formatPickupPointSelection(point: Pick<OzonPvzPoint, 'id' | 'name' | 'address'>): string {
  const name = point.name.trim()
  const address = point.address.trim()
  const label = name && !address.includes(name) ? `${name} · ${address}` : address
  return `#${point.id} · ${label}`
}

export function isCompleteAddress(value: string): boolean {
  const text = value.trim()
  if (text.length < 8) return false
  const parts = parseAddressQuery(text)
  // Город + улица + дом — иначе часто пишут только «ул. Ленина» или один город
  return Boolean(parts.city && parts.streetToken && parts.houseNumber)
}

export function isCompletePickupPoint(value: string): boolean {
  const text = value.trim()
  if (text.length < 12) return false
  return /[A-Za-zА-Яа-яЁё]/.test(text) && /\d/.test(text)
}

function itemsDeclaredValue(order: AdminOrder): number | null {
  const items = normalizeAdminOrder(order).items
  let sum = 0
  let hasPrice = false
  for (const item of items) {
    if (item.priceRub != null) {
      hasPrice = true
      sum += item.priceRub * (item.quantity && item.quantity > 0 ? item.quantity : 1)
    }
  }
  return hasPrice ? sum : null
}

/** Адрес ПВЗ без служебного `#id ·` — удобнее вставлять в поиск приложения. */
export function pickupPointForPaste(raw: string | undefined): string {
  const text = (raw ?? '').trim()
  if (!text) return ''
  return text.replace(/^#\d+\s*·\s*/u, '').trim()
}

export interface OzonCopyField {
  id: string
  /** Как на экране в приложении Ozon. */
  label: string
  value: string
}

/**
 * Поля по шагам приложения Ozon Доставка — копировать по одному,
 * а не сплошным текстом.
 */
export function getOzonCopyFields(order: AdminOrder): OzonCopyField[] {
  const items = normalizeAdminOrder(order).items
  const value = itemsDeclaredValue(order)
  const goods = items.map((item) => formatOrderItemLine(item)).join('; ')
  const pvz = pickupPointForPaste(order.pickupPoint)
  const address = order.address?.trim() || ''

  const fields: OzonCopyField[] = [
    {
      id: 'name',
      label: 'Получатель',
      value: order.name.trim(),
    },
    {
      id: 'phone',
      label: 'Телефон',
      value: order.phone.trim(),
    },
    {
      id: 'address',
      label: 'Адрес',
      value: address,
    },
    {
      id: 'pvz',
      label: 'Пункт выдачи',
      value: pvz,
    },
    {
      id: 'value',
      label: 'Стоимость предметов',
      value: value != null ? String(value) : '',
    },
    {
      id: 'title',
      label: 'Название заказа',
      value: goods.slice(0, 120),
    },
  ]

  if (order.comment?.trim()) {
    fields.push({
      id: 'comment',
      label: 'Комментарий',
      value: order.comment.trim(),
    })
  }

  return fields.filter((field) => field.value.length > 0)
}

/** Полный текст — запасной вариант, если нужен весь блок сразу. */
export function buildOzonShipmentDocument(order: AdminOrder): string {
  const items = normalizeAdminOrder(order).items
  const value = itemsDeclaredValue(order)
  const lines = [
    '=== Данные для Ozon Доставка (по полям приложения) ===',
    `Получатель: ${order.name}`,
    `Телефон: ${order.phone}`,
    `Город: ${order.city?.trim() || '— не указан —'}`,
    `Адрес клиента: ${order.address?.trim() || '— не указан —'}`,
    `Пункт выдачи Ozon: ${pickupPointForPaste(order.pickupPoint) || '— не указан —'}`,
    '',
    'Состав посылки:',
    ...items.map((item) => `• ${formatOrderItemLine(item)}`),
    '',
    `Объявленная стоимость: ${
      value != null ? `${PRICE_FORMATTER.format(value)} ₽` : 'уточнить при упаковке'
    }`,
  ]

  if (order.comment?.trim()) {
    lines.push('', `Комментарий клиента: ${order.comment.trim()}`)
  }

  const channel = order.contactChannel?.trim()
  if (channel) {
    lines.push('', `Канал связи: ${formatContactChannel(channel, order.contactHandle)}`)
  }

  lines.push('', `Заявка сайта №${order.id} · ${order.createdAt}`)
  return lines.join('\n')
}

/** Сообщение клиенту с трек-номером — тоже одной кнопкой. */
export function buildTrackingMessage(order: AdminOrder): string {
  const track = order.trackingNumber?.trim()
  const items = normalizeAdminOrder(order).items
  const goods = items.map((item) => formatOrderItemLine(item)).join('; ')

  if (!track) {
    return [
      `Здравствуйте, ${order.name}!`,
      `Ваш заказ (${goods}) готовим к отправке.`,
      'Трек-номер пришлём, как только посылка будет оформлена в Ozon.',
    ].join('\n')
  }

  return [
    `Здравствуйте, ${order.name}!`,
    `Ваш заказ (${goods}) отправлен.`,
    `Трек: ${track}`,
    'Проверить отправление можно в приложении или на сайте Ozon по номеру трека.',
  ].join('\n')
}
