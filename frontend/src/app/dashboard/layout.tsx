'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  ChevronDown,
  CreditCard,
  Database,
  FolderOpen,
  Globe,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Search,
  Server,
  Settings,
  Terminal,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/Input'

const navGroups = [
  {
    label: 'Hosting',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/projets', label: 'Projets', icon: Server },
      { href: '/dashboard/fichiers', label: 'Fichiers', icon: FolderOpen },
    ],
  },
  {
    label: 'Domaines & Reseau',
    items: [
      { href: '/dashboard/domains', label: 'Domaines', icon: Globe },
      { href: '/dashboard/emails', label: 'Emails', icon: Mail },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { href: '/dashboard/databases', label: 'Bases de donnees', icon: Database },
      { href: '/dashboard/terminal', label: 'Terminal', icon: Terminal },
    ],
  },
  {
    label: 'Compte',
    items: [
      { href: '/dashboard/billing', label: 'Facturation', icon: CreditCard },
      { href: '/dashboard/parametres', label: 'Parametres', icon: Settings },
    ],
  },
] as const

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/projets': 'Projets',
  '/dashboard/fichiers': 'Fichiers',
  '/dashboard/domains': 'Domaines',
  '/dashboard/emails': 'Emails',
  '/dashboard/databases': 'Bases de donnees',
  '/dashboard/terminal': 'Terminal',
  '/dashboard/billing': 'Facturation',
  '/dashboard/parametres': 'Parametres',
  '/dashboard/space': 'Mon espace',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const currentTitle = titleMap[pathname || ''] || 'Dashboard'

  const breadcrumb = useMemo(() => {
    const parts = (pathname || '/dashboard').split('/').filter(Boolean)
    const last = parts.length > 1 ? parts[parts.length - 1] : 'dashboard'
    const formatted = titleMap[pathname || ''] || last.charAt(0).toUpperCase() + last.slice(1)
    return `Accueil / ${formatted}`
  }, [pathname])

  const handleLogout = async () => {
    await api.logout()
    logout()
    router.push('/login')
  }

  const isActive = (href: string, exact?: boolean) => {
    if (!pathname) return false
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-60 border-r border-border bg-surface transition-transform duration-200 md:w-20 lg:w-60 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center border-b border-border px-4 lg:px-5">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red text-sm font-bold text-white">
              O
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-semibold text-text">OpenSpace</p>
              <p className="truncate text-xs text-text-muted">Cloud Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex h-[calc(100vh-8rem)] flex-col gap-4 overflow-y-auto px-3 py-4 lg:px-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1 hidden px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted lg:block">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href, 'exact' in item ? item.exact : false)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex h-10 items-center gap-2.5 rounded-lg px-3 text-sm transition-all duration-150 ${
                        active
                          ? 'bg-red/15 font-semibold text-red'
                          : 'text-text-secondary hover:bg-surface-2 hover:text-text'
                      }`}
                      title={item.label}
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3 lg:p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm text-text-secondary transition-all duration-150 hover:bg-surface-2 hover:text-text"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <span className="hidden lg:inline">Deconnexion</span>
          </button>
        </div>
      </aside>

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-border bg-bg/95 backdrop-blur md:left-20 lg:left-60">
        <div className="flex h-full items-center gap-3 px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text md:hidden"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="min-w-0">
            <p className="truncate text-xs text-text-muted">{breadcrumb}</p>
            <h1 className="truncate text-[18px] font-semibold text-text">{currentTitle}</h1>
          </div>

          <div className="ml-auto hidden w-[240px] items-center md:flex">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <Input className="h-9 pl-9" placeholder="Rechercher..." />
            </div>
          </div>

          <div className="hidden h-6 w-px bg-border md:block" />

          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red/20 text-sm font-semibold text-red">
                {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden text-sm text-text-secondary lg:inline">
                {user?.first_name || 'Utilisateur'}
              </span>
              <ChevronDown className="h-4 w-4 text-text-muted" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-border bg-surface p-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                <Link
                  href="/dashboard/parametres"
                  className="block rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-text"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Profil
                </Link>
                <Link
                  href="/dashboard/parametres"
                  className="block rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-text"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Parametres
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red hover:bg-red/10"
                >
                  Deconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16 md:ml-20 lg:ml-60">
        <div className="mx-auto w-full max-w-[1280px] p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
