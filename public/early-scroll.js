/**
 * F5: restore scroll Y before first paint — no smooth fly from top.
 * Root causes this fights:
 *  1) html { scroll-behavior:smooth } (removed from CSS — only intentional nav uses smooth)
 *  2) browser hash scroll (#nora) fighting saved Y
 *  3) first paint at y=0 then jump (hide until pinned)
 */
(function () {
  try {
    history.scrollRestoration = 'manual'

    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]
    var isReload =
      (nav && nav.type === 'reload') ||
      (performance.navigation && performance.navigation.type === 1)
    if (!isReload) return

    var raw = sessionStorage.getItem('lisya-nora:scroll')
    if (!raw) return
    var data = JSON.parse(raw)
    var path = location.pathname + location.search
    if (!data || data.path !== path || typeof data.y !== 'number') return

    var y = Math.max(0, Math.round(data.y))
    // Hash navigation must not yank after restore.
    if (location.hash) {
      history.replaceState(null, '', path)
    }

    var root = document.documentElement
    root.classList.add('scroll-restore-pending')

    var pin = function () {
      // Direct assignment bypasses scroll-behavior entirely.
      root.scrollTop = y
      if (document.body) document.body.scrollTop = y
      window.scrollTo(0, y)
    }

    pin()

    var reveal = function () {
      pin()
      root.classList.remove('scroll-restore-pending')
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        pin()
      })
    }

    // Reveal ASAP after first pin; keep re-pinning briefly as layout grows.
    requestAnimationFrame(function () {
      reveal()
      requestAnimationFrame(pin)
    })
    window.addEventListener('load', pin)
    // Never leave the page invisible if something else goes wrong.
    setTimeout(function () {
      root.classList.remove('scroll-restore-pending')
    }, 1200)

    window.__lisyaEarlyScrollY = y
    window.__lisyaEarlyPin = pin
  } catch {
    try {
      document.documentElement.classList.remove('scroll-restore-pending')
    } catch {
      /* ignore */
    }
  }
})()
