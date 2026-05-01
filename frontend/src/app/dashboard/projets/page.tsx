'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Search } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { api } from '@/lib/api'
import { useContainerStore, useDomainsStore, useSubscriptionStore } from '@/lib/store'

export default function ProjetsPage() {
  const router = useRouter()
  const { container, setContainer } = useContainerStore()
  const { subscription, setSubscription } = useSubscriptionStore()
  const { domains, setDomains } = useDomainsStore()

  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [space, sub, dms] = await Promise.all([
          api.getMySpace().catch(() => ({ success: false, data: null })),
          api.getCurrentSubscription().catch(() => ({ success: false, data: null })),
          api.getMyDomains().catch(() => ({ success: false, data: [] })),
        ])

        if (space.success) setContainer(space.data || null)
        if (sub.success) setSubscription(sub.data || null)
        if (dms.success && dms.data) setDomains(dms.data)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [setContainer, setDomains, setSubscription])

  const statusVariant = (status?: string) => {
    if (status === 'running') return 'success'
    if (status === 'error') return 'error'
    if (status === 'provisioning') return 'warning'
    return 'default'
  }

  const projects = useMemo(() => {
    if (!container) return []
    return [
      {
        id: container.id,
        name: `${container.hostname}.openspace.cm`,
        plan: subscription?.plan || container.plan,
        status: container.status,
        domainsCount: domains.length,
      },
    ]
  }, [container, domains.length, subscription?.plan])

  const filteredProjects = projects.filter((project) => project.name.toLowerCase().includes(query.toLowerCase()))

  if (isLoading) {
    return (
      <div className="flex min-h-[380px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">Projets</h2>
          <p className="text-sm text-text-secondary">Vue globale de vos applications hebergees</p>
        </div>
        <Button onClick={() => router.push('/dashboard/space')}>+ Nouveau projet</Button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <Input className="h-9 pl-9" placeholder="Filtrer les projets..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-text-secondary">Aucun projet trouve. Cree ton premier projet dans l'espace.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-text">
                {project.name}
                <Badge variant={statusVariant(project.status)}>{project.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-text-secondary">Plan actif: {project.plan}</p>
              <div className="flex gap-2 text-xs text-text-muted">
                <span>Container ID: {project.id}</span>
              </div>
              <p className="text-xs text-text-muted">Domaines connectes: {project.domainsCount}</p>
              <Button size="sm" variant="outline" onClick={() => router.push('/dashboard/space')}>Ouvrir le projet</Button>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-4 text-sm text-text-secondary">
          <p className="inline-flex items-center gap-2"><AlertCircle className="h-4 w-4 text-warning" /> Les tabs detaillees (Vue d'ensemble, Terminal, Logs, Domaines, Variables, Parametres) seront branchees sur les endpoints projet au prochain lot.</p>
        </CardContent>
      </Card>
    </div>
  )
}
