# Guide de Démarrage - OpenSpace Frontend

## 🚀 Démarrage rapide

### 1. Installation des dépendances

```bash
cd frontend
npm install
# ou
yarn install
# ou
pnpm install
```

### 2. Configuration de l'environnement

Créez un fichier `.env.local` à la racine du dossier `frontend`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 3. Lancement du serveur de développement

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Le site sera accessible à: **http://localhost:3000**

## 📁 Structure du projet

```
.
├── src/
│   ├── app/                    # Pages Next.js 14 App Router
│   │   ├── page.tsx           # Page d'accueil
│   │   ├── login/             # Page de connexion
│   │   ├── register/          # Page d'inscription
│   │   ├── onboarding/        # Pages d'onboarding
│   │   ├── dashboard/         # Dashboard principal
│   │   │   ├── layout.tsx     # Layout avec sidebar
│   │   │   ├── page.tsx       # Accueil dashboard
│   │   │   ├── space/         # Gestion des espaces
│   │   │   ├── domains/       # Gestion des domaines
│   │   │   └── billing/       # Facturation
│   │   └── layout.tsx         # Layout racine
│   ├── components/
│   │   ├── ui/               # Composants de base
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Spinner.tsx
│   │   ├── landing/          # Sections landing (à compléter)
│   │   ├── dashboard/        # Composants dashboard (à compléter)
│   │   └── onboarding/       # Composants onboarding (à compléter)
│   ├── lib/
│   │   ├── api.ts           # Client API avec Axios
│   │   ├── auth.ts          # Hook useAuth
│   │   ├── store.ts         # State management (Zustand)
│   │   ├── config.ts        # Configuration locale
│   │   └── utils.ts         # Fonctions utilitaires
│   └── styles/
│       └── globals.css      # Styles globaux + variables CSS
├── public/                   # Fichiers statiques
├── package.json             # Dépendances
├── next.config.mjs          # Configuration Next.js
├── tailwind.config.ts       # Configuration Tailwind
├── tsconfig.json            # Configuration TypeScript
└── .env.local              # Variables d'environnement
```

## 🎨 Système de couleurs

Application à travers les variables CSS:

```css
--color-bg: #0B0F1A          /* Fond principal */
--color-surface: #111827     /* Surfaces secondaires */
--color-primary: #00E5A0     /* Vert émeraude */
--color-gold: #F5A623        /* Accent doré */
--color-text: #F9FAFB        /* Texte principal */
--color-text-muted: #6B7280  /* Texte secondaire */
```

## 🔑 Points d'entrée principaux

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/login` | Connexion |
| `/register` | Inscription |
| `/onboarding` | Flux d'onboarding (3 étapes) |
| `/dashboard` | Accueil du dashboard |
| `/dashboard/space` | Gestion des espaces |
| `/dashboard/domains` | Gestion des domaines |
| `/dashboard/billing` | Facturation & plans |

## 🔌 Intégration API

L'API cliente est dans `lib/api.ts`:

```typescript
import { api } from '@/lib/api'

// Authentification
const result = await api.login('email@example.com', 'password')
const result = await api.register('email@example.com', 'password', 'Name')

// Conteneurs
const containers = await api.getContainers()
const container = await api.createContainer({ memory: 512, cpu: 1, storage: 10, hostname: 'myapp' })

// Domaines
const domains = await api.getDomains()
const available = await api.searchDomain('myapp.cm')

// Paiements
const payment = await api.initiatePayment({ planId: 'dev', amount: 3500, paymentMethod: 'mtn_momo', phoneNumber: '237XXXXXXXXX' })
```

## 📦 Stack technologique

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 10.16
- **Formulaires**: React Hook Form 7.50 + Zod 3.22
- **État**: Zustand 4.4 + React Query 5.28
- **HTTP**: Axios 1.6
- **Icons**: Lucide React 0.294
- **Fonts**: Google Fonts (Sora, DM Sans, JetBrains Mono)

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Lancer le build
npm start

# Linting
npm run lint
```

## 🔐 Sécurité

- JWT tokens stockés dans `localStorage`
- Tokens inclus automatiquement dans les en-têtes `Authorization`
- Redirection automatique vers `/login` si non authentifié (401)

## 📝 À faire

- [ ] Compléter les sections landing page (Hero, Pricing, HowItWorks)
- [ ] Ajouter les détails CSS pour les animations typewriter
- [ ] Documenter les composants dashboard avancés
- [ ] Tests unitaires et d'intégration
- [ ] Optimisation des images
- [ ] Configuration CDN/cache
- [ ] Analytics (Plausible ou Mixpanel)

## 🤝 Support

Pour toute question sur la configuration ou le développement, consultez:
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation Framer Motion](https://www.framer.com/motion/)
