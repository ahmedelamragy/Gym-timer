let ctx: AudioContext | null = null

function resume() {
  // iOS reports "interrupted" after a screen lock or phone call; both need a resume.
  if (ctx && ctx.state !== 'running' && ctx.state !== 'closed') void ctx.resume().catch(() => {})
}

/** Must be called from a user gesture (the Start button) so browsers allow sound. */
export function unlockAudio() {
  if (typeof window === 'undefined') return
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return
  if (!ctx) {
    ctx = new Ctor()
    // Phones suspend audio when the screen locks; wake it when the page is shown again.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') resume()
    })
  }
  resume()
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
