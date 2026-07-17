import { useState } from 'react'
import { PROFILE } from '../data/cv'

/** Inline PDF viewer with ES / EN language toggle. */
export function CvViewer() {
  const [lang, setLang] = useState<'es' | 'en'>('es')
  const src = lang === 'es' ? PROFILE.cvEs : PROFILE.cvEn

  return (
    <div className="cv-viewer">
      <div className="cv-viewer__bar">
        <div className="cv-viewer__langs" role="tablist" aria-label="Idioma del CV">
          <button
            type="button"
            role="tab"
            aria-selected={lang === 'es'}
            className={lang === 'es' ? 'is-on' : ''}
            onClick={() => setLang('es')}
          >
            Español
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={lang === 'en'}
            className={lang === 'en' ? 'is-on' : ''}
            onClick={() => setLang('en')}
          >
            English
          </button>
        </div>
        <a className="cv-viewer__dl" href={src} download target="_blank" rel="noreferrer">
          Descargar
        </a>
      </div>
      <iframe
        key={src}
        className="cv-viewer__frame"
        src={`${src}#view=FitH`}
        title={lang === 'es' ? 'Curriculum vitae (ES)' : 'Resume (EN)'}
      />
    </div>
  )
}
