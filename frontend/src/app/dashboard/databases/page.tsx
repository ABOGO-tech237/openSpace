'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Database, Trash2, Key, Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { api, DatabaseInstance, DatabaseInstanceDetails } from '@/lib/api'
import { useSubscriptionStore } from '@/lib/store'

const ENGINE_OPTIONS = [
  { value: 'mysql', label: 'MySQL 8', type: 'SQL' },
  { value: 'postgresql', label: 'PostgreSQL 16', type: 'SQL' },
  { value: 'mongodb', label: 'MongoDB 7', type: 'NoSQL' },
  { value: 'redis', label: 'Redis 7', type: 'NoSQL' },
] as const

const STATUS_LABELS: Record<string, string> = {
  creating: 'Création',
  active: 'Actif',
  error: 'Erreur',
  deleting: 'Suppression',
}

export default function DatabasesPage() {
  const { subscription, setSubscription } = useSubscriptionStore()
  const [instances, setInstances] = useState<DatabaseInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showCredentials, setShowCredentials] = useState<DatabaseInstanceDetails | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', engine: 'mysql' })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [dbs, sub] = await Promise.all([
        api.getDatabases().catch(() => ({ success: false, data: [] as DatabaseInstance[] })),
        api.getCurrentSubscription().catch(() => ({ success: false, data: null })),
      ])
      if (dbs.success && dbs.data) setInstances(dbs.data)
      if (sub.success) setSubscription(sub.data || null)
    } catch {
      setError('Impossible de charger les bases de données')
    } finally {
      setLoading(false)
    }
  }, [setSubscription])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [loadData])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      const res = await api.createDatabase({ name: form.name, engine: form.engine })
      if (!res.success) {
        setError(res.error || 'Erreur lors de la création')
        return
      }
      setShowCreate(false)
      setForm({ name: '', engine: 'mysql' })
      await loadData()
    } catch {
      setError('Erreur réseau lors de la création')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer la base "${name}" ? Cette action est irréversible.`)) return
    const res = await api.deleteDatabase(id)
    if (!res.success) {
      setError(res.error || 'Erreur lors de la suppression')
      return
    }
    await loadData()
  }

  const handleShowCredentials = async (id: string) => {
    const res = await api.getDatabase(id)
    if (res.success && res.data) {
      setShowCredentials(res.data)
    }
  }

  const handleExport = async (id: string) => {
    const res = await api.exportDatabase(id)
    if (res.success) {
      alert('Export planifié — vous recevrez une notification quand il sera prêt.')
    } else {
      setError(res.error || 'Erreur export')
    }
  }

  if (loading && instances.length === 0) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">Bases de données</h2>
          <p className="text-sm text-text-secondary">Création et administration SQL / NoSQL</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowCreate(true)}>+ Créer</Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-text">Instances ({instances.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {instances.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Aucune base de données. Cliquez sur &quot;+ Créer&quot; pour provisionner MySQL, PostgreSQL, MongoDB ou Redis.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-text-secondary">
                    <th className="pb-3 pr-4">Nom</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Host</th>
                    <th className="pb-3 pr-4">Statut</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {instances.map((db) => (
                    <tr key={db.id} className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-text">{db.name}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={db.engine === 'mongodb' || db.engine === 'redis' ? 'subtle' : 'default'}>
                          {db.engine}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-text-secondary">
                        {db.host ? `${db.host}:${db.port}` : '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={db.status === 'active' ? 'success' : 'warning'}>
                          {STATUS_LABELS[db.status] || db.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleShowCredentials(db.id)} title="Identifiants">
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleExport(db.id)} title="Exporter">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(db.id, db.name)} title="Supprimer">
                            <Trash2 className="h-4 w-4 text-red" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-2 p-4 text-sm text-text-secondary">
          <Database className="h-4 w-4 text-red" />
          Plan courant : <strong className="text-text">{subscription?.plan || 'starter (par défaut)'}</strong>
          {' '}— quotas appliqués selon votre abonnement.
        </CardContent>
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Créer une base de données">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text">Nom</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase() })}
              placeholder="mon-app-db"
              pattern="[a-z][a-z0-9-]*"
              required
              minLength={3}
              maxLength={32}
            />
            <p className="mt-1 text-xs text-text-secondary">Lettres minuscules, chiffres et tirets (3-32 car.)</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text">Moteur</label>
            <select
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
              value={form.engine}
              onChange={(e) => setForm({ ...form, engine: e.target.value })}
            >
              {ENGINE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.type})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!showCredentials}
        onClose={() => setShowCredentials(null)}
        title={`Identifiants — ${showCredentials?.name || ''}`}
      >
        {showCredentials && (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-text-secondary">Host :</span>
              <code className="ml-2 rounded bg-surface px-2 py-1 font-mono text-xs">
                {showCredentials.host}:{showCredentials.port}
              </code>
            </div>
            <div>
              <span className="text-text-secondary">Base :</span>
              <code className="ml-2 rounded bg-surface px-2 py-1 font-mono text-xs">{showCredentials.database_name}</code>
            </div>
            <div>
              <span className="text-text-secondary">Utilisateur :</span>
              <code className="ml-2 rounded bg-surface px-2 py-1 font-mono text-xs">{showCredentials.username}</code>
            </div>
            <div>
              <span className="text-text-secondary">Mot de passe :</span>
              <code className="ml-2 rounded bg-surface px-2 py-1 font-mono text-xs">{showCredentials.password}</code>
            </div>
            <div>
              <span className="text-text-secondary">Connexion :</span>
              <code className="mt-1 block break-all rounded bg-surface px-2 py-1 font-mono text-xs">
                {showCredentials.connection_string}
              </code>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
