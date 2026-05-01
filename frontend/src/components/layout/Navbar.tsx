'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useScrolled } from '@/hooks/useScrolled'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'

const LINKS = [
  { href: '#feat',  label: 'Fonctionnalités' },
  { href: '#price', label: 'Tarifs' },
  { href: '#dom',   label: 'Domaines' },
  { href: '#',      label: 'Docs' },
  { href: '#',      label: 'Support' },
]

export function Navbar() {
  const scrolled = useScrolled()
  const { isAuthenticated, user } = useAuthStore()

  return (
    <nav className={cn(
      'fixed top-0 inset-x-0 z-50 flex items-center justify-between px-12 h-[70px] transition-all duration-300',
      scrolled
        ? 'bg-bg/97 backdrop-blur-2xl border-b border-border'
        : 'bg-bg/70 backdrop-blur-2xl border-b border-white/[0.04]'
    )}>
      <Link href="/">
        <Image src="/logo.png" alt="OpenSpace" width={140} height={40} className="h-10 w-auto" />
      </Link>

      <div className="hidden md:flex items-center gap-9">
        {LINKS.map(l => (
          <a key={l.label} href={l.href}
            className="text-muted text-sm font-medium hover:text-white transition-colors relative group">
            {l.label}
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red scale-x-0 group-hover:scale-x-100 transition-transform duration-250" />
          </a>
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        {isAuthenticated ? (
          <>
            <span className="hidden md:block text-sm text-muted">
              {user?.first_name}
            </span>
            <Button href="/dashboard" variant="red" size="sm">
              Dashboard →
            </Button>
          </>
        ) : (
          <>
            <Button href="/login" variant="ghost" size="sm">Se connecter</Button>
            <Button href="/register" variant="red" size="sm">Commencer →</Button>
          </>
        )}
      </div>
    </nav>
  )
}
