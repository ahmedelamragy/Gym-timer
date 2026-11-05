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
        newStep('warmup', 'rest', 'استعد', 10),
        newStep('round', 'work', 'تمرين', 20),
        newStep('round', 'rest', 'راحة', 10),
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
        newStep('warmup', 'work', 'إحماء', 120),
        newStep('round', 'work', 'تمرين', 40),
        newStep('round', 'rest', 'راحة', 20),
        newStep('cooldown', 'rest', 'تهدئة', 120),
      ],
    }),
  },
  {
    id: 'boxing',
    name: 'ملاكمة 3:00/1:00 × 6',
    build: () => ({
      name: 'جولات ملاكمة',
      rounds: 6,
      steps: [newStep('round', 'work', 'جولة', 180), newStep('round', 'rest', 'راحة', 60)],
    }),
  },
  {
    id: 'emom',
    name: 'EMOM × 10',
    build: () => ({
      name: 'EMOM',
      rounds: 10,
      steps: [newStep('round', 'work', 'كل دقيقة', 60)],
    }),
  },
]
