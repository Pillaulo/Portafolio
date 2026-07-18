import { useMemo, useState } from 'react'
import cvHtml from '../../cv/cv_html/index.html?raw'
import cvScript from '../../cv/cv_html/script.js?raw'
import cvStyles from '../../cv/cv_html/styles.css?raw'
import { PROFILE } from '../data/cv'

/** Embedded HTML resume plus the generated ES / EN PDFs. */
export function CvViewer() {
  const [format, setFormat] = useState<'html' | 'pdf'>('html')
  const [lang, setLang] = useState<'es' | 'en'>('es')
  const src = lang === 'es' ? PROFILE.cvEs : PROFILE.cvEn
  const htmlDocument = useMemo(
    () =>
      cvHtml
        .replace('<link rel="stylesheet" href="styles.css">', `<style>${cvStyles}</style>`)
        .replace('<script src="script.js" defer></script>', '')
        .replace('</body>', `<script>${cvScript}</script></body>`),
    [],
  )

  return (
    <div className="cv-viewer">
      <div className="cv-viewer__bar">
        <div className="cv-viewer__switches">
          <div className="cv-viewer__mode" role="tablist" aria-label="Formato del CV">
            <button
              type="button"
              role="tab"
              aria-selected={format === 'html'}
              className={format === 'html' ? 'is-on' : ''}
              onClick={() => setFormat('html')}
            >
              HTML
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={format === 'pdf'}
              className={format === 'pdf' ? 'is-on' : ''}
              onClick={() => setFormat('pdf')}
            >
              PDF
            </button>
          </div>

          {format === 'pdf' && (
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
          )}
        </div>
        {format === 'pdf' && (
          <a className="cv-viewer__dl" href={src} download target="_blank" rel="noreferrer">
            Descargar
          </a>
        )}
      </div>
      {format === 'html' ? (
        <iframe
          className="cv-viewer__frame"
          srcDoc={htmlDocument}
          title="Curriculum vitae interactivo"
        />
      ) : (
        <iframe
          key={src}
          className="cv-viewer__frame"
          src={`${src}#view=FitH`}
          title={lang === 'es' ? 'Curriculum vitae (ES)' : 'Resume (EN)'}
        />
      )}
    </div>
  )
}
