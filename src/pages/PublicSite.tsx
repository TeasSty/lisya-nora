import { useEffect, useState } from 'react'
import { About } from '../components/site/About'
import { BurrowMap, type RoomId } from '../components/site/BurrowMap'
import { CartDrawer } from '../components/site/CartDrawer'
import { Catalog } from '../components/site/Catalog'
import { Footer } from '../components/site/Footer'
import { Header } from '../components/site/Header'
import { Hero } from '../components/site/Hero'
import { Location } from '../components/site/Location'
import { OrderModal } from '../components/site/OrderModal'
import { Reviews } from '../components/site/Reviews'
import { ApiError, fetchProducts } from '../lib/api'
import { CartProvider, useCart } from '../lib/cart'
import { useReveal } from '../lib/useReveal'
import type { Product } from '../lib/types'

function PublicSiteInner() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<RoomId>('all')
  const { addProduct, items, checkoutOpen, closeCheckout, clear } = useCart()
  const noraRef = useReveal<HTMLDivElement>()

  useEffect(() => {
    let cancelled = false

    fetchProducts()
      .then((data) => {
        if (!cancelled) setProducts(data.products)
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : 'Не удалось загрузить каталог')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const checkoutProducts = items.map((item) => ({
    ...item.product,
    quantity: item.quantity,
  }))

  return (
    <>
      <a href="#main" className="skip-link">
        Перейти к основному содержимому
      </a>
      <Header />
      <main id="main">
        <Hero />

        <section id="nora" className="section section--soft">
          <div className="container">
            <div className="section__head reveal" ref={noraRef}>
              <span className="eyebrow">Загляните в нору</span>
              <h2>У каждой находки — своя комната</h2>
              <p>
                Нора устроена как настоящая лисья — с ходами и комнатками. Выберите, куда хочется
                заглянуть, и мы покажем, что там лежит.
              </p>
            </div>

            <BurrowMap selected={selectedRoom} onSelect={setSelectedRoom} />

            <div style={{ marginTop: 40 }}>
              <Catalog
                products={products}
                isLoading={isLoading}
                loadError={loadError}
                selected={selectedRoom}
                onSelect={setSelectedRoom}
                onAddToCart={addProduct}
              />
            </div>
          </div>
        </section>

        <About />
        <Reviews />
        <Location />
      </main>
      <Footer />

      <CartDrawer />

      {checkoutOpen && checkoutProducts.length > 0 && (
        <OrderModal products={checkoutProducts} onClose={closeCheckout} onSuccess={clear} />
      )}
    </>
  )
}

export function PublicSite() {
  return (
    <CartProvider>
      <PublicSiteInner />
    </CartProvider>
  )
}
