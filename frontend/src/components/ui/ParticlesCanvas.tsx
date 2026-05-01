'use client'
import { useEffect, useRef } from 'react'

export function ParticlesCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cvs = ref.current!
    const ctx = cvs.getContext('2d')!
    let animId: number

    const resize = () => { cvs.width = innerWidth; cvs.height = innerHeight; }
    resize()
    window.addEventListener('resize', resize)

    const mk = () => ({
      x: Math.random() * cvs.width,
      y: Math.random() * cvs.height,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - .5) * .25,
      vy: (Math.random() - .5) * .25,
      a: Math.random() * .4 + .08,
      c: Math.random() > .75 ? '#E8190A' : '#fff',
    })

    const pts = Array.from({ length: 140 }, mk)

    const draw = () => {
      ctx.clearRect(0, 0, cvs.width, cvs.height)
      pts.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.c
        ctx.globalAlpha = p.a
        ctx.fill()
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > cvs.width || p.y < 0 || p.y > cvs.height) Object.assign(p, mk())
      })
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-0 opacity-40" />
}
