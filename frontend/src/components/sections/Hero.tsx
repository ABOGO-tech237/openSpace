'use client'

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
