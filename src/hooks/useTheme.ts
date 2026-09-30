import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'zincir.theme'

// index.html'deki script temayı sayfa çizilmeden önce uyguladığı için
// başlangıç değeri doğrudan <html> sınıfından okunur.
function getInitialTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

/** Aydınlık / karanlık tema; seçim LocalStorage'da hatırlanır. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Gizli sekme gibi durumlarda kaydedilemezse tema yine de oturum boyunca çalışır
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
