const STORAGE_KEY = 'lisya-nora:scroll'

type SavedScroll = {
  path: string
  y: number
}

declare global {
  interface Window {
    __lisyaRestoreScroll?: () => void
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
  // Legacy fallback
  return (performance as Performance & { navigation?: { type: number } }).navigation?.type === 1
}

/** Instant jump — never inherit html { scroll-behavior: smooth }. */
function scrollInstant(y: number) {
  const root = document.documentElement
  const prev = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  try {
    window.scrollTo({ top: y, left: 0, behavior: 'instant' as ScrollBehavior })
  } catch {
    window.scrollTo(0, y)
  }
  root.style.scrollBehavior = prev
}

/**
 * Keep the viewport where the user left it on F5.
 * Nav hash links (#o-magazine etc.) still work on first open / in-page clicks,
 * but a full reload must not jump back to the hash target.
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
    if (!saved || saved.path !== pathKey()) return

    const targetY = saved.y
    let armed = true

    const apply = () => {
      if (!armed) return
      scrollInstant(targetY)
    }

    window.__lisyaRestoreScroll = apply
    apply()
    queueMicrotask(apply)
    requestAnimationFrame(() => {
      apply()
      requestAnimationFrame(apply)
    })
    window.addEventListener('load', apply, { once: true })

    // Catalog / fonts / images grow the page after first paint — re-pin briefly.
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

  // Fresh visit with a hash: scroll after React paints the target section.
  if (location.hash) {
    const id = decodeURIComponent(location.hash.slice(1))
    if (!id) return
    const go = () => {
      const el = document.getElementById(id)
      if (!el) return
      const root = document.documentElement
      const prev = root.style.scrollBehavior
      // Hash landing on first visit can stay smooth; reload path never reaches here.
      root.style.scrollBehavior = ''
      el.scrollIntoView()
      root.style.scrollBehavior = prev
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
