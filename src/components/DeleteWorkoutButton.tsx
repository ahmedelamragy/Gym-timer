'use client'

import { deleteWorkout } from '@/app/workouts/actions'

export function DeleteWorkoutButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteWorkout.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"?`)) e.preventDefault()
      }}
    >
      <button className="text-zinc-400 hover:text-red-400">Delete</button>
    </form>
  )
}
