import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  defaultsFromCar,
  loadAllOffsets,
  resolveOffset,
  saveAllOffsets,
  type CarOffset,
} from '../lib/carOffsets'
import { GARAGE_CARS, getCar, type CarId } from '../data/cars'

type Ctx = {
  offsets: Record<string, CarOffset>
  getOffset: (carId: CarId) => CarOffset
  nudge: (carId: CarId, axis: keyof CarOffset, delta: number) => void
  setOffset: (carId: CarId, next: CarOffset) => void
  resetCar: (carId: CarId) => void
  clearAll: () => void
}

const CarOffsetContext = createContext<Ctx | null>(null)

export function CarOffsetProvider({ children }: { children: ReactNode }) {
  const [offsets, setOffsets] = useState<Record<string, CarOffset>>(() => loadAllOffsets())

  const persist = useCallback((next: Record<string, CarOffset>) => {
    setOffsets(next)
    saveAllOffsets(next)
  }, [])

  const getOffset = useCallback(
    (carId: CarId) => resolveOffset(getCar(carId), offsets),
    [offsets],
  )

  const setOffset = useCallback(
    (carId: CarId, next: CarOffset) => {
      persist({ ...offsets, [carId]: { ...next } })
    },
    [offsets, persist],
  )

  const nudge = useCallback(
    (carId: CarId, axis: keyof CarOffset, delta: number) => {
      const cur = resolveOffset(getCar(carId), offsets)
      persist({
        ...offsets,
        [carId]: { ...cur, [axis]: Math.round((cur[axis] + delta) * 1000) / 1000 },
      })
    },
    [offsets, persist],
  )

  const resetCar = useCallback(
    (carId: CarId) => {
      persist({
        ...offsets,
        [carId]: defaultsFromCar(getCar(carId)),
      })
    },
    [offsets, persist],
  )

  const clearAll = useCallback(() => {
    const seeded: Record<string, CarOffset> = {}
    for (const car of GARAGE_CARS) {
      seeded[car.id] = defaultsFromCar(car)
    }
    persist(seeded)
  }, [persist])

  const value = useMemo(
    () => ({ offsets, getOffset, nudge, setOffset, resetCar, clearAll }),
    [offsets, getOffset, nudge, setOffset, resetCar, clearAll],
  )

  return <CarOffsetContext.Provider value={value}>{children}</CarOffsetContext.Provider>
}

export function useCarOffsets() {
  const ctx = useContext(CarOffsetContext)
  if (!ctx) throw new Error('useCarOffsets must be used inside CarOffsetProvider')
  return ctx
}

/** Safe for GlbCar — falls back to cars.ts defaults if provider missing. */
export function useCarOffset(carId: CarId): CarOffset {
  const ctx = useContext(CarOffsetContext)
  if (!ctx) return defaultsFromCar(getCar(carId))
  return ctx.getOffset(carId)
}
