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

  useEffect(() => {
    if (active) setDisplayed(active)
  }, [active])

  const section = displayed ? SECTIONS[displayed] : null
  const open = Boolean(active && section)

  return (
    <div className="hud">
      <GarageMenu
        active={active}
        focused={focused}
        onFocus={onFocus}
        onSelect={onSelect}
      />

      <div className="garage-hint">
        ← → menú · click pieza o icono · {CAR_PARTS.find((p) => p.id === focused)?.hint}
      </div>

      <OsWindow open={open} title={section?.title ?? 'Window'} onClose={onClose}>
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
