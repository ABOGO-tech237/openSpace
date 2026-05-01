# Next.js Frontend - OpenSpace

Frontend Next.js 14 pour OpenSpace, plateforme cloud africaine.

## Stack Recommandée

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + CSS Variables custom
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Formulaires**: React Hook Form + Zod
- **État**: Zustand + React Query
- **Fonts**: Google Fonts (Sora, DM Sans, JetBrains Mono)

## Installation

```bash
npm install
# ou
yarn install
```

## Variables d'environnement

Créez un fichier `.env.local` :

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Développement

```bash
npm run dev
# ou
yarn dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure des dossiers

```
src/
├── app/                   # Pages Next.js App Router
│   ├── page.tsx          # Landing page
│   ├── login/            # Page de connexion
│   ├── register/         # Page d'inscription
│   ├── onboarding/       # Flow d'onboarding
│   ├── dashboard/        # Layout du dashboard
│   │   ├── page.tsx      # Dashboard principal
│   │   ├── space/        # Gestion des espaces
│   │   ├── domains/      # Gestion des domaines
│   │   └── billing/      # Facturation
│   └── layout.tsx        # Layout racine
├── components/
│   ├── ui/               # Composants réutilisables
│   ├── landing/          # Sections landing page
│   ├── dashboard/        # Composants dashboard
│   └── onboarding/       # Composants onboarding
├── lib/
│   ├── api.ts           # Client API
│   ├── auth.ts          # Logique d'authentification
│   ├── store.ts         # État global (Zustand)
│   └── config.ts        # Configuration locale
└── styles/
    └── globals.css      # Variables CSS globales
```

## Déploiement

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Authentification

Les tokens JWT sont stockés dans `localStorage` et inclus automatiquement dans les requêtes API.

## Points clés de design

- **Couleur primaire**: `#00E5A0` (Emerald Green)
- **Couleur d'accent**: `#F5A623` (Gold)
- **Fond**: `#0B0F1A` (Deep Night)
- **Surface**: `#111827` (Surface)
- **Typographie**: Sora (display), DM Sans (body), JetBrains Mono (code)
