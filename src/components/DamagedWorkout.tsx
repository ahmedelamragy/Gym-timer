import Link from 'next/link'

/** Shown when a saved workout's data no longer matches what the app expects. */
export function DamagedWorkout() {
  return (
    <div className="py-20 text-center">
      <h1 className="mb-2 text-2xl font-bold">This workout can&apos;t be opened</h1>
      <p className="mb-8 text-zinc-400">
        Its saved data is damaged or incomplete. You can delete it from your list and create it again.
      </p>
      <Link href="/workouts" className="rounded-2xl border border-zinc-700 px-6 py-3 hover:bg-zinc-800">
        Back to my workouts
      </Link>
    </div>
  )
}
