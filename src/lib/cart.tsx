import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Product } from './types'

const CART_STORAGE_KEY = 'lisya-nora-cart'
export const CART_MAX_QUANTITY = 99

export interface CartItem {
  product: Product
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  count: number
  addProduct: (product: Product) => void
  setQuantity: (productId: number, quantity: number) => void
  removeProduct: (productId: number) => void
  clear: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  checkoutOpen: boolean
  /** Снимок корзины на момент оформления — чтобы после очистки модалка не исчезала */
  checkoutItems: CartItem[]
  openCheckout: () => void
  closeCheckout: () => void
  /** После успешной заявки: очистить корзину и закрыть ящик */
  completeCheckout: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity) || quantity < 1) return 1
  return Math.min(CART_MAX_QUANTITY, Math.floor(quantity))
}

function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => item && item.product && typeof item.product.id === 'number' && item.quantity > 0)
      .map((item) => ({ ...item, quantity: clampQuantity(item.quantity) }))
  } catch {
    return []
  }
}

function writeStoredCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Quota / private mode — корзина остаётся в памяти сессии.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() =>
    typeof window === 'undefined' ? [] : readStoredCart(),
  )
  const [isOpen, setIsOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([])

  useEffect(() => {
    writeStoredCart(items)
  }, [items])

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0)

    return {
      items,
      count,
      addProduct(product) {
        setItems((prev) => {
          const existing = prev.find((item) => item.product.id === product.id)
          if (existing) {
            return prev.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: clampQuantity(item.quantity + 1), product }
                : item,
            )
          }
          return [...prev, { product, quantity: 1 }]
        })
        setIsOpen(true)
      },
      setQuantity(productId, quantity) {
        const next = clampQuantity(quantity)
        setItems((prev) =>
          prev.map((item) => (item.product.id === productId ? { ...item, quantity: next } : item)),
        )
      },
      removeProduct(productId) {
        setItems((prev) => prev.filter((item) => item.product.id !== productId))
      },
      clear() {
        setItems([])
      },
      isOpen,
      openCart() {
        setIsOpen(true)
      },
      closeCart() {
        setIsOpen(false)
      },
      checkoutOpen,
      checkoutItems,
      openCheckout() {
        setCheckoutItems(items)
        setIsOpen(false)
        setCheckoutOpen(true)
      },
      closeCheckout() {
        setCheckoutOpen(false)
        setCheckoutItems([])
      },
      completeCheckout() {
        setItems([])
        setIsOpen(false)
        writeStoredCart([])
      },
    }
  }, [items, isOpen, checkoutOpen, checkoutItems])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
