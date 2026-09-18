import { formatOrderItemLine, normalizeAdminOrder } from './orderItems'
import type { AdminOrder } from './types'

const PRICE_FORMATTER = new Intl.NumberFormat('ru-RU')

/** Официальная карта пунктов выдачи Ozon. */
export const OZON_PVZ_MAP_URL = 'https://www.ozon.ru/info/map/'

export function isCompleteAddress(value: string): boolean {
  const text = value.trim()
  if (text.length < 10) return false
  // Должны быть и буквы, и цифра дома/корпуса — иначе часто пишут только «ул. Ленина»
  return /[A-Za-zА-Яа-яЁё]/.test(text) && /\d/.test(text)
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

/** Текст, который Инна копирует при оформлении отправки в Ozon. */
export function buildOzonShipmentDocument(order: AdminOrder): string {
  const items = normalizeAdminOrder(order).items
  const value = itemsDeclaredValue(order)
  const lines = [
    '=== Данные для Ozon Доставка ===',
    `Получатель: ${order.name}`,
    `Телефон: ${order.phone}`,
    `Город: ${order.city?.trim() || '— не указан —'}`,
    `Точный адрес клиента: ${order.address?.trim() || '— не указан —'}`,
    `Пункт выдачи Ozon: ${order.pickupPoint?.trim() || '— не указан —'}`,
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

  lines.push('', `Заявка №${order.id} · ${order.createdAt}`)
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
