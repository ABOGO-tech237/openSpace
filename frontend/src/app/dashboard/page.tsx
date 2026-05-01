'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  Database,
  ExternalLink,
  FolderPlus,
  Globe,
  Server,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { api } from '@/lib/api'
import { useAuthStore, useContainerStore, useSubscriptionStore } from '@/lib/store'

const statusClasses: Record<string, string> = {
  running: 'bg-green-500/10 text-green-400 border border-green-500/20',
  provisioning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  stopped: 'bg-gray-500/10 text-gray-300 border border-gray-500/20',
  error: 'bg-red/10 text-red border border-red/20',
}

const planLabel: Record<string, string> = {
  starter: 'Starter',
  dev: 'Dev',
  pro: 'Pro',
  business: 'Business',
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { container, setContainer } = useContainerStore()
  const { subscription, setSubscription } = useSubscriptionStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [space, sub] = await Promise.all([
          api.getMySpace().catch(() => ({ success: false, data: null })),
          api.getCurrentSubscription().catch(() => ({ success: false, data: null })),
        ])

        if (space.success) setContainer(space.data || null)
        if (sub.success) setSubscription(sub.data || null)
      } finally {
        setLoading(false)
      }
    }

    if (user) load()
  }, [setContainer, setSubscription, user])

  const today = useMemo(
    () => new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
    []
  )

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const projects = container
    ? [
        {
          name: container.hostname,
          plan: planLabel[container.plan] || container.plan,
          domain: `${container.hostname}.openspace.cm`,
          status: container.status,
        },
      ]
    : []

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-bold text-text">Bonjour, {user?.first_name || 'Utilisateur'}</h2>
          <p className="text-sm text-text-secondary">{today}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-[13px] text-text-secondary">Projets actifs</p>
            <p className="mt-1 text-2xl font-extrabold text-text">{projects.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-[13px] text-text-secondary">Statut abonnement</p>
            <p className="mt-1 text-xl font-extrabold text-text">{subscription?.status || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-[13px] text-text-secondary">RAM allouee</p>
            <p className="mt-1 text-xl font-extrabold text-text">{container?.ram_limit || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-[13px] text-text-secondary">Stockage alloue</p>
            <p className="mt-1 text-xl font-extrabold text-text">{container ? `${container.storage_gb} Go` : 'N/A'}</p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-wrap gap-3">
        <Button variant="red" onClick={() => router.push('/dashboard/space')}>
          <FolderPlus className="h-4 w-4" /> Nouveau projet
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/domains')}>
          <Globe className="h-4 w-4" /> Nouveau domaine
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/databases')}>
          <Database className="h-4 w-4" /> Nouvelle base de donnees
        </Button>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-text">Mes Projets</h3>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/projets')}>
            Voir tout
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Server className="mx-auto mb-3 h-8 w-8 text-text-muted" />
              <p className="text-sm text-text-secondary">Aucun projet pour le moment.</p>
              <Button className="mt-4" onClick={() => router.push('/dashboard/space')}>
                Creer mon premier projet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.name}>
                <CardContent className="p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm text-text">{project.name}</p>
                      <p className="mt-1 text-xs text-text-muted">{project.domain}</p>
                    </div>
                    <Badge className={statusClasses[project.status] || statusClasses.stopped}>{project.status}</Badge>
                  </div>

                  <div className="mb-4 flex gap-2">
                    <Badge variant="subtle">{project.plan}</Badge>
                  </div>

                  <a
                    href={`https://${project.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-4 inline-flex items-center gap-1 text-xs text-red hover:text-red-l"
                  >
                    {project.domain} <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => router.push('/dashboard/space')}>
                      Gerer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => router.push('/dashboard/projets')}>
                      Dashboard <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text">
              Donnees d'activite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">Aucune timeline de deploiement n'est actuellement renvoyee par le backend.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text">
              Donnees ressources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-text-secondary">CPU/RAM usage en temps reel non expose pour l'instant par les routes utilisateur.</p>
            <div className="rounded-lg border border-border bg-surface-2 p-3">
              <p className="text-xs text-text-muted">Actions rapides</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => router.push('/dashboard/terminal')}>
                  Terminal
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push('/dashboard/space')}>
                  Espace
                </Button>
                <Button size="sm" variant="ghost" onClick={() => router.push('/dashboard/billing')}>
                  Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
