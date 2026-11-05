import { HomeClient } from '@/components/HomeClient'

export default function HomePage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">ابنِ تمرينك</h1>
      <p className="mb-6 text-sm text-zinc-400">
        شغّل المؤقت مباشرة بدون حساب. سجّل دخولك فقط إذا أردت حفظ التمرين.
      </p>
      <HomeClient />
    </>
  )
}
