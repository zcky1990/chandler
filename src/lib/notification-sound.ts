let audioContext: AudioContext | null = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

/** Call once after user gesture so later alerts can play sound. */
export function unlockNotificationSound() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      void ctx.resume()
    }
  } catch {
    // ignore
  }
}

/** Short two-tone chime for staff alerts (pre-order, etc.). */
export function playNewOrderSound() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      void ctx.resume()
    }

    const playTone = (frequency: number, start: number, duration: number) => {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start(start)
      oscillator.stop(start + duration)
    }

    const now = ctx.currentTime
    playTone(880, now, 0.15)
    playTone(1174.66, now + 0.18, 0.2)
  } catch {
    // ponytail: no asset fallback; silent if AudioContext blocked
  }
}
