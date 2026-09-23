/**
 * Early: on F5 keep scroll position (hash like #o-magazine must not yank the page).
 * Instant jump only — never inherit html { scroll-behavior: smooth } (that “flies” down).
 * Вынесено из inline <script>, чтобы CSP мог обойтись без script-src 'unsafe-inline'.
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
    var y = data.y
    var pin = function () {
      var root = document.documentElement
      var prev = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      try {
        window.scrollTo({ top: y, left: 0, behavior: 'instant' })
      } catch (e) {
        window.scrollTo(0, y)
      }
      root.style.scrollBehavior = prev
    }
    pin()
    document.addEventListener('DOMContentLoaded', pin)
    window.addEventListener('load', pin)
  } catch {
    /* sessionStorage / private mode */
  }
})()
