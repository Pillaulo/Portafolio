export type CarId = 'honda_s2000' | 'mustang_gt' | 'laferrari'

export type GarageCarDef = {
  id: CarId
  name: string
  subtitle: string
  /** Public URL under /cars */
  url: string
  /** Extra yaw offset if the mesh faces the wrong way (radians) */
  yawOffset: number
  /** Target longest horizontal length after normalize */
  targetLength: number
}

export const GARAGE_CARS: GarageCarDef[] = [
  {
    id: 'honda_s2000',
    name: 'Honda S2000',
    subtitle: 'AP1 · Roadster',
    url: '/cars/honda_s2000.glb?v=metalrough',
    yawOffset: Math.PI / 2,
    targetLength: 3.9,
  },
  {
    id: 'mustang_gt',
    name: 'Ford Mustang GT',
    subtitle: '2015 · Muscle',
    url: '/cars/2015_ford_mustang_gt.glb',
    yawOffset: Math.PI / 2,
    targetLength: 3.9,
  },
  {
    id: 'laferrari',
    name: 'Ferrari LaFerrari',
    subtitle: 'Hypercar',
    url: '/cars/ferrari_laferrari.glb',
    yawOffset: 0,
    targetLength: 3.85,
  },
]

export const DEFAULT_CAR_ID: CarId = 'honda_s2000'

export function getCar(id: CarId): GarageCarDef {
  return GARAGE_CARS.find((c) => c.id === id) ?? GARAGE_CARS[0]
}
