import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, useTexture } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import {
  MathUtils,
  SRGBColorSpace,
  Vector3,
  type Mesh,
  type PerspectiveCamera,
} from 'three'
import { Computer } from './Computer'
import { CarStage } from './CarStage'
import type { CarId } from '../data/cars'
import { PART_FOCUS_Y, type SectionId } from '../data/cv'

export type SceneMode = 'room' | 'zooming' | 'garage'

type CamPose = {
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
}

const ROOM: CamPose = {
  position: [0, 0.7, 4.8],
  lookAt: [0, 0.25, 0.3],
  fov: 40,
}

// Close-up of CRT screen (group offset 0.55, screen ~ y 0.27 world)
const ZOOM: CamPose = {
  position: [0.55, 0.35, 2.05],
  lookAt: [0.55, 0.27, 0.8],
  fov: 32,
}

const GARAGE: CamPose = {
  position: [0, 1.55, 5.4],
  lookAt: [0, 0.4, 0],
  fov: 34,
}

function CameraRig({
  mode,
  onZoomComplete,
}: {
  mode: SceneMode
  onZoomComplete: () => void
}) {
  const { camera, size } = useThree()
  const done = useRef(false)
  const pos = useMemo(() => new Vector3(...ROOM.position), [])
  const look = useMemo(() => new Vector3(...ROOM.lookAt), [])
  const targetPos = useRef(new Vector3(...ROOM.position))
  const targetLook = useRef(new Vector3(...ROOM.lookAt))
  const targetFov = useRef(ROOM.fov)

  useEffect(() => {
    done.current = false
    if (mode === 'room') {
      targetPos.current.set(...ROOM.position)
      targetLook.current.set(...ROOM.lookAt)
      targetFov.current = ROOM.fov
      pos.set(...ROOM.position)
      look.set(...ROOM.lookAt)
      const persp = camera as PerspectiveCamera
      persp.fov = ROOM.fov
      persp.updateProjectionMatrix()
      camera.position.copy(pos)
      camera.lookAt(look)
    } else if (mode === 'zooming') {
      targetPos.current.set(...ZOOM.position)
      targetLook.current.set(...ZOOM.lookAt)
      targetFov.current = ZOOM.fov
    } else {
      targetPos.current.set(...GARAGE.position)
      targetLook.current.set(...GARAGE.lookAt)
      targetFov.current = GARAGE.fov
      pos.set(...GARAGE.position)
      look.set(...GARAGE.lookAt)
      const persp = camera as PerspectiveCamera
      persp.fov = GARAGE.fov
      persp.aspect = size.width / size.height
      persp.updateProjectionMatrix()
      camera.position.copy(pos)
      camera.lookAt(look)
    }
  }, [mode, camera, pos, look, size.width, size.height])

  useFrame((_, delta) => {
    const persp = camera as PerspectiveCamera
    const speed = mode === 'zooming' ? 2.2 : 8
    const t = 1 - Math.exp(-speed * delta)

    pos.lerp(targetPos.current, t)
    look.lerp(targetLook.current, t)
    camera.position.copy(pos)
    camera.lookAt(look)

    if (persp.isPerspectiveCamera) {
      persp.fov = MathUtils.lerp(persp.fov, targetFov.current, t)
      persp.aspect = size.width / size.height
      persp.updateProjectionMatrix()
    }

    if (mode === 'zooming' && !done.current) {
      const dist = pos.distanceTo(targetPos.current)
      if (dist < 0.08) {
        done.current = true
        onZoomComplete()
      }
    }
  })

  return null
}

type Props = {
  mode: SceneMode
  onEnter: () => void
  onZoomComplete: () => void
  carId: CarId
  slideDir: 1 | -1
  hovered: SectionId | null
  active: SectionId | null
  focused: SectionId | null
  onHover: (id: SectionId | null) => void
  onSelect: (id: SectionId) => void
}

function RoomLights() {
  return (
    <>
      <hemisphereLight args={['#e8f0ff', '#4a4038', 1.05]} />
      <ambientLight intensity={0.95} color="#d0d8e8" />
      <directionalLight position={[4, 6, 3]} intensity={2.05} castShadow color="#fff8ee" />
      <directionalLight position={[-3, 4, -1]} intensity={0.55} color="#b8d4ff" />
      <pointLight position={[-2, 2.2, 2]} intensity={1.85} color="#9edcff" />
      <pointLight position={[1.2, 1.5, 2]} intensity={1.15} color="#ffe8c8" />
      <pointLight position={[0.55, 0.5, 1.2]} intensity={1.45} color="#55e8ff" distance={5} />
      <pointLight position={[0, 2.8, 0.5]} intensity={0.7} color="#fff6e8" distance={6} />
    </>
  )
}

const GARAGE_BG = '#12141a'

function GarageLights() {
  return (
    <>
      <hemisphereLight args={['#d0d6e0', '#2a2e36', 0.85]} />
      <ambientLight intensity={0.7} color="#d8dde6" />
      <spotLight
        position={[0, 7.5, 0.5]}
        angle={0.72}
        penumbra={0.65}
        intensity={5.2}
        color="#f5f7fb"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        distance={22}
      />
      <spotLight
        position={[-3.2, 6.5, 2]}
        angle={0.5}
        penumbra={0.7}
        intensity={1.8}
        color="#e0e6f0"
        distance={16}
      />
      <spotLight
        position={[3.2, 6.5, 2]}
        angle={0.5}
        penumbra={0.7}
        intensity={1.8}
        color="#e0e6f0"
        distance={16}
      />
      <directionalLight position={[2, 8, 3]} intensity={1.1} color="#eef2f8" />
      <directionalLight position={[-2, 5, -1]} intensity={0.45} color="#b0bcc8" />
      <pointLight position={[0, 4.5, -2]} intensity={2.2} color="#e8ecf4" distance={14} decay={2} />
    </>
  )
}

const BG_IMG_ASPECT = 1536 / 1024
/** Distance from camera along view ray — behind the car, fills the frame. */
const BG_DIST = 14

/**
 * Backdrop locked to the garage camera: always covers the viewport (object-fit: cover)
 * so the image stays square/full-bleed with no letterbox seam.
 */
function GarageBackdrop() {
  const map = useTexture('/garage-bg.png?v=2')
  const mesh = useRef<Mesh>(null)
  const { camera, size } = useThree()
  const lookDir = useMemo(() => new Vector3(), [])

  useEffect(() => {
    map.colorSpace = SRGBColorSpace
    map.anisotropy = 8
    map.needsUpdate = true
  }, [map])

  useFrame(() => {
    const m = mesh.current
    if (!m) return
    const persp = camera as PerspectiveCamera
    const vFov = (persp.fov * Math.PI) / 180
    const viewH = 2 * Math.tan(vFov / 2) * BG_DIST
    const viewW = viewH * (size.width / Math.max(1, size.height))
    const viewAspect = viewW / viewH

    // object-fit: cover — fill frame, crop overflow, never letterbox
    let w: number
    let h: number
    if (viewAspect > BG_IMG_ASPECT) {
      w = viewW * 1.02
      h = w / BG_IMG_ASPECT
    } else {
      h = viewH * 1.02
      w = h * BG_IMG_ASPECT
    }
    m.scale.set(w, h, 1)

    camera.getWorldDirection(lookDir)
    m.position.copy(camera.position).addScaledVector(lookDir, BG_DIST)
    m.quaternion.copy(camera.quaternion)
  })

  return (
    <mesh ref={mesh} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={map} toneMapped={false} />
    </mesh>
  )
}

function GarageFloor() {
  return (
    <group>
      {/* Only a small pad under the turntable — photo provides the room floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0.15]} receiveShadow>
        <circleGeometry args={[2.8, 64]} />
        <meshStandardMaterial
          color="#1a1d24"
          roughness={0.2}
          metalness={0.55}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  )
}

export function Scene({
  mode,
  onEnter,
  onZoomComplete,
  carId,
  slideDir,
  hovered,
  active,
  focused,
  onHover,
  onSelect,
}: Props) {
  const inGarage = mode === 'garage'
  const inRoom = mode === 'room' || mode === 'zooming'
  const focusY = focused ? PART_FOCUS_Y[focused] : null

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 40, near: 0.1, far: 80, position: [...ROOM.position] }}
    >
      <color attach="background" args={[inGarage ? GARAGE_BG : '#121820']} />
      {!inGarage && <fog attach="fog" args={['#121820', 8, 20]} />}

      <CameraRig mode={mode} onZoomComplete={onZoomComplete} />

      {inRoom && (
        <>
          <RoomLights />
          <Computer onEnter={onEnter} entered={mode === 'zooming'} />
          <ContactShadows position={[0, -0.95, 0]} opacity={0.45} scale={10} blur={2.5} />
          <Environment preset="city" />
        </>
      )}

      {inGarage && (
        <>
          <GarageLights />
          <Suspense fallback={null}>
            <GarageBackdrop />
          </Suspense>
          <GarageFloor />
          <CarStage
            carId={carId}
            slideDir={slideDir}
            hovered={hovered}
            active={active}
            focused={focused}
            onHover={onHover}
            onSelect={onSelect}
            autoRotate={focused === null}
            focusY={focusY}
          />
          <ContactShadows position={[0, 0.07, 0]} opacity={0.4} scale={10} blur={2.8} color="#000000" />
          <Environment preset="warehouse" environmentIntensity={0.28} />
        </>
      )}
    </Canvas>
  )
}
