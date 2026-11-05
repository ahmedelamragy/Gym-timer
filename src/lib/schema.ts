import { z } from 'zod'
import type { WorkoutInput } from './types'

const phase = z.enum(['warmup', 'round', 'cooldown'])
const kind = z.enum(['work', 'rest'])

export const stepSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().trim().min(1, 'Every step needs a name').max(40, 'Step name is too long'),
  seconds: z
    .number()
    .int()
    .min(1, 'Each step must be at least 1 second')
    .max(3600, 'A step can be at most 1 hour'),
  phase,
  kind,
})

/** Strict schema used before saving to the database. */
export const workoutSchema = z
  .object({
    name: z.string().trim().min(1, 'Give the workout a name').max(60, 'Workout name is too long'),
    rounds: z.number().int().min(1, 'At least 1 round').max(99, 'At most 99 rounds'),
    steps: z.array(stepSchema).min(1).max(50, 'At most 50 steps'),
  })
  .refine((w) => w.steps.some((s) => s.phase === 'round'), {
    message: 'Add at least one step to the round',
    path: ['steps'],
  })

/**
 * Checks a row read back from the database. Rows can be changed outside the app
 * (SQL editor, direct API calls), so they are never trusted to match the types.
 */
export function parseStoredWorkout(row: unknown): WorkoutInput | null {
  const parsed = workoutSchema.safeParse(row)
  return parsed.success ? parsed.data : null
}

/** Lenient schema for a half-edited draft kept in localStorage. */
export const draftSchema = z.object({
  name: z.string(),
  rounds: z.number(),
  steps: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      seconds: z.number(),
      phase,
      kind,
    }),
  ),
})
