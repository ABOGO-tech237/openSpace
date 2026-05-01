'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export function CtaBanner() {
  return (
    <section className="py-[120px] px-12 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-red/20 to-orange-500/20 border border-red/50 rounded-3xl p-16 max-w-[1100px] mx-auto text-center relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at center, rgba(232,25,10,0.08), transparent)' }} />

        <h2 className="font-sora text-[clamp(36px,5vw,52px)] font-extrabold leading-tight mb-4 relative z-10">
          Prêt à lancer ton projet ?
        </h2>
        <p className="text-muted text-lg max-w-[580px] mx-auto mb-9 relative z-10">
          Rejoins des milliers de développeurs africains qui font confiance à OpenSpace pour leur infrastructure.
        </p>
        <div className="flex items-center justify-center gap-4 relative z-10">
          <Button href="#" variant="red" size="lg">
            Créer mon espace →
          </Button>
          <Button href="#" variant="ghost" size="lg">
            Voir la démo
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
