 'use client'

import { useEffect, useMemo, useState } from 'react'
import { Circle, RotateCcw, Square, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { api } from '@/lib/api'
import { useContainerStore } from '@/lib/store'

export default function TerminalPage() {
  const { container, setContainer } = useContainerStore()
  const [loading, setLoading] = useState(true)
  const [cmd, setCmd] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const space = await api.getMySpace().catch(() => ({ success: false, data: null }))
        if (space.success) setContainer(space.data || null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [setContainer])

  const wsUrl = useMemo(() => {
    if (!container) return null
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''
    return `wss://api.openspace.cm/ws/projects/${container.id}/terminal?token=${token || '{jwt}'}`
  }, [container])

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text">Terminal</h2>
        <p className="text-sm text-text-secondary">Execution de commandes via WebSocket securise</p>
      </div>

      {!container && (
        <Card>
          <CardContent className="p-6 text-sm text-text-secondary">
            Aucun projet disponible. Cree un espace pour ouvrir le terminal.
          </CardContent>
        </Card>
      )}

      {container && (
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-[#1C1C27]">
          <CardTitle className="flex items-center justify-between text-sm text-gray-100">
            <span className="inline-flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              terminal - {container.hostname}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-400">
              <Circle className="h-3 w-3 fill-yellow-400 text-yellow-400" /> WebSocket non initialise
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-[#1E1E2E] p-0 font-mono text-[13px] leading-relaxed text-gray-200">
          <div className="min-h-[340px] p-4">
            <p className="text-xs text-gray-400">Projet: {container.id}</p>
            <p className="mt-2 text-xs text-gray-400">Endpoint backend: {wsUrl}</p>
            <p className="mt-2 text-xs text-gray-400">Aucun flux terminal temps reel tant que le backend WS utilisateur n'est pas branche.</p>
          </div>
          <div className="flex items-center gap-2 border-t border-[#2a2a3d] bg-[#1C1C27] p-3">
            <span className="font-semibold text-red">$</span>
            <Input className="h-8 border-[#2a2a3d] bg-[#181824] text-gray-100" placeholder="Tapez une commande..." value={cmd} onChange={(e) => setCmd(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline"><RotateCcw className="h-4 w-4" /> Restart container</Button>
        <Button size="sm" variant="outline"><Square className="h-4 w-4" /> Stop container</Button>
        <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4" /> Clear terminal</Button>
      </div>
    </div>
  )
}
