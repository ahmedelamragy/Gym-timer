import type { Phase, Step, StepKind, WorkoutInput } from './types'

export interface Segment {
  key: string
  label: string
  seconds: number
  phase: Phase
  kind: StepKind
  /** 1-based round number for round steps, null for warmup/cooldown. */
  round: number | null
}

function toSegment(step: Step, round: number | null): Segment {
  return {
    key: `${step.id}:${round ?? '-'}`,
    label: step.label.trim() || (step.kind === 'rest' ? 'راحة' : 'تمرين'),
    seconds: step.seconds,
    phase: step.phase,
    kind: step.kind,
    round,
  }
}

/**
 * Flattens a workout into the exact sequence the timer plays:
 * warmup steps once, then the round steps repeated `rounds` times, then cooldown once.
 * Steps keep their order within each phase; steps with no duration are skipped.
 */
export function buildTimeline(workout: Pick<WorkoutInput, 'rounds' | 'steps'>): Segment[] {
  const steps = workout.steps.filter((s) => Number.isFinite(s.seconds) && s.seconds > 0)
  const inPhase = (phase: Phase) => steps.filter((s) => s.phase === phase)

  const roundSteps = inPhase('round')
  const rounds = Math.max(0, Math.floor(workout.rounds))
  const segments: Segment[] = inPhase('warmup').map((s) => toSegment(s, null))

  for (let r = 1; r <= rounds; r++) {
    for (const s of roundSteps) segments.push(toSegment(s, r))
  }

  for (const s of inPhase('cooldown')) segments.push(toSegment(s, null))
  return segments
}

export function totalSeconds(segments: Segment[]) {
  return segments.reduce((sum, s) => sum + s.seconds, 0)
}

/** 75 → "1:15", 3725 → "1:02:05" */
export function formatTime(totalSecs: number) {
  const s = Math.max(0, Math.round(totalSecs))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}
