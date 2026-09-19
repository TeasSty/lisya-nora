import { assetPath } from '../../lib/assetPath'

interface FoxMarkProps {
  className?: string
  /** Светлая версия знака (для тёмного фона). По умолчанию — тёмная для кремового фона сайта. */
  variant?: 'dark' | 'light'
}

/**
 * Фирменная эмблема из Logo.pdf: лиса в серпе луны + адрес магазина.
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
      width={92}
      height={92}
      decoding="async"
      aria-hidden="true"
      draggable={false}
    />
  )
}
