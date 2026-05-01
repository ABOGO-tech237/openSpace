export const PLANS = [
  { name: 'Starter',  ram: '512 Mo', cpu: '0.5', storage: '5 Go',  priceM: 2000,  priceY: 1600,  popular: false, features: ['512 Mo RAM', '0.5 vCPU', '5 Go stockage', 'Sous-domaine', 'SSL auto', 'Support standard'] },
  { name: 'Dev',      ram: '512 Mo', cpu: '1',   storage: '10 Go', priceM: 3500,  priceY: 2800,  popular: true,  features: ['512 Mo RAM', '1 vCPU', '10 Go stockage', '1 domaine custom', 'SSL auto', 'Support prioritaire'] },
  { name: 'Pro',      ram: '1 Go',   cpu: '2',   storage: '20 Go', priceM: 6000,  priceY: 4800,  popular: false, features: ['1 Go RAM', '2 vCPUs', '20 Go stockage', '3 domaines', 'SSL auto', 'Support dédié'] },
  { name: 'Business', ram: '2 Go',   cpu: '4',   storage: '40 Go', priceM: 12000, priceY: 9600,  popular: false, features: ['2 Go RAM', '4 vCPUs', '40 Go stockage', 'Domaines illimités', 'SSL auto', 'Support 24/7'] },
]

export const EXTENSIONS = [
  { tld: '.cm',     price: '15 000 FCFA' },
  { tld: '.com',    price: '9 000 FCFA'  },
  { tld: '.africa', price: '12 000 FCFA' },
  { tld: '.tech',   price: '6 000 FCFA'  },
  { tld: '.app',    price: '7 000 FCFA'  },
  { tld: '.xyz',    price: '2 500 FCFA'  },
  { tld: '.me',     price: '7 000 FCFA'  },
  { tld: '.online', price: '2 500 FCFA'  },
]

export const TESTIMONIALS = [
  { name: 'Rodrigue K.', role: 'Dev web · Yaoundé',        emoji: '👨🏾‍💻', stars: 5, text: '"Lancé mon portfolio en 5 minutes. MTN MoMo a tout changé. Enfin un hébergeur qui comprend notre réalité."' },
  { name: 'Fatoumata D.', role: 'Étudiante info · Douala', emoji: '👩🏾‍💻', stars: 5, text: '"SSL automatique, déploiement en une minute. J\'ai arrêté de perdre du temps à configurer des serveurs."' },
  { name: 'Patrick M.',  role: 'Fondateur startup · Bafoussam', emoji: '👨🏾‍🎓', stars: 5, text: '"2 000 FCFA/mois pour mon API. Prix stables, service impeccable. Je cherchais ça depuis longtemps."' },
]

export const TERMINAL_LINES = [
  { type: 'cmd',  text: 'openspace login --user emmanuel@aurora.cm' },
  { type: 'ok',   text: '✓ Authentifié · emmanuel@aurora.cm' },
  { type: 'sp' },
  { type: 'cmd',  text: 'openspace create --plan dev --name mon-saas' },
  { type: 'info', text: '  Provisioning du container...' },
  { type: 'prog', text: 'Container', duration: 1000 },
  { type: 'ok',   text: '✓ Container démarré (512Mo RAM · 1 vCPU)' },
  { type: 'info', text: '  Configuration SSL...' },
  { type: 'prog', text: 'SSL', duration: 700 },
  { type: 'ok',   text: '✓ Certificat HTTPS activé' },
  { type: 'ok',   text: '✓ DNS propagé en 23ms' },
  { type: 'sp' },
  { type: 'url',  text: '🌍  https://mon-saas.openspace.cm' },
  { type: 'sp' },
  { type: 'cur' },
] as const
