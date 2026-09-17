import type { AdminOrder, OrderItem, Product } from './types'

export function productsToOrderItems(
  products: Array<Product & { quantity?: number }>,
): OrderItem[] {
  return products.map((product) => ({
    productId: product.id,
    productName: product.name,
    priceRub: product.priceRub,
    quantity: product.quantity && product.quantity > 1 ? product.quantity : 1,
  }))
}

export function summarizeProductNames(items: OrderItem[]): string {
  return items
    .map((item) => {
      const qty = item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : ''
      return `${item.productName}${qty}`
    })
    .join(', ')
}

/** Приводит заявку к виду с items[], сохраняя старые одиночные записи. */
export function normalizeAdminOrder(order: AdminOrder): AdminOrder & { items: OrderItem[] } {
  if (order.items && order.items.length > 0) {
    return {
      ...order,
      items: order.items.map((item) => ({
        productId: item.productId ?? null,
        productName: item.productName,
        priceRub: item.priceRub ?? null,
        quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
      })),
    }
  }

  return {
    ...order,
    items: [
      {
        productId: order.productId,
        productName: order.productName,
        priceRub: null,
        quantity: 1,
      },
    ],
  }
}

export function formatOrderItemLine(item: OrderItem): string {
  const qty = item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : ''
  const price =
    item.priceRub != null
      ? ` — ${new Intl.NumberFormat('ru-RU').format(item.priceRub)} ₽`
      : ''
  return `${item.productName}${qty}${price}`
}
