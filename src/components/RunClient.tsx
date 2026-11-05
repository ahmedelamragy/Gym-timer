'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TimerDisplay, segmentTheme } from '@/components/TimerDisplay'
import { useIntervalTimer } from '@/hooks/useIntervalTimer'
import { useWakeLock } from '@/hooks/useWakeLock'
import { beep, finishChime, unlockAudio } from '@/lib/audio'
import { loadDraft } from '@/lib/draft'
import { buildTimeline, formatTime, totalSeconds } from '@/lib/timeline'
import type { WorkoutInput } from '@/lib/types'

interface Props {
  /** A saved workout; when null the home-page draft is used. */
  initial: WorkoutInput | null
  exitHref: string
}

const ctrlBtn =
  'rounded-2xl bg-black/25 py-4 text-lg font-semibold backdrop-blur hover:bg-black/35 active:scale-[0.98]'

export function RunClient({ initial, exitHref }: Props) {
  const [workout, setWorkout] = useState<WorkoutInput | null>(initial)
  const [loaded, setLoaded] = useState(initial !== null)

  useEffect(() => {
    if (initial) return
    setWorkout(loadDraft())
    setLoaded(true)
  }, [initial])

  const segments = useMemo(() => (workout ? buildTimeline(workout) : []), [workout])
  const total = totalSeconds(segments)

  const timer = useIntervalTimer(segments, {
    onSegmentStart: (seg) => beep(seg.kind === 'rest' ? 520 : 1040, 350),
    onSecond: (sec, seg) => {
      if (sec >= 1 && sec <= 3 && seg.seconds > 3) beep(780, 120)
    },
    onDone: finishChime,
  })
  const { status, index, segment, remainingMs } = timer

  useWakeLock(status === 'running')

  // Space bar pauses and resumes. The listener is added once and reads the latest
  // timer through a ref, instead of being re-added on every tick.
  const timerRef = useRef(timer)
  useEffect(() => {
    timerRef.current = timer
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = timerRef.current
      if (e.code !== 'Space' || e.repeat) return
      if (t.status !== 'running' && t.status !== 'paused') return
      e.preventDefault()
      if (t.status === 'running') t.pause()
      else t.resume()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!loaded) return null

  if (!workout || segments.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="mb-4 text-zinc-400">No workout to run.</p>
        <Link href="/" className="text-emerald-400 hover:underline">
          Back to the editor
        </Link>
      </div>
    )
  }

  const begin = () => {
    unlockAudio()
    timer.start()
  }

  if (status === 'idle') {
    return (
      <div className="py-16 text-center">
        <p className="mb-2 text-zinc-400">Ready?</p>
        <h1 className="mb-2 text-3xl font-bold">{workout.name || 'Workout'}</h1>
        <p className="mb-10 text-zinc-400">
          {workout.rounds} {workout.rounds === 1 ? 'round' : 'rounds'} · Total{' '}
          <span className="tabular-nums">
            {formatTime(total)}
          </span>
        </p>
        <button
          type="button"
          onClick={begin}
          className="size-44 rounded-full bg-emerald-500 text-3xl font-bold text-zinc-950 shadow-xl shadow-emerald-500/20 hover:bg-emerald-400"
        >
          Start
        </button>
        <div className="mt-10">
          <Link href={exitHref} className="text-sm text-zinc-400 hover:text-zinc-100">
            Back
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'done' || !segment) {
    return (
      <div className="py-20 text-center">
        <p className="mb-3 text-6xl">💪</p>
        <h1 className="mb-2 text-3xl font-bold">Great work!</h1>
        <p className="mb-10 text-zinc-400">
          You finished {workout.name || 'the workout'} in{' '}
          <span className="tabular-nums">
            {formatTime(total)}
          </span>
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={begin}
            className="rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-zinc-950 hover:bg-emerald-400"
          >
            Again
          </button>
          <Link href={exitHref} className="rounded-2xl border border-zinc-700 px-6 py-3 hover:bg-zinc-800">
            Back
          </Link>
        </div>
      </div>
    )
  }

  const secondsLeft = Math.ceil(remainingMs / 1000)
  const segmentProgress = 1 - remainingMs / (segment.seconds * 1000)
  const elapsedBefore = totalSeconds(segments.slice(0, index))
  const overallProgress = (elapsedBefore + segment.seconds - remainingMs / 1000) / total

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-300 ${segmentTheme(segment)}`}>
      <TimerDisplay
        segment={segment}
        next={segments[index + 1]}
        secondsLeft={secondsLeft}
        segmentProgress={segmentProgress}
        overallProgress={overallProgress}
        totalRounds={workout.rounds}
        paused={status === 'paused'}
      />
      <div className="grid grid-cols-3 gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={timer.reset} className={ctrlBtn}>
          End
        </button>
        <button
          type="button"
          onClick={status === 'running' ? timer.pause : timer.resume}
          className={`${ctrlBtn} bg-black/40`}
        >
          {status === 'running' ? 'Pause' : 'Resume'}
        </button>
        <button type="button" onClick={timer.skip} className={ctrlBtn}>
          Skip
        </button>
      </div>
    </div>
  )
}
