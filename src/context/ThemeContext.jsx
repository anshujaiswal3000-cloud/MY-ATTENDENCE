import React, { createContext, useContext, useMemo, useCallback } from 'react'
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import useLocalStorage from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../utils/storageUtils'

const ThemeModeContext = createContext(null)

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext)
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider')
  return ctx
}

function buildTheme(mode) {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: { main: '#3b82f6' },
      secondary: { main: '#8b5cf6' },
      success: { main: '#10b981' },
      warning: { main: '#f59e0b' },
      error: { main: '#f43f5e' },
      background: {
        default: isDark ? '#0b1120' : '#f2f5fb',
        paper: isDark ? '#111827' : '#ffffff',
      },
      text: {
        primary: isDark ? '#e7ecf5' : '#161b26',
        secondary: isDark ? '#93a0b8' : '#5b6473',
      },
    },
    shape: { borderRadius: 18 },
    typography: {
      fontFamily: "'Inter', sans-serif",
      h1: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 },
      h2: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 },
      h3: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 },
      h4: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 },
      h5: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 },
      h6: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 14 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 22,
          },
        },
      },
    },
    custom: {
      glassBg: isDark ? 'rgba(23, 30, 48, 0.55)' : 'rgba(255, 255, 255, 0.65)',
      glassBorder: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.08)',
      aurora: 'linear-gradient(135deg, #10b981 0%, #3b82f6 52%, #8b5cf6 100%)',
    },
  })
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useLocalStorage(STORAGE_KEYS.themeMode, 'dark')

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'dark' ? 'light' : 'dark'))
  }, [setMode])

  const theme = useMemo(() => buildTheme(mode), [mode])

  const value = useMemo(() => ({ mode, setMode, toggleMode }), [mode, toggleMode])

  return (
    <ThemeModeContext.Provider value={value}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeModeContext.Provider>
  )
}
