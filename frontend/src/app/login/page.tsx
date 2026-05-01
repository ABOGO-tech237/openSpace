'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit avoir au moins 6 caractères'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const { setUser } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setApiError(null)

    try {
      const response = await api.login(data.email, data.password)

      if (response.success && response.data) {
        setUser(response.data.user)
        router.push('/dashboard')
      } else {
        setApiError(response.message || 'Erreur de connexion')
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Erreur de connexion'
      setApiError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-bg">
      {/* Left side - Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-red flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="font-sora font-bold text-lg text-white">OpenSpace</span>
          </Link>

          {/* Heading */}
          <h1 className="text-3xl font-bold font-sora mb-2 text-white">Connexion</h1>
          <p className="text-muted mb-8">Accédez à votre espace de gestion</p>

          {/* Error Message */}
          {apiError && (
            <div className="mb-6 p-4 rounded-lg bg-red/10 border border-red/20 text-red text-sm">
              {apiError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Email</label>
              <Input
                type="email"
                placeholder="vous@exemple.com"
                {...register('email')}
                error={!!errors.email}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-red">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                error={!!errors.password}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-xs text-red">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="red" size="lg" className="w-full mt-6" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-muted text-sm mt-6">
            Pas encore de compte?{' '}
            <Link href="/register" className="text-red hover:text-red-l font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Right side - Decorative */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex flex-col items-center justify-center p-8 relative bg-surface"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red/5 to-transparent" />
        <div className="relative z-10 max-w-md text-center">
          <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red/20 border border-red/30">
            <div className="text-2xl">🚀</div>
          </div>
          <h2 className="text-2xl font-bold font-sora mb-4 text-white">Bienvenue</h2>
          <p className="text-muted">
            Connectez-vous pour accéder à votre tableau de bord et gérer vos espaces cloud
          </p>
          <div className="mt-8 space-y-4 text-left">
            {['Déploiement en 1 clic', 'Domaines .cm et .africa', 'Support réactif 24/7'].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red/20 flex items-center justify-center">
                  <span className="text-red text-sm">✓</span>
                </div>
                <span className="text-muted">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
