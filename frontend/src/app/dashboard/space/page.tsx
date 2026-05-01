'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { useContainerStore, useUIStore } from '@/lib/store'
import { api, type Plan } from '@/lib/api'
import {
  HardDrive, Copy, Trash2, Plus, Check, AlertCircle,
  ExternalLink, Loader2, RefreshCw
} from 'lucide-react'

const hostnameSchema = z.object({
  hostname: z.string()
    .min(3, 'Le hostname doit avoir au moins 3 caractères')
    .max(30, 'Le hostname ne peut pas dépasser 30 caractères')
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Hostname invalide (lettres minuscules, chiffres et tirets uniquement)'),
})

type HostnameForm = z.infer<typeof hostnameSchema>

const statusLabels: Record<string, { label: string; color: string }> = {
  provisioning: { label: 'En cours de création...', color: 'bg-yellow-500/20 text-yellow-500' },
  running: { label: 'Actif', color: 'bg-green-500/20 text-green-500' },
  stopped: { label: 'Arrêté', color: 'bg-gray-500/20 text-gray-400' },
  error: { label: 'Erreur', color: 'bg-red/20 text-red' },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function SpacePage() {
  const { container, setContainer, isLoading, setLoading, error, setError } = useContainerStore()
  const { isCreateSpaceModalOpen, openCreateSpaceModal, closeCreateSpaceModal } = useUIStore()

  const [step, setStep] = useState<'plan' | 'hostname' | 'payment'>('plan')
  const [plans, setPlans] = useState<Plan[]>([])
  const [chosenPlan, setChosenPlan] = useState<Plan | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<HostnameForm>({
    resolver: zodResolver(hostnameSchema),
  })

  useEffect(() => {
    loadSpace()
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const response = await api.getPlans()
      if (response.success && response.data) {
        setPlans(response.data)
      }
    } catch {
      setPlans([])
    }
  }

  const loadSpace = async () => {
    setLoading(true)
    try {
      const response = await api.getMySpace()
      if (response.success && response.data) {
        setContainer(response.data)
      } else {
        setContainer(null)
      }
    } catch (err) {
      setContainer(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (plan: Plan) => {
    setChosenPlan(plan)
    setStep('hostname')
  }

  const onSubmitHostname = async (data: HostnameForm) => {
    if (!chosenPlan) return

    setIsCreating(true)
    setCreateError(null)

    try {
      const response = await api.createSpace({
        hostname: data.hostname,
        plan: chosenPlan.name,
      })

      if (response.success && response.data) {
        setContainer(response.data)
        closeCreateSpaceModal()
        reset()
        setStep('plan')
        setChosenPlan(null)
      } else {
        setCreateError(response.message || 'Erreur lors de la création')
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteSpace = async () => {
    if (!container || !confirm('Êtes-vous sûr de vouloir supprimer votre espace ? Cette action est irréversible.')) return

    setLoading(true)
    try {
      await api.deleteSpace()
      setContainer(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCloseModal = () => {
    closeCreateSpaceModal()
    setStep('plan')
    setChosenPlan(null)
    setCreateError(null)
    reset()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-sora mb-2 text-white">Mon espace</h1>
            <p className="text-muted">Gérez votre instance de serveur cloud</p>
          </div>
          {!container && (
            <Button variant="red" size="lg" onClick={openCreateSpaceModal}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un espace
            </Button>
          )}
          {container && (
            <Button variant="outline" size="sm" onClick={loadSpace}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          )}
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-lg bg-red/10 border border-red/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red" />
            <p className="text-red text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* No Space - CTA */}
      {!container && (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed border-2 border-border">
            <CardContent className="p-12 text-center">
              <HardDrive className="w-16 h-16 text-muted/30 mx-auto mb-6" />
              <h2 className="text-xl font-semibold mb-2 text-white">Aucun espace créé</h2>
              <p className="text-muted mb-6 max-w-md mx-auto">
                Créez votre premier espace cloud pour déployer vos applications.
                Choisissez un plan adapté à vos besoins.
              </p>
              <Button variant="red" size="lg" onClick={openCreateSpaceModal}>
                <Plus className="w-4 h-4 mr-2" />
                Créer mon espace
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Space Details */}
      {container && (
        <>
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 rounded-lg bg-red/10">
                        <HardDrive className="w-6 h-6 text-red" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-xl font-semibold text-white">{container.hostname}</h2>
                          <Badge className={statusLabels[container.status]?.color}>
                            {statusLabels[container.status]?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted">
                          Créé le {new Date(container.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-surface border border-border">
                      <div>
                        <p className="text-xs text-muted mb-1">Plan</p>
                        <p className="font-medium text-white capitalize">{container.plan}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">RAM</p>
                        <p className="font-medium text-white">{container.ram_limit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">vCPU</p>
                        <p className="font-medium text-white">{container.cpu_limit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Stockage</p>
                        <p className="font-medium text-white">{container.storage_gb} Go</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red hover:text-red border-red/30 hover:border-red/50"
                      onClick={handleDeleteSpace}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Access Info */}
          {container.status === 'running' && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ExternalLink className="w-5 h-5 text-red" />
                    Accès à votre espace
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-surface border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted mb-1">URL de votre espace</p>
                        <code className="text-red font-mono">
                          https://{container.hostname}.openspace.cm
                        </code>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`https://${container.hostname}.openspace.cm`)}
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-surface border border-border">
                    <p className="text-xs text-muted mb-2">Accès SFTP</p>
                    <div className="font-mono text-sm space-y-1 text-white">
                      <div><span className="text-muted">Host:</span> sftp.openspace.cm</div>
                      <div><span className="text-muted">Port:</span> 22</div>
                      <div><span className="text-muted">User:</span> {container.hostname}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {container.status === 'provisioning' && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6 text-center">
                  <Spinner size="lg" />
                  <p className="text-muted mt-4">
                    Votre espace est en cours de création... Cela peut prendre quelques minutes.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}

      {/* Create Space Modal */}
      <Modal isOpen={isCreateSpaceModalOpen} onClose={handleCloseModal} title="Créer un espace">
        {step === 'plan' && (
          <div className="space-y-4">
            <p className="text-muted text-sm mb-4">Choisissez le plan qui correspond à vos besoins</p>
            {plans.length === 0 ? (
              <div className="p-3 rounded-lg border border-border text-sm text-muted">
                Aucun plan recu depuis le backend.
              </div>
            ) : (
            <div className="grid gap-3">
              {plans.map((plan) => (
                <button
                  key={plan.name}
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full p-4 rounded-lg border border-border hover:border-red/50 transition-colors text-left bg-surface"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white capitalize">{plan.name}</h3>
                    <span className="text-red font-bold">{plan.price.toLocaleString()} FCFA/mois</span>
                  </div>
                  <p className="text-sm text-muted">
                    {plan.ram} RAM · {plan.cpus} vCPU · {plan.storage} Go stockage
                  </p>
                </button>
              ))}
            </div>
            )}
          </div>
        )}

        {step === 'hostname' && chosenPlan && (
          <form onSubmit={handleSubmit(onSubmitHostname)} className="space-y-4">
            <div className="p-3 rounded-lg bg-red/10 text-sm">
              <span className="text-muted">Plan choisi:</span>{' '}
              <span className="text-white font-medium capitalize">{chosenPlan.name}</span>{' '}
              <span className="text-red">({chosenPlan.price.toLocaleString()} FCFA/mois)</span>
            </div>

            <div>
              <label className="text-sm font-medium text-white block mb-2">
                Choisissez un hostname
              </label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="mon-app"
                  {...register('hostname')}
                  error={!!errors.hostname}
                  disabled={isCreating}
                />
                <span className="text-muted text-sm">.openspace.cm</span>
              </div>
              {errors.hostname && (
                <p className="text-xs text-red mt-1">{errors.hostname.message}</p>
              )}
            </div>

            {createError && (
              <div className="p-3 rounded-lg bg-red/10 border border-red/20 text-red text-sm">
                {createError}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep('plan')} disabled={isCreating}>
                Retour
              </Button>
              <Button type="submit" variant="red" className="flex-1" disabled={isCreating}>
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isCreating ? 'Création...' : 'Créer mon espace'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </motion.div>
  )
}
