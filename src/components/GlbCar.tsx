import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
import type { SectionId } from '../data/cv'

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

function Hotspot({
  id,
  position,
  args,
  hovered,
  active,
  focused,
  onHover,
  onSelect,
  label,
}: {
  id: SectionId
  position: [number, number, number]
  args: [number, number, number]
  hovered: SectionId | null
  active: SectionId | null
  focused: SectionId | null
  onHover: (id: SectionId | null) => void
  onSelect: (id: SectionId) => void
  label: string
}) {
  const matRef = useRef<MeshStandardMaterial>(null)
  const isLit = hovered === id || active === id || focused === id
  const isStrong = active === id || hovered === id

  useFrame((state) => {
    const mat = matRef.current
    if (!mat) return
    if (!isLit) {
      mat.emissiveIntensity = 0
      mat.opacity = 0.015
      return
    }
    const pulse = 0.55 + Math.sin(state.clock.elapsedTime * 3.2) * 0.35
    mat.emissiveIntensity = isStrong ? 1.15 + pulse * 0.35 : 0.55 + pulse * 0.55
    mat.opacity = isStrong ? 0.38 : 0.16 + pulse * 0.12
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
        color={isLit ? '#5ee7ff' : '#1a2233'}
        emissive={isLit ? '#5ee7ff' : '#000'}
        emissiveIntensity={isLit ? 0.9 : 0}
        transparent
        opacity={isLit ? 0.28 : 0.015}
        depthWrite={false}
      />
      {isLit && (
        <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className="car-hotspot-label">{label}</div>
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

      // Glass / windows
      if (
        std.transparent ||
        (typeof std.opacity === 'number' && std.opacity < 0.99) ||
        name.includes('glass') ||
        name.includes('window')
      ) {
        std.transparent = true
        std.depthWrite = false
        std.side = DoubleSide
        if ((std.opacity ?? 1) > 0.85) std.opacity = 0.35
        // Keep limo-black look on near-black glass
        if (std.color && std.color.getHex() < 0x222222) {
          std.color.set('#050607')
          std.opacity = Math.min(std.opacity ?? 1, 0.92)
          std.transparent = false
          std.depthWrite = true
        }
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
  root.scale.setScalar(s)
  root.position.set(-center.x * s, -box.min.y * s, -center.z * s)
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
  // cloneSkinned required for skinned cars (S2000)
  const clone = useMemo(() => cloneSkinned(scene), [scene])

  useLayoutEffect(() => {
    sanitizeMaterials(clone)
    fitToLength(clone, targetLength, yawOffset)
  }, [clone, targetLength, yawOffset])

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
  const group = useRef<Group>(null)
  const [dragging, setDragging] = useState(false)
  const drag = useRef({ x: 0, rot: 0 })

  useEffect(() => {
    document.body.style.cursor = 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [carId])

  useFrame((_, delta) => {
    if (!group.current) return
    if (focusY !== null && !dragging) {
      const current = group.current.rotation.y
      let diff = focusY - current
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      group.current.rotation.y = current + diff * Math.min(1, delta * 4.5)
    } else if (autoRotate && !dragging && !active) {
      group.current.rotation.y += delta * 0.2625
    }
  })

  return (
    <group
      ref={group}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        e.stopPropagation()
        setDragging(true)
        drag.current = { x: e.clientX, rot: group.current?.rotation.y ?? 0 }
      }}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
      onPointerMove={(e) => {
        if (!dragging || !group.current) return
        const dx = e.clientX - drag.current.x
        group.current.rotation.y = drag.current.rot + dx * 0.01
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

      <Hotspot id="perfil" label="PERFIL" position={[0.9, 0.55, 0]} args={[0.85, 0.2, 0.85]} hovered={hovered} active={active} focused={focused} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="habilidades" label="HABILIDADES" position={[0.05, 0.55, 0.72]} args={[1.1, 0.4, 0.14]} hovered={hovered} active={active} focused={focused} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="habilidades" label="HABILIDADES" position={[0.05, 0.55, -0.72]} args={[1.1, 0.4, 0.14]} hovered={hovered} active={active} focused={focused} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="experiencia" label="EXPERIENCIA" position={[0, 0.18, 0]} args={[2.0, 0.12, 1.2]} hovered={hovered} active={active} focused={focused} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="proyectos" label="PROYECTOS" position={[1.05, 0.32, 0.75]} args={[0.45, 0.45, 0.45]} hovered={hovered} active={active} focused={focused} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="proyectos" label="PROYECTOS" position={[-0.95, 0.32, -0.75]} args={[0.45, 0.45, 0.45]} hovered={hovered} active={active} focused={focused} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="educacion" label="EDUCACIÓN" position={[-0.15, 1.05, 0]} args={[0.9, 0.12, 0.9]} hovered={hovered} active={active} focused={focused} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="certificaciones" label="CERTIFICACIONES" position={[-1.15, 0.95, 0]} args={[0.5, 0.22, 1.1]} hovered={hovered} active={active} focused={focused} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="perfiles" label="PERFILES" position={[1.7, 0.42, 0]} args={[0.25, 0.28, 1.0]} hovered={hovered} active={active} focused={focused} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="cv" label="CV" position={[1.75, 0.28, 0]} args={[0.12, 0.18, 0.45]} hovered={hovered} active={active} focused={focused} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="contacto" label="CONTACTO" position={[-1.75, 0.2, 0]} args={[0.28, 0.14, 0.8]} hovered={hovered} active={active} focused={focused} onHover={onHover} onSelect={onSelect} />
    </group>
  )
}

useGLTF.preload('/cars/honda_s2000.glb?v=metalrough')
useGLTF.preload('/cars/2015_ford_mustang_gt.glb')
useGLTF.preload('/cars/ferrari_laferrari.glb')
