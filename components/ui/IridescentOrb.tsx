'use client'

import { useRef, useState, useCallback } from 'react'

interface IridescentOrbProps {
  producerCount?: number
  label?: string
  sublabel?: string
}

export function IridescentOrb({
  producerCount = 2847,
  label = 'Producer Database',
  sublabel = 'indexed writers',
}: IridescentOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = (e.clientX - cx) / (r.width / 2)
    const dy = (e.clientY - cy) / (r.height / 2)
    setTilt({ x: dy * -22, y: dx * 22 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
    setHovered(false)
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
        perspective: '1200px',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {/* 3D tilt wrapper */}
      <div
        style={{
          position: 'relative',
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: hovered
            ? 'transform 0.08s ease-out'
            : 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Ambient outer glow */}
        <div
          style={{
            position: 'absolute',
            inset: -32,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 0,
            boxShadow: hovered
              ? `0 0 120px 35px rgba(155, 126, 248, 0.32),
                 0 0 60px 20px rgba(78, 205, 196, 0.22),
                 0 0 220px 70px rgba(155, 126, 248, 0.12)`
              : `0 0 80px 22px rgba(155, 126, 248, 0.2),
                 0 0 44px 12px rgba(78, 205, 196, 0.12),
                 0 0 140px 50px rgba(155, 126, 248, 0.07)`,
            transition: 'box-shadow 0.5s ease',
          }}
        />

        {/* Orb sphere */}
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: '50%',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 1,
            boxShadow: `
              inset 0 -24px 48px rgba(0, 0, 0, 0.55),
              inset 0 24px 48px rgba(255, 255, 255, 0.04),
              0 24px 72px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(255, 255, 255, 0.07)
            `,
          }}
        >
          {/* Rotating iridescent base — oversized so rotation doesn't clip */}
          <div
            className="orb-iridescent"
            style={{
              position: 'absolute',
              inset: '-40%',
              background: `conic-gradient(
                from 0deg at 50% 50%,
                #ff6b9d 0deg,
                #ff9f43 50deg,
                #ffd93d 95deg,
                #a8edea 135deg,
                #4ecdc4 175deg,
                #6c63ff 215deg,
                #9b7ef8 255deg,
                #c77dff 290deg,
                #f15bb5 325deg,
                #ff6b9d 360deg
              )`,
            }}
          />

          {/* Sphere depth shading — darkens edges for 3D look */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: `radial-gradient(
                circle at 50% 50%,
                transparent 22%,
                rgba(9, 9, 15, 0.38) 60%,
                rgba(9, 9, 15, 0.72) 100%
              )`,
            }}
          />

          {/* Primary specular highlight (upper-left) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: `radial-gradient(
                circle at 30% 26%,
                rgba(255, 255, 255, 0.48) 0%,
                rgba(255, 255, 255, 0.16) 18%,
                transparent 48%
              )`,
            }}
          />

          {/* Secondary purple-teal reflection (lower-right) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: `radial-gradient(
                circle at 70% 74%,
                rgba(155, 126, 248, 0.22) 0%,
                rgba(78, 205, 196, 0.1) 30%,
                transparent 55%
              )`,
            }}
          />

          {/* Thin edge rim light */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
          />
        </div>

        {/* Pulse rings */}
        <div
          className="orb-pulse-ring"
          style={{ '--orb-ring-delay': '0s' } as React.CSSProperties}
        />
        <div
          className="orb-pulse-ring"
          style={{ '--orb-ring-delay': '1.1s' } as React.CSSProperties}
        />
        <div
          className="orb-pulse-ring"
          style={{ '--orb-ring-delay': '2.2s' } as React.CSSProperties}
        />
      </div>

      {/* Labels */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            color: 'rgba(155, 126, 248, 0.65)',
            marginBottom: 7,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'rgba(255, 255, 255, 0.96)',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {producerCount.toLocaleString()}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            marginTop: 6,
            fontWeight: 400,
          }}
        >
          {sublabel}
        </div>
      </div>
    </div>
  )
}
