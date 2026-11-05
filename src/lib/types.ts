export type Phase = 'warmup' | 'round' | 'cooldown'
export type StepKind = 'work' | 'rest'

export interface Step {
  id: string
  label: string
  seconds: number
  phase: Phase
  kind: StepKind
}

export interface WorkoutInput {
  name: string
  rounds: number
  steps: Step[]
}

export interface Workout extends WorkoutInput {
  id: string
  created_at: string
  updated_at: string
}
