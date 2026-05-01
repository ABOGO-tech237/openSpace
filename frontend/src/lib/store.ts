import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Container, Subscription, Domain, Payment } from './api'

// ============================================
// Auth Store
// ============================================
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// ============================================
// Container Store
// ============================================
export interface ContainerState {
  container: Container | null
  isLoading: boolean
  error: string | null

  setContainer: (container: Container | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clear: () => void
}

export const useContainerStore = create<ContainerState>((set) => ({
  container: null,
  isLoading: false,
  error: null,

  setContainer: (container) => set({ container, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clear: () => set({ container: null, error: null }),
}))

// ============================================
// Subscription Store
// ============================================
export interface SubscriptionState {
  subscription: Subscription | null
  isLoading: boolean
  error: string | null

  setSubscription: (subscription: Subscription | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clear: () => void
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  isLoading: false,
  error: null,

  setSubscription: (subscription) => set({ subscription, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clear: () => set({ subscription: null, error: null }),
}))

// ============================================
// Domains Store
// ============================================
export interface DomainsState {
  domains: Domain[]
  isLoading: boolean
  error: string | null

  setDomains: (domains: Domain[]) => void
  addDomain: (domain: Domain) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clear: () => void
}

export const useDomainsStore = create<DomainsState>((set) => ({
  domains: [],
  isLoading: false,
  error: null,

  setDomains: (domains) => set({ domains, error: null }),
  addDomain: (domain) => set((state) => ({ domains: [...state.domains, domain] })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clear: () => set({ domains: [], error: null }),
}))

// ============================================
// Payments Store
// ============================================
export interface PaymentsState {
  payments: Payment[]
  pendingPayment: { transactionId: string; paymentUrl: string } | null
  isLoading: boolean
  error: string | null

  setPayments: (payments: Payment[]) => void
  setPendingPayment: (pending: { transactionId: string; paymentUrl: string } | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clear: () => void
}

export const usePaymentsStore = create<PaymentsState>((set) => ({
  payments: [],
  pendingPayment: null,
  isLoading: false,
  error: null,

  setPayments: (payments) => set({ payments, error: null }),
  setPendingPayment: (pendingPayment) => set({ pendingPayment }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clear: () => set({ payments: [], pendingPayment: null, error: null }),
}))

// ============================================
// UI Store (pour les modals, toasts, etc.)
// ============================================
export interface UIState {
  isCreateSpaceModalOpen: boolean
  isPaymentModalOpen: boolean
  selectedPlan: string | null

  openCreateSpaceModal: () => void
  closeCreateSpaceModal: () => void
  openPaymentModal: (plan: string) => void
  closePaymentModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isCreateSpaceModalOpen: false,
  isPaymentModalOpen: false,
  selectedPlan: null,

  openCreateSpaceModal: () => set({ isCreateSpaceModalOpen: true }),
  closeCreateSpaceModal: () => set({ isCreateSpaceModalOpen: false }),
  openPaymentModal: (plan) => set({ isPaymentModalOpen: true, selectedPlan: plan }),
  closePaymentModal: () => set({ isPaymentModalOpen: false, selectedPlan: null }),
}))
