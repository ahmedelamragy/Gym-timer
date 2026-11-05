'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { WorkoutEditor } from '@/components/WorkoutEditor'
import { loadDraft, saveDraft } from '@/lib/draft'
import { PRESETS } from '@/lib/presets'
import { buildTimeline } from '@/lib/timeline'
import type { WorkoutInput } from '@/lib/types'

export function HomeClient() {
  const router = useRouter()
  const [workout, setWorkout] = useState<WorkoutInput | null>(null)

  // The draft lives in localStorage, so it can only be read after mount.
  useEffect(() => {
    setWorkout(loadDraft() ?? PRESETS[0].build())
  }, [])

  useEffect(() => {
    if (workout) saveDraft(workout)
  }, [workout])

  if (!workout) return <div className="h-96 animate-pulse rounded-2xl bg-zinc-900" />

  const canStart = buildTimeline(workout).length > 0

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm text-zinc-400">قوالب جاهزة</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setWorkout(p.build())}
              className="rounded-full border border-zinc-700 px-3 py-1 text-sm hover:bg-zinc-800"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <WorkoutEditor value={workout} onChange={setWorkout} />

      <div className="sticky bottom-4 flex gap-3">
        <button
          type="button"
          disabled={!canStart}
          onClick={() => router.push('/run')}
          className="flex-1 rounded-2xl bg-emerald-500 py-4 text-lg font-bold text-zinc-950 shadow-lg shadow-black/40 hover:bg-emerald-400 disabled:opacity-40"
        >
          ابدأ
        </button>
        <Link
          href="/workouts/new"
          className="rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-4 text-lg font-semibold shadow-lg shadow-black/40 hover:bg-zinc-800"
        >
          احفظ
        </Link>
      </div>
    </div>
  )
}
