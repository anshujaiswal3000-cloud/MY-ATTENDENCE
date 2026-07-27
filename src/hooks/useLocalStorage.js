import { useState, useEffect, useCallback } from 'react'

/**
 * useLocalStorage
 * A useState-like hook that automatically persists its value to localStorage
 * under the given key, and rehydrates from localStorage on mount.
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch (err) {
      console.warn(`useLocalStorage: failed to read key "${key}"`, err)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.warn(`useLocalStorage: failed to write key "${key}"`, err)
    }
  }, [key, value])

  // Allows other parts of the app (e.g. Import Data) to force-refresh this
  // hook's value directly from localStorage without a full page reload.
  const reload = useCallback(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored !== null) setValue(JSON.parse(stored))
    } catch (err) {
      console.warn(`useLocalStorage: failed to reload key "${key}"`, err)
    }
  }, [key])

  return [value, setValue, reload]
}
