"use client"

import { useEffect, useState } from 'react'

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
  if (stored === 'light' || stored === 'dark') return stored
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    const apply = (t: 'light' | 'dark') => {
      if (t === 'dark') {
        root.classList.add('dark')
        root.style.setProperty('--bg', '#22252A')
        root.style.setProperty('--text', '#ADB2B1')
        root.style.setProperty('--card', '#292C33')
        root.style.setProperty('--border', '#353941')
        root.style.setProperty('--muted', '#c0c6c5')
        root.style.setProperty('--danger', '#ff6b6b')
        root.style.setProperty('--success', '#34d399')
        if (body) body.style.backgroundColor = '#22252A'
        root.style.backgroundColor = '#22252A'
      } else {
        root.classList.remove('dark')
        root.style.setProperty('--bg', '#ffffff')
        root.style.setProperty('--text', '#111111')
        root.style.setProperty('--card', '#ffffff')
        root.style.setProperty('--border', '#e5e7eb')
        root.style.setProperty('--muted', '#4b5563')
        root.style.setProperty('--danger', '#ef4444')
        root.style.setProperty('--success', '#10b981')
        if (body) body.style.backgroundColor = '#ffffff'
        root.style.backgroundColor = '#ffffff'
      }
    }
    apply(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <button
      type="button"
      className="btn"
      onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  )
}
