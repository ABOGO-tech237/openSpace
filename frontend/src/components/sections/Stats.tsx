import { AnimatedSection } from '@/components/ui/AnimatedSection'

const stats = [
  { label: 'Déploiements', value: '50K+' },
  { label: 'Développeurs', value: '15K+' },
  { label: 'Uptime', value: '99.99%' },
  { label: 'Pays africains', value: '12+' },
]

export function Stats() {
  return (
    <section className="py-[80px] px-12 relative z-10">
      <div className="max-w-[1200px] mx-auto grid grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <AnimatedSection key={stat.label} delay={i * 0.1}>
            <div className="text-center">
              <div className="font-sora text-[clamp(36px,5vw,56px)] font-extrabold text-red mb-2">
                {stat.value}
              </div>
              <p className="text-muted text-sm">{stat.label}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
