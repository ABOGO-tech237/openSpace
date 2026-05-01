import { TESTIMONIALS } from '@/lib/constants'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

export function Testimonials() {
  return (
    <section className="py-[120px] px-12 relative z-10">
      <div className="inline-flex items-center gap-2 text-red text-[12px] font-bold uppercase tracking-[0.15em] mb-5">
        <span className="w-5 h-0.5 bg-red" /> Témoignages
      </div>

      <h2 className="font-sora text-[clamp(32px,4.5vw,52px)] font-extrabold leading-tight mb-4 max-w-[620px]">
        Ils font confiance à OpenSpace.
      </h2>

      <div className="grid grid-cols-3 gap-8 max-w-[1200px] mt-12">
        {TESTIMONIALS.map((t, i) => (
          <AnimatedSection key={t.name} delay={i * 0.1}>
            <div className="bg-surface border border-border rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{t.emoji}</span>
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-muted text-xs">{t.role}</div>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="text-yellow-500">★</span>
                ))}
              </div>
              <p className="text-muted text-sm italic">{t.text}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
