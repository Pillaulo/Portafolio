import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
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
    scale: 0.82,
    y: 36,
    filter: 'blur(6px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 380,
      damping: 28,
      mass: 0.85,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.35,
    y: 180,
    x: 40,
    filter: 'blur(8px)',
    transition: {
      duration: 0.32,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
}

export function OsWindow({ open, title, onClose, children, className = '' }: Props) {
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
            transition={{ duration: 0.2 }}
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
            dragConstraints={{ top: -120, left: -80, right: 80, bottom: 160 }}
            dragElastic={0.08}
          >
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
              <div className="os-window__title">{title}</div>
              <div className="os-window__spacer" />
            </div>
            <div className="os-window__body">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
