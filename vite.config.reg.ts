/**
 * Сборка фронтенда для Node/reg.ru (без Cloudflare vite-plugin).
 */
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
  },
  server: {
    watch: {
      ignored: ["**/public/icons/**"],
    },
  },
})
