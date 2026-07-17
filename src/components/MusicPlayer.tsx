import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const TRACK = {
  src: '/music/riders-on-the-storm.mp3',
  title: 'Riders On The Storm',
  artist: 'Snoop Dogg & The Doors · Fredwreck Remix · NFSU2',
}

const DEFAULT_VOLUME = 0.05

type Props = {
  visible: boolean
}

export type MusicPlayerHandle = {
  play: () => Promise<void>
  pause: () => void
}

function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, '0')
  return `${m}:${sec}`
}

export const MusicPlayer = forwardRef<MusicPlayerHandle, Props>(function MusicPlayer(
  { visible },
  ref,
) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume

    const onMeta = () => {
      setDuration(audio.duration || 0)
      setStatus('ready')
      setMessage('')
    }
    const onTime = () => setProgress(audio.currentTime)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onWaiting = () => setStatus('loading')
    const onCanPlay = () => setStatus('ready')
    const onErr = () => {
      setStatus('error')
      setPlaying(false)
      setMessage('No se pudo cargar el MP3')
    }

    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('error', onErr)
    audio.load()

    return () => {
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('error', onErr)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const play = async () => {
    const audio = audioRef.current
    if (!audio) return
    setMessage('')
    try {
      audio.volume = volume
      await audio.play()
      setExpanded(true)
    } catch (err) {
      const name = err instanceof Error ? err.name : 'Error'
      setMessage(
        name === 'NotAllowedError'
          ? 'Click ▶ para desbloquear audio'
          : 'No se pudo reproducir',
      )
      setPlaying(false)
    }
  }

  const pause = () => {
    audioRef.current?.pause()
  }

  useImperativeHandle(ref, () => ({ play, pause }), [volume])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      pause()
      return
    }
    await play()
  }

  const seek = (value: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = value
    setProgress(value)
  }

  return (
    <>
      <audio ref={audioRef} src={TRACK.src} preload="auto" loop playsInline />

      <AnimatePresence>
        {visible && (
          <motion.div
            className="music-player"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: 40,
              scale: 0.7,
              transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
            }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
          >
            <button
              type="button"
              className={`music-player__play${playing ? ' is-playing' : ''}`}
              onClick={toggle}
              aria-label={playing ? 'Pausar' : 'Reproducir'}
            >
              {playing ? '❚❚' : '▶'}
            </button>

            <div className="music-player__meta">
              <button
                type="button"
                className="music-player__toggle"
                onClick={() => setExpanded((v) => !v)}
              >
                <span className="music-player__title">{TRACK.title}</span>
                <span className="music-player__artist">
                  {message ||
                    (status === 'error'
                      ? 'Error de archivo'
                      : status === 'loading'
                        ? 'Cargando…'
                        : TRACK.artist)}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {expanded && status !== 'error' && (
                  <motion.div
                    className="music-player__controls"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.1}
                      value={progress}
                      onChange={(e) => seek(Number(e.target.value))}
                      aria-label="Progreso"
                    />
                    <div className="music-player__time">
                      <span>{formatTime(progress)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>

                    <label className="music-player__volume">
                      <span>VOL {Math.round(volume * 100)}%</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        aria-label="Volumen"
                      />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {playing && (
              <div className="music-player__eq" aria-hidden>
                <span />
                <span />
                <span />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})
