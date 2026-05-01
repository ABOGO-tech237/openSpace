'use client'

import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export const useAuth = () => {
  const { user, isAuthenticated, setUser, logout, setLoading } = useAuthStore()

  const register = async (email: string, password: string, first_name: string, last_name: string) => {
    setLoading(true)
    try {
      const response = await api.register({ email, password, first_name, last_name })
      if (response.success && response.data) {
        setUser(response.data)
      }
      return response
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Inscription échouée'
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await api.login(email, password)
      if (response.success && response.data) {
        setUser(response.data.user)
      }
      return response
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Connexion échouée'
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await api.logout()
    logout()
  }

  return { user, isAuthenticated, register, login, logout: handleLogout }
}
