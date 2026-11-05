'use client'

import { useEffect, useState, useTransition } from 'react'
import { WorkoutEditor } from '@/components/WorkoutEditor'
import { createWorkout, updateWorkout } from '@/app/workouts/actions'
import { loadDraft } from '@/lib/draft'
import { PRESETS } from '@/lib/presets'
import { workoutSchema } from '@/lib/schema'
import type { WorkoutInput } from '@/lib/types'

interface Props {
  /** Existing workout when editing; omitted for a new one (starts from the home-page draft). */
  initial?: WorkoutInput
  workoutId?: string
}

export function WorkoutForm({ initial, workoutId }: Props) {
  const [workout, setWorkout] = useState<WorkoutInput | null>(initial ?? null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!initial) setWorkout(loadDraft() ?? PRESETS[0].build())
  }, [initial])

  if (!workout) return <div className="h-96 animate-pulse rounded-2xl bg-zinc-900" />

  function save() {
    setError(null)
    const parsed = workoutSchema.safeParse(workout)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid workout')
      return
    }
    startTransition(async () => {
      const res = workoutId
        ? await updateWorkout(workoutId, parsed.data)
        : await createWorkout(parsed.data)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="space-y-6">
      <WorkoutEditor value={workout} onChange={setWorkout} />
      {error && <p className="rounded-xl bg-red-950/60 p-3 text-sm text-red-300">{error}</p>}
      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="w-full rounded-2xl bg-emerald-500 py-4 text-lg font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save workout'}
      </button>
    </div>
  )
}
