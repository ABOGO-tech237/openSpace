import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { EXTENSIONS } from '@/lib/constants'

export function Domains() {
  return (
    <section id="dom" className="py-[120px] px-12 relative z-10">
      <div className="inline-flex items-center gap-2 text-red text-[12px] font-bold uppercase tracking-[0.15em] mb-5">
        <span className="w-5 h-0.5 bg-red" /> Domaines
      </div>

      <h2 className="font-sora text-[clamp(32px,4.5vw,52px)] font-extrabold leading-tight mb-4 max-w-[620px]">
        Domaines africains et mondiaux.
      </h2>
      <p className="text-muted text-lg max-w-[540px] mb-12">
        Gère tes domaines directement depuis notre dashboard. DNS automatique, renouvellement auto, support 24/7.
      </p>

      <div className="grid grid-cols-4 gap-4 max-w-[1100px]">
        {EXTENSIONS.map((ext, i) => (
          <AnimatedSection key={ext.tld} delay={i * 0.06}>
            <div className="bg-surface/50 border border-border rounded-xl p-6 hover:border-red/50 transition-colors text-center">
              <div className="font-sora text-2xl font-extrabold text-red mb-2">{ext.tld}</div>
              <div className="text-muted text-sm">{ext.price}</div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
