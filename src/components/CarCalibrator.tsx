import { useEffect, useState } from 'react'
import { GARAGE_CARS, getCar, type CarId } from '../data/cars'
import { useCarOffsets } from '../context/CarOffsetContext'
import { formatAllOffsetsSnippet, formatOffsetSnippet } from '../lib/carOffsets'

type Props = {
  carId: CarId
}

const STEPS = [0.01, 0.05, 0.1] as const

function CenterRuler() {
  const hTicks = Array.from({ length: 21 }, (_, i) => i - 10)
  const vTicks = Array.from({ length: 15 }, (_, i) => i - 7)

  return (
    <div className="cal-ruler" aria-hidden>
      <div className="cal-ruler__v" />
      <div className="cal-ruler__h" />

      <div className="cal-ruler__ticks cal-ruler__ticks--h">
        {hTicks.map((n) => (
          <span
            key={`h${n}`}
            className={n === 0 ? 'is-zero' : n % 5 === 0 ? 'is-major' : ''}
            style={{ left: `${50 + n * 5}%` }}
          />
        ))}
      </div>
      <div className="cal-ruler__ticks cal-ruler__ticks--v">
        {vTicks.map((n) => (
          <span
            key={`v${n}`}
            className={n === 0 ? 'is-zero' : n % 5 === 0 ? 'is-major' : ''}
            style={{ top: `${50 + n * (100 / 14)}%` }}
          />
        ))}
      </div>

      <div className="cal-ruler__center">
        <span className="cal-ruler__cross-h" />
        <span className="cal-ruler__cross-v" />
        <span className="cal-ruler__dot" />
      </div>

      <div className="cal-ruler__label cal-ruler__label--top">Y+</div>
      <div className="cal-ruler__label cal-ruler__label--bottom">Y−</div>
      <div className="cal-ruler__label cal-ruler__label--left">X−</div>
      <div className="cal-ruler__label cal-ruler__label--right">X+</div>
    </div>
  )
}

/** Hidden by default. Open with Ctrl+Shift+C or the tiny corner control. */
export function CarCalibrator({ carId }: Props) {
  const { getOffset, nudge, resetCar, offsets } = useCarOffsets()
  const [step, setStep] = useState<(typeof STEPS)[number]>(0.05)
  const [open, setOpen] = useState(false)
  const [showRuler, setShowRuler] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const car = getCar(carId)
  const o = getOffset(carId)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      window.setTimeout(() => setCopied(null), 1600)
    } catch {
      setCopied('error')
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="car-cal__ghost"
        title="Calibrar (Ctrl+Shift+C)"
        aria-label="Abrir calibración de auto"
        onClick={() => setOpen(true)}
      />
    )
  }

  return (
    <>
      {showRuler && <CenterRuler />}

      <div className="car-cal">
        <div className="car-cal__head">
          <div>
            <div className="car-cal__title">CALIBRAR POSICIÓN</div>
            <div className="car-cal__car">{car.name}</div>
          </div>
          <button type="button" className="car-cal__hide" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <div className="car-cal__values">
          <span>
            X <b>{o.xOffset.toFixed(3)}</b>
          </span>
          <span>
            Y <b>{o.yOffset.toFixed(3)}</b>
          </span>
          <span>
            Z <b>{o.zOffset.toFixed(3)}</b>
          </span>
        </div>

        <div className="car-cal__step">
          paso
          {STEPS.map((s) => (
            <button
              key={s}
              type="button"
              className={step === s ? 'is-on' : ''}
              onClick={() => setStep(s)}
            >
              {s}
            </button>
          ))}
          <button
            type="button"
            className={showRuler ? 'is-on' : ''}
            onClick={() => setShowRuler((v) => !v)}
            title="Mostrar / ocultar regla"
          >
            regla
          </button>
        </div>

        <div className="car-cal__pad">
          <div className="car-cal__pad-label">altura (Y)</div>
          <div className="car-cal__row">
            <button type="button" onClick={() => nudge(carId, 'yOffset', step)}>
              ↑ subir
            </button>
            <button type="button" onClick={() => nudge(carId, 'yOffset', -step)}>
              ↓ bajar
            </button>
          </div>

          <div className="car-cal__pad-label">lados (X)</div>
          <div className="car-cal__row">
            <button type="button" onClick={() => nudge(carId, 'xOffset', -step)}>
              ← izq
            </button>
            <button type="button" onClick={() => nudge(carId, 'xOffset', step)}>
              der →
            </button>
          </div>

          <div className="car-cal__pad-label">adelante / atrás (Z)</div>
          <div className="car-cal__row">
            <button type="button" onClick={() => nudge(carId, 'zOffset', step)}>
              ↗ adelante
            </button>
            <button type="button" onClick={() => nudge(carId, 'zOffset', -step)}>
              ↙ atrás
            </button>
          </div>
        </div>

        <div className="car-cal__actions">
          <button type="button" onClick={() => resetCar(carId)}>
            Reset auto
          </button>
          <button
            type="button"
            className="car-cal__primary"
            onClick={() => copy(formatOffsetSnippet(carId, o), 'este')}
          >
            Copiar este
          </button>
          <button
            type="button"
            className="car-cal__primary"
            onClick={() => copy(formatAllOffsetsSnippet(GARAGE_CARS, offsets), 'todos')}
          >
            Copiar todos
          </button>
        </div>

        <p className="car-cal__hint">
          Ctrl+Shift+C oculta. Copiá y pedime pegarlo en el código para fijarlo.
          {copied === 'este' && ' · Copiado este auto'}
          {copied === 'todos' && ' · Copiados todos'}
          {copied === 'error' && ' · No se pudo copiar'}
        </p>
      </div>
    </>
  )
}
