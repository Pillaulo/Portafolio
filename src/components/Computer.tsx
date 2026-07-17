import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
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

/** Classic putty / beige PC plastic */
const BEIGE = '#d4c8b0'
const BEIGE_DARK = '#b8aa92'
const BEIGE_LIGHT = '#e4dac8'
const BEZEL = '#1a1814'
const DESK = '#5c4030'

function makeBeigePlastic() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 200, 256)
  g.addColorStop(0, '#e8decc')
  g.addColorStop(0.45, '#d2c6ae')
  g.addColorStop(1, '#bcae96')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 900; i++) {
    const n = 160 + Math.random() * 40
    ctx.fillStyle = `rgba(${n},${n - 12},${n - 28},0.12)`
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1)
  }
  // faint scratches
  for (let i = 0; i < 18; i++) {
    ctx.strokeStyle = `rgba(90,70,50,${0.04 + Math.random() * 0.06})`
    ctx.beginPath()
    ctx.moveTo(Math.random() * 256, Math.random() * 256)
    ctx.lineTo(Math.random() * 256, Math.random() * 256)
    ctx.stroke()
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
    const v = 48 + Math.sin(y * 0.12) * 10 + Math.sin(y * 0.35) * 5
    ctx.fillStyle = `rgb(${v + 28},${v + 10},${v - 8})`
    ctx.fillRect(0, y, 512, 1)
    if (y % 19 === 0) {
      ctx.fillStyle = 'rgba(20,10,5,0.28)'
      ctx.fillRect(0, y, 512, 2)
    }
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
  const g = ctx.createRadialGradient(256, 192, 10, 256, 192, 260)
  g.addColorStop(0, boot ? '#0c2010' : '#081810')
  g.addColorStop(1, '#020804')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 384)

  for (let y = 0; y < 384; y += 2) {
    ctx.fillStyle = 'rgba(0,0,0,0.32)'
    ctx.fillRect(0, y, 512, 1)
  }

  // slight phosphor tint
  ctx.fillStyle = 'rgba(60, 200, 80, 0.04)'
  ctx.fillRect(0, 0, 512, 384)

  if (!boot) {
    ctx.fillStyle = '#5dff6a'
    ctx.font = 'bold 40px monospace'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#5dff6a'
    ctx.shadowBlur = 16
    ctx.fillText('GARAGE OS', 256, 165)
    ctx.font = '16px monospace'
    ctx.shadowBlur = 6
    ctx.fillStyle = '#b8ffc0'
    ctx.fillText('CLICK TO ENTER', 256, 210)
    ctx.strokeStyle = 'rgba(93,255,106,0.4)'
    ctx.lineWidth = 2
    ctx.strokeRect(56, 52, 400, 280)
    ctx.fillStyle = 'rgba(93,255,106,0.7)'
    ctx.font = '12px monospace'
    ctx.fillText('IBM COMPATIBLE · 640x480', 256, 300)
  } else {
    ctx.fillStyle = '#5dff6a'
    ctx.font = 'bold 32px monospace'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#5dff6a'
    ctx.shadowBlur = 12
    ctx.fillText('ENTERING...', 256, 195)
  }

  return new CanvasTexture(c)
}

function makeVentTexture() {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#9a8e78'
  ctx.fillRect(0, 0, 128, 128)
  for (let y = 6; y < 122; y += 6) {
    ctx.fillStyle = '#2a2418'
    ctx.fillRect(8, y, 112, 2.5)
    ctx.fillStyle = '#c8bca8'
    ctx.fillRect(8, y, 112, 0.8)
  }
  const tex = new CanvasTexture(c)
  tex.wrapS = tex.wrapT = RepeatWrapping
  return tex
}

function BeigeMat({
  map,
  color = BEIGE,
  roughness = 0.62,
}: {
  map?: CanvasTexture
  color?: string
  roughness?: number
}) {
  return (
    <meshStandardMaterial
      map={map}
      color={color}
      roughness={roughness}
      metalness={0.08}
    />
  )
}

export function Computer({ onEnter, entered }: Props) {
  const screen = useRef<Mesh>(null)
  const plastic = useMemo(() => makeBeigePlastic(), [])
  const wood = useMemo(() => makeWoodTexture(), [])
  const vent = useMemo(() => makeVentTexture(), [])
  const screenTex = useMemo(() => makeScreenTexture(entered), [entered])
  const baseGlow = entered ? 0.4 : 1.2

  useFrame(({ clock }) => {
    if (!screen.current) return
    const mat = screen.current.material as MeshStandardMaterial
    mat.emissiveIntensity = baseGlow + Math.sin(clock.elapsedTime * 2.2) * 0.1
  })

  const enterHandlers = {
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      if (!entered) onEnter()
    },
    onPointerOver: () => {
      if (!entered) document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      document.body.style.cursor = 'auto'
    },
  }

  return (
    <group position={[0.45, -0.12, 0]}>
      {/* Desk — axis-aligned surface */}
      <mesh position={[-0.25, -0.86, 0.15]} receiveShadow castShadow>
        <boxGeometry args={[4.5, 0.12, 2.2]} />
        <meshStandardMaterial map={wood} color="#a88460" roughness={0.75} metalness={0.04} />
      </mesh>
      <mesh position={[-0.25, -0.795, 1.22]}>
        <boxGeometry args={[4.4, 0.02, 0.04]} />
        <meshStandardMaterial color={DESK} roughness={0.6} />
      </mesh>

      {/* ===== Square CRT monitor (chunky beige) ===== */}
      <group position={[0.15, 0.15, -0.05]}>
        {/* Main chassis — boxy, almost no round */}
        <mesh position={[0, 0.35, 0]} castShadow {...enterHandlers}>
          <boxGeometry args={[1.95, 1.75, 1.7]} />
          <BeigeMat map={plastic} />
        </mesh>
        {/* Slight top lip */}
        <mesh position={[0, 1.2, 0.15]} castShadow>
          <boxGeometry args={[1.95, 0.12, 1.4]} />
          <BeigeMat map={plastic} color={BEIGE_DARK} />
        </mesh>
        {/* Front face plate */}
        <mesh position={[0, 0.38, 0.86]} castShadow>
          <boxGeometry args={[1.88, 1.55, 0.08]} />
          <BeigeMat map={plastic} color={BEIGE_LIGHT} />
        </mesh>
        {/* Deep square bezel */}
        <mesh position={[0, 0.48, 0.91]}>
          <boxGeometry args={[1.62, 1.22, 0.1]} />
          <meshStandardMaterial color={BEZEL} roughness={0.85} metalness={0.05} />
        </mesh>
        {/* Inner recess */}
        <mesh position={[0, 0.48, 0.96]}>
          <boxGeometry args={[1.48, 1.1, 0.04]} />
          <meshStandardMaterial color="#0a0a08" roughness={0.95} />
        </mesh>
        {/* Screen */}
        <mesh ref={screen} position={[0, 0.48, 0.99]} {...enterHandlers}>
          <planeGeometry args={[1.38, 1.02]} />
          <meshStandardMaterial
            map={screenTex}
            emissiveMap={screenTex}
            emissive="#6dff7a"
            emissiveIntensity={baseGlow}
            roughness={0.35}
            metalness={0.02}
            toneMapped={false}
          />
        </mesh>
        {/* Glass glare */}
        <mesh position={[0.2, 0.58, 1.0]}>
          <planeGeometry args={[0.4, 0.55]} />
          <meshBasicMaterial color="#fff8e8" transparent opacity={0.05} depthWrite={false} />
        </mesh>
        {/* Under-screen control strip */}
        <mesh position={[0, -0.22, 0.92]}>
          <boxGeometry args={[1.7, 0.16, 0.06]} />
          <BeigeMat map={plastic} color={BEIGE_DARK} />
        </mesh>
        {/* Power button + brightness knobs */}
        <mesh position={[-0.55, -0.22, 0.96]}>
          <boxGeometry args={[0.14, 0.06, 0.03]} />
          <meshStandardMaterial color="#2a2820" roughness={0.5} />
        </mesh>
        <mesh position={[-0.55, -0.22, 0.98]}>
          <boxGeometry args={[0.05, 0.02, 0.01]} />
          <meshStandardMaterial color="#3cff4a" emissive="#3cff4a" emissiveIntensity={1.8} />
        </mesh>
        {[0.35, 0.52, 0.69].map((x) => (
          <mesh key={x} position={[x, -0.22, 0.97]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
            <meshStandardMaterial color="#4a4538" roughness={0.4} metalness={0.35} />
          </mesh>
        ))}
        {/* Brand badge */}
        <mesh position={[0.55, -0.22, 0.955]}>
          <boxGeometry args={[0.28, 0.05, 0.01]} />
          <meshStandardMaterial color="#c4b89a" metalness={0.55} roughness={0.35} />
        </mesh>
        {/* Side vents */}
        <mesh position={[0.98, 0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.2, 1.15]} />
          <meshStandardMaterial map={vent} roughness={0.7} metalness={0.15} color={BEIGE_DARK} />
        </mesh>
        <mesh position={[-0.98, 0.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.2, 1.15]} />
          <meshStandardMaterial map={vent} roughness={0.7} metalness={0.15} color={BEIGE_DARK} />
        </mesh>
        {/* Rear bulge */}
        <mesh position={[0, 0.35, -0.55]} castShadow>
          <boxGeometry args={[1.7, 1.45, 0.55]} />
          <BeigeMat map={plastic} color={BEIGE_DARK} />
        </mesh>
        {/* Tilt stand — square base */}
        <mesh position={[0, -0.62, 0.1]} castShadow>
          <boxGeometry args={[0.7, 0.22, 0.55]} />
          <BeigeMat map={plastic} color={BEIGE_DARK} />
        </mesh>
        <mesh position={[0, -0.78, 0.25]} castShadow>
          <boxGeometry args={[1.15, 0.08, 0.85]} />
          <BeigeMat map={plastic} />
        </mesh>
      </group>

      {/* Keyboard + mouse — flush on desk, parallel to desk edges */}
      <group position={[0.15, -0.8, 0.95]}>
        {/* Chassis resting on desk top (desk top ≈ y=-0.80) */}
        <mesh position={[0, 0.028, 0]} castShadow>
          <boxGeometry args={[1.55, 0.055, 0.52]} />
          <BeigeMat map={plastic} />
        </mesh>
        {/* Front lip */}
        <mesh position={[0, 0.018, 0.245]}>
          <boxGeometry args={[1.55, 0.02, 0.03]} />
          <BeigeMat map={plastic} color={BEIGE_DARK} />
        </mesh>
        {/* Key grid centered on chassis */}
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 13 }).map((_, col) => {
            const isSpace = row === 4 && col >= 4 && col <= 8
            if (row === 4 && col > 4 && col < 8) return null
            return (
              <mesh
                key={`${row}-${col}`}
                position={[
                  isSpace ? 0 : -0.66 + col * 0.11,
                  0.068,
                  -0.16 + row * 0.08,
                ]}
              >
                <boxGeometry args={[isSpace ? 0.52 : 0.095, 0.02, 0.068]} />
                <meshStandardMaterial
                  color={isSpace ? '#d8cdb8' : '#f2ebe0'}
                  roughness={0.42}
                />
              </mesh>
            )
          }),
        )}
        {/* Mouse pad area + mouse, same orientation */}
        <mesh position={[1.05, 0.022, 0.02]} castShadow>
          <boxGeometry args={[0.22, 0.04, 0.32]} />
          <BeigeMat map={plastic} color={BEIGE_LIGHT} />
        </mesh>
        <mesh position={[1.05, 0.045, -0.02]}>
          <boxGeometry args={[0.06, 0.01, 0.12]} />
          <meshStandardMaterial color="#c8bca8" roughness={0.5} />
        </mesh>
      </group>

      {/* ===== Tower / gabinete with floppy ===== */}
      <group position={[-1.75, -0.1, 0.05]}>
        <mesh castShadow>
          <boxGeometry args={[0.55, 1.55, 1.4]} />
          <BeigeMat map={plastic} />
        </mesh>
        {/* Front panel */}
        <mesh position={[0, 0.02, 0.705]}>
          <boxGeometry args={[0.5, 1.4, 0.04]} />
          <BeigeMat map={plastic} color={BEIGE_DARK} />
        </mesh>

        {/* 5.25" bay (empty) */}
        <mesh position={[0, 0.48, 0.73]}>
          <boxGeometry args={[0.42, 0.16, 0.05]} />
          <meshStandardMaterial color="#1c1a16" roughness={0.55} metalness={0.25} />
        </mesh>
        <mesh position={[0.12, 0.48, 0.76]}>
          <boxGeometry args={[0.08, 0.04, 0.02]} />
          <meshStandardMaterial color="#3a3830" roughness={0.4} />
        </mesh>

        {/* 3.5" floppy drive */}
        <mesh position={[0, 0.28, 0.73]}>
          <boxGeometry args={[0.42, 0.12, 0.05]} />
          <meshStandardMaterial color="#2a2822" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Slot */}
        <mesh position={[0, 0.28, 0.76]}>
          <boxGeometry args={[0.34, 0.018, 0.02]} />
          <meshStandardMaterial color="#050504" roughness={0.9} />
        </mesh>
        {/* Floppy disk partially inserted */}
        <mesh position={[0.02, 0.28, 0.82]} castShadow>
          <boxGeometry args={[0.28, 0.01, 0.14]} />
          <meshStandardMaterial color="#2a5a9a" roughness={0.55} metalness={0.15} />
        </mesh>
        <mesh position={[-0.08, 0.286, 0.86]}>
          <boxGeometry args={[0.06, 0.004, 0.05]} />
          <meshStandardMaterial color="#c8c0b0" metalness={0.7} roughness={0.25} />
        </mesh>
        {/* Eject button */}
        <mesh position={[0.16, 0.28, 0.76]}>
          <boxGeometry args={[0.04, 0.04, 0.02]} />
          <meshStandardMaterial color="#4a4538" roughness={0.4} />
        </mesh>

        {/* CD bay below */}
        <mesh position={[0, 0.1, 0.73]}>
          <boxGeometry args={[0.42, 0.12, 0.05]} />
          <meshStandardMaterial color="#1c1a16" roughness={0.55} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.1, 0.76]}>
          <boxGeometry args={[0.3, 0.01, 0.015]} />
          <meshStandardMaterial color="#0a0a08" />
        </mesh>

        {/* Power / HDD LEDs */}
        <mesh position={[-0.14, -0.35, 0.74]}>
          <boxGeometry args={[0.07, 0.03, 0.02]} />
          <meshStandardMaterial color="#2cff4a" emissive="#2cff4a" emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.04, -0.35, 0.74]}>
          <boxGeometry args={[0.07, 0.03, 0.02]} />
          <meshStandardMaterial color="#ff4433" emissive="#ff4433" emissiveIntensity={1.4} />
        </mesh>
        {/* Power button */}
        <mesh position={[0.14, -0.35, 0.74]}>
          <boxGeometry args={[0.1, 0.06, 0.03]} />
          <meshStandardMaterial color="#3a3830" roughness={0.45} />
        </mesh>

        {/* Reset */}
        <mesh position={[0.14, -0.48, 0.74]}>
          <cylinderGeometry args={[0.025, 0.025, 0.03, 12]} />
          <meshStandardMaterial color="#5a5548" roughness={0.4} />
        </mesh>

        {/* Side vent */}
        <mesh position={[0.28, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.05, 1.15]} />
          <meshStandardMaterial map={vent} roughness={0.65} metalness={0.2} color={BEIGE_DARK} />
        </mesh>

        {/* Feet */}
        {[
          [-0.18, -0.2],
          [0.18, -0.2],
          [-0.18, 0.35],
          [0.18, 0.35],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, -0.8, z]}>
            <boxGeometry args={[0.08, 0.05, 0.08]} />
            <meshStandardMaterial color="#2a2820" roughness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
