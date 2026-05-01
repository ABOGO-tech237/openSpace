 'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function ParametresPage() {
  const { user, setUser } = useAuthStore()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const me = await api.getMe().catch(() => ({ success: false, data: null }))
        if (me.success && me.data) {
          setUser(me.data)
          setFullName(`${me.data.first_name} ${me.data.last_name}`.trim())
          setEmail(me.data.email)
        } else if (user) {
          setFullName(`${user.first_name} ${user.last_name}`.trim())
          setEmail(user.email)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [setUser, user])

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text">Parametres</h2>
        <p className="text-sm text-text-secondary">Profil, securite, notifications et acces API</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-text">Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button size="sm" variant="outline">Mise a jour backend en attente</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-text">Securite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-text-secondary">2FA et gestion des sessions actives</p>
            <Button size="sm" variant="outline">Configurer 2FA</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-text">API Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <Button size="sm" variant="outline">Creer un token (bientot)</Button>
        </CardContent>
      </Card>
    </div>
  )
}
