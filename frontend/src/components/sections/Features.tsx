import { AnimatedSection } from '@/components/ui/AnimatedSection'

const features = [
  {
    icon: '⚡',
    title: 'Déploiement en 60 secondes',
    desc: 'Crée un container isolé en une minute sans configuration complexe.',
  },
  {
    icon: '🔒',
    title: 'SSL gratuit automatique',
    desc: 'HTTPS activé par défaut via Let\'s Encrypt. Certificat renouvelé automatiquement.',
  },
  {
    icon: '💰',
    title: 'Mobile Money accepté',
    desc: 'Paiement par MTN MoMo, Orange Money, Airtel Money. Aucune carte de crédit.',
  },
  {
    icon: '🌍',
    title: 'Domaines africains',
    desc: '.cm, .africa, et 200+ TLDs. Gérés directement depuis ton dashboard.',
  },
  {
    icon: '📊',
    title: 'Dashboard intuitif',
    desc: 'Monitoring en temps réel, logs, métriques. Interface pensée pour les devs.',
  },
  {
    icon: '🚀',
    title: 'Scalabilité instant',
    desc: 'Upgrade ton plan 24/7 sans downtime. Ressources isolées garanties.',
  },
]

export function Features() {
  return (
    <section id="feat" className="py-[120px] px-12 relative z-10">
      <div className="inline-flex items-center gap-2 text-red text-[12px] font-bold uppercase tracking-[0.15em] mb-5">
        <span className="w-5 h-0.5 bg-red" /> Fonctionnalités
      </div>

      <h2 className="font-sora text-[clamp(32px,4.5vw,52px)] font-extrabold leading-tight mb-4 max-w-[620px]">
        Tout ce dont tu as besoin pour héberger en Afrique.
      </h2>

      <div className="grid grid-cols-3 gap-8 max-w-[1200px] mt-12">
        {features.map((f, i) => (
          <AnimatedSection key={f.title} delay={i * 0.08}>
            <div className="bg-surface/50 border border-border rounded-2xl p-8 hover:border-red/50 transition-colors">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-sora text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-muted text-sm">{f.desc}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
