import { useLayoutEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, type Group } from 'three'
import { GlbCar } from './GlbCar'
import { CarErrorBoundary } from './CarErrorBoundary'
import type { CarId } from '../data/cars'
import type { SectionId } from '../data/cv'

type Props = {
  carId: CarId
  /** +1 = next (out to left, in from right), -1 = prev */
  slideDir: 1 | -1
  hovered: SectionId | null
  active: SectionId | null
  focused: SectionId | null
  onHover: (id: SectionId | null) => void
  onSelect: (id: SectionId) => void
  autoRotate: boolean
  focusY: number | null
}

const SLIDE_DIST = 9
const SLIDE_SPEED = 3.2
/** World Y — below midline, but high enough that the full car stays on screen. */
const STAGE_Y = -0.55
/** Local Y of the deck top; car group is placed here so tires land on the plate. */
const DECK_TOP = 0.06

function ShowcasePlatform() {
  return (
    <group>
      {/* One solid turntable — no extra planes / glow discs */}
      <mesh position={[0, DECK_TOP * 0.5, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.05, 2.15, DECK_TOP, 64]} />
        <meshStandardMaterial color="#2e3138" roughness={0.7} metalness={0.28} />
      </mesh>
      <mesh position={[0, DECK_TOP + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.0, 64]} />
        <meshStandardMaterial color="#3a3e46" roughness={0.5} metalness={0.35} depthWrite />
      </mesh>
      <mesh position={[0, DECK_TOP * 0.5, 0]}>
        <cylinderGeometry args={[2.12, 2.12, DECK_TOP * 0.9, 64, 1, true]} />
        <meshStandardMaterial color="#e8b800" roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh position={[0, DECK_TOP * 0.5, 0]} rotation={[0, Math.PI / 8, 0]}>
        <cylinderGeometry args={[2.125, 2.125, DECK_TOP * 0.92, 64, 1, true]} />
        <meshStandardMaterial color="#121212" roughness={0.5} metalness={0.15} />
      </mesh>
    </group>
  )
}

function StageUnit({
  carId,
  hovered,
  active,
  focused,
  onHover,
  onSelect,
  autoRotate,
  focusY,
  interactive,
}: {
  carId: CarId
  hovered: SectionId | null
  active: SectionId | null
  focused: SectionId | null
  onHover: (id: SectionId | null) => void
  onSelect: (id: SectionId) => void
  autoRotate: boolean
  focusY: number | null
  interactive: boolean
}) {
  return (
    <group position={[0, STAGE_Y, 0]}>
      <ShowcasePlatform />
      {/* Wheels grounded at y=0 of this group = deck top */}
      <group position={[0, DECK_TOP - 0.01, 0]}>
        <CarErrorBoundary label={carId}>
          <GlbCar
            carId={carId}
            hovered={interactive ? hovered : null}
            active={interactive ? active : null}
            focused={interactive ? focused : null}
            onHover={interactive ? onHover : () => undefined}
            onSelect={interactive ? onSelect : () => undefined}
            autoRotate={interactive && autoRotate}
            focusY={interactive ? focusY : null}
          />
        </CarErrorBoundary>
      </group>
    </group>
  )
}

export function CarStage({
  carId,
  slideDir,
  hovered,
  active,
  focused,
  onHover,
  onSelect,
  autoRotate,
  focusY,
}: Props) {
  const [activeId, setActiveId] = useState(carId)
  const [prevId, setPrevId] = useState<CarId | null>(null)
  const [dir, setDir] = useState<1 | -1>(1)
  const [busy, setBusy] = useState(false)

  const incoming = useRef<Group>(null)
  const outgoing = useRef<Group>(null)
  const t = useRef(1)

  useLayoutEffect(() => {
    if (carId === activeId) return
    if (busy) return
    setPrevId(activeId)
    setDir(slideDir)
    setBusy(true)
    t.current = 0
    setActiveId(carId)
  }, [carId, activeId, slideDir, busy])

  useLayoutEffect(() => {
    if (!busy) return
    if (outgoing.current) outgoing.current.position.x = 0
    if (incoming.current) incoming.current.position.x = dir * SLIDE_DIST
  }, [busy, dir, activeId, prevId])

  useFrame((_, delta) => {
    if (!busy) {
      if (incoming.current) incoming.current.position.x = 0
      return
    }
    t.current = Math.min(1, t.current + delta * SLIDE_SPEED)
    const e = MathUtils.smootherstep(t.current, 0, 1)
    if (outgoing.current) outgoing.current.position.x = -dir * SLIDE_DIST * e
    if (incoming.current) incoming.current.position.x = dir * SLIDE_DIST * (1 - e)
    if (t.current >= 1) {
      setBusy(false)
      setPrevId(null)
      if (incoming.current) incoming.current.position.x = 0
    }
  })

  const showPrev = prevId != null && busy

  return (
    <group>
      {showPrev && (
        <group ref={outgoing}>
          <StageUnit
            carId={prevId}
            hovered={null}
            active={null}
            focused={null}
            onHover={() => undefined}
            onSelect={() => undefined}
            autoRotate={false}
            focusY={null}
            interactive={false}
          />
        </group>
      )}
      <group ref={incoming}>
        <StageUnit
          carId={activeId}
          hovered={hovered}
          active={active}
          focused={focused}
          onHover={onHover}
          onSelect={onSelect}
          autoRotate={autoRotate && !busy}
          focusY={focusY}
          interactive={!busy}
        />
      </group>
    </group>
  )
}
