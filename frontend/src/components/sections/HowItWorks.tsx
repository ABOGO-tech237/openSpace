import { AnimatedSection } from '@/components/ui/AnimatedSection'

const steps = [
  {
    num: '01',
    title: 'Crée un compte',
    desc: 'Identifiant mobile, e-mail. Gratuit, pas de carte de crédit.',
  },
  {
    num: '02',
    title: 'Choisis un plan',
    desc: 'Starter, Dev, Pro, Business. Upgrade ou downgrade n\'importe quand.',
  },
  {
    num: '03',
    title: 'Déploie ton app',
    desc: 'Git push, webhook, ou SFTP. Ton container redémarre en 60 secondes.',
  },
  {
    num: '04',
    title: 'Configure ton domaine',
    desc: 'DNS automatique. HTTPS en 5 minutes. C\'est fini.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-[120px] px-12 relative z-10">
      <div className="inline-flex items-center gap-2 text-red text-[12px] font-bold uppercase tracking-[0.15em] mb-5">
        <span className="w-5 h-0.5 bg-red" /> Comment ça marche
      </div>

      <h2 className="font-sora text-[clamp(32px,4.5vw,52px)] font-extrabold leading-tight mb-14 max-w-[620px]">
        4 étapes pour ton cloud africain.
      </h2>

      <div className="max-w-[900px]">
        {steps.map((step, i) => (
          <AnimatedSection key={step.num} delay={i * 0.1}>
            <div className="flex gap-8 pb-12 last:pb-0 relative">
              {/* Timeline line */}
              {i < steps.length - 1 && (
                <div className="absolute left-[40px] top-[80px] bottom-0 w-0.5 bg-gradient-to-b from-red/50 to-transparent" />
              )}

              {/* Number circle */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-red/20 border border-red/50 flex items-center justify-center text-red font-sora font-extrabold text-xl relative z-10">
                  {step.num}
                </div>
              </div>

              {/* Content */}
              <div className="pt-2">
                <h3 className="font-sora text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted">{step.desc}</p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
