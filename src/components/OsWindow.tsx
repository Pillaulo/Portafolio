import { AnimatePresence, motion } from 'framer-motion'
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
  hidden: {
    opacity: 0,
    scale: 0.88,
    y: 28,
    rotateX: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 420,
      damping: 30,
      mass: 0.75,
      when: 'beforeChildren' as const,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.72,
    y: 90,
    x: 28,
    filter: 'blur(6px)',
    transition: {
      duration: 0.28,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
}

const bodyVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
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
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="panel-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          <motion.aside
            className={`os-window ${className}`.trim()}
            role="dialog"
            aria-label={title}
            variants={windowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag
            dragMomentum={false}
            dragConstraints={{ top: -140, left: -100, right: 100, bottom: 180 }}
            dragElastic={0.06}
            style={{ transformPerspective: 900 }}
          >
            <div className="os-window__chrome">
              <div className="os-window__titlebar">
                <div className="os-window__traffic">
                  <button
                    type="button"
                    className="traffic traffic--close"
                    onClick={onClose}
                    aria-label="Cerrar"
                    title="Cerrar"
                  />
                  <button
                    type="button"
                    className="traffic traffic--min"
                    onClick={onClose}
                    aria-label="Minimizar"
                    title="Minimizar"
                  />
                  <span className="traffic traffic--max" aria-hidden />
                </div>
                <div className="os-window__heading">
                  <div className="os-window__title">{title}</div>
                  {subtitle && <div className="os-window__subtitle">{subtitle}</div>}
                </div>
                <button type="button" className="os-window__x" onClick={onClose} aria-label="Cerrar">
                  ✕
                </button>
              </div>
              <div className="os-window__accent" />
            </div>
            <motion.div className="os-window__body" variants={bodyVariants}>
              {children}
            </motion.div>
            <div className="os-window__footer">
              Arrastra la barra · Esc / ✕ para cerrar
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
