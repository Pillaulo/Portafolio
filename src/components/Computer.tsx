import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import {
  CanvasTexture,
  RepeatWrapping,
  type Mesh,
  type MeshStandardMaterial,
} from 'three'
import { PROFILE } from '../data/cv'

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

/** Softer CRT boot UI — less neon blast, still green phosphor. */
function makeScreenTexture(boot: boolean) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 384
  const ctx = c.getContext('2d')!

  // Deep CRT phosphor well (no bright center hotspot)
  const g = ctx.createRadialGradient(256, 200, 20, 256, 190, 280)
  g.addColorStop(0, boot ? '#0a1a12' : '#07140e')
  g.addColorStop(0.55, '#040c08')
  g.addColorStop(1, '#010403')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 384)

  // Scanlines
  for (let y = 0; y < 384; y += 2) {
    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.fillRect(0, y, 512, 1)
  }

  // Soft edge vignette
  const vig = ctx.createRadialGradient(256, 192, 120, 256, 192, 290)
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, 'rgba(0,0,0,0.55)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, 512, 384)

  // Warm phosphor wash (muted)
  ctx.fillStyle = 'rgba(70, 180, 90, 0.035)'
  ctx.fillRect(0, 0, 512, 384)

  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(90, 220, 120, 0.55)'

  if (!boot) {
    // Outer frame — rounded look via inset rects
    ctx.strokeStyle = 'rgba(90, 200, 120, 0.28)'
    ctx.lineWidth = 1.5
    roundRect(ctx, 42, 36, 428, 300, 10)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(90, 200, 120, 0.12)'
    ctx.lineWidth = 1
    roundRect(ctx, 54, 48, 404, 276, 6)
    ctx.stroke()

    // Tiny status bar top
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(110, 210, 140, 0.55)'
    ctx.font = '11px monospace'
    ctx.textAlign = 'left'
    ctx.fillText('SYS://PORTFOLIO', 68, 62)
    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(110, 210, 140, 0.4)'
    ctx.fillText('v1.0', 444, 62)

    // Divider
    ctx.strokeStyle = 'rgba(90, 200, 120, 0.2)'
    ctx.beginPath()
    ctx.moveTo(68, 72)
    ctx.lineTo(444, 72)
    ctx.stroke()

    // Identity — who this portfolio belongs to
    ctx.textAlign = 'center'
    ctx.shadowBlur = 10
    ctx.fillStyle = '#9af0b4'
    ctx.font = 'bold 26px monospace'
    ctx.fillText(PROFILE.shortName.toUpperCase(), 256, 118)

    ctx.shadowBlur = 3
    ctx.fillStyle = 'rgba(180, 235, 200, 0.85)'
    ctx.font = '13px monospace'
    ctx.fillText(PROFILE.title, 256, 144)

    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(140, 210, 160, 0.55)'
    ctx.font = '11px monospace'
    ctx.fillText('IA · Fullstack · Machine Learning', 256, 168)

    // Product line
    ctx.shadowBlur = 8
    ctx.fillStyle = '#7ae89a'
    ctx.font = 'bold 22px monospace'
    ctx.fillText('GARAGE OS', 256, 208)

    ctx.shadowBlur = 2
    ctx.fillStyle = 'rgba(170, 230, 190, 0.7)'
    ctx.font = '12px monospace'
    ctx.fillText('— interactive CV —', 256, 230)

    // CTA pill outline
    ctx.shadowBlur = 0
    ctx.strokeStyle = 'rgba(120, 220, 150, 0.45)'
    ctx.lineWidth = 1.5
    roundRect(ctx, 156, 250, 200, 34, 4)
    ctx.stroke()
    ctx.fillStyle = '#b8efc8'
    ctx.font = '13px monospace'
    ctx.shadowBlur = 3
    ctx.fillText('CLICK TO ENTER', 256, 272)

    // Footer
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(100, 190, 130, 0.45)'
    ctx.font = '11px monospace'
    ctx.fillText('IBM COMPATIBLE  ·  640×480  ·  READY', 256, 312)
  } else {
    ctx.shadowBlur = 8
    ctx.fillStyle = '#7ae89a'
    ctx.font = 'bold 28px monospace'
    ctx.fillText('ENTERING...', 256, 185)
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(140, 210, 160, 0.55)'
    ctx.font = '12px monospace'
    ctx.fillText('mounting /garage', 256, 220)
  }

  return new CanvasTexture(c)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
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
  const baseGlow = entered ? 0.35 : 0.85

  useFrame(({ clock }) => {
    if (!screen.current) return
    const mat = screen.current.material as MeshStandardMaterial
    mat.emissiveIntensity = baseGlow + Math.sin(clock.elapsedTime * 2.0) * 0.08
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
      {/* Desk */}
      <mesh position={[-0.25, -0.86, 0.15]} receiveShadow castShadow>
        <boxGeometry args={[4.5, 0.12, 2.2]} />
        <meshStandardMaterial map={wood} color="#a88460" roughness={0.75} metalness={0.04} />
      </mesh>
      <mesh position={[-0.25, -0.795, 1.22]}>
        <boxGeometry args={[4.4, 0.02, 0.04]} />
        <meshStandardMaterial color={DESK} roughness={0.6} />
      </mesh>

      {/* ===== CRT monitor — softened edges ===== */}
      <group position={[0.15, 0.15, -0.05]}>
        {/* Main chassis */}
        <RoundedBox
          args={[1.95, 1.75, 1.7]}
          radius={0.08}
          smoothness={6}
          position={[0, 0.35, 0]}
          castShadow
          {...enterHandlers}
        >
          <BeigeMat map={plastic} />
        </RoundedBox>

        {/* Soft top crown */}
        <RoundedBox
          args={[1.88, 0.1, 1.35]}
          radius={0.04}
          smoothness={5}
          position={[0, 1.18, 0.12]}
          castShadow
        >
          <BeigeMat map={plastic} color={BEIGE_DARK} />
        </RoundedBox>

        {/* Front face plate */}
        <RoundedBox
          args={[1.86, 1.52, 0.07]}
          radius={0.045}
          smoothness={5}
          position={[0, 0.38, 0.86]}
          castShadow
        >
          <BeigeMat map={plastic} color={BEIGE_LIGHT} />
        </RoundedBox>

        {/* Bezel with soft corners */}
        <RoundedBox args={[1.62, 1.22, 0.1]} radius={0.05} smoothness={5} position={[0, 0.48, 0.91]}>
          <meshStandardMaterial color={BEZEL} roughness={0.85} metalness={0.05} />
        </RoundedBox>

        {/* Inner recess */}
        <RoundedBox args={[1.48, 1.1, 0.04]} radius={0.03} smoothness={4} position={[0, 0.48, 0.96]}>
          <meshStandardMaterial color="#0a0a08" roughness={0.95} />
        </RoundedBox>

        {/* Screen — slight curve via thin rounded plane proxy */}
        <mesh ref={screen} position={[0, 0.48, 0.99]} {...enterHandlers}>
          <planeGeometry args={[1.36, 1.0]} />
          <meshStandardMaterial
            map={screenTex}
            emissiveMap={screenTex}
            emissive="#6ecf88"
            emissiveIntensity={baseGlow}
            roughness={0.4}
            metalness={0.02}
            toneMapped={false}
          />
        </mesh>

        {/* Soft glass glare (offset, faint) */}
        <mesh position={[0.22, 0.62, 1.005]}>
          <planeGeometry args={[0.38, 0.5]} />
          <meshBasicMaterial color="#fff8e8" transparent opacity={0.045} depthWrite={false} />
        </mesh>

        {/* Control strip */}
        <RoundedBox
          args={[1.68, 0.15, 0.06]}
          radius={0.025}
          smoothness={4}
          position={[0, -0.22, 0.92]}
        >
          <BeigeMat map={plastic} color={BEIGE_DARK} />
        </RoundedBox>

        {/* Power LED pill */}
        <RoundedBox args={[0.14, 0.055, 0.03]} radius={0.012} smoothness={3} position={[-0.55, -0.22, 0.96]}>
          <meshStandardMaterial color="#2a2820" roughness={0.5} />
        </RoundedBox>
        <mesh position={[-0.55, -0.22, 0.98]}>
          <boxGeometry args={[0.05, 0.02, 0.01]} />
          <meshStandardMaterial color="#3cff4a" emissive="#3cff4a" emissiveIntensity={1.8} />
        </mesh>

        {[0.35, 0.52, 0.69].map((x) => (
          <mesh key={x} position={[x, -0.22, 0.97]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.03, 20]} />
            <meshStandardMaterial color="#4a4538" roughness={0.4} metalness={0.35} />
          </mesh>
        ))}

        <RoundedBox args={[0.28, 0.05, 0.01]} radius={0.01} smoothness={3} position={[0.55, -0.22, 0.955]}>
          <meshStandardMaterial color="#c4b89a" metalness={0.55} roughness={0.35} />
        </RoundedBox>

        {/* Side vents */}
        <mesh position={[0.98, 0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.15, 1.1]} />
          <meshStandardMaterial map={vent} roughness={0.7} metalness={0.15} color={BEIGE_DARK} />
        </mesh>
        <mesh position={[-0.98, 0.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.15, 1.1]} />
          <meshStandardMaterial map={vent} roughness={0.7} metalness={0.15} color={BEIGE_DARK} />
        </mesh>

        {/* Rear bulge — rounded */}
        <RoundedBox
          args={[1.68, 1.4, 0.55]}
          radius={0.07}
          smoothness={5}
          position={[0, 0.35, -0.55]}
          castShadow
        >
          <BeigeMat map={plastic} color={BEIGE_DARK} />
        </RoundedBox>

        {/* Neck + base */}
        <RoundedBox
          args={[0.65, 0.2, 0.5]}
          radius={0.04}
          smoothness={4}
          position={[0, -0.62, 0.1]}
          castShadow
        >
          <BeigeMat map={plastic} color={BEIGE_DARK} />
        </RoundedBox>
        <RoundedBox
          args={[1.12, 0.07, 0.82]}
          radius={0.03}
          smoothness={4}
          position={[0, -0.78, 0.25]}
          castShadow
        >
          <BeigeMat map={plastic} />
        </RoundedBox>
      </group>

      {/* Keyboard + mouse */}
      <group position={[0.15, -0.8, 0.95]}>
        <RoundedBox args={[1.55, 0.055, 0.52]} radius={0.02} smoothness={4} position={[0, 0.028, 0]} castShadow>
          <BeigeMat map={plastic} />
        </RoundedBox>
        <RoundedBox args={[1.55, 0.02, 0.03]} radius={0.008} smoothness={3} position={[0, 0.018, 0.245]}>
          <BeigeMat map={plastic} color={BEIGE_DARK} />
        </RoundedBox>

        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 13 }).map((_, col) => {
            const isSpace = row === 4 && col >= 4 && col <= 8
            if (row === 4 && col > 4 && col < 8) return null
            return (
              <RoundedBox
                key={`${row}-${col}`}
                args={[isSpace ? 0.52 : 0.095, 0.02, 0.068]}
                radius={0.006}
                smoothness={3}
                position={[
                  isSpace ? 0 : -0.66 + col * 0.11,
                  0.068,
                  -0.16 + row * 0.08,
                ]}
              >
                <meshStandardMaterial
                  color={isSpace ? '#d8cdb8' : '#f2ebe0'}
                  roughness={0.42}
                />
              </RoundedBox>
            )
          }),
        )}

        {/* Mouse — oval-ish via rounded box */}
        <RoundedBox
          args={[0.2, 0.045, 0.3]}
          radius={0.035}
          smoothness={6}
          position={[1.05, 0.028, 0.02]}
          castShadow
        >
          <BeigeMat map={plastic} color={BEIGE_LIGHT} />
        </RoundedBox>
        <RoundedBox args={[0.055, 0.01, 0.11]} radius={0.004} smoothness={3} position={[1.05, 0.052, -0.02]}>
          <meshStandardMaterial color="#c8bca8" roughness={0.5} />
        </RoundedBox>
      </group>

      {/* ===== Tower ===== */}
      <group position={[-1.75, -0.1, 0.05]}>
        <RoundedBox args={[0.55, 1.55, 1.4]} radius={0.045} smoothness={5} castShadow>
          <BeigeMat map={plastic} />
        </RoundedBox>

        <RoundedBox args={[0.5, 1.4, 0.04]} radius={0.02} smoothness={4} position={[0, 0.02, 0.705]}>
          <BeigeMat map={plastic} color={BEIGE_DARK} />
        </RoundedBox>

        {/* 5.25" bay */}
        <RoundedBox args={[0.42, 0.16, 0.05]} radius={0.012} smoothness={3} position={[0, 0.48, 0.73]}>
          <meshStandardMaterial color="#1c1a16" roughness={0.55} metalness={0.25} />
        </RoundedBox>
        <mesh position={[0.12, 0.48, 0.76]}>
          <boxGeometry args={[0.08, 0.04, 0.02]} />
          <meshStandardMaterial color="#3a3830" roughness={0.4} />
        </mesh>

        {/* 3.5" floppy */}
        <RoundedBox args={[0.42, 0.12, 0.05]} radius={0.01} smoothness={3} position={[0, 0.28, 0.73]}>
          <meshStandardMaterial color="#2a2822" roughness={0.5} metalness={0.3} />
        </RoundedBox>
        <mesh position={[0, 0.28, 0.76]}>
          <boxGeometry args={[0.34, 0.018, 0.02]} />
          <meshStandardMaterial color="#050504" roughness={0.9} />
        </mesh>
        <RoundedBox args={[0.28, 0.01, 0.14]} radius={0.004} smoothness={3} position={[0.02, 0.28, 0.82]} castShadow>
          <meshStandardMaterial color="#2a5a9a" roughness={0.55} metalness={0.15} />
        </RoundedBox>
        <mesh position={[-0.08, 0.286, 0.86]}>
          <boxGeometry args={[0.06, 0.004, 0.05]} />
          <meshStandardMaterial color="#c8c0b0" metalness={0.7} roughness={0.25} />
        </mesh>
        <mesh position={[0.16, 0.28, 0.76]}>
          <boxGeometry args={[0.04, 0.04, 0.02]} />
          <meshStandardMaterial color="#4a4538" roughness={0.4} />
        </mesh>

        {/* CD bay */}
        <RoundedBox args={[0.42, 0.12, 0.05]} radius={0.01} smoothness={3} position={[0, 0.1, 0.73]}>
          <meshStandardMaterial color="#1c1a16" roughness={0.55} metalness={0.25} />
        </RoundedBox>
        <mesh position={[0, 0.1, 0.76]}>
          <boxGeometry args={[0.3, 0.01, 0.015]} />
          <meshStandardMaterial color="#0a0a08" />
        </mesh>

        {/* LEDs */}
        <mesh position={[-0.14, -0.35, 0.74]}>
          <boxGeometry args={[0.07, 0.03, 0.02]} />
          <meshStandardMaterial color="#2cff4a" emissive="#2cff4a" emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.04, -0.35, 0.74]}>
          <boxGeometry args={[0.07, 0.03, 0.02]} />
          <meshStandardMaterial color="#ff4433" emissive="#ff4433" emissiveIntensity={1.4} />
        </mesh>
        <RoundedBox args={[0.1, 0.06, 0.03]} radius={0.01} smoothness={3} position={[0.14, -0.35, 0.74]}>
          <meshStandardMaterial color="#3a3830" roughness={0.45} />
        </RoundedBox>
        <mesh position={[0.14, -0.48, 0.74]}>
          <cylinderGeometry args={[0.025, 0.025, 0.03, 12]} />
          <meshStandardMaterial color="#5a5548" roughness={0.4} />
        </mesh>

        <mesh position={[0.28, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.05, 1.15]} />
          <meshStandardMaterial map={vent} roughness={0.65} metalness={0.2} color={BEIGE_DARK} />
        </mesh>

        {[
          [-0.18, -0.2],
          [0.18, -0.2],
          [-0.18, 0.35],
          [0.18, 0.35],
        ].map(([x, z]) => (
          <RoundedBox key={`${x}${z}`} args={[0.08, 0.05, 0.08]} radius={0.012} smoothness={3} position={[x, -0.8, z]}>
            <meshStandardMaterial color="#2a2820" roughness={0.8} />
          </RoundedBox>
        ))}
      </group>
    </group>
  )
}
