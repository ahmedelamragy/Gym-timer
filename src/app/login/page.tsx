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
        تسجيل الدخول غير مُفعّل بعد: أضف مفاتيح Supabase إلى <code dir="ltr">.env.local</code>.
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
      <h1 className="mb-2 text-2xl font-bold">تسجيل الدخول</h1>
      <p className="mb-6 text-sm text-zinc-400">
        نرسل لك رابط دخول على إيميلك، بدون كلمة مرور. الحساب يُنشأ تلقائياً أول مرة.
      </p>
      {params.error && (
        <p className="mb-4 rounded-xl bg-red-950/60 p-3 text-sm text-red-300">
          الرابط غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً.
        </p>
      )}
      <LoginForm next={next} />
    </div>
  )
}
