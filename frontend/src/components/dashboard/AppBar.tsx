'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search, Settings } from 'lucide-react'
import { useAuthStore, useContainerStore } from '@/lib/store'
import { Badge } from '@/components/ui/Badge'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/dashboard/space': 'Mon espace',
  '/dashboard/domains': 'Mes domaines',
  '/dashboard/billing': 'Facturation',
}

export function AppBar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { container } = useContainerStore()

  const pageTitle = pageTitles[pathname || ''] || 'Dashboard'

  return (
    <header className="hidden md:flex h-16 items-center justify-between px-6 bg-surface border-b border-border">
      {/* Left: Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold font-sora text-white">{pageTitle}</h1>
        {container?.status === 'running' && (
          <Badge className="bg-green-500/20 text-green-500">
            Espace actif
          </Badge>
        )}
        {container?.status === 'provisioning' && (
          <Badge className="bg-yellow-500/20 text-yellow-500">
            En cours...
          </Badge>
        )}
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-64 pl-10 pr-4 py-2 rounded-lg bg-bg border border-border text-white text-sm placeholder:text-muted focus:outline-none focus:border-red/50 transition-colors"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-border transition-colors relative">
          <Bell className="w-5 h-5 text-muted" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red"></span>
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-border transition-colors">
          <Settings className="w-5 h-5 text-muted" />
        </button>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-red/20 flex items-center justify-center">
              <span className="text-red font-semibold text-sm">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>
            <div className="hidden xl:block">
              <p className="text-sm font-medium text-white">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
