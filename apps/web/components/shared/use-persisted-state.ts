"use client"

import { useEffect, useRef, useState } from "react"

const EVENT = "persisted-state"

/**
 * State mirrored to localStorage. Every hook using the same key stays in sync,
 * in this tab (custom event) and in other tabs (storage event), so an attendee
 * tab and a coordinator tab see each other's changes.
 */
export function usePersistedState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [ready, setReady] = useState(false)
  const last = useRef<string | null>(null)

  useEffect(() => {
    const sync = () => {
      try {
        const saved = window.localStorage.getItem(key)
        if (saved === null || saved === last.current) return
        last.current = saved
        setValue(JSON.parse(saved) as T)
      } catch {
        /* ignore invalid demo data */
      }
    }
    const timer = window.setTimeout(() => {
      sync()
      setReady(true)
    }, 0)
    const onStorage = (e: StorageEvent) => e.key === key && sync()
    const onLocal = (e: Event) => (e as CustomEvent).detail === key && sync()
    window.addEventListener("storage", onStorage)
    window.addEventListener(EVENT, onLocal)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(EVENT, onLocal)
    }
  }, [key])

  useEffect(() => {
    if (!ready) return
    const serialised = JSON.stringify(value)
    if (serialised === last.current) return
    last.current = serialised
    try {
      window.localStorage.setItem(key, serialised)
    } catch {
      /* storage full or unavailable: keep working in memory */
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: key }))
  }, [key, value, ready])

  return [value, setValue, ready] as const
}
