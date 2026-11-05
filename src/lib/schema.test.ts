import { describe, expect, it } from 'vitest'
import { PRESETS } from './presets'
import { parseStoredWorkout, workoutSchema } from './schema'

const valid = () => PRESETS[0].build()

describe('workoutSchema', () => {
  it('accepts every preset', () => {
    for (const p of PRESETS) expect(workoutSchema.safeParse(p.build()).success).toBe(true)
  })

  it('requires at least one round step', () => {
    const w = { ...valid(), steps: valid().steps.filter((s) => s.phase !== 'round') }
    const r = workoutSchema.safeParse(w)
    expect(r.success).toBe(false)
    expect(r.error?.issues[0]?.message).toBe('Add at least one step to the round')
  })

  it('rejects bad names, rounds and durations with readable messages', () => {
    const msg = (w: unknown) => workoutSchema.safeParse(w).error?.issues[0]?.message
    expect(msg({ ...valid(), name: '   ' })).toBe('Give the workout a name')
    expect(msg({ ...valid(), rounds: 0 })).toBe('At least 1 round')
    expect(msg({ ...valid(), rounds: 100 })).toBe('At most 99 rounds')
    const w = valid()
    w.steps[1].seconds = 0
    expect(msg(w)).toBe('Each step must be at least 1 second')
  })

  it('drops unknown fields such as user_id', () => {
    const r = workoutSchema.safeParse({ ...valid(), user_id: 'someone-else' })
    expect(r.success && 'user_id' in r.data).toBe(false)
  })
})

describe('parseStoredWorkout', () => {
  it('returns the workout for a good row', () => {
    expect(parseStoredWorkout(valid())?.name).toBe('Tabata')
  })

  it.each([
    ['null', null],
    ['steps not an array', { name: 'x', rounds: 1, steps: 'nope' }],
    ['seconds as text', { name: 'x', rounds: 1, steps: [{ id: 'a', label: 'a', seconds: '20', phase: 'round', kind: 'work' }] }],
    ['unknown phase', { name: 'x', rounds: 1, steps: [{ id: 'a', label: 'a', seconds: 20, phase: 'bonus', kind: 'work' }] }],
  ])('returns null for a damaged row (%s)', (_label, row) => {
    expect(parseStoredWorkout(row)).toBeNull()
  })
})
