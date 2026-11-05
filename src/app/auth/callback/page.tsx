'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { safeNext } from '@/lib/utils'

/**
 * Landing page for the sign-in email. Supabase sends the session in the URL hash
 * (#access_token=…&refresh_token=…), which never reaches the server, so it is read
 * here, removed from the address bar and history, and stored as cookies.
 */
export default function AuthCallbackPage() {
  useEffect(() => {
    const { pathname, search, hash } = window.location
    const query = new URLSearchParams(search)
    const params = new URLSearchParams(hash.slice(1))
    const next = safeNext(query.get('next'))

    // Older PKCE / token_hash links are still handled by the server route.
    if (query.has('code') || query.has('token_hash')) {
      window.location.replace(`/auth/confirm${search}`)
      return
    }

    // Drop the tokens from the address bar before doing anything else.
    window.history.replaceState(null, '', pathname + search)

    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    if (!accessToken || !refreshToken) {
      window.location.replace('/login?error=link')
      return
    }

    createClient()
      .auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => window.location.replace(error ? '/login?error=link' : next))
  }, [])

  return <p className="py-24 text-center text-zinc-400">جارٍ تسجيل الدخول…</p>
}
