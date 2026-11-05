'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Segment } from '@/lib/timeline'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'done'

interface Options {
  /** Fires once each time the displayed whole second changes. */
  onSecond?: (secondsLeft: number, segment: Segment) => void
  onSegmentStart?: (segment: Segment, index: number) => void
  onDone?: () => void
}

const TICK_MS = 100

/**
 * Drift-free interval timer. Instead of counting ticks, it stores the
 * performance.now() timestamp at which the current segment ends and derives the
 * remaining time from it, so throttled tabs and slow frames never lose time.
 */
export function useIntervalTimer(segments: Segment[], options: Options = {}) {
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [index, setIndex] = useState(0)
  const [remainingMs, setRemainingMs] = useState((segments[0]?.seconds ?? 0) * 1000)

  const segmentsRef = useRef(segments)
  const optionsRef = useRef(options)
  const indexRef = useRef(0)
  const endAtRef = useRef(0)
  const remainingRef = useRef(remainingMs)
  const lastSecondRef = useRef<number | null>(null)

  useEffect(() => {
    optionsRef.current = options
  })

  useEffect(() => {
    segmentsRef.current = segments
    if (status === 'idle') {
      indexRef.current = 0
      setIndex(0)
      remainingRef.current = (segments[0]?.seconds ?? 0) * 1000
      setRemainingMs(remainingRef.current)
    }
    // Only re-sync when the workout itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments])

  const enterSegment = useCallback((i: number) => {
    indexRef.current = i
    lastSecondRef.current = null
    setIndex(i)
    optionsRef.current.onSegmentStart?.(segmentsRef.current[i], i)
  }, [])

  const finish = useCallback(() => {
    remainingRef.current = 0
    setRemainingMs(0)
    setStatus('done')
    optionsRef.current.onDone?.()
  }, [])

  const tick = useCallback(() => {
    const segs = segmentsRef.current
    const now = performance.now()
    let i = indexRef.current
    let left = endAtRef.current - now

    // Catch up over any segments that ended while the tab was throttled.
    while (left <= 0) {
      i += 1
      if (i >= segs.length) {
        finish()
        return
      }
      endAtRef.current += segs[i].seconds * 1000
      left = endAtRef.current - now
    }
    if (i !== indexRef.current) enterSegment(i)

    remainingRef.current = left
    setRemainingMs(left)

    const sec = Math.ceil(left / 1000)
    if (sec !== lastSecondRef.current) {
      lastSecondRef.current = sec
      optionsRef.current.onSecond?.(sec, segs[i])
    }
  }, [enterSegment, finish])

  useEffect(() => {
    if (status !== 'running') return
    tick()
    const id = window.setInterval(tick, TICK_MS)
    return () => window.clearInterval(id)
  }, [status, tick])

  const start = useCallback(() => {
    const segs = segmentsRef.current
    if (segs.length === 0) return
    endAtRef.current = performance.now() + segs[0].seconds * 1000
    enterSegment(0)
    setStatus('running')
  }, [enterSegment])

  const pause = useCallback(() => {
    if (status !== 'running') return
    remainingRef.current = Math.max(0, endAtRef.current - performance.now())
    setRemainingMs(remainingRef.current)
    setStatus('paused')
  }, [status])

  const resume = useCallback(() => {
    if (status !== 'paused') return
    endAtRef.current = performance.now() + remainingRef.current
    setStatus('running')
  }, [status])

  const skip = useCallback(() => {
    if (status !== 'running' && status !== 'paused') return
    const segs = segmentsRef.current
    const next = indexRef.current + 1
    if (next >= segs.length) {
      finish()
      return
    }
    const ms = segs[next].seconds * 1000
    endAtRef.current = performance.now() + ms
    remainingRef.current = ms
    setRemainingMs(ms)
    enterSegment(next)
  }, [status, enterSegment, finish])

  const reset = useCallback(() => {
    const segs = segmentsRef.current
    indexRef.current = 0
    lastSecondRef.current = null
    remainingRef.current = (segs[0]?.seconds ?? 0) * 1000
    setIndex(0)
    setRemainingMs(remainingRef.current)
    setStatus('idle')
  }, [])

  return {
    status,
    index,
    segment: segments[index] as Segment | undefined,
    remainingMs,
    start,
    pause,
    resume,
    skip,
    reset,
  }
}
