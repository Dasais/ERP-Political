import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = import.meta.dirname

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Сайт открывается на своём домене (erp-california-party.website), то есть из корня.
  // Если вернётесь на адрес вида https://<логин>.github.io/ERP-Political/ — поставьте "/ERP-Political/".
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
}))
