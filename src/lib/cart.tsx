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

export interface CartItem {
  product: Product
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  count: number
  addProduct: (product: Product) => void
  removeProduct: (productId: number) => void
  clear: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  checkoutOpen: boolean
  openCheckout: () => void
  closeCheckout: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item) => item && item.product && typeof item.product.id === 'number' && item.quantity > 0,
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() =>
    typeof window === 'undefined' ? [] : readStoredCart(),
  )
  const [isOpen, setIsOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
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
                ? { ...item, quantity: item.quantity + 1, product }
                : item,
            )
          }
          return [...prev, { product, quantity: 1 }]
        })
        setIsOpen(true)
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
      openCheckout() {
        setIsOpen(false)
        setCheckoutOpen(true)
      },
      closeCheckout() {
        setCheckoutOpen(false)
      },
    }
  }, [items, isOpen, checkoutOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
