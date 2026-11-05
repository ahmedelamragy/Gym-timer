import Link from 'next/link'
import { DeleteWorkoutButton } from '@/components/DeleteWorkoutButton'
import { createClient } from '@/lib/supabase/server'
import { buildTimeline, formatTime, totalSeconds } from '@/lib/timeline'
import type { Workout } from '@/lib/types'

export default async function WorkoutsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workouts')
    .select('id, name, rounds, steps, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (error) throw new Error('تعذّر تحميل التمارين')
  const workouts = (data ?? []) as Workout[]

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">تماريني</h1>
        <Link
          href="/workouts/new"
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-emerald-400"
        >
          + تمرين جديد
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-zinc-400">
          لا توجد تمارين محفوظة بعد.
        </div>
      ) : (
        <ul className="space-y-3">
          {workouts.map((w) => (
            <li key={w.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{w.name}</h2>
                  <p className="text-sm text-zinc-400">
                    {w.rounds} جولات ·{' '}
                    <span dir="ltr" className="tabular-nums">
                      {formatTime(totalSeconds(buildTimeline(w)))}
                    </span>
                  </p>
                </div>
                <Link
                  href={`/run?id=${w.id}`}
                  className="shrink-0 rounded-xl bg-emerald-500 px-4 py-2 font-bold text-zinc-950 hover:bg-emerald-400"
                >
                  تشغيل
                </Link>
              </div>
              <div className="mt-3 flex gap-4 text-sm">
                <Link href={`/workouts/${w.id}/edit`} className="text-zinc-300 hover:text-zinc-100">
                  تعديل
                </Link>
                <DeleteWorkoutButton id={w.id} name={w.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
