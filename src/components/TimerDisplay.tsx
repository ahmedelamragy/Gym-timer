import { formatTime, type Segment } from '@/lib/timeline'

const PHASE_LABEL = { warmup: 'Warm-up', round: 'Round', cooldown: 'Cool-down' } as const

export function segmentTheme(segment: Segment | undefined) {
  if (!segment) return 'bg-zinc-950 text-zinc-100'
  if (segment.phase === 'warmup') return 'bg-amber-500 text-zinc-950'
  if (segment.phase === 'cooldown') return 'bg-violet-700 text-white'
  return segment.kind === 'work' ? 'bg-emerald-600 text-white' : 'bg-sky-700 text-white'
}

interface Props {
  segment: Segment
  next: Segment | undefined
  secondsLeft: number
  segmentProgress: number
  overallProgress: number
  totalRounds: number
  paused: boolean
}

export function TimerDisplay({
  segment,
  next,
  secondsLeft,
  segmentProgress,
  overallProgress,
  totalRounds,
  paused,
}: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="space-y-1 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Bar value={overallProgress} className="h-1.5" />
        <Bar value={segmentProgress} className="h-3" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-lg font-semibold opacity-80">
          {segment.round ? (
            <>
              {PHASE_LABEL.round}{' '}
              <span className="tabular-nums">
                {segment.round}/{totalRounds}
              </span>
            </>
          ) : (
            PHASE_LABEL[segment.phase]
          )}
        </p>
        <h2 className="text-4xl font-bold sm:text-5xl">{segment.label}</h2>
        <p className="text-[28vw] leading-none font-bold tabular-nums sm:text-[11rem]" aria-live="off">
          {formatTime(secondsLeft)}
        </p>
        {paused && <p className="animate-pulse text-xl font-semibold">Paused</p>}
        {next && (
          <p className="text-lg opacity-80">
            Next: {next.label}{' '}
            <span className="tabular-nums">
              ({formatTime(next.seconds)})
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

function Bar({ value, className }: { value: number; className: string }) {
  return (
    <div className={`overflow-hidden rounded-full bg-black/20 ${className}`}>
      <div
        className="h-full rounded-full bg-white/80"
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  )
}
