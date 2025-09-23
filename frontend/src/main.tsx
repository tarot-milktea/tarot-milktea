import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import 'pretendard/dist/web/static/pretendard.css'
import './assets/fonts.css'
import './assets/colors.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster 
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'var(--color-primary-800)',
          color: 'var(--color-primary-200)',
          border: '1px solid var(--color-primary-600)',
          borderRadius: '12px',
          fontFamily: 'Pretendard, sans-serif',
        },
        success: {
          iconTheme: {
            primary: 'var(--color-accent-400)',
            secondary: 'var(--color-primary-900)',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: 'var(--color-primary-200)',
          },
        },
      }}
    />
  </StrictMode>,
)
