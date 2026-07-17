import { GARAGE_CARS, type CarId, type GarageCarDef } from '../data/cars'

export type CarOffset = {
  xOffset: number
  yOffset: number
  zOffset: number
}

/**
 * Bump when cars.ts offsets are updated in code so localStorage
 * re-seeds and does not keep stale calibrator values.
 */
/** Bump to force re-seed from cars.ts (clears bad localStorage calibrations). */
export const OFFSETS_VERSION = 7

const STORAGE_KEY = 'garage-car-offsets-v3'

type StoredPayload = {
  version: number
  offsets: Record<string, CarOffset>
}

export function emptyOffset(): CarOffset {
  return { xOffset: 0, yOffset: 0, zOffset: 0 }
}

export function defaultsFromCar(car: GarageCarDef): CarOffset {
  return {
    xOffset: car.xOffset ?? 0,
    yOffset: car.yOffset ?? 0,
    zOffset: car.zOffset ?? 0,
  }
}

function seedFromCatalog(): Record<string, CarOffset> {
  const out: Record<string, CarOffset> = {}
  for (const car of GARAGE_CARS) {
    out[car.id] = defaultsFromCar(car)
  }
  return out
}

function parseOffset(v: Partial<CarOffset> | undefined): CarOffset {
  const x = Number(v?.xOffset)
  const y = Number(v?.yOffset)
  const z = Number(v?.zOffset)
  return {
    xOffset: Number.isFinite(x) ? x : 0,
    yOffset: Number.isFinite(y) ? y : 0,
    zOffset: Number.isFinite(z) ? z : 0,
  }
}

/** Load saved offsets, or seed from cars.ts when missing / outdated. */
export function loadAllOffsets(): Record<string, CarOffset> {
  const seeded = seedFromCatalog()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      saveAllOffsets(seeded)
      return seeded
    }
    const parsed = JSON.parse(raw) as StoredPayload | Record<string, Partial<CarOffset>>

    // Legacy flat map (no version) → re-seed from catalog
    if (!parsed || typeof parsed !== 'object' || !('version' in parsed)) {
      saveAllOffsets(seeded)
      return seeded
    }

    const payload = parsed as StoredPayload
    if (payload.version !== OFFSETS_VERSION) {
      saveAllOffsets(seeded)
      return seeded
    }

    const out: Record<string, CarOffset> = { ...seeded }
    for (const [id, v] of Object.entries(payload.offsets ?? {})) {
      out[id] = parseOffset(v)
    }
    return out
  } catch {
    saveAllOffsets(seeded)
    return seeded
  }
}

export function saveAllOffsets(map: Record<string, CarOffset>) {
  const payload: StoredPayload = {
    version: OFFSETS_VERSION,
    offsets: map,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function resolveOffset(
  car: GarageCarDef,
  offsets: Record<string, CarOffset>,
): CarOffset {
  return offsets[car.id] ? { ...offsets[car.id] } : defaultsFromCar(car)
}

export function formatOffsetSnippet(carId: CarId, o: CarOffset): string {
  return [
    `    // ${carId}`,
    `    xOffset: ${round(o.xOffset)},`,
    `    yOffset: ${round(o.yOffset)},`,
    `    zOffset: ${round(o.zOffset)},`,
  ].join('\n')
}

export function formatAllOffsetsSnippet(
  cars: GarageCarDef[],
  offsets: Record<string, CarOffset>,
): string {
  return cars
    .map((car) => {
      const o = resolveOffset(car, offsets)
      return [
        `  // ${car.name} (${car.id})`,
        `  xOffset: ${round(o.xOffset)},`,
        `  yOffset: ${round(o.yOffset)},`,
        `  zOffset: ${round(o.zOffset)},`,
      ].join('\n')
    })
    .join('\n\n')
}

function round(n: number) {
  return Math.round(n * 1000) / 1000
}
