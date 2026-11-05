import type { Phase, Step, StepKind, WorkoutInput } from './types'
import { uid } from './utils'

export function newStep(phase: Phase, kind: StepKind, label: string, seconds: number): Step {
  return { id: uid(), phase, kind, label, seconds }
}

export interface Preset {
  id: string
  name: string
  build: () => WorkoutInput
}

export const PRESETS: Preset[] = [
  {
    id: 'tabata',
    name: 'Tabata 20/10 × 8',
    build: () => ({
      name: 'Tabata',
      rounds: 8,
      steps: [
        newStep('warmup', 'rest', 'Get ready', 10),
        newStep('round', 'work', 'Work', 20),
        newStep('round', 'rest', 'Rest', 10),
      ],
    }),
  },
  {
    id: 'hiit',
    name: 'HIIT 40/20 × 10',
    build: () => ({
      name: 'HIIT',
      rounds: 10,
      steps: [
        newStep('warmup', 'work', 'Warm-up', 120),
        newStep('round', 'work', 'Work', 40),
        newStep('round', 'rest', 'Rest', 20),
        newStep('cooldown', 'rest', 'Cool-down', 120),
      ],
    }),
  },
  {
    id: 'boxing',
    name: 'Boxing 3:00/1:00 × 6',
    build: () => ({
      name: 'Boxing rounds',
      rounds: 6,
      steps: [newStep('round', 'work', 'Round', 180), newStep('round', 'rest', 'Rest', 60)],
    }),
  },
  {
    id: 'emom',
    name: 'EMOM × 10',
    build: () => ({
      name: 'EMOM',
      rounds: 10,
      steps: [newStep('round', 'work', 'Every minute', 60)],
    }),
  },
]
