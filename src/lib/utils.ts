export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function uid() {
  // crypto.randomUUID is missing on plain-http LAN addresses (e.g. testing on a phone).
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  )
}

/** Only allow same-site relative paths as a post-login redirect target. */
export function safeNext(value: string | null | undefined, fallback = '/workouts') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback
  }
  return value
}
