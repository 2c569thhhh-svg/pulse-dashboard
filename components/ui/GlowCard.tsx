'use client'

import { useRef, MouseEvent, CSSProperties, ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

export function GlowCard({ children, className = '', style, onClick }: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  const handleMouseLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--mouse-x', '-500px')
    el.style.setProperty('--mouse-y', '-500px')
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`glow-card ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
