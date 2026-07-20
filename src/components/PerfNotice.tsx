import { useEffect, useState } from 'react'

const STORAGE_KEY = 'garage-os-perf-notice-v1'

/** First-visit notice: WebGL can feel slow without GPU acceleration. */
export function PerfNotice() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return
    } catch {
      /* ignore */
    }
    setOpen(true)
  }, [])

  const dismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="perf-notice" role="dialog" aria-modal="true" aria-labelledby="perf-notice-title">
      <div className="perf-notice__panel">
        <div className="perf-notice__titlebar">
          <span className="perf-notice__glyph" aria-hidden>
            ■
          </span>
          <h2 id="perf-notice-title" className="perf-notice__title">
            GARAGE OS · AVISO
          </h2>
        </div>
        <div className="perf-notice__body">
          <p>
            Esta experiencia usa gráficos 3D en el navegador. Si la aceleración por
            hardware (GPU) está desactivada, puede ir más lento o con menos fluidez.
          </p>
          <p>
            En Chrome / Edge: <strong>Configuración → Sistema</strong> y activa{' '}
            <em>Usar aceleración de hardware cuando esté disponible</em>. Luego reinicia
            el navegador.
          </p>
          <p className="perf-notice__hint">
            En móvil también funciona, pero se ve y rinde mejor en computador.
          </p>
        </div>
        <div className="perf-notice__footer">
          <button type="button" className="perf-notice__cta" onClick={dismiss}>
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  )
}
