let ctx: AudioContext | null = null

/** Must be called from a user gesture (the Start button) so browsers allow sound. */
export function unlockAudio() {
  if (typeof window === 'undefined') return
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return
  ctx ??= new Ctor()
  if (ctx.state === 'suspended') void ctx.resume()
}

export function beep(frequency = 880, durationMs = 150, delayMs = 0, volume = 0.3) {
  if (!ctx) return
  const start = ctx.currentTime + delayMs / 1000
  const end = start + durationMs / 1000
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, end)
  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(end + 0.02)
}

export function finishChime() {
  beep(880, 200, 0)
  beep(1100, 200, 250)
  beep(1320, 500, 500)
}
