'use client'

import { useState, useTransition } from 'react'
import { deleteWorkout } from '@/app/workouts/actions'

export function DeleteWorkoutButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onDelete() {
    if (!confirm(`Delete "${name}"?`)) return
    setError(null)
    startTransition(async () => {
      const res = await deleteWorkout(id)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="text-zinc-400 hover:text-red-400 disabled:opacity-50"
      >
        {pending ? 'Deleting…' : 'Delete'}
      </button>
      {error && (
        <span role="alert" className="text-red-400">
          {error}
        </span>
      )}
    </span>
  )
}
