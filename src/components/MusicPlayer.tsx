import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const TRACK = {
  src: '/music/riders-on-the-storm.mp3',
  title: 'RIDERS ON THE STORM',
  artist: 'SNOOP DOGG & THE DOORS',
  album: 'NFSU2 OST',
}

const DEFAULT_VOLUME = 0.01

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
      setMessage('NO DISC / ERROR')
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
      setMessage(name === 'NotAllowedError' ? 'PRESS PLAY' : 'PLAY ERROR')
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

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <>
      <audio ref={audioRef} src={TRACK.src} preload="auto" loop playsInline />

      <AnimatePresence>
        {visible && (
          <motion.div
            className="retro-deck"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 36, transition: { duration: 0.22 } }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          >
            <div className="retro-deck__screw retro-deck__screw--tl" />
            <div className="retro-deck__screw retro-deck__screw--tr" />
            <div className="retro-deck__screw retro-deck__screw--bl" />
            <div className="retro-deck__screw retro-deck__screw--br" />

            <div className="retro-deck__brand">
              <span>GARAGE</span>
              <span>AUDIO · STEREO</span>
            </div>

            <div className="retro-deck__lcd">
              <div className="retro-deck__lcd-glow" />
              <div className="retro-deck__lcd-row">
                <span className={`retro-deck__led${playing ? ' is-on' : ''}`} />
                <span className="retro-deck__mode">
                  {message ||
                    (status === 'loading' ? 'LOAD…' : playing ? 'PLAY ▶' : 'STOP ■')}
                </span>
                <span className="retro-deck__clock">{formatTime(progress)}</span>
              </div>
              <button
                type="button"
                className="retro-deck__track"
                onClick={() => setExpanded((v) => !v)}
              >
                <strong>{TRACK.title}</strong>
                <span>
                  {TRACK.artist} · {TRACK.album}
                </span>
              </button>
              <div className="retro-deck__vu" aria-hidden>
                {Array.from({ length: 12 }).map((_, i) => (
                  <i
                    key={i}
                    className={playing && i < 3 + ((progress * 7) % 9) ? 'is-lit' : ''}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  />
                ))}
              </div>
            </div>

            <div className="retro-deck__transport">
              <button
                type="button"
                className={`retro-deck__key${playing ? ' is-down' : ''}`}
                onClick={toggle}
                aria-label={playing ? 'Pausar' : 'Reproducir'}
              >
                {playing ? 'PAUSE' : 'PLAY'}
              </button>
              <button
                type="button"
                className="retro-deck__key"
                onClick={pause}
                aria-label="Stop"
              >
                STOP
              </button>
              <button
                type="button"
                className="retro-deck__key retro-deck__key--small"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? 'HIDE' : 'TAPE'}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {expanded && status !== 'error' && (
                <motion.div
                  className="retro-deck__panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="retro-deck__seek">
                    <div className="retro-deck__seek-track">
                      <div className="retro-deck__seek-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.1}
                      value={progress}
                      onChange={(e) => seek(Number(e.target.value))}
                      aria-label="Progreso"
                    />
                  </div>
                  <div className="retro-deck__times">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <label className="retro-deck__vol">
                    <span>VOL</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      aria-label="Volumen"
                    />
                    <em>{Math.round(volume * 100)}</em>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})
