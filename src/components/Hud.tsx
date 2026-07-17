import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CAR_PARTS, SECTIONS, type SectionId } from '../data/cv'
import type { CarId } from '../data/cars'
import { GarageMenu } from './GarageMenu'
import { OsWindow } from './OsWindow'
import { SideProfile } from './SideProfile'
import { CarPicker } from './CarPicker'
import { CvViewer } from './CvViewer'

type Props = {
  active: SectionId | null
  focused: SectionId
  carId: CarId
  carName?: string
  onClose: () => void
  onFocus: (id: SectionId) => void
  onSelect: (id: SectionId) => void
  onSelectCar: (id: CarId, dir: 1 | -1) => void
}

export function Hud({
  active,
  focused,
  carId,
  carName,
  onClose,
  onFocus,
  onSelect,
  onSelectCar,
}: Props) {
  const [displayed, setDisplayed] = useState<SectionId | null>(active)
  const [showGuide, setShowGuide] = useState(true)

  useEffect(() => {
    if (active) {
      setDisplayed(active)
      setShowGuide(false)
    }
  }, [active])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && active) {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, onClose])

  const section = displayed ? SECTIONS[displayed] : null
  const open = Boolean(active && section)
  const focusedPart = CAR_PARTS.find((p) => p.id === focused)
  const isCv = displayed === 'cv'

  return (
    <div className="hud">
      <SideProfile />

      <div className="side-credit" role="note" aria-label="Crédito de modelos 3D">
        <span className="side-credit__label">Modelos 3D · no son de mi propiedad</span>
        <span className="side-credit__name">sketchfab.com/Lexyc16</span>
      </div>

      <div className="garage-top-stack">
        <GarageMenu
          active={active}
          focused={focused}
          carName={carName}
          onFocus={onFocus}
          onSelect={onSelect}
        />
        <CarPicker carId={carId} onSelect={onSelectCar} />
      </div>

      <AnimatePresence>
        {showGuide && !open && (
          <motion.div
            className="garage-guide"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <div className="garage-guide__title">Cómo explorar el CV</div>
            <ol className="garage-guide__steps">
              <li>
                <span>1</span> Usa <kbd>←</kbd> <kbd>→</kbd> para cambiar de apartado
              </li>
              <li>
                <span>2</span> Pulsa <kbd>Enter</kbd> o click en el icono / pieza para abrir
              </li>
              <li>
                <span>3</span> Cambia de auto con <kbd>[</kbd> <kbd>]</kbd> o el selector de arriba
              </li>
            </ol>
            <button type="button" className="garage-guide__cta" onClick={() => onSelect(focused)}>
              Abrir “{focusedPart?.hint ?? 'pieza'}” → {focusedPart?.label ?? 'sección'}
            </button>
            <button type="button" className="garage-guide__skip" onClick={() => setShowGuide(false)}>
              Entendido
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && !showGuide && (
          <motion.div
            className="garage-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <strong>← →</strong> apartado · <strong>[ ]</strong> auto · <strong>arrastra</strong>{' '}
            girar · <strong>Enter</strong> ventana
            {carName ? ` · ${carName}` : ''}
          </motion.div>
        )}
      </AnimatePresence>

      <OsWindow
        open={open}
        className={isCv ? 'os-window--cv' : ''}
        title={section?.title ?? 'Window'}
        subtitle={
          focusedPart
            ? `${focusedPart.hint} → ${focusedPart.label}${carName ? ` · ${carName}` : ''}`
            : carName
        }
        onClose={onClose}
      >
        {section &&
          (isCv ? (
            <CvViewer />
          ) : (
            <div className="os-section">
              <p className="os-section__lead">{section.body}</p>
              {section.items && (
                <ul className="os-section__list">
                  {section.items.map((item) => (
                    <li key={item}>
                      <span className="os-section__bullet" aria-hidden>
                        ▸
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.links && (
                <div className="os-section__links">
                  {section.links.map((link) => (
                    <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
      </OsWindow>
    </div>
  )
}
