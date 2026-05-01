import Image from 'next/image'

const footerLinks = {
  Produit: ['Plans', 'Domaines', 'Dashboard', 'API'],
  Ressources: ['Docs', 'Blog', 'Support', 'Changelog'],
  Entreprise: ['À propos', 'Contact', 'Statut', 'Carrières'],
  Légal: ['Confidentialité', 'CGU', 'Cookies', 'Mentions légales'],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/30 relative z-10">
      <div className="max-w-[1200px] mx-auto px-12 py-16">
        {/* Top section */}
        <div className="grid grid-cols-5 gap-8 mb-12 pb-12 border-b border-border">
          {/* Logo */}
          <div>
            <Image src="/logo.png" alt="OpenSpace" width={140} height={40} className="h-10 w-auto mb-4" />
            <p className="text-muted text-sm">
              Plateforme cloud pour développeurs et étudiants africains.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-sm mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-muted text-sm hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="flex items-center justify-between">
          <p className="text-muted text-sm">
            © 2024 OpenSpace. Construit par <a href="#" className="text-red hover:text-red-l">AURORA IT</a>.
          </p>
          <div className="flex items-center gap-4">
            {[
              { name: 'Twitter', href: '#' },
              { name: 'GitHub', href: '#' },
              { name: 'Discord', href: '#' },
              { name: 'LinkedIn', href: '#' },
            ].map(social => (
              <a
                key={social.name}
                href={social.href}
                className="text-muted hover:text-red transition-colors text-sm"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
