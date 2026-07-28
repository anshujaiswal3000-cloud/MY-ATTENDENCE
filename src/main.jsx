import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AttendanceProvider } from './context/AttendanceContext.jsx'

// Unregister any stale Service Worker to guarantee 100% fresh assets & 0 white screens
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister()
    }
  }).catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AttendanceProvider>
          <App />
        </AttendanceProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
