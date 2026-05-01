# Guide d'implémentation — OpenSpace Landing Page
## Next.js 14 + React + Tailwind CSS

---

## 1. Initialisation du projet

```bash
npx create-next-app@latest openspace-frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd openspace-frontend
```

### Dépendances à installer

```bash
# Animations
npm install framer-motion

# Icons
npm install lucide-react

# Fonts (Google Fonts via next/font)
# Déjà inclus dans Next.js — pas d'installation requise
```

---

## 2. Configuration

### `tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#080A0F',
        surface: '#0E1118',
        border:  '#1C2333',
        red:     '#E8190A',
        'red-l': '#FF3D2E',
        muted:   '#8B95A8',
        dim:     '#2A3347',
      },
      fontFamily: {
        sora:  ['var(--font-sora)', 'sans-serif'],
        dm:    ['var(--font-dm)', 'sans-serif'],
        mono:  ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'pulse-dot': 'pulseDot 2s infinite',
        'glow':      'glowBreath 3.5s ease infinite',
        'grad':      'gradShift 5s ease infinite',
        'float':     'orbFloat 8s ease-in-out infinite',
        'blink':     'cursorBlink 1s step-end infinite',
      },
      keyframes: {
        pulseDot: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(232,25,10,0.6)' },
          '70%':     { boxShadow: '0 0 0 10px rgba(232,25,10,0)' },
        },
        glowBreath: {
          '0%,100%': { opacity: '0.25' },
          '50%':     { opacity: '0.55' },
        },
        gradShift: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
        orbFloat: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(30px,-30px) scale(1.05)' },
          '66%':     { transform: 'translate(-20px,20px) scale(0.97)' },
        },
        cursorBlink: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
```

### `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #080A0F;
  --red: #E8190A;
  --red-glow: rgba(232, 25, 10, 0.35);
  --red-dim: rgba(232, 25, 10, 0.12);
}

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: #F0F4FF;
  font-family: var(--font-dm), sans-serif;
  overflow-x: hidden;
}

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: #1C2333; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--red); }

.grad-text {
  background: linear-gradient(135deg, #FF4444 0%, #FF8C42 50%, #FFCC44 100%);
  background-size: 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradShift 5s ease infinite;
}

.term-glow-ring {
  background: linear-gradient(135deg, #E8190A, #FF6B35, #E8190A);
  animation: glowBreath 3.5s ease infinite;
}
```

### `src/app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Sora, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sora',
})

const dm = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'OpenSpace — Hébergement Cloud Africain',
  description: 'Lance, héberge et déploie tes projets en moins de 60 secondes. À partir de 2 000 FCFA/mois.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sora.variable} ${dm.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

---

## 3. Structure des fichiers

```
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx                  ← Page principale (assemble tout)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Stats.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Pricing.tsx
│   │   ├── Domains.tsx
│   │   ├── Testimonials.tsx
│   │   └── CtaBanner.tsx
│   └── ui/
│       ├── Terminal.tsx
│       ├── ParticlesCanvas.tsx
│       ├── AnimatedSection.tsx   ← Wrapper scroll animation
│       └── Button.tsx
├── hooks/
│   └── useScrolled.ts
├── lib/
│   └── constants.ts              ← Plans, extensions, témoignages
└── public/
    └── logo.png                  ← Ton logo OpenSpace
```

---

## 4. Composants — Code complet

### `src/lib/constants.ts`

```ts
export const PLANS = [
  { name: 'Starter',  ram: '512 Mo', cpu: '0.5', storage: '5 Go',  priceM: 2000,  priceY: 1600,  popular: false, features: ['512 Mo RAM', '0.5 vCPU', '5 Go stockage', 'Sous-domaine', 'SSL auto', 'Support standard'] },
  { name: 'Dev',      ram: '512 Mo', cpu: '1',   storage: '10 Go', priceM: 3500,  priceY: 2800,  popular: true,  features: ['512 Mo RAM', '1 vCPU', '10 Go stockage', '1 domaine custom', 'SSL auto', 'Support prioritaire'] },
  { name: 'Pro',      ram: '1 Go',   cpu: '2',   storage: '20 Go', priceM: 6000,  priceY: 4800,  popular: false, features: ['1 Go RAM', '2 vCPUs', '20 Go stockage', '3 domaines', 'SSL auto', 'Support dédié'] },
  { name: 'Business', ram: '2 Go',   cpu: '4',   storage: '40 Go', priceM: 12000, priceY: 9600,  popular: false, features: ['2 Go RAM', '4 vCPUs', '40 Go stockage', 'Domaines illimités', 'SSL auto', 'Support 24/7'] },
]

export const EXTENSIONS = [
  { tld: '.cm',     price: '15 000 FCFA' },
  { tld: '.com',    price: '9 000 FCFA'  },
  { tld: '.africa', price: '12 000 FCFA' },
  { tld: '.tech',   price: '6 000 FCFA'  },
  { tld: '.app',    price: '7 000 FCFA'  },
  { tld: '.xyz',    price: '2 500 FCFA'  },
  { tld: '.me',     price: '7 000 FCFA'  },
  { tld: '.online', price: '2 500 FCFA'  },
]

export const TESTIMONIALS = [
  { name: 'Rodrigue K.', role: 'Dev web · Yaoundé',        emoji: '👨🏾‍💻', stars: 5, text: '"Lancé mon portfolio en 5 minutes. MTN MoMo a tout changé. Enfin un hébergeur qui comprend notre réalité."' },
  { name: 'Fatoumata D.', role: 'Étudiante info · Douala', emoji: '👩🏾‍💻', stars: 5, text: '"SSL automatique, déploiement en une minute. J\'ai arrêté de perdre du temps à configurer des serveurs."' },
  { name: 'Patrick M.',  role: 'Fondateur startup · Bafoussam', emoji: '👨🏾‍🎓', stars: 5, text: '"2 000 FCFA/mois pour mon API. Prix stables, service impeccable. Je cherchais ça depuis longtemps."' },
]

export const TERMINAL_LINES = [
  { type: 'cmd',  text: 'openspace login --user emmanuel@aurora.cm' },
  { type: 'ok',   text: '✓ Authentifié · emmanuel@aurora.cm' },
  { type: 'sp' },
  { type: 'cmd',  text: 'openspace create --plan dev --name mon-saas' },
  { type: 'info', text: '  Provisioning du container...' },
  { type: 'prog', text: 'Container', duration: 1000 },
  { type: 'ok',   text: '✓ Container démarré (512Mo RAM · 1 vCPU)' },
  { type: 'info', text: '  Configuration SSL...' },
  { type: 'prog', text: 'SSL', duration: 700 },
  { type: 'ok',   text: '✓ Certificat HTTPS activé' },
  { type: 'ok',   text: '✓ DNS propagé en 23ms' },
  { type: 'sp' },
  { type: 'url',  text: '🌍  https://mon-saas.openspace.cm' },
  { type: 'sp' },
  { type: 'cur' },
]
```

---

### `src/hooks/useScrolled.ts`

```ts
import { useState, useEffect } from 'react'

export function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])
  return scrolled
}
```

---

### `src/components/ui/AnimatedSection.tsx`

```tsx
'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ children, className, delay = 0 }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.175, 0.885, 0.32, 1.275] }}
    >
      {children}
    </motion.div>
  )
}
```

---

### `src/components/ui/Button.tsx`

```tsx
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'red' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

export function Button({ variant = 'red', size = 'md', href, children, className, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-250 cursor-pointer font-dm'

  const variants = {
    red:     'bg-red text-white shadow-[0_8px_32px_rgba(232,25,10,0.35)] hover:bg-red-l hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(232,25,10,0.45)]',
    ghost:   'bg-transparent border border-border text-text hover:border-red hover:text-red',
    outline: 'bg-transparent border border-border text-text hover:border-white/25 hover:text-white',
  }
  const sizes = {
    sm: 'text-sm px-5 py-2',
    md: 'text-sm px-6 py-2.5',
    lg: 'text-base px-9 py-4',
  }

  const cls = cn(base, variants[variant], sizes[size], className)

  if (href) return <a href={href} className={cls}>{children}</a>
  return <button className={cls} {...props}>{children}</button>
}
```

---

### `src/components/ui/ParticlesCanvas.tsx`

```tsx
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
```

---

### `src/components/ui/Terminal.tsx`

```tsx
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

async function renderLine(body: HTMLDivElement, line: (typeof TERMINAL_LINES)[0]) {
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
      <span style="font-size:11px;color:#8B95A8">${line.text}</span>`
    body.appendChild(el)
    await sleep(80)
    const fill = document.getElementById(id)
    if (fill) fill.style.width = '100%'
    await sleep((line.duration as number) + 100)
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

  await new Promise<void>(res => {
    let i = 0
    function wr() {
      if (i < line.text.length) {
        span.textContent += line.text[i++]
        body.scrollTop = body.scrollHeight
        setTimeout(wr, speed + Math.random() * 8)
      } else {
        setTimeout(res, line.type === 'cmd' ? 350 : 80)
      }
    }
    wr()
  })
}
```

---

### `src/components/layout/Navbar.tsx`

```tsx
'use client'
import Image from 'next/image'
import { useScrolled } from '@/hooks/useScrolled'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '#feat',  label: 'Fonctionnalités' },
  { href: '#price', label: 'Tarifs' },
  { href: '#dom',   label: 'Domaines' },
  { href: '#',      label: 'Docs' },
  { href: '#',      label: 'Support' },
]

export function Navbar() {
  const scrolled = useScrolled()

  return (
    <nav className={cn(
      'fixed top-0 inset-x-0 z-50 flex items-center justify-between px-12 h-[70px] transition-all duration-300',
      scrolled
        ? 'bg-bg/97 backdrop-blur-2xl border-b border-border'
        : 'bg-bg/70 backdrop-blur-2xl border-b border-white/[0.04]'
    )}>
      <a href="#">
        <Image src="/logo.png" alt="OpenSpace" width={140} height={40} className="h-10 w-auto" />
      </a>

      <div className="hidden md:flex items-center gap-9">
        {LINKS.map(l => (
          <a key={l.label} href={l.href}
            className="text-muted text-sm font-medium hover:text-white transition-colors relative group">
            {l.label}
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red scale-x-0 group-hover:scale-x-100 transition-transform duration-250" />
          </a>
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        <Button href="#" variant="ghost" size="sm">Se connecter</Button>
        <Button href="#" variant="red"   size="sm">Commencer →</Button>
      </div>
    </nav>
  )
}
```

---

### `src/components/sections/Hero.tsx`

```tsx
import { motion } from 'framer-motion'
import { Terminal } from '@/components/ui/Terminal'
import { Button } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-10 pt-24 pb-16 z-10 overflow-hidden">
      {/* Mesh */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 15% 30%, rgba(232,25,10,0.1), transparent 60%), radial-gradient(ellipse 50% 50% at 85% 70%, rgba(255,100,50,0.07), transparent 60%)' }} />

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
        }} />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
        className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-9 z-10"
        style={{ background: 'rgba(232,25,10,0.1)', border: '1px solid rgba(232,25,10,0.3)', color: '#FF7070' }}>
        <span className="w-2 h-2 rounded-full bg-red animate-pulse-dot" />
        <span className="text-[13px] font-semibold">Cloud africain · Mobile Money accepté</span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
        className="font-sora text-[clamp(44px,7.5vw,88px)] font-extrabold leading-[1.0] mb-7 z-10">
        Ton projet mérite<br />
        <span className="grad-text">un vrai espace cloud.</span>
      </motion.h1>

      {/* Sub */}
      <motion.p
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
        className="text-muted text-[clamp(16px,2vw,20px)] max-w-[580px] leading-relaxed mb-11 z-10">
        Lance, héberge et déploie tes projets en moins de 60 secondes.
        Docker isolé, SSL automatique, domaines africains. À partir de 2 000 FCFA/mois.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
        className="flex items-center gap-4 mb-5 z-10">
        <Button href="#" variant="red"     size="lg">Créer mon espace →</Button>
        <Button href="#price" variant="outline" size="lg">Voir les plans</Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-dim text-sm z-10">
        Aucune carte de crédit · <span className="text-muted">MTN MoMo & Orange Money</span>
      </motion.p>

      {/* Terminal */}
      <Terminal />
    </section>
  )
}
```

---

### `src/components/sections/Pricing.tsx`

```tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PLANS } from '@/lib/constants'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function Pricing() {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="price" className="py-[120px] px-12 text-center relative z-10">
      <div className="inline-flex items-center gap-2 text-red text-[12px] font-bold uppercase tracking-[0.15em] mb-5">
        <span className="w-5 h-0.5 bg-red" /> Plans & Tarifs
      </div>

      <h2 className="font-sora text-[clamp(32px,4.5vw,52px)] font-extrabold leading-tight mb-4">
        Transparent. Prévisible. Juste.
      </h2>
      <p className="text-muted text-lg max-w-[540px] mx-auto">
        Le prix que tu vois aujourd'hui est le même dans 3 ans.
      </p>

      {/* Toggle */}
      <div className="inline-flex items-center gap-1 bg-surface border border-border rounded-full p-1.5 mt-9 mb-10">
        {(['Mensuel', 'Annuel'] as const).map((opt, i) => (
          <button key={opt}
            onClick={() => setYearly(i === 1)}
            className={cn(
              'flex items-center gap-2 px-7 py-2.5 rounded-full text-sm font-semibold transition-all duration-250',
              (i === 1) === yearly ? 'bg-red text-white' : 'text-muted hover:text-white'
            )}>
            {opt}
            {i === 1 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,200,0,0.12)', color: '#FFD166', border: '1px solid rgba(255,200,0,0.25)' }}>
                -20%
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-5 max-w-[1100px] mx-auto">
        {PLANS.map((plan, i) => (
          <AnimatedSection key={plan.name} delay={i * 0.08}>
            <div className={cn(
              'bg-surface border rounded-2xl p-9 text-left relative transition-all duration-400 hover:-translate-y-2',
              'hover:shadow-[0_32px_64px_rgba(0,0,0,0.4)]',
              plan.popular
                ? 'border-red shadow-[0_0_0_1px_#E8190A,0_24px_48px_rgba(232,25,10,0.18)]'
                : 'border-border'
            )}>
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-red text-white text-xs font-bold px-4 py-1 rounded-full shadow-[0_4px_12px_rgba(232,25,10,0.4)] whitespace-nowrap">
                  ⭐ Populaire
                </div>
              )}

              <div className="text-[13px] font-bold text-muted uppercase tracking-[0.08em] mb-5">{plan.name}</div>

              <div className="font-sora text-[44px] font-extrabold leading-none mb-1">
                <span className="text-[15px] font-semibold text-muted align-super">FCFA </span>
                {(yearly ? plan.priceY : plan.priceM).toLocaleString('fr-FR')}
              </div>
              <div className="text-muted text-sm mb-7">par mois</div>

              <hr className="border-border my-6" />

              <ul className="flex flex-col gap-3.5 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted">
                    <span className="text-red font-extrabold flex-shrink-0 text-[13px]">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'red' : 'ghost'}
                className="w-full justify-center">
                Choisir {plan.name}
              </Button>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
```

---

### `src/app/page.tsx`

```tsx
import { ParticlesCanvas } from '@/components/ui/ParticlesCanvas'
import { Navbar }         from '@/components/layout/Navbar'
import { Hero }           from '@/components/sections/Hero'
import { Stats }          from '@/components/sections/Stats'
import { Features }       from '@/components/sections/Features'
import { HowItWorks }     from '@/components/sections/HowItWorks'
import { Pricing }        from '@/components/sections/Pricing'
import { Domains }        from '@/components/sections/Domains'
import { Testimonials }   from '@/components/sections/Testimonials'
import { CtaBanner }      from '@/components/sections/CtaBanner'
import { Footer }         from '@/components/layout/Footer'

export default function Home() {
  return (
    <>
      <ParticlesCanvas />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Pricing />
        <Domains />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </>
  )
}
```

---

## 5. Utilitaire `cn`

### `src/lib/utils.ts`

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```bash
npm install clsx tailwind-merge
```

---

## 6. Ordre de build recommandé

```
1. Setup projet + config Tailwind + fonts
2. globals.css + variables CSS
3. lib/constants.ts + lib/utils.ts
4. hooks/useScrolled.ts
5. ui/Button.tsx
6. ui/AnimatedSection.tsx
7. ui/ParticlesCanvas.tsx
8. ui/Terminal.tsx           ← Le plus complexe
9. layout/Navbar.tsx
10. sections/Hero.tsx
11. sections/Stats.tsx
12. sections/Features.tsx
13. sections/HowItWorks.tsx
14. sections/Pricing.tsx     ← Avec toggle état
15. sections/Domains.tsx
16. sections/Testimonials.tsx
17. sections/CtaBanner.tsx
18. layout/Footer.tsx
19. app/page.tsx             ← Assemble tout
```

---

## 7. Lancement

```bash
# Développement
npm run dev

# Build production
npm run build
npm run start

# Vérifier le build
npm run lint
```

---

## 8. Notes importantes

**Le logo** : place `logo.png` dans `/public/logo.png`. Il s'affiche dans Navbar et Footer via `<Image src="/logo.png" />`.

**`'use client'`** : obligatoire sur tous les composants qui utilisent `useState`, `useEffect`, `useRef`, Framer Motion, ou les hooks custom. Les composants purement statiques n'en ont pas besoin.

**Terminal** : c'est un composant `'use client'` qui manipule le DOM directement. Il se remet en boucle automatiquement toutes les 6 secondes.

**ParticlesCanvas** : composant `'use client'` monté une seule fois dans `page.tsx`. Position `fixed` avec `z-index: 0` pour rester derrière tout le contenu.

**Framer Motion** : utilise `useInView` pour les animations au scroll sur chaque card. Le composant `AnimatedSection` est le wrapper réutilisable.
