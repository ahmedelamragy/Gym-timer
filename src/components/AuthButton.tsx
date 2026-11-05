import Link from 'next/link'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

export async function AuthButton() {
  if (!isSupabaseConfigured()) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Link href="/login" className="rounded-full border border-zinc-700 px-4 py-1.5 text-sm hover:bg-zinc-800">
        دخول
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href="/workouts" className="font-medium hover:text-emerald-400">
        تماريني
      </Link>
      <span className="hidden max-w-40 truncate text-zinc-500 sm:inline" dir="ltr">
        {user.email}
      </span>
      <form action="/auth/signout" method="post">
        <button className="text-zinc-400 hover:text-zinc-100">خروج</button>
      </form>
    </div>
  )
}
