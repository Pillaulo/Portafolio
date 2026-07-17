import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html, useGLTF, useProgress } from '@react-three/drei'
import {
  Box3,
  Color,
  DoubleSide,
  Vector3,
  type Group,
  type Material,
  type Mesh,
  type MeshStandardMaterial,
  type Object3D,
} from 'three'
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js'
import { getCar, type CarId } from '../data/cars'
import { CAR_PARTS, type SectionId } from '../data/cv'
import { useCarOffset } from '../context/CarOffsetContext'

type Props = {
  carId: CarId
  hovered: SectionId | null
  active: SectionId | null
  focused: SectionId | null
  onHover: (id: SectionId | null) => void
  onSelect: (id: SectionId) => void
  autoRotate: boolean
  focusY: number | null
}

type HotspotDef = {
  id: SectionId
  position: [number, number, number]
  args: [number, number, number]
  /** Only one marker per section shows the floating label */
  showLabel?: boolean
}

/** Hit volumes aligned to car parts (local space, nose +X). */
const HOTSPOTS: HotspotDef[] = [
  { id: 'perfil', position: [1.05, 0.58, 0], args: [0.7, 0.16, 0.7], showLabel: true },
  { id: 'habilidades', position: [0.05, 0.48, 0.62], args: [0.95, 0.32, 0.1], showLabel: true },
  { id: 'habilidades', position: [0.05, 0.48, -0.62], args: [0.95, 0.32, 0.1] },
  { id: 'experiencia', position: [-0.05, 0.2, 0], args: [1.7, 0.08, 0.95], showLabel: true },
  { id: 'proyectos', position: [0.95, 0.28, 0.68], args: [0.38, 0.38, 0.38], showLabel: true },
  { id: 'proyectos', position: [0.95, 0.28, -0.68], args: [0.38, 0.38, 0.38] },
  { id: 'proyectos', position: [-0.95, 0.28, 0.68], args: [0.38, 0.38, 0.38] },
  { id: 'proyectos', position: [-0.95, 0.28, -0.68], args: [0.38, 0.38, 0.38] },
  { id: 'educacion', position: [-0.15, 0.98, 0], args: [0.75, 0.1, 0.7], showLabel: true },
  { id: 'certificaciones', position: [-1.25, 0.88, 0], args: [0.35, 0.16, 0.85], showLabel: true },
  { id: 'perfiles', position: [1.55, 0.4, 0.42], args: [0.22, 0.2, 0.28], showLabel: true },
  { id: 'perfiles', position: [1.55, 0.4, -0.42], args: [0.22, 0.2, 0.28] },
  { id: 'cv', position: [1.68, 0.22, 0], args: [0.1, 0.14, 0.4], showLabel: true },
  { id: 'contacto', position: [-1.65, 0.18, 0.28], args: [0.22, 0.12, 0.28], showLabel: true },
  { id: 'contacto', position: [-1.65, 0.18, -0.28], args: [0.22, 0.12, 0.28] },
]

function partMeta(id: SectionId) {
  return CAR_PARTS.find((p) => p.id === id) ?? CAR_PARTS[0]
}

function Hotspot({
  id,
  position,
  args,
  hovered,
  active,
  onHover,
  onSelect,
  showLabel,
}: HotspotDef & {
  hovered: SectionId | null
  active: SectionId | null
  focused: SectionId | null
  onHover: (id: SectionId | null) => void
  onSelect: (id: SectionId) => void
}) {
  const matRef = useRef<MeshStandardMaterial>(null)
  const isHover = hovered === id
  const isActive = active === id
  const part = partMeta(id)

  useFrame((state) => {
    const mat = matRef.current
    if (!mat) return
    if (isHover || isActive) {
      const pulse = 0.55 + Math.sin(state.clock.elapsedTime * 3.2) * 0.35
      mat.emissiveIntensity = isActive ? 1.05 + pulse * 0.3 : 0.7 + pulse * 0.4
      mat.opacity = isActive ? 0.2 : 0.14
      return
    }
    // Invisible hit volume — no floating boxes while browsing the menu
    mat.emissiveIntensity = 0
    mat.opacity = 0
  })

  return (
    <mesh
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(id)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        onHover(null)
        document.body.style.cursor = 'auto'
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        onSelect(id)
      }}
    >
      <boxGeometry args={args} />
      <meshStandardMaterial
        ref={matRef}
        color="#5ee7ff"
        emissive="#5ee7ff"
        emissiveIntensity={0}
        transparent
        opacity={0}
        depthWrite={false}
      />
      {showLabel && (isHover || isActive) && (
        <Html center distanceFactor={9} style={{ pointerEvents: 'none' }}>
          <div className="car-hotspot-label">
            <span className="car-hotspot-label__part">{part.hint}</span>
            <span className="car-hotspot-label__section">{part.label}</span>
          </div>
        </Html>
      )}
    </mesh>
  )
}

function isMesh(obj: Object3D): obj is Mesh {
  return (obj as Mesh).isMesh === true
}

function computeMeshBox(root: Object3D): Box3 {
  root.updateMatrixWorld(true)
  const box = new Box3()
  root.traverse((obj) => {
    if (!isMesh(obj) || !obj.geometry || obj.visible === false) return
    const geom = obj.geometry
    if (!geom.boundingBox) geom.computeBoundingBox()
    if (!geom.boundingBox) return
    const b = geom.boundingBox.clone()
    b.applyMatrix4(obj.matrixWorld)
    box.union(b)
  })
  return box
}

/** Lowest visible mesh Y — deterministic (no tire heuristics). */
function computeGroundY(root: Object3D): number {
  let minY = Number.POSITIVE_INFINITY
  root.traverse((obj) => {
    if (!isMesh(obj) || !obj.geometry || obj.visible === false) return
    const geom = obj.geometry
    if (!geom.boundingBox) geom.computeBoundingBox()
    if (!geom.boundingBox) return
    const bb = geom.boundingBox.clone()
    bb.applyMatrix4(obj.matrixWorld)
    if (bb.min.y < minY) minY = bb.min.y
  })
  return Number.isFinite(minY) ? minY : 0
}

function sanitizeMaterials(root: Object3D) {
  const seen = new Set<Material>()
  root.traverse((obj) => {
    if (!isMesh(obj)) return
    obj.castShadow = true
    obj.receiveShadow = true
    obj.frustumCulled = false

    const name = (obj.name || '').toLowerCase()
    const isGlow =
      name.includes('glow') ||
      name.includes('lights_') ||
      name.includes('lamp')

    // Mustang Sketchfab light "glow" planes — hide (they blow out / look broken)
    if (name.includes('glows') || name.includes('lights_brakes') || name.includes('lights_position') || name.includes('lights_reverse')) {
      obj.visible = false
      return
    }

    // Baked shadow / ground catcher discs (common in Sketchfab cars) — hide before fit
    if (
      name.includes('shadow') ||
      name.includes('ground') ||
      name.includes('floor') ||
      name.includes('catcher') ||
      name.includes('plane_shadow') ||
      name === 'plane' ||
      name.endsWith('_shadow')
    ) {
      obj.visible = false
      return
    }

    // Very flat wide meshes are almost always fake ground shadows
    if (obj.geometry) {
      if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox()
      const bb = obj.geometry.boundingBox
      if (bb) {
        const sx = bb.max.x - bb.min.x
        const sy = bb.max.y - bb.min.y
        const sz = bb.max.z - bb.min.z
        if (sy < 0.04 && Math.max(sx, sz) > 1.2) {
          obj.visible = false
          return
        }
      }
    }

    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    for (const mat of mats) {
      if (!mat || seen.has(mat)) continue
      seen.add(mat)

      const std = mat as MeshStandardMaterial & {
        emissiveIntensity?: number
        transparent?: boolean
        opacity?: number
        depthWrite?: boolean
        side?: number
        toneMapped?: boolean
        color?: Color
        emissive?: Color
        envMapIntensity?: number
      }

      if (typeof std.emissiveIntensity === 'number') {
        std.emissiveIntensity = Math.min(std.emissiveIntensity, 1.25)
      }

      if (std.envMapIntensity != null) {
        std.envMapIntensity = Math.min(std.envMapIntensity, 1.4)
      }

      // Mustang glow meshes — tone down so headlights don't blow out
      if (isGlow) {
        if (std.emissive) std.emissive.set('#ffcc88')
        std.emissiveIntensity = 0.55
        std.toneMapped = true
        std.transparent = true
        std.opacity = Math.min(std.opacity ?? 1, 0.85)
        std.depthWrite = false
      }

      const matName = (std.name || '').toLowerCase()
      const isGlass =
        name.includes('glass') ||
        name.includes('window') ||
        matName.includes('glass') ||
        matName.includes('window')

      // Sketchfab low-poly cars often mark body paint as BLEND — don't treat as glass
      if (isGlass) {
        std.transparent = true
        std.depthWrite = false
        std.side = DoubleSide
        if ((std.opacity ?? 1) > 0.85) std.opacity = 0.35
        if (std.color && std.color.getHex() < 0x222222) {
          std.color.set('#050607')
          std.opacity = Math.min(std.opacity ?? 1, 0.92)
          std.transparent = false
          std.depthWrite = true
        }
      } else if (std.transparent) {
        // Restore body/paint that was wrongly ghosted as "glass"
        std.transparent = false
        std.opacity = 1
        std.depthWrite = true
      }

      std.needsUpdate = true
    }
  })
}

function fitToLength(root: Object3D, targetLength: number, yawOffset: number) {
  root.rotation.set(0, yawOffset, 0)
  root.scale.setScalar(1)
  root.position.set(0, 0, 0)
  root.updateMatrixWorld(true)

  let box = computeMeshBox(root)
  if (box.isEmpty()) {
    box = new Box3().setFromObject(root)
  }
  if (box.isEmpty()) return

  const size = new Vector3()
  const center = new Vector3()
  box.getSize(size)
  box.getCenter(center)

  const longest = Math.max(size.x, size.z, size.y * 0.55, 1e-4)
  const s = targetLength / longest
  const groundY = computeGroundY(root)
  root.scale.setScalar(s)
  // Ground + center only — live X/Y/Z nudges live on a non-rotating parent
  root.position.set(-center.x * s, -groundY * s, -center.z * s)
  root.updateMatrixWorld(true)
}

function FittedModel({
  url,
  targetLength,
  yawOffset,
}: {
  url: string
  targetLength: number
  yawOffset: number
}) {
  const { scene } = useGLTF(url)
  // Fit once when the GLB is ready — same result every reload
  const clone = useMemo(() => {
    const c = cloneSkinned(scene)
    sanitizeMaterials(c)
    fitToLength(c, targetLength, yawOffset)
    return c
  }, [scene, targetLength, yawOffset])

  return <primitive object={clone} />
}

function ModelFallback() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="car-loading">CARGANDO MODELO… {Math.round(progress)}%</div>
    </Html>
  )
}

export function GlbCar({
  carId,
  hovered,
  active,
  focused,
  onHover,
  onSelect,
  autoRotate,
  focusY,
}: Props) {
  const car = getCar(carId)
  const offset = useCarOffset(carId)
  const group = useRef<Group>(null)
  const [dragging, setDragging] = useState(false)
  const drag = useRef({ x: 0, rot: 0 })
  const freeSpin = useRef(true)
  const returning = useRef(false)
  const returnTarget = useRef(0)
  const lastFocused = useRef(focused)

  useEffect(() => {
    document.body.style.cursor = 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [carId])

  // Reset spin state when switching cars
  useEffect(() => {
    returning.current = false
    freeSpin.current = true
    if (group.current) group.current.rotation.y = 0
  }, [carId])

  // Brief orient toward section when focus changes, then free again
  useEffect(() => {
    if (focused !== lastFocused.current) {
      lastFocused.current = focused
      freeSpin.current = false
      returning.current = false
    }
  }, [focused])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: PointerEvent) => {
      if (!group.current) return
      const dx = e.clientX - drag.current.x
      group.current.rotation.y = drag.current.rot + dx * 0.012
    }
    const onUp = () => {
      setDragging(false)
      document.body.style.cursor = 'auto'
      // Snap back to the angle before the drag started
      returnTarget.current = drag.current.rot
      returning.current = true
      freeSpin.current = true
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragging])

  useFrame((_, delta) => {
    if (!group.current) return

    if (dragging) {
      freeSpin.current = true
      returning.current = false
      return
    }

    // After release: ease back to pre-drag rotation
    if (returning.current) {
      const current = group.current.rotation.y
      let diff = returnTarget.current - current
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      group.current.rotation.y = current + diff * Math.min(1, delta * 8)
      if (Math.abs(diff) < 0.02) {
        group.current.rotation.y = returnTarget.current
        returning.current = false
      }
      return
    }

    if (!freeSpin.current && focusY !== null) {
      const current = group.current.rotation.y
      let diff = focusY - current
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      group.current.rotation.y = current + diff * Math.min(1, delta * 5)
      if (Math.abs(diff) < 0.04) freeSpin.current = true
      return
    }

    if (autoRotate && !active) {
      group.current.rotation.y += delta * 0.22
    }
  })

  return (
    // Offsets in world space — outside spin — so nudge buttons stay consistent after rotate
    <group position={[offset.xOffset, offset.yOffset, offset.zOffset]}>
      <group
        ref={group}
        onPointerDown={(e) => {
          if (e.button !== 0) return
          e.stopPropagation()
          setDragging(true)
          freeSpin.current = true
          returning.current = false
          drag.current = { x: e.clientX, rot: group.current?.rotation.y ?? 0 }
          document.body.style.cursor = 'grabbing'
        }}
      >
        <Suspense fallback={<ModelFallback />}>
          <FittedModel
            key={car.url}
            url={car.url}
            targetLength={car.targetLength}
            yawOffset={car.yawOffset}
          />
        </Suspense>

        {HOTSPOTS.map((h, i) => (
          <Hotspot
            key={`${h.id}-${i}`}
            {...h}
            hovered={hovered}
            active={active}
            focused={focused}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}
      </group>
    </group>
  )
}

// Cars load on demand via useGLTF (catalog is large — avoid preloading all)
