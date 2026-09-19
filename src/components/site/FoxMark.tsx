import { assetPath } from '../../lib/assetPath'

interface FoxMarkProps {
  className?: string
  /** Светлая версия знака (для тёмного фона). По умолчанию — тёмная для кремового фона сайта. */
  variant?: 'dark' | 'light'
}

/**
 * Фирменная эмблема из Logo.pdf: только лиса в серпе луны (без дугового текста).
 * Растровая версия — PDF векторный, но без точной трассировки SVG надёжнее PNG/WebP.
 */
export function FoxMark({ className, variant = 'dark' }: FoxMarkProps) {
  const src =
    variant === 'light'
      ? assetPath('images/logo-mark.webp')
      : assetPath('images/logo-mark-dark.webp')

  return (
    <img
      className={className ? `fox-mark ${className}` : 'fox-mark'}
      src={src}
      alt=""
      width={132}
      height={132}
      decoding="async"
      aria-hidden="true"
      draggable={false}
    />
  )
}
