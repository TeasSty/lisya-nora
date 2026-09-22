import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { productImageList, type Product } from '../../lib/types'
import { ProductPattern } from './ProductPattern'

interface ProductCarouselProps {
  product: Pick<Product, 'name' | 'category' | 'imageUrl' | 'imageUrls'>
  className?: string
  /** Стартовый кадр (например, при открытии деталки с того же фото, что на карточке). */
  initialIndex?: number
  /** Клик по фото (не свайп, не стрелка/точка) — открыть деталку. */
  onActivate?: (index: number) => void
  /** Сообщать наружу текущий индекс (для синхрона с деталкой). */
  onIndexChange?: (index: number) => void
}

const SWIPE_THRESHOLD_PX = 40

function isControlTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('button'))
}

/**
 * Свайпаемая галерея фото товара (как в VK Market).
 * Один кадр — просто картинка; несколько — точки + свайп/кнопки.
 */
export function ProductCarousel({
  product,
  className,
  initialIndex = 0,
  onActivate,
  onIndexChange,
}: ProductCarouselProps) {
  const images = productImageList(product)
  const [index, setIndex] = useState(initialIndex)
  const dragStartX = useRef<number | null>(null)
  const dragDelta = useRef(0)
  const ignoreClick = useRef(false)

  const count = images.length
  const safeIndex = count === 0 ? 0 : ((index % count) + count) % count

  useEffect(() => {
    if (count === 0) return
    setIndex(((initialIndex % count) + count) % count)
  }, [initialIndex, count])

  useEffect(() => {
    onIndexChange?.(safeIndex)
  }, [safeIndex, onIndexChange])

  const go = useCallback(
    (delta: number) => {
      if (count <= 1) return
      setIndex((current) => ((current + delta) % count + count) % count)
    },
    [count],
  )

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (count <= 1 && !onActivate) return
    // Не перехватываем жесты с кнопок — иначе click стрелок/точек глотается capture'ом.
    if (isControlTarget(event.target)) return
    if (count <= 1) {
      // Один кадр: только для различения клика vs случайного drag.
      dragStartX.current = event.clientX
      dragDelta.current = 0
      ignoreClick.current = false
      return
    }
    dragStartX.current = event.clientX
    dragDelta.current = 0
    ignoreClick.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return
    dragDelta.current = event.clientX - dragStartX.current
    if (Math.abs(dragDelta.current) > 8) {
      ignoreClick.current = true
    }
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return
    const delta = dragDelta.current
    dragStartX.current = null
    dragDelta.current = 0
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* already released */
    }
    if (count <= 1) return
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    go(delta < 0 ? 1 : -1)
  }

  const onControlPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.stopPropagation()
  }

  const onControlClick = (event: ReactMouseEvent<HTMLButtonElement>, action: () => void) => {
    event.preventDefault()
    event.stopPropagation()
    if (ignoreClick.current) {
      ignoreClick.current = false
      return
    }
    action()
  }

  const onRootClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!onActivate) return
    if (isControlTarget(event.target)) return
    if (ignoreClick.current) {
      ignoreClick.current = false
      return
    }
    onActivate(safeIndex)
  }

  const rootClass = className ? `product-carousel ${className}` : 'product-carousel'

  if (count === 0) {
    return (
      <div
        className={rootClass}
        onClick={onActivate ? () => onActivate(0) : undefined}
        role={onActivate ? 'button' : undefined}
        tabIndex={onActivate ? 0 : undefined}
        onKeyDown={
          onActivate
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onActivate(0)
                }
              }
            : undefined
        }
        aria-label={onActivate ? `Открыть: ${product.name}` : undefined}
      >
        <ProductPattern category={product.category} />
      </div>
    )
  }

  return (
    <div
      className={rootClass}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onRootClick}
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
            onPointerDown={onControlPointerDown}
            onClick={(e) => onControlClick(e, () => go(-1))}
          >
            ‹
          </button>
          <button
            type="button"
            className="product-carousel__nav product-carousel__nav--next"
            aria-label="Следующее фото"
            onPointerDown={onControlPointerDown}
            onClick={(e) => onControlClick(e, () => go(1))}
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
                onPointerDown={onControlPointerDown}
                onClick={(e) => onControlClick(e, () => setIndex(i))}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
