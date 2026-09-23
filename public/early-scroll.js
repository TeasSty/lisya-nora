/**
 * Early: on F5 keep scroll position (hash like #o-magazine must not yank the page).
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
      window.scrollTo(0, y)
    }
    pin()
    document.addEventListener('DOMContentLoaded', pin)
    window.addEventListener('load', pin)
  } catch {
    /* sessionStorage / private mode */
  }
})()
