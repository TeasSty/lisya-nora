import { assetPath } from '../../lib/assetPath'

interface FoxMarkProps {
  className?: string
  /** Светлая версия знака (для тёмного фона). По умолчанию — тёмная для кремового фона сайта. */
  variant?: 'dark' | 'light'
}

/**
 * Фирменная эмблема: рыжая лиса в листовом круге.
 * dark — для кремового фона сайта; light — для тёмного футера.
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
