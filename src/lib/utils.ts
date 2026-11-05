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

const PROBE_ORIGIN = 'https://same-site.invalid'

/**
 * Only allow same-site paths as a post-login redirect target.
 * Browsers silently drop tabs/newlines and treat "\" like "/", so "/\t/evil.com"
 * or "/\evil.com" would become "//evil.com". Reject those characters outright,
 * then confirm the path resolves to our own origin.
 */
export function safeNext(value: string | null | undefined, fallback = '/workouts') {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F\u007F\\]/.test(value)) return fallback
  try {
    const url = new URL(value, PROBE_ORIGIN)
    if (url.origin !== PROBE_ORIGIN) return fallback
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}
