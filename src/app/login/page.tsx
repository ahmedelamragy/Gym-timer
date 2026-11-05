import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/LoginForm'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/utils'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const next = safeNext(params.next)

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-sm py-12 text-center text-zinc-400">
        Sign-in is not set up yet: add your Supabase keys to <code>.env.local</code>.
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect(next)

  return (
    <div className="mx-auto max-w-sm py-12">
      <h1 className="mb-2 text-2xl font-bold">Sign in</h1>
      <p className="mb-6 text-sm text-zinc-400">
        We'll email you a sign-in link. No password needed; your account is created the first time.
      </p>
      {params.error && (
        <p className="mb-4 rounded-xl bg-red-950/60 p-3 text-sm text-red-300">
          That link is invalid or has expired. Request a new one.
        </p>
      )}
      <LoginForm next={next} />
    </div>
  )
}
