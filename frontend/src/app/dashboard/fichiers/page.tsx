import { FolderOpen, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function FichiersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">Fichiers</h2>
          <p className="text-sm text-text-secondary">Gestionnaire de fichiers de vos projets</p>
        </div>
        <Button variant="outline"><Upload className="h-4 w-4" /> Importer</Button>
      </div>

      <Card>
        <CardContent className="p-10 text-center">
          <FolderOpen className="mx-auto mb-3 h-10 w-10 text-text-muted" />
          <p className="text-sm text-text-secondary">Explorateur de fichiers en cours de finalisation.</p>
        </CardContent>
      </Card>
    </div>
  )
}
