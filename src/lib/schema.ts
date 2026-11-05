import { z } from 'zod'

const phase = z.enum(['warmup', 'round', 'cooldown'])
const kind = z.enum(['work', 'rest'])

export const stepSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().trim().min(1, 'كل خطوة تحتاج اسماً').max(40, 'اسم الخطوة طويل جداً'),
  seconds: z
    .number()
    .int()
    .min(1, 'مدة كل خطوة ثانية واحدة على الأقل')
    .max(3600, 'أقصى مدة للخطوة ساعة'),
  phase,
  kind,
})

/** Strict schema used before saving to the database. */
export const workoutSchema = z
  .object({
    name: z.string().trim().min(1, 'اكتب اسماً للتمرين').max(60, 'اسم التمرين طويل جداً'),
    rounds: z.number().int().min(1, 'جولة واحدة على الأقل').max(99, 'أقصى عدد 99 جولة'),
    steps: z.array(stepSchema).min(1).max(50, 'أقصى عدد 50 خطوة'),
  })
  .refine((w) => w.steps.some((s) => s.phase === 'round'), {
    message: 'أضف خطوة واحدة على الأقل في الجولة',
    path: ['steps'],
  })

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
