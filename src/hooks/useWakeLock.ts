'use client'

import { useEffect } from 'react'

/** Keeps the screen on while `active` is true, where the browser supports it. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return

    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const request = async () => {
      try {
        const next = await navigator.wakeLock.request('screen')
        if (cancelled) await next.release()
        else lock = next
      } catch {
        // Denied (low battery, tab hidden, etc.). The timer still works.
      }
    }

    // The lock is dropped whenever the tab is hidden, so take it again on return.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request()
    }

    void request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release().catch(() => {})
    }
  }, [active])
}
