'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'

const registerSchema = z.object({
  first_name: z.string().min(2, 'Le prénom doit avoir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit avoir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit avoir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setApiError(null)

    try {
      const response = await api.register({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
      })

      if (response.success) {
        setSuccess(true)
        // Rediriger vers login après 2 secondes
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setApiError(response.message || 'Erreur lors de l\'inscription')
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Erreur lors de l\'inscription'
      setApiError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold font-sora mb-2 text-white">Compte créé!</h2>
          <p className="text-muted mb-4">Redirection vers la page de connexion...</p>
        </motion.div>
      </div>
    )
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
          <h1 className="text-3xl font-bold font-sora mb-2 text-white">Inscription</h1>
          <p className="text-muted mb-8">Rejoignez des milliers de développeurs africains</p>

          {/* Error Message */}
          {apiError && (
            <div className="mb-6 p-4 rounded-lg bg-red/10 border border-red/20 text-red text-sm">
              {apiError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Prénom</label>
                <Input
                  type="text"
                  placeholder="Jean"
                  {...register('first_name')}
                  error={!!errors.first_name}
                  disabled={isLoading}
                />
                {errors.first_name && (
                  <p className="text-xs text-red">{errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Nom</label>
                <Input
                  type="text"
                  placeholder="Atangana"
                  {...register('last_name')}
                  error={!!errors.last_name}
                  disabled={isLoading}
                />
                {errors.last_name && (
                  <p className="text-xs text-red">{errors.last_name.message}</p>
                )}
              </div>
            </div>

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

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Confirmer mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="red" size="lg" className="w-full mt-6" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? 'Inscription en cours...' : 'Créer un compte'}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center text-muted text-sm mt-6">
            Vous avez déjà un compte?{' '}
            <Link href="/login" className="text-red hover:text-red-l font-medium">
              Se connecter
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
            <div className="text-2xl">✨</div>
          </div>
          <h2 className="text-2xl font-bold font-sora mb-4 text-white">Prêt à commencer?</h2>
          <p className="text-muted mb-8">
            Inscrivez-vous en moins d'une minute et commencez à déployer vos applications
          </p>
          <div className="space-y-3">
            {[
              'Paiement Mobile Money',
              'Configuration simple',
              'Support communautaire',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 justify-center">
                <CheckCircle2 className="w-5 h-5 text-red" />
                <span className="text-muted">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
