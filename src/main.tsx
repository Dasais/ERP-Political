import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { AppProviders } from "@/providers/query"
import App from './App.tsx'

// Сайт лежит в подпапке (GitHub Pages: /ERP-Political/), поэтому роутеру нужен basename
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* PWA недоступна в этом окружении — не критично */
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
)
