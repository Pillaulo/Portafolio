import { useEffect, useMemo, useRef, useState } from 'react'
import { Scene, type SceneMode } from './components/Scene'
import { Hud } from './components/Hud'
import { MusicPlayer, type MusicPlayerHandle } from './components/MusicPlayer'
import { CrtOverlay } from './components/CrtOverlay'
import { GARAGE_CARS, getCar, type CarId } from './data/cars'
import { PROFILE, type SectionId } from './data/cv'
import { playSfx } from './lib/sfx'
import { CarOffsetProvider } from './context/CarOffsetContext'
import { CarCalibrator } from './components/CarCalibrator'
import { PerfNotice } from './components/PerfNotice'

type AppMode = 'boot' | SceneMode

export default function App() {
  const [mode, setMode] = useState<AppMode>('boot')
  const [hovered, setHovered] = useState<SectionId | null>(null)
  const [active, setActive] = useState<SectionId | null>(null)
  const [focused, setFocused] = useState<SectionId>('perfil')
  // Fixed catalog order — never shuffle on reload (offsets stay consistent)
  const [carId, setCarId] = useState<CarId>(() => GARAGE_CARS[0].id)
  const [slideDir, setSlideDir] = useState<1 | -1>(1)
  const [showGarageIntro, setShowGarageIntro] = useState(false)
  const musicRef = useRef<MusicPlayerHandle>(null)
  const carIdRef = useRef(carId)
  carIdRef.current = carId

  const carName = useMemo(() => getCar(carId).name, [carId])

  useEffect(() => {
    const t = window.setTimeout(() => setMode('room'), 1400)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!showGarageIntro) return
    const t = window.setTimeout(() => setShowGarageIntro(false), 1600)
    return () => window.clearTimeout(t)
  }, [showGarageIntro])

  /** Cycle cars independently of CV sections. */
  const cycleCar = (dir: 1 | -1) => {
    const list = GARAGE_CARS
    const idx = Math.max(
      0,
      list.findIndex((c) => c.id === carIdRef.current),
    )
    const next = list[(idx + dir + list.length) % list.length]
    if (!next || next.id === carIdRef.current) return
    setSlideDir(dir)
    setCarId(next.id)
  }

  useEffect(() => {
    if (mode !== 'garage') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '[' || (e.key === 'ArrowLeft' && e.shiftKey)) {
        e.preventDefault()
        playSfx('Izquierda')
        cycleCar(-1)
      } else if (e.key === ']' || (e.key === 'ArrowRight' && e.shiftKey)) {
        e.preventDefault()
        playSfx('Derecha')
        cycleCar(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode])

  const startZoom = () => {
    if (mode !== 'room') return
    setMode('zooming')
    setActive(null)
    void musicRef.current?.play()
  }

  const finishZoom = () => {
    setMode('garage')
    setShowGarageIntro(true)
    setActive(null)
    setFocused('perfil')
    setCarId(GARAGE_CARS[0].id)
  }

  const backToRoom = () => {
    playSfx('Volver')
    setMode('room')
    setActive(null)
    setHovered(null)
    setShowGarageIntro(false)
    musicRef.current?.pause()
    document.body.style.cursor = 'auto'
  }

  const focusPart = (id: SectionId) => {
    setFocused(id)
  }

  const selectPart = (id: SectionId) => {
    playSfx('Aceptar')
    setFocused(id)
    setActive(id)
  }

  const closeWindow = () => {
    playSfx('Volver')
    setActive(null)
  }

  const sceneMode: SceneMode =
    mode === 'boot' || mode === 'room'
      ? 'room'
      : mode === 'zooming'
        ? 'zooming'
        : 'garage'

  const musicVisible = mode === 'zooming' || mode === 'garage'

  return (
    <CarOffsetProvider>
      <div className="app-shell">
        <PerfNotice />
        {mode === 'garage' && <CrtOverlay />}

        {mode === 'boot' && (
          <div className="boot-overlay">BOOTING GARAGE OS...</div>
        )}

        {showGarageIntro && (
          <div className="boot-overlay garage-flash">ENTERING GARAGE...</div>
        )}

        <div className="canvas-wrap">
          <Scene
            mode={sceneMode}
            onEnter={startZoom}
            onZoomComplete={finishZoom}
            carId={carId}
            slideDir={slideDir}
            hovered={hovered}
            active={active}
            focused={mode === 'garage' ? focused : null}
            onHover={setHovered}
            onSelect={selectPart}
          />
        </div>

        {mode === 'room' && (
          <div className="hud">
            <div className="intro-id">
              <p className="intro-id__sys">PORTFOLIO · GARAGE OS</p>
              <h1 className="intro-id__name">{PROFILE.shortName}</h1>
              <p className="intro-id__title">{PROFILE.title}</p>
              <p className="intro-id__tag">{PROFILE.tagline}</p>
              <p className="intro-id__hint">Click el monitor o el botón para entrar al CV</p>
            </div>
            <div className="center-cta">
              <button type="button" className="enter-btn" onClick={startZoom}>
                ENTRAR AL MONITOR
              </button>
            </div>
          </div>
        )}

        {mode === 'zooming' && (
          <div className="hud">
            <div className="intro-id intro-id--compact">
              <p className="intro-id__sys">PORTFOLIO · GARAGE OS</p>
              <h1 className="intro-id__name">{PROFILE.shortName}</h1>
              <p className="intro-id__hint">Acercando al monitor...</p>
            </div>
          </div>
        )}

        {mode === 'garage' && (
          <>
            <div className="hud" style={{ pointerEvents: 'none' }}>
              <div className="garage-top-actions">
                <button
                  type="button"
                  className="back-btn"
                  style={{ pointerEvents: 'auto' }}
                  onClick={backToRoom}
                >
                  ← PC
                </button>
              </div>
            </div>
            <Hud
              active={active}
              focused={focused}
              carId={carId}
              carName={carName}
              onClose={closeWindow}
              onFocus={focusPart}
              onSelect={selectPart}
              onSelectCar={(id, dir) => {
                setSlideDir(dir)
                setCarId(id)
              }}
            />
            <CarCalibrator carId={carId} />
          </>
        )}

        <MusicPlayer ref={musicRef} visible={musicVisible} />
      </div>
    </CarOffsetProvider>
  )
}
