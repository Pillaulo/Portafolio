import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import {
  CanvasTexture,
  DoubleSide,
  MathUtils,
  RepeatWrapping,
  Vector3,
  type Group,
  type Mesh,
  type PerspectiveCamera,
} from 'three'
import { Computer } from './Computer'
import { GarageCar } from './GarageCar'
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
  hovered: SectionId | null
  active: SectionId | null
  focused: SectionId | null
  onHover: (id: SectionId | null) => void
  onSelect: (id: SectionId) => void
}

function RoomLights() {
  return (
    <>
      <hemisphereLight args={['#c8d4e8', '#2a2018', 0.55]} />
      <ambientLight intensity={0.55} color="#b8c4d4" />
      <directionalLight position={[4, 6, 3]} intensity={1.35} castShadow color="#fff5e8" />
      <pointLight position={[-2, 2.2, 2]} intensity={1.1} color="#7ec8ff" />
      <pointLight position={[1.2, 1.5, 2]} intensity={0.55} color="#ffe8c8" />
      {/* Monitor bounce */}
      <pointLight position={[0.55, 0.5, 1.2]} intensity={0.8} color="#44e0ff" distance={4} />
    </>
  )
}

const GARAGE_BG = '#141820'
const GARAGE_FOG = '#1c2230'

function makeBrickTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#3a3e48'
  ctx.fillRect(0, 0, 512, 512)
  const brickH = 28
  const brickW = 64
  for (let y = 0, row = 0; y < 512; y += brickH + 3, row++) {
    const offset = row % 2 === 0 ? 0 : brickW / 2
    for (let x = -brickW; x < 512; x += brickW + 3) {
      const shade = 58 + ((x * 7 + y * 13) % 32)
      ctx.fillStyle = `rgb(${shade + 12},${shade + 4},${shade - 2})`
      ctx.fillRect(x + offset, y, brickW, brickH)
      if ((x + y) % 11 === 0) {
        ctx.fillStyle = 'rgba(200,60,70,0.28)'
        ctx.fillRect(x + offset + 8, y + 4, 18, 12)
      }
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  for (let i = 0; i < 40; i++) {
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 8, 1)
  }
  const tex = new CanvasTexture(c)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(3, 2)
  return tex
}

function makeAsphaltTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#1a1b20'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 900; i++) {
    const g = 18 + Math.random() * 30
    ctx.fillStyle = `rgba(${g},${g},${g + 2},${0.15 + Math.random() * 0.35})`
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1)
  }
  const tex = new CanvasTexture(c)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(6, 6)
  return tex
}

function makeHazardTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 64
  const ctx = c.getContext('2d')!
  const stripe = 28
  for (let x = -64; x < 320; x += stripe) {
    ctx.fillStyle = ((x / stripe) | 0) % 2 === 0 ? '#f0c400' : '#121212'
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + stripe * 0.55, 0)
    ctx.lineTo(x + stripe * 0.55 + 40, 64)
    ctx.lineTo(x + 40, 64)
    ctx.closePath()
    ctx.fill()
  }
  const tex = new CanvasTexture(c)
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.repeat.set(18, 1)
  return tex
}

function makeDoorTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 512
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#d8d4cc'
  ctx.fillRect(0, 0, 256, 512)
  for (let y = 0; y < 512; y += 36) {
    ctx.fillStyle = y % 72 === 0 ? '#c8c4bc' : '#e2ded6'
    ctx.fillRect(0, y, 256, 32)
    ctx.fillStyle = 'rgba(0,0,0,0.12)'
    ctx.fillRect(0, y + 32, 256, 4)
  }
  ctx.fillStyle = 'rgba(160,30,40,0.45)'
  ctx.font = 'bold 42px sans-serif'
  ctx.fillText('NF', 28, 180)
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  for (let i = 0; i < 30; i++) {
    ctx.fillRect(Math.random() * 256, Math.random() * 512, 3, 8)
  }
  return new CanvasTexture(c)
}

function GarageLights() {
  return (
    <>
      <hemisphereLight args={['#8a96aa', '#2a2218', 0.75]} />
      <ambientLight intensity={0.55} color="#b0bac8" />
      <spotLight
        position={[0, 6.2, 1.2]}
        angle={0.52}
        penumbra={0.55}
        intensity={4.2}
        color="#f8f4ec"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        distance={18}
      />
      <pointLight position={[4.2, 3.4, -2.2]} intensity={4.8} color="#ff4466" distance={14} decay={2} />
      <pointLight position={[3.6, 2.2, -1.4]} intensity={2.2} color="#ff7a5a" distance={9} decay={2} />
      <pointLight position={[-4.5, 2.8, 0.5]} intensity={1.8} color="#9ad0ff" distance={12} decay={2} />
      <pointLight position={[-3.2, 0.6, 1.5]} intensity={1.1} color="#d0e0f0" distance={6} decay={2} />
      <directionalLight position={[1.5, 5, 4]} intensity={0.9} color="#fffaf0" />
      <pointLight position={[0, 3, 3]} intensity={1.2} color="#e8eef8" distance={10} />
    </>
  )
}

function SteamPlume({ position }: { position: [number, number, number] }) {
  const group = useRef<Group>(null)
  const puffs = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        y: i * 0.55,
        scale: 0.35 + i * 0.18,
        phase: i * 1.3,
        x: (i % 2) * 0.12 - 0.06,
      })),
    [],
  )

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime
    group.current.children.forEach((child, i) => {
      const p = puffs[i]
      const mesh = child as Mesh
      mesh.position.y = p.y + ((t * 0.35 + p.phase) % 2.4)
      mesh.position.x = p.x + Math.sin(t * 0.6 + p.phase) * 0.08
      const life = ((t * 0.35 + p.phase) % 2.4) / 2.4
      const s = p.scale * (0.7 + life * 0.9)
      mesh.scale.setScalar(s)
      const mat = mesh.material as import('three').MeshBasicMaterial
      mat.opacity = 0.22 * (1 - life)
    })
  })

  return (
    <group ref={group} position={position}>
      {puffs.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, 0]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="#d8e4f0" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function GarageBackdrop() {
  const brick = useMemo(() => makeBrickTexture(), [])
  const door = useMemo(() => makeDoorTexture(), [])

  return (
    <group>
      {/* Back alley wall */}
      <mesh position={[0, 2.6, -5.4]} receiveShadow>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial map={brick} color="#d0d4dc" roughness={0.9} metalness={0.04} />
      </mesh>

      {/* Left brick wall */}
      <mesh position={[-6.2, 2.6, -0.8]} rotation={[0, Math.PI / 2.15, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial map={brick} color="#c4c8d0" roughness={0.92} metalness={0.04} />
      </mesh>

      {/* Right brick wall */}
      <mesh position={[6.2, 2.6, -0.8]} rotation={[0, -Math.PI / 2.15, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial map={brick} color="#c4c8d0" roughness={0.92} metalness={0.04} />
      </mesh>

      {/* Distant buildings (silhouettes) */}
      {[
        [-2.8, 4.2, -5.2, 1.4, 3.2],
        [-0.6, 3.6, -5.15, 1.1, 2.4],
        [1.4, 4.0, -5.25, 1.6, 2.8],
      ].map(([x, y, z, w, h], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[w, h, 0.4]} />
          <meshStandardMaterial color="#15171e" roughness={0.95} />
        </mesh>
      ))}
      {/* Lit windows on distant buildings */}
      {[
        [-3.1, 4.5, -4.95],
        [-2.5, 5.1, -4.95],
        [1.1, 4.3, -4.98],
        [1.7, 5.0, -4.98],
      ].map((pos, i) => (
        <mesh key={`w${i}`} position={pos as [number, number, number]}>
          <planeGeometry args={[0.22, 0.28]} />
          <meshBasicMaterial color={i % 2 ? '#ffcc88' : '#88c8ff'} transparent opacity={0.75} />
        </mesh>
      ))}

      {/* Rolling garage door (right) */}
      <group position={[3.55, 1.55, -4.85]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.6, 3.1, 0.12]} />
          <meshStandardMaterial map={door} roughness={0.55} metalness={0.25} />
        </mesh>
        {/* Door frame */}
        <mesh position={[0, 1.6, 0.02]}>
          <boxGeometry args={[2.75, 0.12, 0.18]} />
          <meshStandardMaterial color="#3a3c42" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[-1.35, 0, 0.02]}>
          <boxGeometry args={[0.1, 3.15, 0.18]} />
          <meshStandardMaterial color="#3a3c42" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[1.35, 0, 0.02]}>
          <boxGeometry args={[0.1, 3.15, 0.18]} />
          <meshStandardMaterial color="#3a3c42" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Red-glow window above / beside door */}
      <mesh position={[4.85, 3.55, -4.95]}>
        <planeGeometry args={[1.1, 0.85]} />
        <meshBasicMaterial color="#ff2244" transparent opacity={0.85} />
      </mesh>
      <mesh position={[4.85, 3.55, -4.9]}>
        <planeGeometry args={[1.35, 1.1]} />
        <meshBasicMaterial color="#ff4466" transparent opacity={0.25} />
      </mesh>
      {/* Red wash on wall near door */}
      <mesh position={[3.6, 2.8, -5.35]}>
        <planeGeometry args={[3.2, 2.4]} />
        <meshBasicMaterial color="#ff2040" transparent opacity={0.12} depthWrite={false} />
      </mesh>

      {/* Orange construction barrier hint */}
      <mesh position={[2.05, 0.45, -4.2]} rotation={[0, 0.35, 0]}>
        <boxGeometry args={[0.55, 0.9, 0.08]} />
        <meshStandardMaterial color="#e06020" roughness={0.7} emissive="#c04010" emissiveIntensity={0.15} />
      </mesh>

      {/* Left alley metal fence / ladder */}
      <group position={[-4.6, 0, -2.2]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[0, 0.9 + i * 0.55, -i * 0.15]}>
            <boxGeometry args={[0.06, 0.55, 0.06]} />
            <meshStandardMaterial color="#4a4e58" metalness={0.7} roughness={0.35} />
          </mesh>
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={`r${i}`} position={[0, 1.15 + i * 0.55, -i * 0.15]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.05, 0.7, 0.05]} />
            <meshStandardMaterial color="#5a5e68" metalness={0.65} roughness={0.4} />
          </mesh>
        ))}
        {/* Chain-link hint */}
        <mesh position={[-0.8, 1.4, 0.6]} rotation={[0, 0.4, 0]}>
          <planeGeometry args={[2.2, 2.6]} />
          <meshStandardMaterial color="#3a3e48" wireframe transparent opacity={0.35} />
        </mesh>
      </group>

      {/* Ceiling / overhead beams */}
      <mesh position={[0, 5.4, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#0e1016" roughness={1} side={DoubleSide} />
      </mesh>
      {[-3, -1, 1, 3].map((x) => (
        <mesh key={x} position={[x, 5.15, -1.5]}>
          <boxGeometry args={[0.18, 0.25, 8]} />
          <meshStandardMaterial color="#2a2e38" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}

      <SteamPlume position={[-4.8, 0.1, 0.8]} />
      <SteamPlume position={[-5.2, 0.05, -0.6]} />
    </group>
  )
}

function GarageFloor() {
  const asphalt = useMemo(() => makeAsphaltTexture(), [])
  const hazard = useMemo(() => makeHazardTexture(), [])

  return (
    <group>
      {/* Asphalt ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial map={asphalt} color="#9aa0aa" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Wet sheen patches */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.8, -0.01, 1.2]}>
        <circleGeometry args={[1.4, 32]} />
        <meshStandardMaterial
          color="#2a3038"
          roughness={0.15}
          metalness={0.65}
          transparent
          opacity={0.45}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.2, -0.01, -0.5]}>
        <circleGeometry args={[0.9, 32]} />
        <meshStandardMaterial
          color="#2a3038"
          roughness={0.18}
          metalness={0.6}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Raised circular showcase platform */}
      <group>
        <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[2.15, 2.25, 0.1, 64]} />
          <meshStandardMaterial color="#2c2e34" roughness={0.72} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.095, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[2.05, 64]} />
          <meshStandardMaterial color="#3a3c44" roughness={0.55} metalness={0.35} />
        </mesh>
        {/* Hazard stripe band on rim */}
        <mesh position={[0, 0.055, 0]}>
          <cylinderGeometry args={[2.22, 2.22, 0.08, 64, 1, true]} />
          <meshStandardMaterial map={hazard} roughness={0.45} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.05, 2.22, 64]} />
          <meshStandardMaterial map={hazard} roughness={0.45} metalness={0.2} />
        </mesh>
      </group>

      {/* Soft ground glow under spotlight */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]}>
        <circleGeometry args={[2.6, 48]} />
        <meshBasicMaterial color="#fff4e0" transparent opacity={0.07} depthWrite={false} />
      </mesh>
    </group>
  )
}

export function Scene({
  mode,
  onEnter,
  onZoomComplete,
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
      <fog attach="fog" args={[inGarage ? GARAGE_FOG : '#121820', inGarage ? 10 : 8, inGarage ? 24 : 20]} />

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
          <GarageBackdrop />
          <GarageFloor />
          <group position={[0, 0.08, 0]} scale={0.92}>
            <GarageCar
              hovered={hovered}
              active={active}
              onHover={onHover}
              onSelect={onSelect}
              autoRotate={focused === null}
              focusY={focusY}
            />
          </group>
          <ContactShadows position={[0, 0.07, 0]} opacity={0.5} scale={8} blur={2.6} color="#000000" />
          <Environment preset="night" environmentIntensity={0.18} />
        </>
      )}
    </Canvas>
  )
}
