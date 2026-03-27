'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  // ── Canvas symbiote animation ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 300
    const H = 300
    canvas.width = W
    canvas.height = H
    const cx = W / 2
    const cy = H / 2
    const R = 142 // clipping radius

    // Symbiote particle system
    const particles = Array.from({ length: 22 }, (_, i) => {
      const angle = (i / 22) * Math.PI * 2
      const orbit = 20 + Math.random() * 95
      return {
        x: cx + Math.cos(angle) * orbit,
        y: cy + Math.sin(angle) * orbit,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        baseSize: 28 + Math.random() * 72,
        sizeFreq: 0.018 + Math.random() * 0.025,
        sizePhase: Math.random() * Math.PI * 2,
        hue: 255 + Math.random() * 50,          // purple 255-305
        sat: 70 + Math.random() * 30,
        light: 18 + Math.random() * 55,
        alpha: 0.45 + Math.random() * 0.55,
        turbX: Math.random() * 1000,
        turbY: Math.random() * 1000,
      }
    })

    // A few bright "hot" particles for the white-core effect
    const hotParticles = Array.from({ length: 5 }, () => ({
      x: cx + (Math.random() - 0.5) * 60,
      y: cy + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: 20 + Math.random() * 40,
    }))

    let t = 0

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // ── Clip to circle ──────────────────────────────────────────────────────
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.clip()

      // Dark void base
      ctx.fillStyle = '#030008'
      ctx.fillRect(0, 0, W, H)

      // ── Symbiote particles ─────────────────────────────────────────────────
      ctx.globalCompositeOperation = 'screen'

      particles.forEach(p => {
        // Pseudo-turbulence: layered sines create organic drift
        const nx = Math.sin(p.turbX * 0.008 + t * 0.004) * Math.cos(p.turbY * 0.006 + t * 0.003)
        const ny = Math.cos(p.turbX * 0.007 + t * 0.005) * Math.sin(p.turbY * 0.009 + t * 0.002)

        // Soft attraction toward center
        const dx = cx - p.x
        const dy = cy - p.y
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01

        p.vx += (dx / dist) * 0.04 + nx * 0.35
        p.vy += (dy / dist) * 0.04 + ny * 0.35
        p.vx *= 0.94
        p.vy *= 0.94
        p.x += p.vx
        p.y += p.vy
        p.turbX += 0.8
        p.turbY += 0.7

        // Keep inside sphere loosely
        if (dist > R * 0.9) {
          p.vx -= (p.x - cx) * 0.003
          p.vy -= (p.y - cy) * 0.003
        }

        const s = p.baseSize * (1 + 0.35 * Math.sin(t * p.sizeFreq + p.sizePhase))

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s)
        grad.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${p.alpha})`)
        grad.addColorStop(0.5, `hsla(${p.hue + 20}, ${p.sat}%, ${p.light * 0.6}%, ${p.alpha * 0.5})`)
        grad.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      })

      // ── Hot white-core blobs (the bright internal light) ───────────────────
      hotParticles.forEach(p => {
        const dx = cx - p.x
        const dy = cy - p.y
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01
        p.vx += (dx / dist) * 0.06 + (Math.random() - 0.5) * 0.25
        p.vy += (dy / dist) * 0.06 + (Math.random() - 0.5) * 0.25
        p.vx *= 0.92
        p.vy *= 0.92
        p.x += p.vx
        p.y += p.vy

        const pulse = 1 + 0.4 * Math.sin(t * 0.03 + p.x)
        const s = p.size * pulse

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s)
        grad.addColorStop(0, `rgba(255, 245, 255, 0.9)`)
        grad.addColorStop(0.3, `rgba(200, 140, 255, 0.5)`)
        grad.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      })

      // ── Central pulsing glow ───────────────────────────────────────────────
      const corePulse = 0.6 + 0.4 * Math.sin(t * 0.018)
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90 * corePulse)
      coreGrad.addColorStop(0, `rgba(220, 180, 255, ${0.25 * corePulse})`)
      coreGrad.addColorStop(0.4, `rgba(140, 80, 255, ${0.12 * corePulse})`)
      coreGrad.addColorStop(1, 'transparent')
      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = coreGrad
      ctx.fillRect(0, 0, W, H)

      // ── Depth darkening at edges (sphere illusion) ─────────────────────────
      ctx.globalCompositeOperation = 'multiply'
      const edgeGrad = ctx.createRadialGradient(cx, cy, R * 0.45, cx, cy, R)
      edgeGrad.addColorStop(0, 'transparent')
      edgeGrad.addColorStop(1, 'rgba(2, 0, 8, 0.88)')
      ctx.fillStyle = edgeGrad
      ctx.fillRect(0, 0, W, H)

      ctx.restore() // end clip

      // ── Specular highlight on the glass surface (outside clip) ────────────
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.clip()
      const spec = ctx.createRadialGradient(cx - 55, cy - 58, 0, cx - 55, cy - 58, 90)
      spec.addColorStop(0, 'rgba(255, 255, 255, 0.28)')
      spec.addColorStop(0.4, 'rgba(220, 200, 255, 0.08)')
      spec.addColorStop(1, 'transparent')
      ctx.fillStyle = spec
      ctx.fillRect(0, 0, W, H)
      // Thin rim light on bottom-right
      const rimSpec = ctx.createRadialGradient(cx + 70, cy + 75, 0, cx + 70, cy + 75, 50)
      rimSpec.addColorStop(0, 'rgba(180, 140, 255, 0.18)')
      rimSpec.addColorStop(1, 'transparent')
      ctx.fillStyle = rimSpec
      ctx.fillRect(0, 0, W, H)
      ctx.restore()

      t++
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  // ── Mouse tilt ─────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2)
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2)
    setTilt({ x: dy * -18, y: dx * 18 })
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
      {/* Autonomous float (outer) — tilt transform lives on inner div to avoid conflict */}
      <div className="symbiote-float" style={{ position: 'relative' }}>
      {/* Mouse tilt (inner) */}
      <div
        style={{
          position: 'relative',
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: hovered
            ? 'transform 0.08s ease-out'
            : 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Outer ambient glow */}
        <div
          style={{
            position: 'absolute',
            inset: -36,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 0,
            boxShadow: hovered
              ? `0 0 130px 45px rgba(130, 60, 255, 0.45),
                 0 0 70px 25px rgba(200, 140, 255, 0.3),
                 0 0 260px 80px rgba(100, 30, 200, 0.15)`
              : `0 0 90px 30px rgba(130, 60, 255, 0.28),
                 0 0 50px 16px rgba(200, 140, 255, 0.18),
                 0 0 180px 60px rgba(100, 30, 200, 0.1)`,
            transition: 'box-shadow 0.6s ease',
          }}
        />

        {/* Morphing blob + canvas */}
        <div
          className="symbiote-blob"
          style={{
            width: 300,
            height: 300,
            position: 'relative',
            overflow: 'hidden',
            zIndex: 1,
            boxShadow: `
              inset 0 0 0 1px rgba(180, 140, 255, 0.15),
              0 0 0 1px rgba(130, 60, 255, 0.08)
            `,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, display: 'block' }}
          />
        </div>

        {/* Pulse rings */}
        <div className="orb-pulse-ring" style={{ '--orb-ring-delay': '0s', borderColor: 'rgba(150, 80, 255, 0.35)' } as React.CSSProperties} />
        <div className="orb-pulse-ring" style={{ '--orb-ring-delay': '1s', borderColor: 'rgba(180, 120, 255, 0.2)' } as React.CSSProperties} />
        <div className="orb-pulse-ring" style={{ '--orb-ring-delay': '2s', borderColor: 'rgba(130, 60, 255, 0.15)' } as React.CSSProperties} />
      </div>
      </div>

      {/* Labels */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            color: 'rgba(180, 130, 255, 0.65)',
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
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          {sublabel}
        </div>
      </div>
    </div>
  )
}
