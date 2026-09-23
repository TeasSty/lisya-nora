const STORAGE_KEY = 'lisya-nora:scroll'

type SavedScroll = {
  path: string
  y: number
}

declare global {
  interface Window {
    __lisyaRestoreScroll?: () => void
    __lisyaEarlyScrollY?: number
    __lisyaEarlyPin?: () => void
  }
}

function pathKey() {
  return `${window.location.pathname}${window.location.search}`
}

function readSaved(): SavedScroll | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SavedScroll
    if (typeof data?.path !== 'string' || typeof data?.y !== 'number') return null
    return data
  } catch {
    return null
  }
}

function writeSaved(y: number) {
  try {
    const payload: SavedScroll = { path: pathKey(), y: Math.max(0, Math.round(y)) }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* private mode / quota */
  }
}

function isReload(): boolean {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (nav) return nav.type === 'reload'
  return (performance as Performance & { navigation?: { type: number } }).navigation?.type === 1
}

/** Instant jump — never uses CSS scroll-behavior. */
function scrollInstant(y: number) {
  const root = document.documentElement
  root.scrollTop = y
  document.body.scrollTop = y
  window.scrollTo(0, y)
}

/**
 * Keep the viewport where the user left it on F5.
 * Smooth scrolling is only used by intentional nav clicks (Header), never on reload.
 */
export function initScrollRestore() {
  if (typeof window === 'undefined') return

  history.scrollRestoration = 'manual'

  const save = () => writeSaved(window.scrollY)
  let raf = 0
  window.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(save)
    },
    { passive: true },
  )
  window.addEventListener('pagehide', save)

  if (isReload()) {
    const saved = readSaved()
    const earlyY = window.__lisyaEarlyScrollY
    const targetY =
      saved && saved.path === pathKey()
        ? saved.y
        : typeof earlyY === 'number'
          ? earlyY
          : null
    if (targetY === null) {
      document.documentElement.classList.remove('scroll-restore-pending')
      return
    }

    // Kill hash so the browser never smooth-scrolls to #nora after React mounts.
    if (location.hash) {
      history.replaceState(null, '', pathKey())
    }

    let armed = true

    const apply = () => {
      if (!armed) return
      scrollInstant(targetY)
      document.documentElement.classList.remove('scroll-restore-pending')
    }

    window.__lisyaRestoreScroll = apply
    window.__lisyaEarlyPin?.()
    apply()
    queueMicrotask(apply)
    requestAnimationFrame(() => {
      apply()
      requestAnimationFrame(apply)
    })
    window.addEventListener('load', apply, { once: true })

    const started = performance.now()
    const ro = new ResizeObserver(() => {
      apply()
      if (performance.now() - started > 2500) ro.disconnect()
    })
    ro.observe(document.documentElement)

    const disarm = () => {
      if (Math.abs(window.scrollY - targetY) <= 48) return
      armed = false
      ro.disconnect()
      delete window.__lisyaRestoreScroll
      window.removeEventListener('wheel', disarm)
      window.removeEventListener('touchmove', disarm)
      window.removeEventListener('keydown', onKey)
    }
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'PageDown' ||
        event.key === 'PageUp' ||
        event.key === 'Home' ||
        event.key === 'End' ||
        event.key === ' '
      ) {
        disarm()
      }
    }
    window.addEventListener('wheel', disarm, { passive: true })
    window.addEventListener('touchmove', disarm, { passive: true })
    window.addEventListener('keydown', onKey)
    return
  }

  // Fresh visit with a hash: scroll after React paints the target section (instant — no fly).
  if (location.hash) {
    const id = decodeURIComponent(location.hash.slice(1))
    if (!id) return
    const go = () => {
      const el = document.getElementById(id)
      if (!el) return
      el.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
    requestAnimationFrame(() => {
      go()
      window.addEventListener('load', go, { once: true })
    })
  }
}

/** Call when late layout (catalog) finishes so a reload pin can re-apply. */
export function notifyLayoutSettled() {
  window.__lisyaRestoreScroll?.()
}
