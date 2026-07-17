import { useEffect, useRef, useState } from 'react'
import { Scene, type SceneMode } from './components/Scene'
import { Hud } from './components/Hud'
import { MusicPlayer, type MusicPlayerHandle } from './components/MusicPlayer'
import { CrtOverlay } from './components/CrtOverlay'
import type { SectionId } from './data/cv'

type AppMode = 'boot' | SceneMode

export default function App() {
  const [mode, setMode] = useState<AppMode>('boot')
  const [hovered, setHovered] = useState<SectionId | null>(null)
  const [active, setActive] = useState<SectionId | null>(null)
  const [focused, setFocused] = useState<SectionId>('perfil')
  const [showGarageIntro, setShowGarageIntro] = useState(false)
  const musicRef = useRef<MusicPlayerHandle>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setMode('room'), 1400)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!showGarageIntro) return
    const t = window.setTimeout(() => setShowGarageIntro(false), 1600)
    return () => window.clearTimeout(t)
  }, [showGarageIntro])

  const startZoom = () => {
    if (mode !== 'room') return
    setMode('zooming')
    setActive(null)
    // User gesture → start OST so it plays while entering the garage
    void musicRef.current?.play()
  }

  const finishZoom = () => {
    setMode('garage')
    setShowGarageIntro(true)
    setActive(null)
    setFocused('perfil')
  }

  const backToRoom = () => {
    setMode('room')
    setActive(null)
    setHovered(null)
    setShowGarageIntro(false)
    musicRef.current?.pause()
    document.body.style.cursor = 'auto'
  }

  const selectPart = (id: SectionId) => {
    setFocused(id)
    setActive(id)
  }

  const sceneMode: SceneMode =
    mode === 'boot' || mode === 'room'
      ? 'room'
      : mode === 'zooming'
        ? 'zooming'
        : 'garage'

  const musicVisible = mode === 'zooming' || mode === 'garage'

  return (
    <div className="app-shell">
      <CrtOverlay />

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
          <Hud
            active={active}
            focused={focused}
            onClose={() => setActive(null)}
            onFocus={setFocused}
            onSelect={selectPart}
          />
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
        </>
      )}

      <MusicPlayer ref={musicRef} visible={musicVisible} />
    </div>
  )
}
