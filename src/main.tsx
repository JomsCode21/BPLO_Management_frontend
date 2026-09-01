import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { EnvBanner } from './components/EnxBanner.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EnvBanner />
    <App />
  </StrictMode>,
)
