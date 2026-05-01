'use client'

import { useEffect, useRef } from 'react'

interface TerminalLine {
  t: 'cmd' | 's' | 'i' | 'u' | 'sp' | 'prog' | 'cur'
  s?: string
  label?: string
  d?: number
}

const terminalLines: TerminalLine[] = [
  { t: 'cmd', s: 'openspace login --user openspace@aurora.cm' },
  { t: 's', s: 'Authentifié · openspace@aurora.cm' },
  { t: 'sp' },
  { t: 'cmd', s: 'openspace create --plan dev --name my-saas' },
  { t: 'i', s: '  Provisioning du container...' },
  { t: 'prog', label: 'Container', d: 1000 },
  { t: 's', s: 'Container démarré (512Mo RAM · 1 vCPU · 10Go)' },
  { t: 'i', s: '  Configuration SSL...' },
  { t: 'prog', label: 'SSL', d: 700 },
  { t: 's', s: 'Certificat HTTPS activé' },
  { t: 's', s: 'DNS propagé en 23ms' },
  { t: 'sp' },
  { t: 'u', s: 'https://my-saas.openspace.cm' },
  { t: 'sp' },
  { t: 'cur' },
]

export function Terminal() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const runTerminal = async () => {
      if (!bodyRef.current) return
      bodyRef.current.innerHTML = ''
      await new Promise(r => setTimeout(r, 1000))

      for (const line of terminalLines) {
        await mkLine(line)
        await new Promise(r => setTimeout(r, line.t === 'cmd' ? 450 : 50))
      }

      setTimeout(runTerminal, 6000)
    }

    const mkLine = async (data: TerminalLine): Promise<void> => {
      if (!bodyRef.current) return

      return new Promise<void>(resolve => {
        setTimeout(() => {
          if (data.t === 'sp') {
            const div = document.createElement('div')
            div.className = 'h-2'
            bodyRef.current?.appendChild(div)
            resolve()
            return
          }

          if (data.t === 'cur') {
            const div = document.createElement('div')
            div.className = 'flex gap-0 opacity-100'
            div.innerHTML = `
              <span class="text-[#E8190A] font-bold">$</span>
              <span class="w-2 h-4 bg-[#E8190A] ml-1 animate-blink"></span>
            `
            bodyRef.current?.appendChild(div)
            resolve()
            return
          }

          if (data.t === 'prog') {
            const div = document.createElement('div')
            div.className = 'flex items-center gap-3 opacity-100 tl v'
            const progBar = document.createElement('div')
            progBar.className = 'flex-1 max-w-40 h-1 bg-[#2A3347] rounded overflow-hidden'
            const progFill = document.createElement('div')
            progFill.className = 'h-full bg-gradient-to-r from-[#E8190A] to-[#FF8C42] rounded transition-all'
            progFill.style.width = '0%'
            progFill.style.transitionDuration = `${(data.d || 1000)}ms`
            progBar.appendChild(progFill)
            const label = document.createElement('span')
            label.className = 'text-xs text-[#8B95A8]'
            label.textContent = data.label || ''
            div.appendChild(progBar)
            div.appendChild(label)
            bodyRef.current?.appendChild(div)

            setTimeout(() => {
              progFill.style.width = '100%'
            }, 50)

            setTimeout(() => resolve(), (data.d || 1000) + 100)
            return
          }

          const colorMap: Record<string, string> = {
            cmd: 'text-[#E8190A]',
            s: 'text-[#28C840]',
            i: 'text-[#8B95A8]',
            u: 'text-[#FFB347] font-bold',
          }

          const div = document.createElement('div')
          div.className = 'flex gap-0 opacity-100 tl v'
          if (data.t === 'cmd') {
            const prompt = document.createElement('span')
            prompt.className = 'text-[#E8190A] font-bold'
            prompt.textContent = '$'
            div.appendChild(prompt)
            const space = document.createElement('span')
            space.textContent = ' '
            div.appendChild(space)
          }
          const textSpan = document.createElement('span')
          textSpan.className = colorMap[data.t] || ''
          div.appendChild(textSpan)
          bodyRef.current?.appendChild(div)

          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight

          let displayText = ''
          const speed = data.t === 'cmd' ? 26 : 6

          const typeWriter = () => {
            if (displayText.length < (data.s?.length || 0)) {
              displayText = (data.s || '').slice(0, displayText.length + 1)
              textSpan.textContent = displayText
              if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
              setTimeout(typeWriter, speed + Math.random() * 8)
            } else {
              setTimeout(resolve, data.t === 'cmd' ? 350 : 80)
            }
          }

          typeWriter()
        }, 80)
      })
    }

    runTerminal()
  }, [])


  return (
    <div className="relative w-full max-w-2xl">
      <div
        className="absolute inset-[-3px] rounded-3xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #E8190A, #FF6B35, #E8190A)',
          opacity: 0.3,
          filter: 'blur(16px)',
          animation: 'glowBreath 3.5s ease infinite',
        }}
      />
      <div
        className="relative bg-[#080B10] border border-[rgba(232,25,10,0.25)] rounded-2xl overflow-hidden"
        style={{
          boxShadow: '0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-5 py-3 bg-[rgba(255,255,255,0.025)] border-b border-[rgba(255,255,255,0.05)]">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          <span className="text-xs text-[#8B95A8] font-mono ml-2">openspace — terminal</span>
          <div className="ml-auto flex items-center gap-1 text-xs text-[#28C840] font-mono">
            <div className="w-1.5 h-1.5 bg-[#28C840] rounded-full animate-pulse" />
            Connecté
          </div>
        </div>

        {/* Terminal body */}
        <div
          ref={scrollRef}
          className="px-7 py-6 font-mono text-sm leading-8 min-h-60 max-h-60 overflow-y-auto space-y-0"
        >
          <div ref={bodyRef} />
        </div>
      </div>
    </div>
  )
}
