import { useEffect, useMemo, useRef, useState } from 'react'
import { Scene, type SceneMode } from './components/Scene'
import { Hud } from './components/Hud'
import { MusicPlayer, type MusicPlayerHandle } from './components/MusicPlayer'
import { CrtOverlay } from './components/CrtOverlay'
import { buildGarageSlots, GARAGE_CARS, shuffleCars, slotForSection, type CarId } from './data/cars'
import type { SectionId } from './data/cv'

type AppMode = 'boot' | SceneMode

export default function App() {
  const [mode, setMode] = useState<AppMode>('boot')
  const [hovered, setHovered] = useState<SectionId | null>(null)
  const [active, setActive] = useState<SectionId | null>(null)
  const [focused, setFocused] = useState<SectionId>('perfil')
  const [carOrder] = useState(() => shuffleCars())
  const slots = useMemo(() => buildGarageSlots(carOrder), [carOrder])
  const [carId, setCarId] = useState<CarId>(() => slots[0]?.carId ?? GARAGE_CARS[0].id)
  const [slideDir, setSlideDir] = useState<1 | -1>(1)
  const [showGarageIntro, setShowGarageIntro] = useState(false)
  const musicRef = useRef<MusicPlayerHandle>(null)
  const focusedRef = useRef(focused)
  focusedRef.current = focused

  useEffect(() => {
    const t = window.setTimeout(() => setMode('room'), 1400)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!showGarageIntro) return
    const t = window.setTimeout(() => setShowGarageIntro(false), 1600)
    return () => window.clearTimeout(t)
  }, [showGarageIntro])

  const syncCarForSection = (sectionId: SectionId) => {
    const fromIdx = slots.findIndex((s) => s.sectionId === focusedRef.current)
    const toIdx = slots.findIndex((s) => s.sectionId === sectionId)
    const next = slotForSection(sectionId, slots)
    if (next.carId !== carId) {
      const dir = (toIdx >= fromIdx ? 1 : -1) as 1 | -1
      // Wrap around: if jumping across ends, pick shorter visual dir
      if (fromIdx >= 0 && toIdx >= 0) {
        const forward = (toIdx - fromIdx + slots.length) % slots.length
        const backward = (fromIdx - toIdx + slots.length) % slots.length
        setSlideDir(forward <= backward ? 1 : -1)
      } else {
        setSlideDir(dir)
      }
      setCarId(next.carId)
    }
    setFocused(sectionId)
  }

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
    const first = slots[0]
    setFocused(first?.sectionId ?? 'perfil')
    if (first) setCarId(first.carId)
  }

  const backToRoom = () => {
    setMode('room')
    setActive(null)
    setHovered(null)
    setShowGarageIntro(false)
    musicRef.current?.pause()
    document.body.style.cursor = 'auto'
  }

  const focusPart = (id: SectionId) => {
    syncCarForSection(id)
  }

  const selectPart = (id: SectionId) => {
    syncCarForSection(id)
    setActive(id)
  }

  const sceneMode: SceneMode =
    mode === 'boot' || mode === 'room'
      ? 'room'
      : mode === 'zooming'
        ? 'zooming'
        : 'garage'

  const musicVisible = mode === 'zooming' || mode === 'garage'
  const currentSlot = slotForSection(focused, slots)

  return (
    <div className="app-shell">
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
          <div className="top-bar">
            <div className="brand">
              PORTFOLIO PC
              <span>Estilo CRT · Click el monitor para entrar</span>
            </div>
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
          <div className="top-bar">
            <div className="brand">
              PORTFOLIO PC
              <span>Acercando al monitor...</span>
            </div>
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
            carName={currentSlot.carName}
            onClose={() => setActive(null)}
            onFocus={focusPart}
            onSelect={selectPart}
          />
        </>
      )}

      <MusicPlayer ref={musicRef} visible={musicVisible} />
    </div>
  )
}
