import { GARAGE_CARS, getCar, type CarId } from '../data/cars'
import { playSfx } from '../lib/sfx'

type Props = {
  carId: CarId
  onSelect: (id: CarId, dir: 1 | -1) => void
}

/** Compact car switcher under the main menu (red zone). */
export function CarPicker({ carId, onSelect }: Props) {
  const car = getCar(carId)
  const idx = Math.max(0, GARAGE_CARS.findIndex((c) => c.id === carId))

  const step = (dir: 1 | -1) => {
    playSfx(dir === 1 ? 'Derecha' : 'Izquierda')
    const next = GARAGE_CARS[(idx + dir + GARAGE_CARS.length) % GARAGE_CARS.length]
    if (next) onSelect(next.id, dir)
  }

  return (
    <div className="car-picker" role="group" aria-label="Seleccionar auto">
      <button type="button" className="car-picker__arrow" onClick={() => step(-1)} aria-label="Auto anterior">
        ◀
      </button>
      <div className="car-picker__info">
        <div className="car-picker__label">AUTO</div>
        <div className="car-picker__name">{car.name}</div>
        <div className="car-picker__sub">
          {car.subtitle} · {idx + 1}/{GARAGE_CARS.length}
        </div>
      </div>
      <button type="button" className="car-picker__arrow" onClick={() => step(1)} aria-label="Auto siguiente">
        ▶
      </button>
    </div>
  )
}
