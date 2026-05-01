'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Server, Users, HardDrive, Activity, LogOut, Terminal, Trash2, RotateCw } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
}

interface AdminContainer {
  id: string
  user_id: string
  hostname: string
  plan: string
  status: string
  docker_id: string
  internal_ip: string
  ram_limit: string
  cpu_limit: number
  storage_gb: number
  created_at: string
  updated_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [containers, setContainers] = useState<AdminContainer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContainer, setSelectedContainer] = useState<AdminContainer | null>(null)
  const [showTerminal, setShowTerminal] = useState(false)

  // Vérifier que l'utilisateur est admin
  useEffect(() => {
    if (user && !user.is_admin) {
      router.push('/dashboard')
      return
    }
  }, [user, router])

  // Charger les containers
  useEffect(() => {
    const loadContainers = async () => {
      try {
        setIsLoading(true)
        const response = await api.getAdminContainers()
        if (response.success && response.data) {
          setContainers(response.data)
        } else {
          setError('Impossible de charger les containers')
        }
      } catch (err) {
        console.error('Error loading containers:', err)
        setError('Erreur lors du chargement')
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.is_admin) {
      loadContainers()
      // Poll every 5 seconds
      const interval = setInterval(loadContainers, 5000)
      return () => clearInterval(interval)
    }
  }, [user])

  const handleLogout = async () => {
    await api.logout()
    logout()
    router.push('/login')
  }

  const handleDeleteContainer = async (containerId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce container?')) return

    try {
      const response = await api.deleteContainer(containerId)
      if (response.success) {
        setContainers(containers.filter((c) => c.id !== containerId))
        setSelectedContainer(null)
      } else {
        setError('Erreur lors de la suppression')
      }
    } catch (err) {
      console.error('Error deleting container:', err)
    }
  }

  const handleRestartContainer = async (containerId: string) => {
    try {
      const response = await api.restartContainer(containerId)
      if (response.success) {
        setContainers(
          containers.map((c) =>
            c.id === containerId ? { ...c, status: 'running' } : c
          )
        )
      }
    } catch (err) {
      console.error('Error restarting container:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/20 text-green-500'
      case 'provisioning':
        return 'bg-yellow-500/20 text-yellow-500'
      case 'stopped':
        return 'bg-gray-500/20 text-gray-400'
      case 'error':
        return 'bg-red/20 text-red'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  if (!user?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red">Accès refusé - Admin seulement</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  const stats = {
    total: containers.length,
    running: containers.filter((c) => c.status === 'running').length,
    provisioning: containers.filter((c) => c.status === 'provisioning').length,
    error: containers.filter((c) => c.status === 'error').length,
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-border flex items-center justify-between px-8 h-16">
        <div>
          <h1 className="text-lg font-semibold font-sora text-white">Admin Panel</h1>
          <p className="text-xs text-muted">OpenSpace Server Management</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">{user?.first_name}</p>
            <p className="text-xs text-muted">Administrator</p>
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stats */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted text-sm">Total Containers</p>
                      <p className="text-3xl font-bold text-white">{stats.total}</p>
                    </div>
                    <Server className="w-8 h-8 text-red" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted text-sm">Running</p>
                      <p className="text-3xl font-bold text-green-500">{stats.running}</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted text-sm">Provisioning</p>
                      <p className="text-3xl font-bold text-yellow-500">{stats.provisioning}</p>
                    </div>
                    <HardDrive className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted text-sm">Errors</p>
                      <p className="text-3xl font-bold text-red">{stats.error}</p>
                    </div>
                    <Users className="w-8 h-8 text-red" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <motion.div variants={itemVariants}>
              <div className="p-4 rounded-lg bg-red/10 border border-red/20">
                <p className="text-red text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Containers List */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Containers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {containers.length === 0 ? (
                    <p className="text-muted text-center py-8">Aucun container</p>
                  ) : (
                    containers.map((container) => (
                      <motion.div
                        key={container.id}
                        className="p-4 rounded-lg border border-border hover:bg-surface/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedContainer(container)}
                        whileHover={{ x: 2 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-mono font-semibold text-white">
                                {container.hostname}
                              </h3>
                              <Badge className={getStatusColor(container.status)}>
                                {container.status}
                              </Badge>
                              <span className="text-xs text-muted bg-surface px-2 py-1 rounded">
                                {container.plan}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                              <div>
                                <p className="text-muted">User ID</p>
                                <p className="text-white font-mono">
                                  {container.user_id.substring(0, 8)}...
                                </p>
                              </div>
                              <div>
                                <p className="text-muted">IP</p>
                                <p className="text-white font-mono">{container.internal_ip || '-'}</p>
                              </div>
                              <div>
                                <p className="text-muted">RAM</p>
                                <p className="text-white">{container.ram_limit}</p>
                              </div>
                              <div>
                                <p className="text-muted">CPU</p>
                                <p className="text-white">{container.cpu_limit} vCPU</p>
                              </div>
                              <div>
                                <p className="text-muted">Storage</p>
                                <p className="text-white">{container.storage_gb} GB</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedContainer(container)
                                setShowTerminal(true)
                              }}
                              className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 transition-colors"
                              title="Terminal"
                            >
                              <Terminal className="w-4 h-4" />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRestartContainer(container.id)
                              }}
                              className="p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 transition-colors"
                              title="Restart"
                            >
                              <RotateCw className="w-4 h-4" />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteContainer(container.id)
                              }}
                              className="p-2 rounded-lg bg-red/20 hover:bg-red/30 text-red transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Terminal Modal */}
          {showTerminal && selectedContainer && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowTerminal(false)}
            >
              <Card className="w-full max-w-2xl max-h-96 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    Terminal - {selectedContainer.hostname}
                  </CardTitle>
                  <button
                    onClick={() => setShowTerminal(false)}
                    className="text-muted hover:text-white"
                  >
                    ✕
                  </button>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-500 h-64 overflow-auto">
                    <p>$ ssh {selectedContainer.hostname}@openspace.cm</p>
                    <p className="mt-4 text-muted">
                      Terminal connection will open in SSH client...
                    </p>
                    <p className="mt-2 text-yellow-500">
                      IP: {selectedContainer.internal_ip}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
