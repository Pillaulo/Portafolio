import { CAR_PARTS, type SectionId } from './cv'

/** Use any string id — add new cars below without changing types elsewhere. */
export type CarId = string

export type GarageCarDef = {
  id: CarId
  name: string
  subtitle: string
  /** Path under public/, e.g. /cars/mi_auto.glb */
  url: string
  yawOffset: number
  /** World length after fit — smaller = farther / smaller on screen */
  targetLength: number
  /** Extra vertical nudge after grounding (negative = lower) */
  yOffset?: number
}

export type GarageSlot = {
  sectionId: SectionId
  label: string
  hint: string
  carId: CarId
  carName: string
}

/**
 * Catalogo de autos del garage (debe coincidir con public/cars/*.glb).
 * Para agregar uno: deja el .glb en public/cars/ y suma una entrada aqui.
 */
export const GARAGE_CARS: GarageCarDef[] = [
  {
    id: 'laferrari',
    name: 'Ferrari LaFerrari',
    subtitle: 'Hypercar',
    url: '/cars/ferrari_laferrari.glb',
    yawOffset: 0,
    targetLength: 3.66,
    yOffset: -0.02,
  },
  {
    id: 'bmw_1m',
    name: 'BMW 1M',
    subtitle: 'E82 · Coupe',
    url: '/cars/ac_-_bmw_1m_free.glb',
    yawOffset: 0,
    targetLength: 3.315,
    yOffset: -0.02,
  },
  {
    id: 'mclaren_p1',
    name: 'McLaren P1',
    subtitle: 'Hypercar',
    url: '/cars/ac_-_mclaren_p1_free.glb',
    yawOffset: 0,
    targetLength: 3.315,
    yOffset: -0.02,
  },
  {
    id: 'maserati_qp',
    name: 'Maserati Quattroporte',
    subtitle: 'Luxury · Sedan',
    url: '/cars/ac_-_maserati_quattroporte_free.glb',
    yawOffset: 0,
    targetLength: 3.485,
    yOffset: -0.02,
  },
  {
    id: 'mazda_rx7',
    name: 'Mazda RX-7',
    subtitle: 'FD · Tuned',
    url: '/cars/mazda_rx-7_tuned.glb',
    yawOffset: 0,
    targetLength: 3.315,
    yOffset: -0.02,
  },
  {
    id: 'diablo_sv',
    name: 'Lamborghini Diablo SV',
    subtitle: '1998 · Low Poly',
    url: '/cars/1998_lamborghini_diablo_sv_-_low_poly.glb',
    yawOffset: 0,
    targetLength: 3.75,
    yOffset: -0.06,
  },
  {
    id: 'viper_gts',
    name: 'SRT Viper GTS',
    subtitle: '2013 · Low Poly',
    url: '/cars/2013_srt_viper_gts_-_low_poly.glb',
    yawOffset: 0,
    targetLength: 3.85,
    yOffset: -0.04,
  },
]

export function shuffleCars(list: GarageCarDef[] = GARAGE_CARS): GarageCarDef[] {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

/** Each CV section is paired with a car (1:1 when enough cars; otherwise cycles). */
export function buildGarageSlots(order: GarageCarDef[]): GarageSlot[] {
  const cars = order.length ? order : GARAGE_CARS
  return CAR_PARTS.map((part, i) => {
    const car = cars[i % cars.length]
    return {
      sectionId: part.id,
      label: part.label,
      hint: part.hint,
      carId: car.id,
      carName: car.name,
    }
  })
}

export function getCar(id: CarId, order: GarageCarDef[] = GARAGE_CARS): GarageCarDef {
  return order.find((c) => c.id === id) ?? order[0] ?? GARAGE_CARS[0]
}

export function slotForSection(sectionId: SectionId, slots: GarageSlot[]): GarageSlot {
  return slots.find((s) => s.sectionId === sectionId) ?? slots[0]
}
