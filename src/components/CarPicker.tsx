import { GARAGE_CARS, type CarId } from '../data/cars'

type Props = {
  selected: CarId
  onSelect: (id: CarId) => void
}

export function CarPicker({ selected, onSelect }: Props) {
  return (
    <div className="car-picker" role="listbox" aria-label="Seleccionar auto">
      <div className="car-picker__label">GARAGE</div>
      <div className="car-picker__row">
        {GARAGE_CARS.map((car) => {
          const active = car.id === selected
          return (
            <button
              key={car.id}
              type="button"
              role="option"
              aria-selected={active}
              className={`car-picker__item${active ? ' is-active' : ''}`}
              onClick={() => onSelect(car.id)}
            >
              <strong>{car.name}</strong>
              <span>{car.subtitle}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
