'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { useDomainsStore, useContainerStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Globe, Search, Check, X, Loader2, AlertCircle } from 'lucide-react'

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
  active: { label: 'Actif', color: 'bg-green-500/20 text-green-500' },
  expired: { label: 'Expiré', color: 'bg-red/20 text-red' },
}

export default function DomainsPage() {
  const { domains, setDomains, addDomain, isLoading, setLoading, error, setError } = useDomainsStore()
  const { container } = useContainerStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<{
    domain_name: string
    available: boolean
    price: number
    currency: string
  } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  useEffect(() => {
    loadDomains()
  }, [])

  const loadDomains = async () => {
    setLoading(true)
    try {
      const response = await api.getMyDomains()
      if (response.success && response.data) {
        setDomains(response.data)
      }
    } catch (err) {
      setError('Impossible de charger vos domaines')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchError(null)
    setSearchResult(null)
    setPurchaseSuccess(false)

    try {
      const response = await api.searchDomain(searchQuery.trim())
      if (response.success && response.data) {
        setSearchResult(response.data)
      } else {
        setSearchError(response.message || 'Erreur lors de la recherche')
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.message || 'Erreur lors de la recherche')
    } finally {
      setIsSearching(false)
    }
  }

  const handlePurchase = async () => {
    if (!searchResult || !searchResult.available) return

    setIsPurchasing(true)
    setSearchError(null)

    try {
      const response = await api.purchaseDomain({
        domain_name: searchResult.domain_name,
        container_id: container?.id,
      })

      if (response.success && response.data) {
        addDomain(response.data)
        setPurchaseSuccess(true)
        setSearchQuery('')
        setSearchResult(null)
      } else {
        setSearchError(response.message || 'Erreur lors de l\'achat')
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.message || 'Erreur lors de l\'achat')
    } finally {
      setIsPurchasing(false)
    }
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
        <h1 className="text-3xl font-bold font-sora mb-2 text-white">Mes domaines</h1>
        <p className="text-muted">Recherchez et achetez des noms de domaine africains</p>
      </motion.div>

      {/* Search Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-muted pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="monapp.cm, exemple.africa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    disabled={isSearching}
                  />
                </div>
                <Button variant="red" disabled={isSearching || !searchQuery.trim()}>
                  {isSearching && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Chercher
                </Button>
              </div>
              <p className="text-xs text-muted">
                Extensions disponibles: .cm, .africa, .com, .net, .org
              </p>
            </form>

            {/* Search Error */}
            {searchError && (
              <div className="mt-4 p-3 rounded-lg bg-red/10 border border-red/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red" />
                <p className="text-red text-sm">{searchError}</p>
              </div>
            )}

            {/* Purchase Success */}
            {purchaseSuccess && (
              <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <p className="text-green-500 text-sm">Domaine acheté avec succès!</p>
              </div>
            )}

            {/* Search Result */}
            {searchResult && (
              <div className="mt-6 p-4 rounded-lg bg-surface border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${searchResult.available ? 'bg-green-500/10' : 'bg-red/10'}`}>
                      {searchResult.available ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{searchResult.domain_name}</p>
                      <p className="text-sm text-muted">
                        {searchResult.available ? 'Disponible' : 'Non disponible'}
                        {searchResult.available && ` · ${searchResult.price.toLocaleString()} ${searchResult.currency}/an`}
                      </p>
                    </div>
                  </div>
                  {searchResult.available && (
                    <Button variant="red" size="sm" onClick={handlePurchase} disabled={isPurchasing}>
                      {isPurchasing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isPurchasing ? 'Achat...' : 'Acheter'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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

      {/* My Domains */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold font-sora mb-4 text-white">Mes domaines</h2>

        {domains.length === 0 ? (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="p-12 text-center">
              <Globe className="w-16 h-16 text-muted/30 mx-auto mb-6" />
              <h3 className="text-lg font-semibold mb-2 text-white">Aucun domaine</h3>
              <p className="text-muted mb-4">
                Recherchez et achetez votre premier nom de domaine ci-dessus.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {domains.map((domain) => (
              <Card key={domain.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Globe className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-white">{domain.domain_name}</p>
                        <p className="text-sm text-muted">
                          {domain.expires_at && `Expire le ${new Date(domain.expires_at).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3">
                      <Badge className={statusLabels[domain.status]?.color}>
                        {statusLabels[domain.status]?.label}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted">
                        {domain.dns_configured ? (
                          <span className="flex items-center gap-1 text-green-500">
                            <Check className="w-4 h-4" /> DNS configuré
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-500">
                            <AlertCircle className="w-4 h-4" /> DNS non configuré
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {domain.nameservers && domain.nameservers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted mb-2">Nameservers</p>
                      <div className="flex flex-wrap gap-2">
                        {domain.nameservers.map((ns, idx) => (
                          <code key={idx} className="px-2 py-1 rounded bg-surface text-xs text-white">
                            {ns}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
