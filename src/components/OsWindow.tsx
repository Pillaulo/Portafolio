import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  className?: string
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const windowVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 380, damping: 28 },
  },
  exit: {
    opacity: 0,
    y: 14,
    scale: 0.98,
    transition: { duration: 0.16 },
  },
}

export function OsWindow({
  open,
  title,
  subtitle,
  onClose,
  children,
  className = '',
}: Props) {
  const dragControls = useDragControls()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="panel-backdrop panel-backdrop--soft"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.16 }}
            onClick={onClose}
          />
          <motion.aside
            className={`os-window os-window--dock-right ${className}`.trim()}
            role="dialog"
            aria-label={title}
            variants={windowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragConstraints={{ top: -100, left: -520, right: 60, bottom: 180 }}
            dragElastic={0.06}
          >
            <div
              className="os-window__titlebar"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="os-window__caption">
                <span className="os-window__glyph" aria-hidden>
                  ■
                </span>
                <div className="os-window__heading">
                  <div className="os-window__title">{title}</div>
                  {subtitle && <div className="os-window__subtitle">{subtitle}</div>}
                </div>
              </div>
              <div className="os-window__controls">
                <button type="button" className="os-window__ctrl" onClick={onClose} aria-label="Minimizar">
                  _
                </button>
                <button
                  type="button"
                  className="os-window__ctrl os-window__ctrl--close"
                  onClick={onClose}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="os-window__body">{children}</div>
            <div className="os-window__footer">Esc / × cierra · Arrastra la barra de título</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
