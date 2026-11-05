import Link from 'next/link'
import { DeleteWorkoutButton } from '@/components/DeleteWorkoutButton'
import { parseStoredWorkout } from '@/lib/schema'
import { createClient } from '@/lib/supabase/server'
import { buildTimeline, formatTime, totalSeconds } from '@/lib/timeline'

export default async function WorkoutsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workouts')
    .select('id, name, rounds, steps')
    .order('updated_at', { ascending: false })

  if (error) throw new Error('Could not load workouts')

  // A row that fails validation is still listed, so it can be deleted.
  const rows = (data ?? []).map((row) => ({
    id: String(row.id),
    rawName: typeof row.name === 'string' && row.name.trim() ? row.name : 'Untitled workout',
    workout: parseStoredWorkout(row),
  }))

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My workouts</h1>
        <Link
          href="/workouts/new"
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-emerald-400"
        >
          + New workout
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-zinc-400">
          No saved workouts yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ id, rawName, workout }) => (
            <li key={id} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{workout?.name ?? rawName}</h2>
                  {workout ? (
                    <p className="text-sm text-zinc-400">
                      {workout.rounds} {workout.rounds === 1 ? 'round' : 'rounds'} ·{' '}
                      <span className="tabular-nums">{formatTime(totalSeconds(buildTimeline(workout)))}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-amber-400">This workout&apos;s data is damaged.</p>
                  )}
                </div>
                {workout && (
                  <Link
                    href={`/run?id=${id}`}
                    className="shrink-0 rounded-xl bg-emerald-500 px-4 py-2 font-bold text-zinc-950 hover:bg-emerald-400"
                  >
                    Run
                  </Link>
                )}
              </div>
              <div className="mt-3 flex gap-4 text-sm">
                {workout && (
                  <Link href={`/workouts/${id}/edit`} className="text-zinc-300 hover:text-zinc-100">
                    Edit
                  </Link>
                )}
                <DeleteWorkoutButton id={id} name={workout?.name ?? rawName} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
