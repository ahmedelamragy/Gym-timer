import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/lib/supabase/config'

const PROTECTED_PREFIX = '/workouts'

function toLogin(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.search = ''
  url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
  return NextResponse.redirect(url)
}

export async function proxy(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith(PROTECTED_PREFIX)

  if (!isSupabaseConfigured()) {
    return isProtected ? toLogin(request) : NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  // Refreshes the session cookie if needed. Do not put code between this and createServerClient.
  // getClaims verifies the JWT signature locally (the project uses ES256 signing keys),
  // so signed-in page loads skip a round trip to Supabase's Auth server.
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims && isProtected) return toLogin(request)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
