import { createBrowserClient } from '@supabase/ssr'
import { createClient as createPlainClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config'

/** Cookie-backed client shared with the server. @supabase/ssr always uses the PKCE flow. */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

/**
 * Used only to request the sign-in email. The implicit flow puts the session in the
 * link itself, so it works when opened on another device. PKCE links only work in the
 * browser that asked for them, and Supabase's free plan won't let us change the email
 * template to work around that. /auth/callback turns the link into a cookie session.
 */
export function createMagicLinkSender() {
  return createPlainClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      flowType: 'implicit',
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
