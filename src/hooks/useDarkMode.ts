/**
 * useDarkMode.ts
 * Hook untuk manajemen tema tampilan (Light & Dark Mode)
 * Menyimpan preferensi di localStorage dan menyinkronkan dengan class 'dark' pada <html>.
 */
import { useState, useEffect, useCallback } from 'react'

const THEME_KEY = 'psikologi-stt-theme'

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved !== null) {
        return saved === 'dark'
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      try {
        localStorage.setItem(THEME_KEY, 'dark')
      } catch { /* ignore */ }
    } else {
      root.classList.remove('dark')
      try {
        localStorage.setItem(THEME_KEY, 'light')
      } catch { /* ignore */ }
    }
  }, [isDark])

  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => !prev)
  }, [])

  return { isDark, toggleDarkMode }
}
