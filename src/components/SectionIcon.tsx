import type { SectionId } from '../data/cv'

type Props = {
  id: SectionId
  className?: string
}

export function SectionIcon({ id, className = '' }: Props) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  const icon = {
    perfil: (
      <>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.2 20c.5-4.2 2.8-6.2 6.8-6.2s6.3 2 6.8 6.2" />
        <path d="M8.6 14.4 12 17l3.4-2.6" />
      </>
    ),
    habilidades: (
      <>
        <path d="m14.6 5.2-3 3 4.8 4.8 3-3a5 5 0 0 1-6.6 6.6L7 22.4l-3.4-3.4 5.8-5.8a5 5 0 0 1 6.6-6.6Z" />
        <path d="m5.1 17.5 1.4 1.4" />
      </>
    ),
    experiencia: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V4h6v3M3 12h18M10 12v2h4v-2" />
      </>
    ),
    proyectos: (
      <>
        <path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5" />
        <circle cx="12" cy="12" r="2.3" />
        <path d="M12 7.8V6m0 12v-1.8M7.8 12H6m12 0h-1.8" />
      </>
    ),
    educacion: (
      <>
        <path d="m2.5 9 9.5-5 9.5 5-9.5 5Z" />
        <path d="M6.5 11.2v4.3c3.7 2.7 7.3 2.7 11 0v-4.3M21.5 9v6" />
      </>
    ),
    certificaciones: (
      <>
        <circle cx="12" cy="9" r="5.5" />
        <path d="m9.5 9 1.6 1.6 3.5-3.5M8.2 13.5 6.5 21l5.5-2 5.5 2-1.7-7.5" />
      </>
    ),
    perfiles: (
      <>
        <circle cx="12" cy="8" r="2.5" />
        <circle cx="5" cy="17" r="2.5" />
        <circle cx="19" cy="17" r="2.5" />
        <path d="m10.2 9.8-3.4 5M13.8 9.8l3.4 5M7.5 17h9" />
      </>
    ),
    cv: (
      <>
        <path d="M6 2.5h8l4 4V21H6Z" />
        <path d="M14 2.5v4h4M9 11h6M9 14.5h6M9 18h4" />
      </>
    ),
    contacto: (
      <>
        <rect x="2.5" y="5" width="19" height="14" rx="2" />
        <path d="m3.5 7 8.5 6 8.5-6M3.5 17l5.7-5M20.5 17l-5.7-5" />
      </>
    ),
  }[id]

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...common}
    >
      {icon}
    </svg>
  )
}
