 'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { api } from '@/lib/api'
import { useContainerStore, useDomainsStore } from '@/lib/store'

export default function EmailsPage() {
  const { setContainer } = useContainerStore()
  const { setDomains } = useDomainsStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [space, dms] = await Promise.all([
          api.getMySpace().catch(() => ({ success: false, data: null })),
          api.getMyDomains().catch(() => ({ success: false, data: [] })),
        ])
        if (space.success) setContainer(space.data || null)
        if (dms.success && dms.data) setDomains(dms.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [setContainer, setDomains])

  const hasEmailApiData = false

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
          <h2 className="text-2xl font-bold text-text">Emails</h2>
          <p className="text-sm text-text-secondary">Boites mail, quota et acces webmail</p>
        </div>
        <Button>+ Creer un email</Button>
      </div>

      {!hasEmailApiData && (
        <Card>
          <CardContent className="p-6 text-sm text-text-secondary">
            Aucune donnee email n'est retournee par le backend pour le moment. Cette page s'activera des que les endpoints email seront exposes.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
