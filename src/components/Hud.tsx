import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CAR_PARTS, SECTIONS, type SectionId } from '../data/cv'
import { GarageMenu } from './GarageMenu'
import { OsWindow } from './OsWindow'

type Props = {
  active: SectionId | null
  focused: SectionId
  onClose: () => void
  onFocus: (id: SectionId) => void
  onSelect: (id: SectionId) => void
}

export function Hud({ active, focused, onClose, onFocus, onSelect }: Props) {
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

  return (
    <div className="hud">
      <GarageMenu
        active={active}
        focused={focused}
        onFocus={onFocus}
        onSelect={onSelect}
      />

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
                <span>1</span> Usa <kbd>←</kbd> <kbd>→</kbd> o las flechas del menú para girar el auto
              </li>
              <li>
                <span>2</span> Pulsa <kbd>Enter</kbd> o haz click en el icono central para abrir la ventana
              </li>
              <li>
                <span>3</span> También puedes clickear una pieza del auto (ruedas, capó, alerón…)
              </li>
            </ol>
            <button type="button" className="garage-guide__cta" onClick={() => onSelect(focused)}>
              Abrir “{focusedPart?.label ?? 'sección'}”
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
            <strong>Enter</strong> abre ventana · <strong>← →</strong> cambia sección · pieza:{' '}
            {focusedPart?.hint}
          </motion.div>
        )}
      </AnimatePresence>

      <OsWindow
        open={open}
        title={section?.title ?? 'Window'}
        subtitle={focusedPart ? `Pieza: ${focusedPart.hint}` : undefined}
        onClose={onClose}
      >
        {section && (
          <>
            <p>{section.body}</p>
            {section.items && (
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.links && (
              <div className="panel-links">
                {section.links.map((link) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </OsWindow>
    </div>
  )
}
