import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TalkSessionsProvider } from './context/TalkSessionsProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TalkSessionsProvider>
      <App />
    </TalkSessionsProvider>
  </StrictMode>,
)
