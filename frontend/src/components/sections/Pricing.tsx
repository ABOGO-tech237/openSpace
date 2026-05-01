'use client'
import { useState } from 'react'
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
