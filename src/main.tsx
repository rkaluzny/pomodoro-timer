import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register the PWA service worker (auto-updates)
// vite-plugin-pwa exposes a virtual module to simplify registration
import { registerSW } from 'virtual:pwa-register'

// `immediate: true` ensures that the SW is registered as soon as possible and keeps it up-to-date automatically
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
