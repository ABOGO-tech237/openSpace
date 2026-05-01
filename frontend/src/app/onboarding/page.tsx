'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Check, ChevronRight } from 'lucide-react'
import { plans } from '@/lib/config'

const steps = ['Plan', 'Espace', 'Paiement']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    planId: 'dev',
    hostname: '',
    paymentMethod: 'mtn_momo',
  })

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      router.push('/dashboard')
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: { duration: 0.3 },
    },
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Stepper */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex justify-between mb-6">
            {steps.map((stepName, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                    idx < step
                      ? 'bg-primary text-bg'
                      : idx === step
                      ? 'bg-primary text-bg ring-4 ring-primary/30'
                      : 'bg-surface border border-border text-text-muted'
                  }`}
                >
                  {idx < step ? <Check className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`text-xs font-medium ${idx <= step ? 'text-text' : 'text-text-muted'}`}>
                  {stepName}
                </span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-gold"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={step}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Step 1: Plan Selection */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-sora mb-4">Choisir votre plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.slice(0, 3).map((plan) => (
                  <Card
                    key={plan.id}
                    variant="surface"
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      formData.planId === plan.id ? 'ring-2 ring-primary border-primary' : ''
                    }`}
                    onClick={() => setFormData({ ...formData, planId: plan.id })}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{plan.name}</h3>
                          <p className="text-sm text-text-muted">{plan.description}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.planId === plan.id
                              ? 'bg-primary border-primary'
                              : 'border-border'
                          }`}
                        >
                          {formData.planId === plan.id && (
                            <div className="w-2 h-2 bg-bg rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className="text-lg font-bold text-primary mb-3">
                        {plan.price.toLocaleString()} FCFA/mois
                      </p>
                      <ul className="space-y-2">
                        {plan.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-text-muted">
                            <Check className="w-3 h-3 text-success" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Hostname */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-sora mb-4">Créer votre premier espace</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom d'hôte</label>
                    <Input
                      type="text"
                      placeholder="monapp"
                      value={formData.hostname}
                      onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                      disabled={!formData.planId}
                    />
                    <p className="text-xs text-text-muted mt-2">
                      Votre espace sera accessible via:{' '}
                      <span className="text-primary font-mono">
                        {formData.hostname || 'monapp'}.openspace.cm
                      </span>
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-text-muted mb-2">Plan sélectionné:</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="subtle">
                        {plans.find((p) => p.id === formData.planId)?.name || 'Dev'}
                      </Badge>
                      <span className="text-sm text-text-muted">
                        {plans.find((p) => p.id === formData.planId)?.price.toLocaleString()}{' '}
                        FCFA/mois
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-sora mb-4">Méthode de paiement</h2>
              <div className="space-y-3">
                {[
                  { id: 'mtn_momo', name: 'MTN MoMo', icon: '📱' },
                  { id: 'orange_money', name: 'Orange Money', icon: '🟠' },
                ].map((method) => (
                  <Card
                    key={method.id}
                    variant="surface"
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      formData.paymentMethod === method.id
                        ? 'ring-2 ring-primary border-primary'
                        : ''
                    }`}
                    onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentMethod === method.id
                            ? 'bg-primary border-primary'
                            : 'border-border'
                        }`}
                      >
                        {formData.paymentMethod === method.id && (
                          <div className="w-2 h-2 bg-bg rounded-full" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Summary */}
              <Card>
                <CardContent className="p-6 space-y-3">
                  <p className="text-sm text-text-muted">Résumé:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Plan {plans.find((p) => p.id === formData.planId)?.name}</span>
                      <span>
                        {plans.find((p) => p.id === formData.planId)?.price.toLocaleString()}{' '}
                        FCFA
                      </span>
                    </div>
                    <div className="pt-3 border-t border-border flex justify-between font-bold">
                      <span>Total mensuel</span>
                      <span className="text-primary">
                        {plans
                          .find((p) => p.id === formData.planId)
                          ?.price.toLocaleString()}{' '}
                        FCFA
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <div className="flex gap-4 mt-8 justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 0}
          >
            Précédent
          </Button>
          <Button onClick={handleNext}>
            {step === steps.length - 1 ? (
              <>
                Terminer
                <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
