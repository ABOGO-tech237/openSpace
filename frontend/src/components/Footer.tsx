'use client'

export function Footer() {
  return (
    <footer className="border-t border-[#1C2333] py-16 px-12 bg-[#080A0F]">
      <div className="max-w-6xl mx-auto mb-12">
        <div className="grid grid-cols-4 gap-12">
          <div>
            <h3 className="font-bold text-white mb-4">Produit</h3>
            <ul className="space-y-3 text-sm">
              {['Fonctionnalités', 'Plans', 'Domaines', 'CLI'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-[#8B95A8] hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Entreprise</h3>
            <ul className="space-y-3 text-sm">
              {['À propos', 'Blog', 'Emplois', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-[#8B95A8] hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Ressources</h3>
            <ul className="space-y-3 text-sm">
              {['Docs', 'Guides', 'SDK', 'API'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-[#8B95A8] hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              {['Centre d\'aide', 'Contact', 'Status', 'CGU'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-[#8B95A8] hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex items-center justify-between pt-8 border-t border-[#1C2333] text-xs text-[#2A3347]">
          <span>© 2026 OpenSpace · AURORA IT Corporation · Yaoundé, Cameroun</span>
          <span>Fait avec ❤️ en Afrique</span>
        </div>
      </div>
    </footer>
  )
}
