'use client'

import { useEffect, ReactNode, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Spinner } from '@/components/ui/Spinner'

interface AuthProviderProps {
  children: ReactNode
}

// Routes publiques (pas besoin d'être connecté)
const publicRoutes = ['/', '/login', '/register', '/onboarding']

// Routes qui redirigent vers dashboard si déjà connecté
const authRoutes = ['/login', '/register']

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { setUser, isAuthenticated } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token')

      if (!token) {
        setUser(null)
        setIsInitialized(true)
        return
      }

      try {
        const response = await api.getMe()
        if (response.success && response.data) {
          setUser(response.data)
        } else {
          setUser(null)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      } catch (error) {
        setUser(null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      } finally {
        setIsInitialized(true)
      }
    }

    checkAuth()
  }, [setUser])

  useEffect(() => {
    if (!isInitialized) return

    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname?.startsWith(route + '/'))
    const isAuthRoute = authRoutes.includes(pathname || '')

    // Si connecté et sur une page d'auth, rediriger vers dashboard
    if (isAuthenticated && isAuthRoute) {
      router.push('/dashboard')
      return
    }

    // Si non connecté et route protégée, rediriger vers login
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login')
      return
    }
  }, [isInitialized, isAuthenticated, pathname, router])

  // Afficher un spinner pendant la vérification initiale
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
