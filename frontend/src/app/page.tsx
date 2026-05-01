import { ParticlesCanvas } from '@/components/ui/ParticlesCanvas'
import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/sections/Hero'
import { Stats } from '@/components/sections/Stats'
import { Features } from '@/components/sections/Features'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Pricing } from '@/components/sections/Pricing'
import { Domains } from '@/components/sections/Domains'
import { Testimonials } from '@/components/sections/Testimonials'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { Footer } from '@/components/layout/Footer'

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
