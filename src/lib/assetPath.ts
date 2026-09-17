/**
 * Строит корректный путь к файлу из /public с учётом base-пути сборки
 * (на GitHub Pages сайт живёт по подпути /lisya-nora/, на Cloudflare — в корне).
 */
export function assetPath(path: string): string {
  const base = import.meta.env.BASE_URL
  return `${base}${path.replace(/^\//, '')}`
}
