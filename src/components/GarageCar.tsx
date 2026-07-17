import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import {
  ExtrudeGeometry,
  Shape,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from 'three'
import type { SectionId } from '../data/cv'

type Props = {
  hovered: SectionId | null
  active: SectionId | null
  onHover: (id: SectionId | null) => void
  onSelect: (id: SectionId) => void
  autoRotate: boolean
  focusY: number | null
}

const SILVER = '#b8bec8'
const SILVER_MID = '#9aa2ad'
const SILVER_DARK = '#7a838e'
const CARBON = '#2a2c31'
const BLACK = '#101214'
const GLASS = '#1a242e'
const GLASS_TINT = '#0c1218'

/** High-segment silver paint */
function SilverMat({ color = SILVER, roughness = 0.38 }: { color?: string; roughness?: number }) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={0.84}
      roughness={roughness}
      envMapIntensity={1.35}
    />
  )
}

function Hotspot({
  id,
  position,
  args,
  hovered,
  active,
  onHover,
  onSelect,
  label,
}: {
  id: SectionId
  position: [number, number, number]
  args: [number, number, number]
  hovered: SectionId | null
  active: SectionId | null
  onHover: (id: SectionId | null) => void
  onSelect: (id: SectionId) => void
  label: string
}) {
  const isLit = hovered === id || active === id
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
        color={isLit ? '#5ee7ff' : '#1a2233'}
        emissive={isLit ? '#5ee7ff' : '#000'}
        emissiveIntensity={isLit ? 1.1 : 0}
        transparent
        opacity={isLit ? 0.35 : 0.02}
        depthWrite={false}
      />
      {isLit && (
        <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              whiteSpace: 'nowrap',
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '11px',
              letterSpacing: '0.12em',
              color: '#5ee7ff',
              textShadow: '0 0 8px #5ee7ff',
              background: 'rgba(0,0,0,0.65)',
              padding: '4px 8px',
              border: '1px solid rgba(94,231,255,0.5)',
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </mesh>
  )
}

/** Dense wheel-arch ring (24 wedges) */
function WheelArch({
  position,
  side,
}: {
  position: [number, number, number]
  side: 1 | -1
}) {
  return (
    <group position={position}>
      {Array.from({ length: 24 }).map((_, i) => {
        const t = i / 23
        const ang = Math.PI * 0.08 + t * Math.PI * 0.84
        const r = 0.36
        const x = Math.cos(ang) * r
        const y = Math.sin(ang) * r * 0.92
        return (
          <mesh
            key={i}
            position={[x, y, side * 0.008]}
            rotation={[0, 0, ang - Math.PI / 2]}
            castShadow
          >
            <boxGeometry args={[0.085, 0.05, 0.09]} />
            <SilverMat color={SILVER_MID} roughness={0.4} />
          </mesh>
        )
      })}
      {/* Arch lip */}
      {Array.from({ length: 20 }).map((_, i) => {
        const t = i / 19
        const ang = Math.PI * 0.12 + t * Math.PI * 0.76
        const r = 0.4
        return (
          <mesh
            key={`lip-${i}`}
            position={[Math.cos(ang) * r, Math.sin(ang) * r * 0.9, side * 0.04]}
            rotation={[0, 0, ang - Math.PI / 2]}
          >
            <boxGeometry args={[0.06, 0.02, 0.025]} />
            <meshStandardMaterial color={SILVER_DARK} metalness={0.7} roughness={0.42} />
          </mesh>
        )
      })}
    </group>
  )
}

function Wheel({
  position,
  spinning,
}: {
  position: [number, number, number]
  spinning: boolean
}) {
  const spin = useRef<Group>(null)
  useFrame((_, d) => {
    if (spin.current && spinning) spin.current.rotation.y += d * 3.2
  })

  return (
    <group position={position}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.185, 0.185, 0.035, 48]} />
          <meshStandardMaterial color="#3a3a42" metalness={0.88} roughness={0.28} />
        </mesh>
        <mesh position={[0.015, 0.025, 0.095]}>
          <boxGeometry args={[0.15, 0.065, 0.085]} />
          <meshStandardMaterial color="#c8102e" metalness={0.45} roughness={0.4} />
        </mesh>
        <group ref={spin}>
          <mesh castShadow>
            <cylinderGeometry args={[0.305, 0.305, 0.235, 96]} />
            <meshStandardMaterial color="#08080a" roughness={0.95} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.275, 0.275, 0.24, 96]} />
            <meshStandardMaterial color="#141416" roughness={0.88} />
          </mesh>
          {/* Tread grooves */}
          {Array.from({ length: 36 }).map((_, i) => (
            <mesh key={i} rotation={[0, (i * Math.PI * 2) / 36, 0]} position={[0.29, 0, 0]}>
              <boxGeometry args={[0.025, 0.22, 0.012]} />
              <meshStandardMaterial color="#050506" roughness={1} />
            </mesh>
          ))}
          <mesh>
            <cylinderGeometry args={[0.215, 0.215, 0.248, 64]} />
            <meshStandardMaterial color="#2e3138" metalness={0.92} roughness={0.25} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.175, 0.175, 0.26, 64]} />
            <meshStandardMaterial color="#3c4048" metalness={0.94} roughness={0.2} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.275, 32]} />
            <meshStandardMaterial color="#1a1a1e" metalness={0.85} roughness={0.25} />
          </mesh>
          {Array.from({ length: 12 }).map((_, i) => (
            <group key={i} rotation={[0, (i * Math.PI * 2) / 12, 0]}>
              <mesh position={[0.095, 0, 0]}>
                <boxGeometry args={[0.155, 0.02, 0.036]} />
                <meshStandardMaterial color="#4a4e58" metalness={0.93} roughness={0.18} />
              </mesh>
              <mesh position={[0.095, 0, 0]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={[0.14, 0.012, 0.022]} />
                <meshStandardMaterial color="#5a5e68" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          ))}
          {Array.from({ length: 5 }).map((_, i) => {
            const a = (i * Math.PI * 2) / 5
            return (
              <mesh key={i} position={[Math.cos(a) * 0.038, 0.138, Math.sin(a) * 0.038]}>
                <cylinderGeometry args={[0.007, 0.007, 0.018, 10]} />
                <meshStandardMaterial color="#d0d4d8" metalness={0.96} roughness={0.12} />
              </mesh>
            )
          })}
        </group>
      </group>
    </group>
  )
}

/** Lateral body “Nagare” wave built from many slices */
function BodyWave({ side }: { side: 1 | -1 }) {
  return (
    <group>
      {Array.from({ length: 28 }).map((_, i) => {
        const t = i / 27
        const x = -0.75 + t * 1.55
        const y = 0.42 + Math.sin(t * Math.PI) * 0.06 + t * 0.04
        const z = side * (0.48 + Math.sin(t * Math.PI * 0.9) * 0.025)
        const h = 0.12 + Math.sin(t * Math.PI) * 0.04
        return (
          <mesh key={i} position={[x, y, z]} castShadow>
            <boxGeometry args={[0.065, h, 0.04]} />
            <SilverMat color={i % 2 ? SILVER : SILVER_MID} roughness={0.4} />
          </mesh>
        )
      })}
    </group>
  )
}

function DiffuserFin({ z }: { z: number }) {
  return (
    <group position={[-1.2, 0.14, z]}>
      <mesh rotation={[0.12, 0, 0]} castShadow>
        <boxGeometry args={[0.14, 0.13, 0.028]} />
        <meshStandardMaterial color="#141518" metalness={0.45} roughness={0.48} />
      </mesh>
      <mesh position={[0.02, -0.02, 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.1, 0.08, 0.018]} />
        <meshStandardMaterial color={CARBON} metalness={0.5} roughness={0.42} />
      </mesh>
    </group>
  )
}

function ExhaustTip({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.04, 0.044, 0.15, 48]} />
        <meshStandardMaterial color="#c8ccd2" metalness={0.96} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.13, 40]} />
        <meshStandardMaterial color="#1a1a1c" metalness={0.4} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <torusGeometry args={[0.038, 0.005, 12, 48]} />
        <meshStandardMaterial color="#e0e4e8" metalness={0.95} roughness={0.12} />
      </mesh>
    </group>
  )
}

/** Extruded smiling grille silhouette */
function FrontGrilleMesh() {
  const geo = useMemo(() => {
    const s = new Shape()
    s.moveTo(-0.38, 0)
    s.quadraticCurveTo(-0.4, 0.08, -0.32, 0.12)
    s.lineTo(0.32, 0.12)
    s.quadraticCurveTo(0.4, 0.08, 0.38, 0)
    s.quadraticCurveTo(0.35, -0.06, 0.28, -0.08)
    s.lineTo(-0.28, -0.08)
    s.quadraticCurveTo(-0.35, -0.06, -0.38, 0)
    return new ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 4, curveSegments: 32 })
  }, [])

  return (
    <mesh geometry={geo} position={[1.16, 0.24, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
      <meshStandardMaterial color="#080809" metalness={0.3} roughness={0.7} />
    </mesh>
  )
}

export function GarageCar({
  hovered,
  active,
  onHover,
  onSelect,
  autoRotate,
  focusY,
}: Props) {
  const group = useRef<Group>(null)
  const bodyRef = useRef<Mesh>(null)
  const [dragging, setDragging] = useState(false)
  const drag = useRef({ x: 0, rot: 0 })

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
    if (bodyRef.current) {
      const mat = bodyRef.current.material as MeshStandardMaterial
      mat.roughness = 0.38 + Math.sin(performance.now() * 0.0015) * 0.012
    }
  })

  const spinning = autoRotate && focusY === null && !dragging && !active

  return (
    <group
      ref={group}
      position={[0, 0.02, 0]}
      onPointerDown={(e) => {
        e.stopPropagation()
        setDragging(true)
        drag.current = { x: e.clientX, rot: group.current?.rotation.y ?? 0 }
      }}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
      onPointerMove={(e) => {
        if (!dragging || !group.current) return
        group.current.rotation.y = drag.current.rot + (e.clientX - drag.current.x) * 0.01
      }}
    >
      {/* ===== MAIN BODY: many stacked volumes for hatch wedge ===== */}
      {/* Lower chassis */}
      <RoundedBox
        ref={bodyRef}
        args={[1.95, 0.36, 0.98]}
        radius={0.11}
        smoothness={16}
        position={[0.02, 0.36, 0]}
        castShadow
        receiveShadow
      >
        <SilverMat />
      </RoundedBox>

      {/* Mid belt — rising wedge */}
      {Array.from({ length: 12 }).map((_, i) => {
        const t = i / 11
        const x = -0.85 + t * 1.75
        const y = 0.48 + t * 0.08
        const w = 0.16
        const h = 0.22 - t * 0.02
        const depth = 0.96 - t * 0.02
        return (
          <RoundedBox
            key={i}
            args={[w, h, depth]}
            radius={0.04}
            smoothness={10}
            position={[x, y, 0]}
            castShadow
          >
            <SilverMat color={t > 0.6 ? SILVER : SILVER_MID} roughness={0.4} />
          </RoundedBox>
        )
      })}

      {/* Nose */}
      <RoundedBox
        args={[0.4, 0.32, 0.94]}
        radius={0.09}
        smoothness={14}
        position={[1.05, 0.34, 0]}
        castShadow
      >
        <SilverMat />
      </RoundedBox>

      {/* Hood — layered for bulge */}
      <RoundedBox
        args={[0.8, 0.08, 0.88]}
        radius={0.05}
        smoothness={14}
        position={[0.58, 0.55, 0]}
        castShadow
      >
        <SilverMat roughness={0.36} />
      </RoundedBox>
      <RoundedBox
        args={[0.55, 0.045, 0.55]}
        radius={0.03}
        smoothness={12}
        position={[0.62, 0.6, 0]}
        castShadow
      >
        <SilverMat color={SILVER_MID} roughness={0.36} />
      </RoundedBox>
      {/* Hood center crease — dense strips */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[0.4 + i * 0.05, 0.625, 0]}>
          <boxGeometry args={[0.048, 0.006, 0.018]} />
          <meshStandardMaterial color={SILVER_DARK} metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      <FrontGrilleMesh />
      {/* Grille mesh bars */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} position={[1.19, 0.2 + i * 0.01, 0]}>
          <boxGeometry args={[0.025, 0.004, 0.7 - Math.abs(i - 7) * 0.02]} />
          <meshStandardMaterial color="#222226" metalness={0.55} roughness={0.45} />
        </mesh>
      ))}

      {/* Upper grille + black badge */}
      <RoundedBox args={[0.05, 0.065, 0.36]} radius={0.01} smoothness={6} position={[1.22, 0.43, 0]}>
        <meshStandardMaterial color={BLACK} metalness={0.55} roughness={0.5} />
      </RoundedBox>
      <mesh position={[1.25, 0.43, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.02, 48]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Splitter — multi piece */}
      <RoundedBox args={[0.3, 0.04, 1.04]} radius={0.012} smoothness={8} position={[1.16, 0.13, 0]}>
        <meshStandardMaterial color={CARBON} metalness={0.55} roughness={0.4} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.028, 0.98]} radius={0.008} smoothness={6} position={[1.28, 0.115, 0]}>
        <meshStandardMaterial color={BLACK} metalness={0.45} roughness={0.48} />
      </RoundedBox>
      {/* Splitter side wings */}
      <mesh position={[1.2, 0.13, 0.5]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.03, 0.06]} />
        <meshStandardMaterial color={CARBON} metalness={0.5} roughness={0.42} />
      </mesh>
      <mesh position={[1.2, 0.13, -0.5]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.2, 0.03, 0.06]} />
        <meshStandardMaterial color={CARBON} metalness={0.5} roughness={0.42} />
      </mesh>

      {/* Fog surrounds */}
      <mesh position={[1.12, 0.22, 0.4]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.055, 0.014, 16, 48]} />
        <meshStandardMaterial color={BLACK} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[1.12, 0.22, -0.4]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.055, 0.014, 16, 48]} />
        <meshStandardMaterial color={BLACK} metalness={0.5} roughness={0.4} />
      </mesh>

      {/* ===== CABIN / HATCH ===== */}
      <RoundedBox
        args={[1.05, 0.46, 0.92]}
        radius={0.1}
        smoothness={16}
        position={[-0.18, 0.72, 0]}
        castShadow
      >
        <SilverMat color={SILVER_MID} />
      </RoundedBox>
      <RoundedBox
        args={[0.78, 0.07, 0.82]}
        radius={0.04}
        smoothness={12}
        position={[-0.22, 0.98, 0]}
        castShadow
      >
        <SilverMat />
      </RoundedBox>

      {/* A / C pillars dense */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={i}>
          <mesh
            position={[0.3 - i * 0.02, 0.72 + i * 0.03, 0.4]}
            rotation={[0, 0, -0.38]}
            castShadow
          >
            <boxGeometry args={[0.06, 0.38, 0.035]} />
            <SilverMat color={SILVER_DARK} />
          </mesh>
          <mesh
            position={[0.3 - i * 0.02, 0.72 + i * 0.03, -0.4]}
            rotation={[0, 0, -0.38]}
            castShadow
          >
            <boxGeometry args={[0.06, 0.38, 0.035]} />
            <SilverMat color={SILVER_DARK} />
          </mesh>
        </group>
      ))}

      {/* Windshield — slight curve via stacked panes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          position={[0.34 - i * 0.012, 0.74 + i * 0.008, 0]}
          rotation={[0, 0, -0.4]}
          castShadow
        >
          <boxGeometry args={[0.5, 0.02, 0.84 - i * 0.01]} />
          <meshPhysicalMaterial
            color={GLASS}
            transparent
            opacity={0.22}
            roughness={0.04}
            metalness={0.1}
            transmission={0.45}
            thickness={0.2}
          />
        </mesh>
      ))}

      {/* Rear hatch glass — steep */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh
          key={i}
          position={[-0.55 - i * 0.025, 0.82 - i * 0.01, 0]}
          rotation={[0, 0, 0.52]}
          castShadow
        >
          <boxGeometry args={[0.5, 0.018, 0.84]} />
          <meshPhysicalMaterial
            color={GLASS_TINT}
            transparent
            opacity={0.35}
            roughness={0.08}
            transmission={0.15}
          />
        </mesh>
      ))}

      {/* Side windows */}
      <mesh position={[0.02, 0.75, 0.455]}>
        <boxGeometry args={[0.55, 0.28, 0.025]} />
        <meshPhysicalMaterial color={GLASS} transparent opacity={0.45} roughness={0.06} />
      </mesh>
      <mesh position={[0.02, 0.75, -0.455]}>
        <boxGeometry args={[0.55, 0.28, 0.025]} />
        <meshPhysicalMaterial color={GLASS} transparent opacity={0.45} roughness={0.06} />
      </mesh>
      <mesh position={[-0.42, 0.74, 0.455]}>
        <boxGeometry args={[0.36, 0.26, 0.025]} />
        <meshPhysicalMaterial color={GLASS_TINT} transparent opacity={0.72} roughness={0.1} />
      </mesh>
      <mesh position={[-0.42, 0.74, -0.455]}>
        <boxGeometry args={[0.36, 0.26, 0.025]} />
        <meshPhysicalMaterial color={GLASS_TINT} transparent opacity={0.72} roughness={0.1} />
      </mesh>

      <BodyWave side={1} />
      <BodyWave side={-1} />

      {/* Door decal plates */}
      <RoundedBox args={[0.5, 0.125, 0.014]} radius={0.01} smoothness={6} position={[0.06, 0.35, 0.505]}>
        <meshStandardMaterial color="#0c0c0e" roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.5, 0.125, 0.014]} radius={0.01} smoothness={6} position={[0.06, 0.35, -0.505]}>
        <meshStandardMaterial color="#0c0c0e" roughness={0.7} />
      </RoundedBox>

      {/* Side skirts — segmented */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = -0.7 + i * 0.12
        return (
          <group key={i}>
            <RoundedBox
              args={[0.115, 0.07, 0.07]}
              radius={0.012}
              smoothness={6}
              position={[x, 0.15, 0.52]}
            >
              <meshStandardMaterial color={CARBON} metalness={0.55} roughness={0.4} />
            </RoundedBox>
            <RoundedBox
              args={[0.115, 0.07, 0.07]}
              radius={0.012}
              smoothness={6}
              position={[x, 0.15, -0.52]}
            >
              <meshStandardMaterial color={CARBON} metalness={0.55} roughness={0.4} />
            </RoundedBox>
          </group>
        )
      })}

      <WheelArch position={[0.66, 0.28, 0.48]} side={1} />
      <WheelArch position={[0.66, 0.28, -0.48]} side={-1} />
      <WheelArch position={[-0.55, 0.28, 0.48]} side={1} />
      <WheelArch position={[-0.55, 0.28, -0.48]} side={-1} />

      {/* ===== REAR ===== */}
      <RoundedBox
        args={[0.42, 0.34, 0.96]}
        radius={0.08}
        smoothness={14}
        position={[-0.95, 0.36, 0]}
        castShadow
      >
        <SilverMat />
      </RoundedBox>

      {/* Diffuser base */}
      <RoundedBox args={[0.28, 0.15, 1.0]} radius={0.02} smoothness={8} position={[-1.15, 0.155, 0]}>
        <meshStandardMaterial color={CARBON} metalness={0.55} roughness={0.38} />
      </RoundedBox>
      {[-0.38, -0.27, -0.16, -0.05, 0.06, 0.17, 0.28, 0.38].map((z) => (
        <DiffuserFin key={z} z={z} />
      ))}

      {/* Multi-tier wing */}
      <RoundedBox
        args={[0.26, 0.038, 1.02]}
        radius={0.012}
        smoothness={8}
        position={[-0.7, 1.08, 0]}
        castShadow
      >
        <meshStandardMaterial color={BLACK} metalness={0.6} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.16, 0.028, 0.88]} radius={0.01} smoothness={6} position={[-0.78, 1.13, 0]}>
        <meshStandardMaterial color="#1a1a1e" metalness={0.55} roughness={0.32} />
      </RoundedBox>
      <RoundedBox args={[0.1, 0.02, 0.7]} radius={0.008} smoothness={5} position={[-0.82, 1.16, 0]}>
        <meshStandardMaterial color="#222" metalness={0.5} roughness={0.35} />
      </RoundedBox>
      {/* Stands — dense */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={i}>
          <RoundedBox
            args={[0.04, 0.22, 0.04]}
            radius={0.008}
            smoothness={4}
            position={[-0.66, 0.96, -0.28 + i * 0.14]}
          >
            <meshStandardMaterial color={BLACK} />
          </RoundedBox>
        </group>
      ))}
      {/* Endplates */}
      <mesh position={[-0.72, 1.1, 0.53]}>
        <boxGeometry args={[0.22, 0.14, 0.025]} />
        <meshStandardMaterial color={BLACK} metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[-0.72, 1.1, -0.53]}>
        <boxGeometry args={[0.22, 0.14, 0.025]} />
        <meshStandardMaterial color={BLACK} metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[-0.68, 1.02, 0]}>
        <boxGeometry args={[0.04, 0.022, 0.38]} />
        <meshStandardMaterial color="#ff2030" emissive="#ff1020" emissiveIntensity={1.8} />
      </mesh>

      {/* ===== LIGHTS (high segment) ===== */}
      {[0.35, -0.35].map((z) => (
        <group key={z} position={[1.2, 0.42, z]}>
          <RoundedBox args={[0.13, 0.16, 0.3]} radius={0.035} smoothness={10} castShadow>
            <meshStandardMaterial color="#181a1e" metalness={0.78} roughness={0.2} />
          </RoundedBox>
          <mesh position={[0.04, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.048, 0.055, 0.05, 48]} />
            <meshStandardMaterial
              color="#dce4f0"
              emissive="#c8d4e8"
              emissiveIntensity={0.9}
              metalness={0.9}
            />
          </mesh>
          {/* DRL eyebrow — many torus segments */}
          <mesh position={[0.055, 0.045, 0]} rotation={[z > 0 ? 0.2 : -0.2, 0, z > 0 ? -0.4 : 0.4]}>
            <torusGeometry args={[0.075, 0.011, 16, 64, Math.PI * 1.15]} />
            <meshStandardMaterial color="#f6f9ff" emissive="#eef4ff" emissiveIntensity={2.6} />
          </mesh>
        </group>
      ))}

      {/* Smoked tail rings */}
      {[0.34, -0.34].map((z) => (
        <group key={z} position={[-1.14, 0.44, z]}>
          <RoundedBox args={[0.075, 0.19, 0.32]} radius={0.028} smoothness={8}>
            <meshStandardMaterial color="#2a1014" emissive="#aa1428" emissiveIntensity={0.65} />
          </RoundedBox>
          <group rotation={[0, Math.PI / 2, 0]}>
            {[0.065, 0.042, 0.022].map((r, i) => (
              <mesh key={i}>
                <torusGeometry args={[r, 0.008, 12, 48]} />
                <meshStandardMaterial
                  color="#ff3048"
                  emissive="#ff2038"
                  emissiveIntensity={1.4 - i * 0.2}
                />
              </mesh>
            ))}
          </group>
        </group>
      ))}

      {/* Mirrors */}
      {[0.53, -0.53].map((z) => (
        <group key={z} position={[0.24, 0.64, z]}>
          <RoundedBox args={[0.14, 0.08, 0.16]} radius={0.025} smoothness={8}>
            <meshStandardMaterial color={BLACK} metalness={0.55} roughness={0.32} />
          </RoundedBox>
          <mesh position={[0, 0, z > 0 ? 0.07 : -0.07]}>
            <boxGeometry args={[0.09, 0.055, 0.01]} />
            <meshStandardMaterial color="#99aabb" metalness={0.95} roughness={0.08} />
          </mesh>
        </group>
      ))}

      {/* Plate */}
      <RoundedBox args={[0.02, 0.115, 0.36]} radius={0.008} smoothness={4} position={[1.25, 0.27, 0]}>
        <meshStandardMaterial color="#f0f0f0" />
      </RoundedBox>

      {/* Rear badge */}
      <mesh position={[-1.14, 0.56, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.018, 48]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.88} roughness={0.22} />
      </mesh>
      <mesh position={[-1.12, 0.42, 0.28]}>
        <boxGeometry args={[0.02, 0.04, 0.14]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.35} />
      </mesh>

      <ExhaustTip position={[-1.28, 0.14, -0.26]} />
      <ExhaustTip position={[-1.28, 0.14, -0.13]} />
      <ExhaustTip position={[-1.28, 0.14, 0.13]} />
      <ExhaustTip position={[-1.28, 0.14, 0.26]} />

      {/* Antenna */}
      <mesh position={[-0.4, 1.14, 0.14]} rotation={[0.2, 0, 0.1]}>
        <cylinderGeometry args={[0.007, 0.009, 0.22, 12]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>

      {/* Handles */}
      {[0.5, -0.5].map((z) => (
        <RoundedBox
          key={z}
          args={[0.085, 0.022, 0.028]}
          radius={0.006}
          smoothness={5}
          position={[0.12, 0.56, z]}
        >
          <meshStandardMaterial color={SILVER_DARK} metalness={0.88} roughness={0.22} />
        </RoundedBox>
      ))}

      <Wheel position={[0.66, 0.3, 0.54]} spinning={spinning} />
      <Wheel position={[0.66, 0.3, -0.54]} spinning={spinning} />
      <Wheel position={[-0.55, 0.3, 0.54]} spinning={spinning} />
      <Wheel position={[-0.55, 0.3, -0.54]} spinning={spinning} />

      <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.15, 64]} />
        <meshBasicMaterial color="#000" transparent opacity={0.14} />
      </mesh>

      <Hotspot id="perfil" label="PERFIL" position={[0.55, 0.58, 0]} args={[0.7, 0.16, 0.7]} hovered={hovered} active={active} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="habilidades" label="HABILIDADES" position={[0.0, 0.5, 0.51]} args={[0.95, 0.35, 0.12]} hovered={hovered} active={active} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="habilidades" label="HABILIDADES" position={[0.0, 0.5, -0.51]} args={[0.95, 0.35, 0.12]} hovered={hovered} active={active} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="experiencia" label="EXPERIENCIA" position={[-0.02, 0.15, 0]} args={[1.55, 0.1, 1.0]} hovered={hovered} active={active} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="proyectos" label="PROYECTOS" position={[0.66, 0.3, 0.54]} args={[0.4, 0.4, 0.4]} hovered={hovered} active={active} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="proyectos" label="PROYECTOS" position={[-0.55, 0.3, -0.54]} args={[0.4, 0.4, 0.4]} hovered={hovered} active={active} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="educacion" label="EDUCACIÓN" position={[-0.22, 1.0, 0]} args={[0.75, 0.1, 0.75]} hovered={hovered} active={active} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="certificaciones" label="CERTIFICACIONES" position={[-0.72, 1.12, 0]} args={[0.4, 0.18, 1.05]} hovered={hovered} active={active} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="perfiles" label="PERFILES" position={[1.2, 0.42, 0]} args={[0.2, 0.22, 0.9]} hovered={hovered} active={active} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="cv" label="CV" position={[1.25, 0.27, 0]} args={[0.1, 0.16, 0.4]} hovered={hovered} active={active} onHover={onHover} onSelect={onSelect} />
      <Hotspot id="contacto" label="CONTACTO" position={[-1.28, 0.14, 0]} args={[0.22, 0.12, 0.7]} hovered={hovered} active={active} onHover={onHover} onSelect={onSelect} />
    </group>
  )
}
