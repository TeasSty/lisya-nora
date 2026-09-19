import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'

// GitHub Pages отдаёт проект по подпути /lisya-nora/ — важно для путей к ассетам.
// При деплое на Cloudflare Workers (следующий этап) base нужно вернуть на '/'.
const BASE_PATH = process.env.GITHUB_PAGES_BUILD ? '/lisya-nora/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base: BASE_PATH,
  plugins: [react(), cloudflare()],
  server: {
    // Windows: параллельная запись SVG в public/icons ломает chokidar (EBUSY).
    watch: {
      ignored: ['**/public/icons/**'],
    },
  },
})
