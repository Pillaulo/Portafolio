import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo } from 'react'
import { CAR_PARTS, MENU_ICONS, type SectionId } from '../data/cv'

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
  const progress = CAR_PARTS.length <= 1 ? 0 : index / (CAR_PARTS.length - 1)

  const step = useCallback(
    (dir: -1 | 1) => {
      const next = (index + dir + CAR_PARTS.length) % CAR_PARTS.length
      onFocus(CAR_PARTS[next].id)
    },
    [index, onFocus],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
    <div className="nfs-menu" role="navigation" aria-label="Secciones del CV">
      <div className="nfs-menu__track">
        <div className="nfs-menu__progress" style={{ ['--p' as string]: String(progress) }}>
          <motion.span
            className="nfs-menu__notch"
            layout
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          />
        </div>

        <div className="nfs-menu__row">
          <motion.button
            type="button"
            className="nfs-menu__arrow"
            onClick={() => step(-1)}
            aria-label="Anterior"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            ‹
          </motion.button>

          <div className="nfs-menu__items">
            {CAR_PARTS.map((item, i) => {
              const dist = Math.abs(i - index)
              const isCenter = i === index
              const isActive = active === item.id
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  className={[
                    'nfs-menu__item',
                    isCenter ? 'is-center' : '',
                    isActive ? 'is-open' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  animate={{
                    x: `calc(-50% + ${(i - index) * 4.6}rem)`,
                    scale: isCenter ? 1.14 : dist === 1 ? 0.9 : 0.75,
                    opacity: dist > 3 ? 0.2 : dist > 2 ? 0.4 : 1,
                    zIndex: isCenter ? 5 : 4 - dist,
                  }}
                  transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                  style={{ left: '50%', top: '50%', marginTop: '-1.55rem' }}
                  onClick={() => {
                    onFocus(item.id)
                    onSelect(item.id)
                  }}
                  aria-current={isCenter ? 'true' : undefined}
                  whileTap={{ scale: isCenter ? 1.05 : 0.85 }}
                >
                  <span className="nfs-menu__icon">{MENU_ICONS[item.id]}</span>
                </motion.button>
              )
            })}
          </div>

          <motion.button
            type="button"
            className="nfs-menu__arrow"
            onClick={() => step(1)}
            aria-label="Siguiente"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            ›
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={part.id}
            className="nfs-menu__label"
            initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
            transition={{ duration: 0.22 }}
          >
            <strong>{part.label}</strong>
            <span>
              Pieza: <em>{part.hint}</em>
              {carName ? ` · ${carName}` : ''}
              {' · '}
              <kbd>Enter</kbd> abre
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
