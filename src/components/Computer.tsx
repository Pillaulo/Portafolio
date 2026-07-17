import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import {
  CanvasTexture,
  RepeatWrapping,
  type Mesh,
  type MeshStandardMaterial,
} from 'three'

type Props = {
  onEnter: () => void
  entered: boolean
}

function makePlasticTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 256, 256)
  g.addColorStop(0, '#3a404c')
  g.addColorStop(0.5, '#2c313a')
  g.addColorStop(1, '#232830')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 1200; i++) {
    const n = 20 + Math.random() * 30
    ctx.fillStyle = `rgba(${n},${n},${n + 5},0.15)`
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1)
  }
  const tex = new CanvasTexture(c)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(2, 2)
  return tex
}

function makeWoodTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#3a2a1c'
  ctx.fillRect(0, 0, 512, 256)
  for (let y = 0; y < 256; y++) {
    const v = 42 + Math.sin(y * 0.15) * 8 + Math.sin(y * 0.4) * 4
    ctx.fillStyle = `rgb(${v + 30},${v + 12},${v - 5})`
    ctx.fillRect(0, y, 512, 1)
    if (y % 17 === 0) {
      ctx.fillStyle = 'rgba(20,10,5,0.25)'
      ctx.fillRect(0, y, 512, 2)
    }
  }
  for (let i = 0; i < 40; i++) {
    ctx.strokeStyle = `rgba(60,35,18,${0.15 + Math.random() * 0.2})`
    ctx.beginPath()
    const x = Math.random() * 512
    ctx.moveTo(x, 0)
    ctx.bezierCurveTo(x + 20, 80, x - 30, 160, x + 10, 256)
    ctx.stroke()
  }
  const tex = new CanvasTexture(c)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(2, 1)
  return tex
}

function makeScreenTexture(boot: boolean) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 384
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(256, 192, 20, 256, 192, 280)
  g.addColorStop(0, boot ? '#0a1820' : '#062028')
  g.addColorStop(1, '#02080c')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 384)

  // Scanlines baked into texture
  for (let y = 0; y < 384; y += 2) {
    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.fillRect(0, y, 512, 1)
  }

  if (!boot) {
    ctx.fillStyle = '#00f0ff'
    ctx.font = 'bold 42px monospace'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#00f0ff'
    ctx.shadowBlur = 18
    ctx.fillText('GARAGE OS', 256, 170)
    ctx.font = '18px monospace'
    ctx.shadowBlur = 8
    ctx.fillStyle = '#ffe566'
    ctx.fillText('CLICK TO ENTER', 256, 220)
    ctx.strokeStyle = 'rgba(0,240,255,0.45)'
    ctx.lineWidth = 2
    ctx.strokeRect(48, 48, 416, 288)
  } else {
    ctx.fillStyle = '#ff2bd6'
    ctx.font = 'bold 36px monospace'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#ff2bd6'
    ctx.shadowBlur = 14
    ctx.fillText('ENTERING...', 256, 195)
  }

  const tex = new CanvasTexture(c)
  return tex
}

function makeVentTexture() {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#1a1e26'
  ctx.fillRect(0, 0, 128, 128)
  for (let y = 8; y < 120; y += 7) {
    ctx.fillStyle = '#0c0e12'
    ctx.fillRect(10, y, 108, 3)
    ctx.fillStyle = '#2a303a'
    ctx.fillRect(10, y, 108, 1)
  }
  const tex = new CanvasTexture(c)
  tex.wrapS = tex.wrapT = RepeatWrapping
  return tex
}

export function Computer({ onEnter, entered }: Props) {
  const screen = useRef<Mesh>(null)
  const plastic = useMemo(() => makePlasticTexture(), [])
  const wood = useMemo(() => makeWoodTexture(), [])
  const vent = useMemo(() => makeVentTexture(), [])
  const screenTex = useMemo(() => makeScreenTexture(entered), [entered])
  const baseGlow = entered ? 0.35 : 1.35

  useFrame(({ clock }) => {
    if (!screen.current) return
    const mat = screen.current.material as MeshStandardMaterial
    mat.emissiveIntensity = baseGlow + Math.sin(clock.elapsedTime * 2.4) * 0.12
  })

  return (
    <group position={[0.55, -0.15, 0]}>
      {/* Desk — wood grain */}
      <RoundedBox
        args={[4.3, 0.14, 2.25]}
        radius={0.02}
        smoothness={4}
        position={[-0.35, -0.86, 0.25]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial map={wood} roughness={0.72} metalness={0.05} color="#c4a882" />
      </RoundedBox>
      {/* Desk edge highlight */}
      <mesh position={[-0.35, -0.78, 1.35]}>
        <boxGeometry args={[4.2, 0.02, 0.04]} />
        <meshStandardMaterial color="#8a6a48" roughness={0.55} metalness={0.1} />
      </mesh>

      {/* CRT shell */}
      <RoundedBox
        args={[2.35, 1.85, 1.55]}
        radius={0.08}
        smoothness={6}
        position={[0, 0.38, 0]}
        castShadow
        onClick={(e) => {
          e.stopPropagation()
          if (!entered) onEnter()
        }}
        onPointerOver={() => {
          if (!entered) document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <meshStandardMaterial
          map={plastic}
          color="#8a929e"
          roughness={0.48}
          metalness={0.22}
        />
      </RoundedBox>

      {/* Top CRT curve / brow */}
      <RoundedBox args={[2.2, 0.22, 0.35]} radius={0.06} smoothness={5} position={[0, 1.2, 0.55]}>
        <meshStandardMaterial map={plastic} color="#7a828e" roughness={0.5} metalness={0.2} />
      </RoundedBox>

      {/* Bezel */}
      <RoundedBox args={[2.05, 1.42, 0.12]} radius={0.04} smoothness={5} position={[0, 0.45, 0.78]}>
        <meshStandardMaterial color="#0e1116" roughness={0.65} metalness={0.15} />
      </RoundedBox>

      {/* Inner bezel ring */}
      <mesh position={[0, 0.45, 0.845]}>
        <planeGeometry args={[1.92, 1.3]} />
        <meshStandardMaterial color="#05070a" roughness={0.9} />
      </mesh>

      {/* Screen glass */}
      <mesh
        ref={screen}
        position={[0, 0.45, 0.86]}
        onClick={(e) => {
          e.stopPropagation()
          if (!entered) onEnter()
        }}
      >
        <planeGeometry args={[1.78, 1.18]} />
        <meshStandardMaterial
          map={screenTex}
          emissiveMap={screenTex}
          emissive="#88e8ff"
          emissiveIntensity={baseGlow}
          roughness={0.25}
          metalness={0.05}
          toneMapped={false}
        />
      </mesh>

      {/* Glass reflection sheen */}
      <mesh position={[0.15, 0.55, 0.865]}>
        <planeGeometry args={[0.55, 0.7]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} depthWrite={false} />
      </mesh>

      {/* Power / controls under screen */}
      <group position={[0.65, -0.25, 0.82]}>
        {['#ff5f57', '#febc2e', '#28c840'].map((col, i) => (
          <mesh key={col} position={[i * 0.12, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.02, 16]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.35} />
          </mesh>
        ))}
        <mesh position={[0.45, 0, 0.01]}>
          <boxGeometry args={[0.2, 0.04, 0.02]} />
          <meshStandardMaterial color="#1a1e26" roughness={0.5} />
        </mesh>
      </group>

      {/* Brand badge */}
      <mesh position={[-0.7, -0.28, 0.84]}>
        <boxGeometry args={[0.35, 0.06, 0.01]} />
        <meshStandardMaterial color="#c8d0d8" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Side vents */}
      <mesh position={[1.2, 0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 1.2]} />
        <meshStandardMaterial map={vent} roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[-1.2, 0.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 1.2]} />
        <meshStandardMaterial map={vent} roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Neck / stand */}
      <RoundedBox args={[0.55, 0.4, 0.55]} radius={0.04} smoothness={4} position={[0, -0.55, 0.15]}>
        <meshStandardMaterial map={plastic} color="#6a7280" roughness={0.5} metalness={0.25} />
      </RoundedBox>
      <RoundedBox args={[1.35, 0.08, 0.95]} radius={0.03} smoothness={4} position={[0, -0.78, 0.3]} castShadow>
        <meshStandardMaterial map={plastic} color="#5a6270" roughness={0.45} metalness={0.3} />
      </RoundedBox>

      {/* Keyboard */}
      <RoundedBox args={[1.85, 0.07, 0.58]} radius={0.02} smoothness={4} position={[0, -0.78, 1.2]} castShadow>
        <meshStandardMaterial color="#1a1e26" roughness={0.55} metalness={0.2} />
      </RoundedBox>
      {/* Key rows */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 14 }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[-0.78 + col * 0.12, -0.73, 1.02 + row * 0.09]}
          >
            <boxGeometry args={[0.095, 0.025, 0.07]} />
            <meshStandardMaterial
              color={row === 4 && col > 4 && col < 9 ? '#2a3340' : '#2c323c'}
              roughness={0.4}
              metalness={0.15}
            />
          </mesh>
        )),
      )}

      {/* Mouse */}
      <RoundedBox args={[0.22, 0.05, 0.32]} radius={0.025} smoothness={5} position={[1.15, -0.76, 1.25]} castShadow>
        <meshStandardMaterial color="#2a3038" roughness={0.45} metalness={0.2} />
      </RoundedBox>

      {/* Tower / gabinete */}
      <RoundedBox
        args={[0.58, 1.45, 1.35]}
        radius={0.05}
        smoothness={5}
        position={[-1.9, -0.12, 0.15]}
        castShadow
      >
        <meshStandardMaterial
          map={plastic}
          color="#6e7684"
          roughness={0.42}
          metalness={0.28}
        />
      </RoundedBox>
      {/* Front panel */}
      <mesh position={[-1.9, -0.05, 0.84]}>
        <planeGeometry args={[0.5, 1.25]} />
        <meshStandardMaterial color="#1a1e26" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Drive bays */}
      {[0.35, 0.15, -0.05].map((y, i) => (
        <mesh key={i} position={[-1.9, y, 0.85]}>
          <boxGeometry args={[0.42, 0.12, 0.04]} />
          <meshStandardMaterial color="#0e1116" roughness={0.55} metalness={0.35} />
        </mesh>
      ))}
      {/* Power LED */}
      <mesh position={[-1.72, 0.45, 0.86]}>
        <boxGeometry args={[0.08, 0.035, 0.02]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2.2} />
      </mesh>
      <mesh position={[-1.9, 0.45, 0.86]}>
        <boxGeometry args={[0.08, 0.035, 0.02]} />
        <meshStandardMaterial color="#28c840" emissive="#28c840" emissiveIntensity={1.2} />
      </mesh>
      {/* Side vent on tower */}
      <mesh position={[-1.61, 0.1, 0.15]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.0, 1.1]} />
        <meshStandardMaterial map={vent} roughness={0.65} metalness={0.35} />
      </mesh>
      {/* Feet */}
      {[-0.2, 0.2].map((z) =>
        [-0.18, 0.18].map((x) => (
          <mesh key={`${x}${z}`} position={[-1.9 + x, -0.88, 0.15 + z]}>
            <cylinderGeometry args={[0.04, 0.05, 0.06, 12]} />
            <meshStandardMaterial color="#111" roughness={0.8} />
          </mesh>
        )),
      )}
    </group>
  )
}
