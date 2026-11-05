'use client'

import { useState } from 'react'
import { newStep } from '@/lib/presets'
import { buildTimeline, formatTime, totalSeconds } from '@/lib/timeline'
import type { Phase, Step, StepKind, WorkoutInput } from '@/lib/types'
import { clamp } from '@/lib/utils'

const SECTIONS: { phase: Phase; title: string; hint: string }[] = [
  { phase: 'warmup', title: 'Warm-up', hint: 'Plays once at the start' },
  { phase: 'round', title: 'Round', hint: 'Repeats for each round' },
  { phase: 'cooldown', title: 'Cool-down', hint: 'Plays once at the end' },
]

const KIND_LABEL: Record<StepKind, string> = { work: 'Work', rest: 'Rest' }

const inputCls =
  'w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-emerald-500'
const iconBtn =
  'grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent'

interface Props {
  value: WorkoutInput
  onChange: (workout: WorkoutInput) => void
}

export function WorkoutEditor({ value, onChange }: Props) {
  /** What is being typed into the rounds box; null when it isn't being edited. */
  const [roundsText, setRoundsText] = useState<string | null>(null)
  const total = totalSeconds(buildTimeline(value))
  const hasRoundStep = value.steps.some((s) => s.phase === 'round')

  const setSteps = (steps: Step[]) => onChange({ ...value, steps })
  const setRounds = (n: number) =>
    onChange({ ...value, rounds: clamp(Number.isFinite(n) ? Math.round(n) : 1, 1, 99) })

  function updateStep(id: string, patch: Partial<Step>) {
    setSteps(value.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function removeStep(id: string) {
    setSteps(value.steps.filter((s) => s.id !== id))
  }

  /** Swap with the nearest step of the same phase in the given direction. */
  function moveStep(id: string, dir: -1 | 1) {
    const steps = [...value.steps]
    const i = steps.findIndex((s) => s.id === id)
    if (i < 0) return
    let j = i + dir
    while (j >= 0 && j < steps.length && steps[j].phase !== steps[i].phase) j += dir
    if (j < 0 || j >= steps.length) return
    ;[steps[i], steps[j]] = [steps[j], steps[i]]
    setSteps(steps)
  }

  function addStep(phase: Phase) {
    const last = value.steps.filter((s) => s.phase === phase).at(-1)
    if (phase === 'warmup') return setSteps([...value.steps, newStep(phase, 'work', 'Warm-up', 60)])
    if (phase === 'cooldown') return setSteps([...value.steps, newStep(phase, 'rest', 'Cool-down', 60)])
    const kind: StepKind = last?.kind === 'work' ? 'rest' : 'work'
    setSteps([...value.steps, newStep(phase, kind, KIND_LABEL[kind], kind === 'work' ? 30 : 15)])
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Workout name</span>
          <input
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            maxLength={60}
            placeholder="e.g. Morning Tabata"
            className={inputCls}
          />
        </label>
        <div>
          <span className="mb-1 block text-sm text-zinc-400">Rounds</span>
          <div className="flex items-center gap-2">
            <button type="button" className={`${iconBtn} border border-zinc-700`} onClick={() => { setRoundsText(null); setRounds(value.rounds - 1) }} aria-label="One less round">
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              value={roundsText ?? value.rounds}
              onChange={(e) => {
                // Keep exactly what was typed (even empty) until the field loses focus.
                setRoundsText(e.target.value)
                const n = parseInt(e.target.value, 10)
                if (Number.isFinite(n) && n >= 1) setRounds(n)
              }}
              onBlur={() => setRoundsText(null)}
              aria-label="Number of rounds"
              className="w-16 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-center tabular-nums outline-none focus:border-emerald-500"
            />
            <button type="button" className={`${iconBtn} border border-zinc-700`} onClick={() => { setRoundsText(null); setRounds(value.rounds + 1) }} aria-label="One more round">
              +
            </button>
          </div>
        </div>
      </div>

      {SECTIONS.map((section) => {
        const steps = value.steps.filter((s) => s.phase === section.phase)
        return (
          <section key={section.phase} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h3 className="font-semibold">
                {section.title}
                {section.phase === 'round' && (
                  <span className="ms-1 text-emerald-400 tabular-nums">× {value.rounds}</span>
                )}
              </h3>
              <span className="text-xs text-zinc-500">{section.hint}</span>
            </div>

            {steps.length > 0 && (
              <ul className="space-y-2">
                {steps.map((step, i) => (
                  <li key={step.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-zinc-800/60 p-2">
                    <button
                      type="button"
                      onClick={() => updateStep(step.id, { kind: step.kind === 'work' ? 'rest' : 'work' })}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        step.kind === 'work' ? 'bg-emerald-600' : 'bg-sky-600'
                      }`}
                      title="Switch between work and rest"
                    >
                      {KIND_LABEL[step.kind]}
                    </button>
                    <input
                      value={step.label}
                      onChange={(e) => updateStep(step.id, { label: e.target.value })}
                      maxLength={40}
                      aria-label="Step name"
                      className="min-w-24 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 outline-none focus:border-zinc-600"
                    />
                    <label className="flex items-center gap-1">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={3600}
                        value={step.seconds || ''}
                        onChange={(e) =>
                          updateStep(step.id, { seconds: clamp(parseInt(e.target.value, 10) || 0, 0, 3600) })
                        }
                        aria-label="Duration in seconds"
                        className="w-16 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-center tabular-nums outline-none focus:border-emerald-500"
                      />
                      <span className="text-xs text-zinc-400">s</span>
                    </label>
                    <div className="flex">
                      <button type="button" className={iconBtn} onClick={() => moveStep(step.id, -1)} disabled={i === 0} aria-label="Move up">
                        ↑
                      </button>
                      <button type="button" className={iconBtn} onClick={() => moveStep(step.id, 1)} disabled={i === steps.length - 1} aria-label="Move down">
                        ↓
                      </button>
                      <button type="button" className={`${iconBtn} hover:text-red-400`} onClick={() => removeStep(step.id)} aria-label="Delete step">
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => addStep(section.phase)}
              className="mt-3 text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              + Add step
            </button>
          </section>
        )
      })}

      {!hasRoundStep && <p className="text-sm text-amber-400">Add at least one step to the round.</p>}

      <p className="text-sm text-zinc-400">
        Total time:{' '}
        <span className="font-semibold text-zinc-100 tabular-nums">
          {formatTime(total)}
        </span>
      </p>
    </div>
  )
}
