import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

// Types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  is_verified: boolean
  is_admin: boolean
  created_at: string
}

export interface Container {
  id: string
  user_id: string
  docker_id: string
  hostname: string
  plan: string
  ram_limit: string
  cpu_limit: number
  storage_gb: number
  status: 'provisioning' | 'running' | 'stopped' | 'error'
  internal_ip: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: string
  status: 'active' | 'expired' | 'cancelled'
  starts_at: string
  expires_at: string
  container?: Container
}

export interface Payment {
  id: string
  transaction_id: string
  provider: 'cinetpay' | 'notchpay'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  plan: string
  created_at: string
}

export interface Domain {
  id: string
  domain_name: string
  status: 'pending' | 'active' | 'expired'
  registered_at: string
  expires_at: string
  dns_configured: boolean
  nameservers: string[]
}

export interface Plan {
  name: string
  ram: string
  cpus: number
  storage: number
  price: number
}

export interface DatabaseInstance {
  id: string
  user_id: string
  name: string
  engine: 'mysql' | 'postgresql' | 'mongodb' | 'redis'
  version: string
  status: 'creating' | 'active' | 'error' | 'deleting' | 'deleted'
  host: string
  port: number
  database_name: string
  username?: string
  storage_mb: number
  max_connections: number
  created_at: string
  updated_at: string
}

export interface DatabaseInstanceDetails extends DatabaseInstance {
  password?: string
  connection_string?: string
}

export interface DatabaseBackup {
  id: string
  instance_id: string
  size_bytes: number
  storage_path?: string
  type: string
  status: string
  created_at: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  user: User
}

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Intercepteur pour ajouter le token JWT
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Intercepteur pour les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse<null>>) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // ============================================
  // Auth
  // ============================================
  async register(data: { email: string; password: string; first_name: string; last_name: string }) {
    const response = await this.client.post<ApiResponse<User>>('/auth/register', data)
    return response.data
  }

  async login(email: string, password: string) {
    const response = await this.client.post<ApiResponse<TokenPair>>('/auth/login', { email, password })
    if (response.data.success && response.data.data) {
      localStorage.setItem('access_token', response.data.data.access_token)
      localStorage.setItem('refresh_token', response.data.data.refresh_token)
    }
    return response.data
  }

  async getMe() {
    const response = await this.client.get<ApiResponse<User>>('/auth/me')
    return response.data
  }

  async logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  // ============================================
  // Spaces / Containers
  // ============================================
  async getMySpace() {
    const response = await this.client.get<ApiResponse<Container>>('/spaces/me')
    return response.data
  }

  async createSpace(data: { hostname: string; plan: string }) {
    const response = await this.client.post<ApiResponse<Container>>('/spaces/', data)
    return response.data
  }

  async deleteSpace() {
    const response = await this.client.delete<ApiResponse<null>>('/spaces/me')
    return response.data
  }

  // ============================================
  // Payments
  // ============================================
  async initiatePayment(data: {
    plan: string
    hostname: string
    provider: 'cinetpay' | 'notchpay'
    phone_number: string
  }) {
    const response = await this.client.post<ApiResponse<{ payment_url: string; transaction_id: string }>>('/payments/initiate', data)
    return response.data
  }

  async getPaymentStatus(transactionId: string) {
    const response = await this.client.get<ApiResponse<Payment>>(`/payments/${transactionId}`)
    return response.data
  }

  async getPaymentHistory() {
    const response = await this.client.get<ApiResponse<Payment[]>>('/payments/me')
    return response.data
  }

  // ============================================
  // Subscriptions
  // ============================================
  async getCurrentSubscription() {
    const response = await this.client.get<ApiResponse<Subscription>>('/subscriptions/me')
    return response.data
  }

  async cancelSubscription() {
    const response = await this.client.post<ApiResponse<null>>('/subscriptions/cancel')
    return response.data
  }

  // ============================================
  // Domains
  // ============================================
  async searchDomain(domainName: string) {
    const response = await this.client.post<ApiResponse<{ domain_name: string; available: boolean; price: number; currency: string }>>('/domains/search', {
      domain_name: domainName,
    })
    return response.data
  }

  async purchaseDomain(data: { domain_name: string; container_id?: string }) {
    const response = await this.client.post<ApiResponse<Domain>>('/domains/purchase', data)
    return response.data
  }

  async getMyDomains() {
    const response = await this.client.get<ApiResponse<Domain[]>>('/domains/me')
    return response.data
  }

  async configureDNS(domainId: string, containerId: string) {
    const response = await this.client.put<ApiResponse<null>>(`/domains/${domainId}/configure`, { container_id: containerId })
    return response.data
  }

  // ============================================
  // Plans
  // ============================================
  async getPlans() {
    const response = await this.client.get<ApiResponse<Plan[]>>('/plans')
    return response.data
  }

  // ============================================
  // Databases (SQL + NoSQL)
  // ============================================
  async getDatabases() {
    const response = await this.client.get<ApiResponse<DatabaseInstance[]>>('/databases')
    return response.data
  }

  async createDatabase(data: { name: string; engine: string }) {
    const response = await this.client.post<ApiResponse<DatabaseInstance>>('/databases', data)
    return response.data
  }

  async getDatabase(id: string) {
    const response = await this.client.get<ApiResponse<DatabaseInstanceDetails>>(`/databases/${id}`)
    return response.data
  }

  async deleteDatabase(id: string) {
    const response = await this.client.delete<ApiResponse<null>>(`/databases/${id}`)
    return response.data
  }

  async exportDatabase(id: string) {
    const response = await this.client.post<ApiResponse<DatabaseBackup>>(`/databases/${id}/export`)
    return response.data
  }

  async getDatabaseUsers(id: string) {
    const response = await this.client.get<ApiResponse<unknown[]>>(`/databases/${id}/users`)
    return response.data
  }

  // ============================================
  // Health Check
  // ============================================
  async healthCheck() {
    const response = await this.client.get<ApiResponse<{ status: string }>>('/health')
    return response.data
  }

  // ============================================
  // Admin - Containers Management
  // ============================================
  async getAdminContainers() {
    const response = await this.client.get<ApiResponse<Container[]>>('/admin/containers')
    return response.data
  }

  async deleteContainer(containerId: string) {
    const response = await this.client.delete<ApiResponse<null>>(`/admin/containers/${containerId}`)
    return response.data
  }

  async restartContainer(containerId: string) {
    const response = await this.client.post<ApiResponse<null>>(`/admin/containers/${containerId}/restart`, {})
    return response.data
  }

  async getContainerTerminal(containerId: string) {
    const response = await this.client.get<ApiResponse<{ ssh_url: string; ip: string }>>(`/admin/containers/${containerId}/terminal`)
    return response.data
  }

  async getContainerStats(containerId: string) {
    const response = await this.client.get<ApiResponse<{ cpu: number; memory: number; network: string }>>(`/admin/containers/${containerId}/stats`)
    return response.data
  }
}

export const api = new APIClient()
