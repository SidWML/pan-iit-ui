"use client"

import { useEffect, useState } from "react"

export function usePersistedState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)

  useEffect(() => {
    const saved = window.localStorage.getItem(key)
    if (!saved) return
    const timer = window.setTimeout(() => {
      try {
        setValue(JSON.parse(saved) as T)
      } catch {
        /* ignore invalid demo data */
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [key])

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full or unavailable: keep working in memory */
    }
  }, [key, value])

  return [value, setValue] as const
}
