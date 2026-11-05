import { draftSchema } from './schema'
import type { WorkoutInput } from './types'

const KEY = 'gym-timer:draft'

/** The workout being edited on the home page, kept in this browser only. */
export function loadDraft(): WorkoutInput | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = draftSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export function saveDraft(workout: WorkoutInput) {
  try {
    localStorage.setItem(KEY, JSON.stringify(workout))
  } catch {
    // Private mode or storage full: the timer still works, the draft just isn't kept.
  }
}
