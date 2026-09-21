import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { productImageList, type Product } from '../../lib/types'
import { ProductPattern } from './ProductPattern'

interface ProductCarouselProps {
  product: Pick<Product, 'name' | 'category' | 'imageUrl' | 'imageUrls'>
  className?: string
}

/**
 * Свайпаемая галерея фото товара (как в VK Market).
 * Один кадр — просто картинка; несколько — точки + свайп/кнопки.
 */
export function ProductCarousel({ product, className }: ProductCarouselProps) {
  const images = productImageList(product)
  const [index, setIndex] = useState(0)
  const dragStartX = useRef<number | null>(null)
  const dragDelta = useRef(0)

  const count = images.length
  const safeIndex = count === 0 ? 0 : ((index % count) + count) % count

  const go = useCallback(
    (next: number) => {
      if (count <= 1) return
      setIndex(((next % count) + count) % count)
    },
    [count],
  )

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (count <= 1) return
    dragStartX.current = event.clientX
    dragDelta.current = 0
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return
    dragDelta.current = event.clientX - dragStartX.current
  }

  const onPointerUp = () => {
    if (dragStartX.current === null) return
    const delta = dragDelta.current
    dragStartX.current = null
    dragDelta.current = 0
    if (Math.abs(delta) < 40) return
    go(safeIndex + (delta < 0 ? 1 : -1))
  }

  if (count === 0) {
    return (
      <div className={className ? `product-carousel ${className}` : 'product-carousel'}>
        <ProductPattern category={product.category} />
      </div>
    )
  }

  return (
    <div
      className={className ? `product-carousel ${className}` : 'product-carousel'}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="group"
      aria-roledescription="карусель"
      aria-label={`Фото: ${product.name}`}
    >
      <div
        className="product-carousel__track"
        style={{ transform: `translateX(-${safeIndex * 100}%)` }}
      >
        {images.map((src, i) => (
          <div className="product-carousel__slide" key={`${src}-${i}`}>
            <img
              src={src}
              alt={count > 1 ? `${product.name} — фото ${i + 1}` : product.name}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className="product-carousel__nav product-carousel__nav--prev"
            aria-label="Предыдущее фото"
            onClick={(e) => {
              e.stopPropagation()
              go(safeIndex - 1)
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="product-carousel__nav product-carousel__nav--next"
            aria-label="Следующее фото"
            onClick={(e) => {
              e.stopPropagation()
              go(safeIndex + 1)
            }}
          >
            ›
          </button>
          <div className="product-carousel__dots" role="tablist" aria-label="Выбор фото">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === safeIndex}
                aria-label={`Фото ${i + 1} из ${count}`}
                className={`product-carousel__dot${i === safeIndex ? ' is-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setIndex(i)
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
