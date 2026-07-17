import { useCallback, useEffect, useMemo } from 'react'
import { CAR_PARTS, MENU_ICONS, type SectionId } from '../data/cv'

type Props = {
  active: SectionId | null
  focused: SectionId
  onFocus: (id: SectionId) => void
  onSelect: (id: SectionId) => void
}

export function GarageMenu({ active, focused, onFocus, onSelect }: Props) {
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
          <span className="nfs-menu__notch" />
        </div>

        <div className="nfs-menu__row">
          <button
            type="button"
            className="nfs-menu__arrow"
            onClick={() => step(-1)}
            aria-label="Anterior"
          >
            ‹
          </button>

          <div className="nfs-menu__items">
            {CAR_PARTS.map((item, i) => {
              const dist = Math.abs(i - index)
              const isCenter = i === index
              const isActive = active === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    'nfs-menu__item',
                    isCenter ? 'is-center' : '',
                    isActive ? 'is-open' : '',
                    dist > 2 ? 'is-far' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{
                    transform: `translateX(${(i - index) * 4.6}rem) scale(${isCenter ? 1.12 : dist === 1 ? 0.92 : 0.78})`,
                    opacity: dist > 3 ? 0.25 : dist > 2 ? 0.45 : 1,
                    zIndex: isCenter ? 5 : 4 - dist,
                  }}
                  onClick={() => {
                    onFocus(item.id)
                    onSelect(item.id)
                  }}
                  aria-current={isCenter ? 'true' : undefined}
                >
                  <span className="nfs-menu__icon">{MENU_ICONS[item.id]}</span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="nfs-menu__arrow"
            onClick={() => step(1)}
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>

        <div className="nfs-menu__label">
          <strong>{part.label}</strong>
          <span>{part.hint}</span>
        </div>
      </div>
    </div>
  )
}
