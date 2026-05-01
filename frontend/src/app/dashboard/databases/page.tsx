 'use client'

import { useEffect, useState } from 'react'
import { Database } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { api } from '@/lib/api'
import { useContainerStore, useSubscriptionStore } from '@/lib/store'

export default function DatabasesPage() {
  const { setContainer } = useContainerStore()
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
    load()
  }, [setContainer, setSubscription])

  const hasDatabaseApiData = false

  if (loading) {
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
          <h2 className="text-2xl font-bold text-text">Bases de donnees</h2>
          <p className="text-sm text-text-secondary">Creation et administration SQL/NoSQL</p>
        </div>
        <Button>+ Creer</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-text">Instances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!hasDatabaseApiData && (
            <p className="text-sm text-text-secondary">Aucune instance base de donnees n'est retournee par le backend pour le moment.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-sm text-text-secondary">
          <p className="inline-flex items-center gap-2"><Database className="h-4 w-4 text-red" /> Plan courant: {subscription?.plan || 'aucun'} - endpoints creation/suppression DB a brancher des qu'ils sont exposes par l'API.</p>
        </CardContent>
      </Card>
    </div>
  )
}
