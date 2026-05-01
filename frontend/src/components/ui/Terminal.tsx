'use client'
import { useEffect, useRef } from 'react'
import { TERMINAL_LINES } from '@/lib/constants'

export function Terminal() {
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    async function runTerm() {
      const body = bodyRef.current
      if (!body) return
      body.innerHTML = ''
      await sleep(1000)

      for (const line of TERMINAL_LINES) {
        if (cancelled) return
        await renderLine(body, line)
        await sleep(line.type === 'cmd' ? 450 : 50)
      }
      await sleep(6000)
      if (!cancelled) runTerm()
    }
    runTerm()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="relative w-full max-w-[740px] mx-auto mt-12 z-10">
      {/* Glow ring */}
      <div className="absolute -inset-[3px] rounded-[18px] term-glow-ring opacity-0 blur-[16px] -z-10 animate-glow" />

      <div className="bg-[#080B10] border border-red/25 rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)]">
        {/* Bar */}
        <div className="flex items-center gap-2 px-5 py-3.5 bg-white/[0.025] border-b border-white/5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          <span className="ml-2 font-mono text-xs text-muted">openspace — terminal</span>
          <div className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-[#28C840]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#28C840] animate-pulse-dot" />
            Connecté
          </div>
        </div>
        {/* Body */}
        <div
          ref={bodyRef}
          className="p-6 font-mono text-[13px] leading-[1.9] min-h-[240px] overflow-hidden"
        />
      </div>
    </div>
  )
}

/* ─── helpers ─── */
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

type TerminalLine = {
  type: string
  text?: string
  duration?: number
}

async function renderLine(body: HTMLDivElement, line: TerminalLine) {
  if (line.type === 'sp') {
    const el = document.createElement('div')
    el.style.cssText = 'height:8px;opacity:1'
    body.appendChild(el); return
  }

  if (line.type === 'cur') {
    const el = document.createElement('div')
    el.className = 'flex gap-2 opacity-100'
    el.innerHTML = `<span style="color:#E8190A;font-weight:700;margin-right:8px">$</span><span style="display:inline-block;width:8px;height:15px;background:#E8190A;margin-left:2px;vertical-align:middle;animation:cursorBlink 1s step-end infinite"></span>`
    body.appendChild(el); return
  }

  if (line.type === 'prog') {
    const id = 'pf' + Math.random().toString(36).slice(2)
    const el = document.createElement('div')
    el.className = 'flex items-center gap-3'
    el.innerHTML = `
      <div style="width:160px;height:3px;background:#2A3347;border-radius:2px;overflow:hidden">
        <div id="${id}" style="height:100%;background:linear-gradient(90deg,#E8190A,#FF8C42);border-radius:2px;width:0;transition:width 0.9s ease"></div>
      </div>
      <span style="font-size:11px;color:#8B95A8">${line.text || ''}</span>`
    body.appendChild(el)
    await sleep(80)
    const fill = document.getElementById(id)
    if (fill) fill.style.width = '100%'
    await sleep((line.duration || 0) + 100)
    return
  }

  const colorMap: Record<string, string> = {
    cmd: '#F0F4FF', ok: '#28C840', info: '#8B95A8', url: '#FFB347'
  }

  const el = document.createElement('div')
  el.className = 'flex opacity-0 translate-y-1 transition-all duration-200'
  body.appendChild(el)
  await sleep(60)
  el.style.opacity = '1'; el.style.transform = 'translateY(0)'

  if (line.type === 'cmd') {
    el.innerHTML = `<span style="color:#E8190A;font-weight:700;margin-right:8px;flex-shrink:0">$</span><span style="color:#F0F4FF"></span>`
  } else {
    el.innerHTML = `<span style="color:${colorMap[line.type] || '#8B95A8'}"></span>`
  }

  const span = el.querySelector('span:last-child') as HTMLElement
  const speed = line.type === 'cmd' ? 26 : 6
  const text = line.text || ''

  await new Promise<void>(res => {
    let i = 0
    function wr() {
      if (i < text.length) {
        span.textContent += text[i++]
        body.scrollTop = body.scrollHeight
        setTimeout(wr, speed + Math.random() * 8)
      } else {
        setTimeout(res, line.type === 'cmd' ? 350 : 80)
      }
    }
    wr()
  })
}
