'use client'

import { useState } from 'react'
import { createMagicLinkSender } from '@/lib/supabase/client'

type State = { status: 'idle' | 'sending' | 'sent' } | { status: 'error'; message: string }

/** Supabase's built-in mailer only sends a few emails per hour per project. */
function errorMessage(error: { code?: string; status?: number; message: string }) {
  if (error.code === 'over_email_send_rate_limit' || /rate limit/i.test(error.message)) {
    return 'أُرسلت روابط كثيرة خلال وقت قصير. انتظر قليلاً (حتى ساعة) ثم حاول مرة أخرى، واضغط مرة واحدة فقط.'
  }
  if (error.code === 'over_request_rate_limit' || error.status === 429) {
    return 'محاولات كثيرة. انتظر دقيقة ثم حاول مرة أخرى.'
  }
  if (error.code === 'email_address_invalid' || error.code === 'validation_failed') {
    return 'تأكّد من كتابة الإيميل بشكل صحيح.'
  }
  return 'تعذّر إرسال الرابط. حاول مرة أخرى بعد قليل.'
}

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

    setState(error ? { status: 'error', message: errorMessage(error) } : { status: 'sent' })
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
