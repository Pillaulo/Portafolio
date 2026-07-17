export type SfxName = 'Derecha' | 'Izquierda' | 'Aceptar' | 'Volver'

const cache = new Map<SfxName, HTMLAudioElement>()

function getAudio(name: SfxName): HTMLAudioElement {
  let audio = cache.get(name)
  if (!audio) {
    audio = new Audio(`/efectos/${name}.mp3`)
    audio.preload = 'auto'
    cache.set(name, audio)
  }
  return audio
}

/** Play a short UI SFX; overlaps safely by cloning if still playing. */
export function playSfx(name: SfxName, volume = 0.7) {
  try {
    const base = getAudio(name)
    if (base.paused) {
      base.volume = volume
      base.currentTime = 0
      void base.play().catch(() => undefined)
      return
    }
    const node = base.cloneNode(true) as HTMLAudioElement
    node.volume = volume
    void node.play().catch(() => undefined)
  } catch {
    /* missing file / decode — ignore */
  }
}

/** Warm the cache so the first click is instant. */
export function preloadSfx() {
  ;(['Derecha', 'Izquierda', 'Aceptar', 'Volver'] as const).forEach((n) => {
    getAudio(n).load()
  })
}
