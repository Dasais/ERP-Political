import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = import.meta.dirname

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // На GitHub Pages сайт открывается по адресу https://<логин>.github.io/ERP-Political/
  // Если переименуете репозиторий или подключите свой домен — поменяйте это значение.
  base: command === "build" ? (process.env.VITE_BASE ?? "/ERP-Political/") : "/",
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
