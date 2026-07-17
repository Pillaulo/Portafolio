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
  /** Horizontal nudge after centering */
  xOffset?: number
  zOffset?: number
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
    id: 'nsx_1990',
    name: 'Honda NSX',
    subtitle: '1990 · NA1',
    url: '/cars/honda_nsx_1990.glb',
    yawOffset: 0,
    targetLength: 3.85,
    xOffset: -0.01,
    yOffset: -0.09,
    zOffset: 0.15,
  },
  {
    id: 'integra_typer',
    name: 'Honda Integra Type-R',
    subtitle: 'DB8 · Updated',
    url: '/cars/honda_integra_type-r_db8_updated.glb',
    yawOffset: 0,
    targetLength: 3.85,
    xOffset: 0,
    yOffset: 0.01,
    zOffset: 0,
  },
  {
    id: 'supra_a80',
    name: 'Toyota Supra A80',
    subtitle: '1993 · MK4',
    url: '/cars/toyota_supra_a80_1993.glb',
    yawOffset: 0,
    targetLength: 3.9,
    xOffset: 0,
    yOffset: 0,
    zOffset: 0,
  },
  {
    id: 'rx7_fd',
    name: 'Mazda RX-7 FD',
    subtitle: '3rd Gen',
    url: '/cars/mazda_rx-7_fd.glb',
    yawOffset: 0,
    targetLength: 3.85,
    xOffset: 0,
    yOffset: -1.42,
    zOffset: -0.04,
  },
  {
    id: 'rx7_fc',
    name: 'Mazda RX-7 FC',
    subtitle: '2nd Gen',
    url: '/cars/mazda_rx-7_fc.glb',
    yawOffset: 0,
    targetLength: 3.85,
    xOffset: 0,
    yOffset: 0.01,
    zOffset: 0,
  },
  {
    id: 'miata_na',
    name: 'Mazda MX-5 Miata',
    subtitle: 'NA · Roadster',
    url: '/cars/mazda_miata_mx-5_na.glb',
    yawOffset: 0,
    targetLength: 3.7,
    xOffset: 0.01,
    yOffset: -0.82,
    zOffset: -0.24,
  },
  {
    id: 'silvia_s13',
    name: 'Nissan Silvia S13',
    subtitle: 'Updated',
    url: '/cars/nissan_silvia_s13_updated.glb',
    yawOffset: 0,
    targetLength: 3.85,
    xOffset: 0,
    yOffset: 0.01,
    zOffset: 0,
  },
  {
    id: 'skyline_r32',
    name: 'Nissan Skyline R32 GT-R',
    subtitle: 'BNR32',
    url: '/cars/nissan_skyline_r32_gt-r.glb',
    yawOffset: 0,
    targetLength: 3.95,
    xOffset: 0,
    yOffset: 0.01,
    zOffset: 0,
  },
  {
    id: 'skyline_r34',
    name: 'Nissan Skyline R34 GT-R',
    subtitle: 'BNR34',
    url: '/cars/nissan_skyline_r34_gt-r.glb',
    yawOffset: 0,
    targetLength: 3.95,
    xOffset: 0,
    yOffset: 0.01,
    zOffset: -0.4,
  },
  {
    id: 'bmw_e30',
    name: 'BMW M3 Coupe E30',
    subtitle: '1986',
    url: '/cars/bmw_m3_coupe_e30_1986.glb',
    yawOffset: 0,
    targetLength: 3.9,
    xOffset: 0.02,
    yOffset: 0.01,
    zOffset: -0.19,
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
