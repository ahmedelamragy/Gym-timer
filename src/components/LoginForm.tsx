'use client'

import { useState } from 'react'
import { createMagicLinkSender } from '@/lib/supabase/client'

type State = { status: 'idle' | 'sending' | 'sent' } | { status: 'error'; message: string }

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>({ status: 'idle' })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState({ status: 'sending' })

    const redirectTo = new URL('/auth/callback', window.location.origin)
    redirectTo.searchParams.set('next', next)

    const { error } = await createMagicLinkSender().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo.toString() },
    })

    setState(error ? { status: 'error', message: error.message } : { status: 'sent' })
  }

  if (state.status === 'sent') {
    return (
      <div className="rounded-2xl border border-emerald-800 bg-emerald-950/40 p-5">
        <p className="mb-1 font-semibold">تفقّد بريدك 📬</p>
        <p className="text-sm text-zinc-300">
          أرسلنا رابط الدخول إلى <span dir="ltr">{email}</span>. افتحه من أي جهاز.
        </p>
        <button
          type="button"
          onClick={() => setState({ status: 'idle' })}
          className="mt-4 text-sm text-emerald-400 hover:underline"
        >
          استخدم إيميلاً آخر
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="email"
        required
        autoComplete="email"
        dir="ltr"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-emerald-500"
      />
      <button
        disabled={state.status === 'sending'}
        className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {state.status === 'sending' ? 'جارٍ الإرسال…' : 'أرسل رابط الدخول'}
      </button>
      {state.status === 'error' && <p className="text-sm text-red-400">{state.message}</p>}
    </form>
  )
}
