import { describe, expect, it } from 'vitest'
import { buildTimeline, formatTime, totalSeconds } from './timeline'
import type { Step } from './types'
import { safeNext } from './utils'

const step = (id: string, phase: Step['phase'], kind: Step['kind'], seconds: number): Step => ({
  id,
  label: id,
  phase,
  kind,
  seconds,
})

describe('buildTimeline', () => {
  it('builds Tabata: 8 rounds of 20/10 with no warmup', () => {
    const segs = buildTimeline({
      rounds: 8,
      steps: [step('work', 'round', 'work', 20), step('rest', 'round', 'rest', 10)],
    })
    expect(segs).toHaveLength(16)
    expect(totalSeconds(segs)).toBe(240)
    expect(segs[0]).toMatchObject({ label: 'work', round: 1 })
    expect(segs[15]).toMatchObject({ label: 'rest', round: 8 })
  })

  it('plays warmup once first and cooldown once last, regardless of array order', () => {
    const segs = buildTimeline({
      rounds: 2,
      steps: [
        step('cool', 'cooldown', 'rest', 60),
        step('work', 'round', 'work', 30),
        step('warm', 'warmup', 'work', 90),
      ],
    })
    expect(segs.map((s) => s.label)).toEqual(['warm', 'work', 'work', 'cool'])
    expect(segs.map((s) => s.round)).toEqual([null, 1, 2, null])
  })

  it('handles a single round', () => {
    const segs = buildTimeline({ rounds: 1, steps: [step('w', 'round', 'work', 45)] })
    expect(segs).toHaveLength(1)
    expect(segs[0].round).toBe(1)
  })

  it('skips steps with no duration and gives every segment a unique key', () => {
    const segs = buildTimeline({
      rounds: 3,
      steps: [step('a', 'round', 'work', 10), step('b', 'round', 'rest', 0)],
    })
    expect(segs).toHaveLength(3)
    expect(new Set(segs.map((s) => s.key)).size).toBe(3)
  })

  it('returns nothing when there are no playable steps', () => {
    expect(buildTimeline({ rounds: 5, steps: [] })).toEqual([])
  })
})

describe('formatTime', () => {
  it('formats minutes and hours', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(75)).toBe('1:15')
    expect(formatTime(3725)).toBe('1:02:05')
  })
})

describe('safeNext', () => {
  it('only allows same-site paths', () => {
    expect(safeNext('/workouts/new')).toBe('/workouts/new')
    expect(safeNext('https://evil.example')).toBe('/workouts')
    expect(safeNext('//evil.example')).toBe('/workouts')
    expect(safeNext('/\\evil.example')).toBe('/workouts')
    expect(safeNext(null)).toBe('/workouts')
  })
})
