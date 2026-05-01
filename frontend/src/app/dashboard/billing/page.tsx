'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { useSubscriptionStore, usePaymentsStore } from '@/lib/store'
import { api, type Plan } from '@/lib/api'
import { CreditCard, TrendingUp, AlertCircle, Calendar } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-500' },
  completed: { label: 'Payé', color: 'bg-green-500/20 text-green-500' },
  failed: { label: 'Échoué', color: 'bg-red/20 text-red' },
}

export default function BillingPage() {
  const { subscription, setSubscription } = useSubscriptionStore()
  const { payments, setPayments } = usePaymentsStore()
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [subResponse, paymentsResponse, plansResponse] = await Promise.all([
        api.getCurrentSubscription().catch(() => ({ success: false, data: null })),
        api.getPaymentHistory().catch(() => ({ success: false, data: [] })),
        api.getPlans().catch(() => ({ success: false, data: [] })),
      ])

      if (subResponse.success && subResponse.data) {
        setSubscription(subResponse.data)
      }

      if (paymentsResponse.success && paymentsResponse.data) {
        setPayments(paymentsResponse.data)
      }

      if (plansResponse.success && plansResponse.data) {
        setPlans(plansResponse.data)
      }
    } catch (err) {
      setError('Impossible de charger les données')
    } finally {
      setIsLoading(false)
    }
  }

  const currentPlan = subscription ? plans.find((p) => p.name === subscription.plan) : null

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
        <h1 className="text-3xl font-bold font-sora mb-2 text-white">Facturation</h1>
        <p className="text-muted">Gérez votre abonnement et consultez vos paiements</p>
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

      {/* Current Subscription */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Votre abonnement</CardTitle>
            {subscription ? (
              <CardDescription>
                Plan {currentPlan?.name.charAt(0).toUpperCase()}{currentPlan?.name.slice(1)} — {currentPlan?.price.toLocaleString()} FCFA/mois
              </CardDescription>
            ) : (
              <CardDescription>Aucun abonnement actif</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-muted text-xs mb-1">RAM</p>
                    <p className="font-semibold text-white">{currentPlan?.ram || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs mb-1">vCPU</p>
                    <p className="font-semibold text-white">{currentPlan?.cpus ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs mb-1">Stockage</p>
                    <p className="font-semibold text-white">{currentPlan?.storage ? `${currentPlan.storage} Go` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs mb-1">Statut</p>
                    <Badge className={subscription.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red/20 text-red'}>
                      {subscription.status === 'active' ? 'Actif' : 'Expiré'}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-surface border border-border flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted" />
                  <div>
                    <p className="text-sm text-muted">Prochaine facturation</p>
                    <p className="font-medium text-white">
                      {new Date(subscription.expires_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                <p className="text-muted mb-4">Vous n'avez pas d'abonnement actif</p>
                <p className="text-sm text-muted">Choisissez un plan ci-dessous pour commencer</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Plans */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold font-sora mb-4 text-white">Choisir un plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.name

            return (
              <Card key={plan.name} className={`${isCurrentPlan ? 'ring-2 ring-red' : ''}`}>
                <CardHeader className="pt-6">
                  <CardTitle className="text-lg capitalize text-white">{plan.name}</CardTitle>
                  <div>
                    <span className="text-2xl font-bold text-red">{plan.price.toLocaleString()}</span>
                    <span className="text-muted text-sm"> FCFA/mois</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1 text-sm text-muted">
                    <p>RAM: {plan.ram}</p>
                    <p>vCPU: {plan.cpus}</p>
                    <p>Stockage: {plan.storage} Go</p>
                  </div>
                  <Button
                    variant={isCurrentPlan ? 'outline' : 'red'}
                    className="w-full"
                    size="sm"
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Plan actuel' : 'Choisir ce plan'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Historique des paiements</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                <p className="text-muted">Aucun paiement effectué</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red/10">
                        <TrendingUp className="w-4 h-4 text-red" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white">
                          Plan {payment.plan.charAt(0).toUpperCase()}{payment.plan.slice(1)}
                        </p>
                        <p className="text-xs text-muted">
                          {payment.provider.toUpperCase()} · {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-white">
                        {payment.amount.toLocaleString()} {payment.currency}
                      </p>
                      <Badge className={statusLabels[payment.status]?.color}>
                        {statusLabels[payment.status]?.label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
