import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/providers'
import '../styles/globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${plusJakarta.variable} ${mono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
