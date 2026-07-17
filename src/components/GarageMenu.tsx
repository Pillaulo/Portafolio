import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo } from 'react'
import { CAR_PARTS, MENU_ICONS, type SectionId } from '../data/cv'
import { playSfx, preloadSfx } from '../lib/sfx'

type Props = {
  active: SectionId | null
  focused: SectionId
  carName?: string
  onFocus: (id: SectionId) => void
  onSelect: (id: SectionId) => void
}

export function GarageMenu({ active, focused, carName, onFocus, onSelect }: Props) {
  const index = useMemo(
    () => Math.max(0, CAR_PARTS.findIndex((p) => p.id === focused)),
    [focused],
  )
  const part = CAR_PARTS[index] ?? CAR_PARTS[0]
  const progress = CAR_PARTS.length > 1 ? index / (CAR_PARTS.length - 1) : 0

  useEffect(() => {
    preloadSfx()
  }, [])

  const step = useCallback(
    (dir: -1 | 1) => {
      playSfx(dir === 1 ? 'Derecha' : 'Izquierda')
      const next = (index + dir + CAR_PARTS.length) % CAR_PARTS.length
      onFocus(CAR_PARTS[next].id)
    },
    [index, onFocus],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        step(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        step(1)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onSelect(focused)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, focused, onSelect])

  return (
    <nav className="nfs-menu" aria-label="Secciones del CV">
      <div className="nfs-menu__topline">
        <span className="nfs-menu__brand">GARAGE OS</span>
        <span className="nfs-menu__context">CV Menu</span>
      </div>

      <div className="nfs-menu__rail" aria-hidden>
        <span className="nfs-menu__rail-nub" style={{ left: `${8 + progress * 84}%` }} />
      </div>

      <div className="nfs-menu__bar">
        <button type="button" className="nfs-menu__arrow" onClick={() => step(-1)} aria-label="Anterior">
          ‹
        </button>

        <div className="nfs-menu__tabs" role="tablist">
          {CAR_PARTS.map((item) => {
            const isFocus = item.id === focused
            const isOpen = active === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isFocus}
                className={[
                  'nfs-menu__tab',
                  isFocus ? 'is-focus' : '',
                  isOpen ? 'is-open' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  if (isFocus) {
                    onSelect(item.id)
                    return
                  }
                  const i = CAR_PARTS.findIndex((p) => p.id === item.id)
                  playSfx(i > index ? 'Derecha' : 'Izquierda')
                  onFocus(item.id)
                }}
                onDoubleClick={() => onSelect(item.id)}
                title={item.label}
              >
                <span className="nfs-menu__icon" aria-hidden>
                  {MENU_ICONS[item.id]}
                </span>
              </button>
            )
          })}
        </div>

        <button type="button" className="nfs-menu__arrow" onClick={() => step(1)} aria-label="Siguiente">
          ›
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={part.id}
          className="nfs-menu__status"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.16 }}
        >
          <span className="nfs-menu__status-main">{part.label}</span>
          <span className="nfs-menu__status-meta">
            {part.hint}
            {carName ? ` · ${carName}` : ''}
          </span>
        </motion.div>
      </AnimatePresence>
    </nav>
  )
}
