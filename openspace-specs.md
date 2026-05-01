# OPENSPACE — SPECIFICATIONS COMPLETES
# SaaS Cloud Hosting pour etudiants et PME africaines
# Inspired by Hostinger hPanel
# Redige par : Emmanuel Atangana Abogo — AURORA IT Corporation
# Date : Avril 2026

================================================================================
PARTIE 1 — FRONTEND
================================================================================

------------------------------------------------------------------------
1.1 VISION UI
------------------------------------------------------------------------

OpenSpace adopte le pattern hPanel de Hostinger : interface SaaS clean,
minimaliste, non-technique. L'utilisateur ne doit jamais etre perdu.
Chaque action critique est a maximum 2 clics.

Philosophie : "ne jamais perdre un utilisateur non-technique"
Audience : etudiants, developpeurs juniors, PME africaines
Ton visuel : professionnel, aere, violet comme couleur de confiance


------------------------------------------------------------------------
1.2 DESIGN SYSTEM
------------------------------------------------------------------------



TYPOGRAPHIE
-----------
Font principale  : "Plus Jakarta Sans" (Google Fonts)
Fallback         : system-ui, -apple-system, sans-serif

Echelle :
  H1  : 24px, weight 700    (titre de page)
  H2  : 18px, weight 600    (titre de section)
  H3  : 16px, weight 600    (titre de card)
  Body: 14px, weight 400    (contenu courant)
  Sm  : 13px, weight 400    (meta, descriptions)
  Xs  : 12px, weight 500    (labels, badges)
  XX  : 11px, weight 600    (uppercase labels, table headers)


TOKENS UI
---------
border-radius    : 12px  (cards, inputs, modals)
border-radius-sm : 8px   (boutons, badges, chips)
border-radius-lg : 16px  (modals larges, panels)
border-radius-xl : 20px  (badges ronds)

box-shadow card  : 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
box-shadow hover : 0 4px 12px rgba(0,0,0,0.08)
box-shadow lg    : 0 8px 24px rgba(0,0,0,0.10)

Spacing scale (base 8px) :
  4px  8px  12px  16px  20px  24px  32px  40px  48px  64px


TRANSITIONS
-----------
Standard  : all 0.18s ease
Boutons   : all 0.15s ease
Modals    : opacity + translateY 0.2s ease


------------------------------------------------------------------------
1.3 LAYOUT GLOBAL
------------------------------------------------------------------------

+----------------------------------------------------------+
|                    TOPBAR (64px height)                  |
+------------------+---------------------------------------+
|                  |                                       |
|  SIDEBAR         |        MAIN CONTENT                   |
|  (240px fixed)   |        (fluid, max-width 1280px)      |
|                  |        padding : 32px                 |
|                  |                                       |
+------------------+---------------------------------------+

Sidebar   : position fixed left, hauteur 100vh, z-index 40
Topbar    : position fixed top, left 240px, right 0, z-index 30
Content   : margin-left 240px, padding-top 64px


------------------------------------------------------------------------
1.4 SIDEBAR — COMPOSANT
------------------------------------------------------------------------

Structure :
  [Logo OpenSpace]
  [Separator]
  [Nav principal — grouped]
  [Separator]
  [Nav bottom]

Groupes nav :
  Groupe "Hosting"
    - Dashboard (icone : LayoutDashboard)
    - Projets (icone : Server)
    - Fichiers (icone : FolderOpen)

  Groupe "Domaines & Reseau"
    - Domaines (icone : Globe)
    - Emails (icone : Mail)

  Groupe "Infrastructure"
    - Bases de donnees (icone : Database)
    - Terminal (icone : Terminal)

  Groupe "Compte"
    - Facturation (icone : CreditCard)
    - Parametres (icone : Settings)

  Bottom
    - Deconnexion (icone : LogOut)

Style par etat :
  Default  : color text-secondary, fond transparent
  Hover    : color text-primary, fond #F3F4F6
  Active   : color #673DE6, fond #F0EBFF, texte gras

Chaque item nav :
  height 40px, padding horizontal 16px
  flex items-center gap 10px
  border-radius 8px
  icone 18px
  label font-size 14px

Label groupe :
  font-size 11px, uppercase, letter-spacing 0.08em
  color text-muted, padding horizontal 16px, margin-bottom 4px


------------------------------------------------------------------------
1.5 TOPBAR — COMPOSANT
------------------------------------------------------------------------

Contenu de gauche a droite :
  [Breadcrumb / Titre de page courant]
  [flex-1 spacer]
  [Search bar]
  [Separator vertical]
  [Cloche notifications avec badge rouge]
  [Avatar utilisateur + nom + chevron dropdown]

Search bar :
  width 240px, height 36px
  background #F4F5F7, border 1px solid #E5E7EB
  placeholder "Rechercher..."
  border-radius 8px, icone Search a gauche

Avatar dropdown :
  clic ouvre menu : Profil / Parametres / Deconnexion
  avatar : 32px, initiales ou photo


------------------------------------------------------------------------
1.6 COMPOSANTS REUTILISABLES
------------------------------------------------------------------------

CARD
----
background white
border 1px solid #E5E7EB
border-radius 12px
padding 20px (standard) ou 24px (large)
box-shadow leger
hover : border #D1D5DB, shadow eleve
transition all 0.18s ease

Structure interne standard :
  [Card Header] : titre H3 + action optionnelle (lien ou bouton icon)
  [Card Body]   : contenu libre
  [Card Footer] : actions principales (optionnel)


BUTTON
------
Variants :

  Primary
    background #de1717
    color white
    hover : background #ec1313, shadow
    padding : 8px 16px (md) | 6px 12px (sm) | 10px 20px (lg)
    border-radius 8px
    font-size 14px, weight 600

  Secondary (outline)
    background white
    border 1px solid #E5E7EB
    color #374151
    hover : border #D1D5DB, background #F9FAFB

  Ghost
    background transparent
    color #6B7280
    hover : background #F3F4F6

  Danger
    background white
    border 1px solid #FECACA
    color #EF4444
    hover : background #FEF2F2

  Icon-only
    width 36px, height 36px, padding 0
    border-radius 8px, variant secondary ou ghost


BADGE / STATUS
--------------
  Actif        : text #10B981, bg #ECFDF5, icone CheckCircle
  Arrete       : text #6B7280, bg #F3F4F6, icone Square
  Erreur       : text #EF4444, bg #FEF2F2, icone AlertCircle
  En construction : text #F59E0B, bg #FFFBEB, icone Clock
  En attente   : text #F59E0B, bg #FFFBEB, icone Clock

Style commun :
  padding 3px 10px, border-radius 20px
  font-size 11px, weight 600
  flex items-center gap 4px


INPUT / FORM
------------
height 40px, padding 0 12px
border 1px solid #E5E7EB, border-radius 8px
focus : border #673DE6, ring 2px rgba(103,61,230,0.15)
font-size 14px, color #111827
placeholder color #9CA3AF
transition border 0.15s


TABLE
-----
border-radius 12px, overflow hidden
thead :
  background #F9FAFB
  th : font-size 11px, uppercase, letter-spacing 0.06em, color #6B7280, weight 600
  padding 12px 20px
tbody tr :
  border-top 1px solid #F3F4F6
  td : padding 14px 20px, font-size 14px
  hover : background #F9FAFB


PROGRESS BAR
------------
height 6px, border-radius 3px
background #E5E7EB
fill : gradient #673DE6 → #9B6DFF
transition width 0.6s ease


STAT CARD
---------
Card avec :
  icone colore dans carre arrondi (40x40, radius 10px)
  valeur principale : 28px, weight 800
  label : 13px, text-secondary
  variation optionnelle : +X% en vert ou rouge


------------------------------------------------------------------------
1.7 PAGES
------------------------------------------------------------------------

PAGE 1 : DASHBOARD 
--------------------------
URL : /dashboard

Layout :
  [Greeting] "Bonjour, Emmanuel" + date du jour

  [Stat strip — 4 cards horizontales]
    - Projets actifs   : valeur / total
    - Uptime global    : %
    - RAM utilisee     : X GB / Y GB (progress bar)
    - Stockage         : X GB / Y GB (progress bar)

  [Quick Actions — ligne de boutons]
    + Nouveau projet | + Nouveau domaine | + Nouvelle base de donnees

  [Section "Mes Projets" — grid 3 colonnes]
    Chaque project card contient :
      - Nom du projet (monospace)
      - Type (badge bleu : Node.js / Python / Go / Next.js / Static)
      - Plan (badge : Starter / Pro / Business)
      - Domaine avec icone lien externe
      - Status badge
      - Boutons : [Gerer] [Dashboard] [...]

  [Section bas — 2 colonnes]
    Gauche : "Derniere activite" — log des 5 derniers deploiements
    Droite : "Usage ressources" — barres RAM, CPU, Stockage


PAGE 2 : PROJETS
-----------------
URL : /projets

Layout :
  [Header] Titre "Projets" + bouton "+ Nouveau projet"
  [Filtres] tabs : Tous | Actifs | Arretes | En erreur
  [Grid 3 colonnes] Project cards

  Detail projet (vue projet individuel) :
    Tabs horizontaux : Vue d'ensemble | Terminal | Logs | Domaines | Variables | Parametres

    Tab "Vue d'ensemble" :
      - Stats (RAM, CPU, Uptime, Deploiements)
      - Graphe usage (7 derniers jours)
      - Dernier deploiement : commit hash, branche, date

    Tab "Terminal" :
      - Panel terminal style xterm : fond #1C1C27, font mono
      - Header avec nom container + status WebSocket
      - Input commande en bas
      - Actions : Restart container | Stop | Rebuild

    Tab "Logs" :
      - Selecteur de deploiement (dropdown)
      - Flux de logs avec timestamp, niveau (INFO/ERROR/SUCCESS)
      - Couleurs : INFO = bleu, ERROR = rouge, SUCCESS = vert

    Tab "Domaines" :
      - Domaine par defaut (openspace.cm) — toujours actif, badge SSL
      - Ajouter domaine custom : input + bouton Verifier
      - Stepper DNS : Entrer domaine → CNAME → Verification → SSL

    Tab "Variables" :
      - Table : cle | valeur masquee | bouton toggle | bouton supprimer
      - Bouton "+ Ajouter variable"
      - Bouton "Importer .env"

    Tab "Parametres" :
      - Renommer le projet
      - Changer de plan
      - Zone dangereuse : Supprimer le projet


PAGE 3 : DOMAINES
------------------
URL : /domaines

Layout :
  [Header] "Domaines" + bouton "+ Connecter un domaine"
  [Table full-width]
    Colonnes : Domaine | Type | Statut | SSL | Expiration | Actions
  [Section] "Ajouter un domaine externe" — input + guide CNAME

  Logique SSL :
    - SSL auto via Let's Encrypt pour tous les *.openspace.cm
    - SSL custom pour domaines externes : Let's Encrypt via Traefik ACME
    - Afficher date expiration cert + bouton Renouveler

  Detail domaine (modal ou page) :
    - DNS records (A, CNAME, TXT, MX) — tableau
    - Redirection vers projet (select)
    - Statut verification DNS polling


PAGE 4 : EMAILS
----------------
URL : /emails

Layout :
  [Header] "Emails" + bouton "+ Creer un email"
  [Cards grid] — une card par adresse email
    Contient : adresse, quota (progress bar), statut, boutons

  Acces Webmail :
    Bouton "Ouvrir Webmail" — ouvre Roundcube dans nouvel onglet

  Note : Backend email = Mailcow sur VPS dedie


PAGE 5 : BASES DE DONNEES
--------------------------
URL : /databases

Layout :
  [Header] "Bases de donnees" + bouton "+ Creer"
  [Table] Nom | Type | Taille | Statut | Utilisateurs | Actions
  [Section] Creer une base : form nom + type (PostgreSQL / Redis / MySQL)

  Actions par base :
    - Ouvrir phpMyAdmin / pgAdmin (iframe ou nouvel onglet)
    - Exporter (dump SQL)
    - Supprimer

  Utilisateurs DB :
    - Table utilisateurs avec roles
    - Bouton generer mot de passe fort


PAGE 6 : TERMINAL
------------------
URL : /terminal

Layout :
  [Header] "Terminal" + selecteur de projet (dropdown)
  [Panel xterm] :
    Fond : #1E1E2E (Catppuccin Mocha)
    Font : "JetBrains Mono" ou "Fira Code"
    Font-size : 13px
    Line-height : 1.6

  Connexion WebSocket :
    wss://api.openspace.cm/ws/projects/{id}/terminal?token={jwt}
    Bibliotheque frontend : xterm.js + xterm-addon-fit

  Header panel :
    - Dots macOS (rouge/orange/vert decoratifs)
    - Label "terminal — {nom-projet}"
    - Badge "WebSocket Connected" en vert si connecte

  Footer input :
    Invite "$" en violet + input texte

  Actions rapides a droite :
    - Restart container
    - Stop container
    - Clear terminal


PAGE 7 : FACTURATION
---------------------
URL : /facturation

Layout :
  [Section Plan actuel]
    Card : plan, prix, date renouvellement, bouton Changer

  [Section Comparaison des plans — 3 cards]

    Starter — 2 000 FCFA/mois
      1 projet, 512 MB RAM, 1 vCPU, 5 GB stockage
      50 GB bande passante, 1 domaine, 2 emails

    Pro — 5 000 FCFA/mois [BADGE : Actuel]
      5 projets, 2 GB RAM, 2 vCPU, 20 GB stockage
      200 GB bande passante, 5 domaines, 10 emails

    Business — 12 000 FCFA/mois
      Projets illimites, 8 GB RAM, 4 vCPU, 100 GB stockage
      1 TB bande passante, domaines illimites, emails illimites

  [Section Historique des paiements]
    Table : Date | Description | Montant | Statut | Recu PDF

  Modes de paiement acceptes :
    - Mobile Money (MTN MoMo, Orange Money via CinetPay)
    - Carte bancaire (Stripe pour diaspora)
    Note : prepaiement annuel genere cash flow immediat


PAGE 8 : PARAMETRES
--------------------
URL : /parametres

Sections :
  - Profil : nom, email, mot de passe, photo
  - Securite : 2FA, sessions actives
  - Notifications : email, push, alertes deploiement
  - SSH Keys : liste, ajout, suppression
  - Webhooks : URL, evenements (deploy, error, restart)
  - API Tokens : liste, creation avec scopes, revocation


------------------------------------------------------------------------
1.8 RESPONSIVE
------------------------------------------------------------------------

Breakpoints :
  mobile  : < 768px
  tablet  : 768px — 1024px
  desktop : > 1024px

Mobile :
  Sidebar devient drawer (hamburger toggle)
  Cards grid : 1 colonne
  Topbar : titre seulement + hamburger + avatar

Tablet :
  Sidebar icones seulement (collapsed 64px)
  Cards grid : 2 colonnes

Desktop :
  Sidebar pleine 240px
  Cards grid : 3 colonnes
  max-width content : 1280px, centre


================================================================================
PARTIE 2 — BACKEND
================================================================================

------------------------------------------------------------------------
2.1 STACK TECHNIQUE
------------------------------------------------------------------------

Langage       : Go 1.22 (Gin framework)
Base de donnees : PostgreSQL 16 (donnees app) + Redis 7 (sessions, cache)
Infrastructure : VPS Contabo (16 vCPU, 60 GB RAM, 400 GB SSD) — 1 node initial
Orchestration : Docker Engine API (direct) via Docker SDK for Go
Reverse proxy : Traefik v3 (routing automatique, SSL automatique)
Deploiement   : Coolify pour le deploiement d'OpenSpace lui-meme
Paiement      : CinetPay (MTN MoMo, Orange Money) + Stripe (cartes)


------------------------------------------------------------------------
2.2 ARCHITECTURE GLOBALE
------------------------------------------------------------------------

Internet
   |
[Traefik v3]  ← reverse proxy + TLS termination
   |
   +──────────────────────────────────────────────────────+
   |                                                       |
[API Go]                                          [Containers users]
api.openspace.cm                                  {slug}.openspace.cm
   |
   +── PostgreSQL (donnees users, projets, domains)
   +── Redis (sessions JWT, cache DNS, job queue)
   +── Docker API Socket (/var/run/docker.sock)

Architecture monolithique modulaire au depart.
Migration vers microservices quand > 500 users actifs.


------------------------------------------------------------------------
2.3 STRUCTURE DU PROJET GO
------------------------------------------------------------------------

openspace-api/
  cmd/
    server/
      main.go          ← entrypoint HTTP + WebSocket
  internal/
    auth/              ← JWT, middleware, 2FA
    projects/          ← CRUD projets, cycle de vie containers
    domains/           ← gestion domaines, verification DNS, SSL
    terminal/          ← WebSocket → Docker exec
    billing/           ← plans, paiements CinetPay/Stripe, webhooks
    emails/            ← integration Mailcow API
    databases/         ← creation DB PostgreSQL/Redis/MySQL
    storage/           ← gestion quotas fichiers
    notifications/     ← emails transactionnels, push
  pkg/
    docker/            ← wrapper Docker SDK
    traefik/           ← configuration dynamique Traefik via API
    dns/               ← verification DNS polling
    mailer/            ← SMTP transactionnel (Mailgun ou Resend)
  migrations/          ← fichiers SQL migration (golang-migrate)
  config/
    config.go          ← variables d'environnement


------------------------------------------------------------------------
2.4 MODELE DE DONNEES (PostgreSQL)
------------------------------------------------------------------------

TABLE users
  id            UUID PRIMARY KEY
  email         VARCHAR UNIQUE NOT NULL
  password_hash VARCHAR NOT NULL
  name          VARCHAR NOT NULL
  plan          ENUM('starter', 'pro', 'business') DEFAULT 'starter'
  created_at    TIMESTAMP
  updated_at    TIMESTAMP

TABLE projects
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES users(id)
  name          VARCHAR NOT NULL
  slug          VARCHAR UNIQUE NOT NULL
  type          VARCHAR (nodejs, python, go, php, static, postgresql, redis)
  status        ENUM('queued', 'building', 'running', 'stopped', 'error')
  container_id  VARCHAR (Docker container ID)
  image_tag     VARCHAR (image Docker buildee)
  env_vars      JSONB (variables chiffrees AES-256)
  plan_override VARCHAR NULL
  created_at    TIMESTAMP
  updated_at    TIMESTAMP

TABLE deployments
  id            UUID PRIMARY KEY
  project_id    UUID REFERENCES projects(id)
  status        ENUM('queued', 'building', 'success', 'failed')
  commit_hash   VARCHAR
  branch        VARCHAR
  build_log     TEXT
  started_at    TIMESTAMP
  finished_at   TIMESTAMP

TABLE domains
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES users(id)
  project_id    UUID NULL REFERENCES projects(id)
  domain        VARCHAR UNIQUE NOT NULL
  type          ENUM('openspace', 'external')
  ssl_enabled   BOOLEAN DEFAULT false
  ssl_expires   TIMESTAMP NULL
  verified      BOOLEAN DEFAULT false
  cname_target  VARCHAR DEFAULT 'proxy.openspace.cm'
  created_at    TIMESTAMP

TABLE billing_subscriptions
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES users(id)
  plan          ENUM('starter', 'pro', 'business')
  status        ENUM('active', 'expired', 'cancelled')
  amount_fcfa   INTEGER
  renews_at     TIMESTAMP
  payment_ref   VARCHAR (reference CinetPay ou Stripe)
  created_at    TIMESTAMP

TABLE billing_payments
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES users(id)
  amount_fcfa   INTEGER
  provider      ENUM('cinetpay', 'stripe')
  status        ENUM('pending', 'success', 'failed')
  reference     VARCHAR
  created_at    TIMESTAMP

TABLE ssh_keys
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES users(id)
  name          VARCHAR
  public_key    TEXT
  created_at    TIMESTAMP

TABLE api_tokens
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES users(id)
  name          VARCHAR
  token_hash    VARCHAR
  scopes        JSONB
  last_used_at  TIMESTAMP
  created_at    TIMESTAMP


------------------------------------------------------------------------
2.5 LOGIQUE CONTAINERS
------------------------------------------------------------------------

CYCLE DE VIE D'UN DEPLOIEMENT
-------------------------------
1. POST /api/projects/{id}/deploy
   → Cree un enregistrement deployments (status: queued)
   → Pousse la tache dans une job queue Redis (LPUSH)

2. Worker Go (goroutine ou worker pool)
   → Depile la tache de Redis (BRPOP)
   → Clone le repo Git (ou recoit le ZIP uploaded)
   → docker build -t openspace/{slug}:{commit} .
   → Stream les logs de build dans deployments.build_log
   → Si build OK → docker run avec contraintes + labels Traefik
   → Si build KO → status = 'failed', notification user

3. docker run (parametres complets)
   docker run -d
     --name {slug}
     --memory={plan.ram}
     --cpus={plan.cpu}
     --restart unless-stopped
     --network openspace-network
     --label "traefik.enable=true"
     --label "traefik.http.routers.{slug}.rule=Host(`{slug}.openspace.cm`)"
     --label "traefik.http.routers.{slug}.tls=true"
     --label "traefik.http.routers.{slug}.tls.certresolver=letsencrypt"
     --label "traefik.http.services.{slug}.loadbalancer.server.port={port}"
     openspace/{slug}:{commit}

4. Health check
   → GET http://container-ip:{port}/health (ou TCP check)
   → 3 tentatives, 5s interval
   → Si OK : project.status = 'running'
   → Si KO : project.status = 'error', rollback vers image precedente

LIMITES PAR PLAN
-----------------
Starter  : --memory 512m  --cpus 0.5  storage 5G   projects 1
Pro      : --memory 2g    --cpus 2    storage 20G   projects 5
Business : --memory 8g    --cpus 4    storage 100G  projects illimites

ACTIONS CONTAINER
------------------
Restart  : docker restart {container_id}
Stop     : docker stop {container_id}   → status 'stopped'
Rebuild  : nouveau deploiement (workflow complet)
Logs     : docker logs --tail 200 --follow {container_id} → SSE
Stats    : docker stats {container_id} --no-stream → JSON


------------------------------------------------------------------------
2.6 LOGIQUE DOMAINES
------------------------------------------------------------------------

SOUS-DOMAINE PAR DEFAUT
------------------------
Format : {slug}.openspace.cm
Creation : automatique a la creation du projet
SSL : wildcard *.openspace.cm via Let's Encrypt (Traefik ACME)
DNS : enregistrement *.openspace.cm → IP du VPS (configure une fois)
Activation : immediate apres status 'running'

DOMAINE CUSTOM
--------------
Flux :
  1. User POST /api/domains { domain: "api.monsite.cm", project_id }
  2. Backend genere et retourne :
       cname_type  : "CNAME"
       cname_name  : "api" (ou "@" pour domaine racine)
       cname_value : "proxy.openspace.cm"
  3. Background worker DNS polling (toutes les 30s, timeout 24h)
       dns.LookupCNAME("api.monsite.cm")
       → Si retourne "proxy.openspace.cm" : verified = true
  4. A la verification :
       - Traefik : ajout label --label "traefik.http.routers.{slug}-custom.rule=Host(`api.monsite.cm`)"
         via configuration dynamique (fichier TOML ou Traefik API)
       - Let's Encrypt emets le cert automatiquement (ACME HTTP-01)
       - domain.ssl_enabled = true
  5. Polling cert readiness (30s) → notification user

GESTION SSL
-----------
  Sous-domaines *.openspace.cm : wildcard cert, renouvele auto par Traefik
  Domaines externes : cert individuel Let's Encrypt par domaine
  Expiration tracking : cron quotidien verifie ssl_expires dans 30 jours
  Renouvellement : Traefik ACME gere automatiquement


------------------------------------------------------------------------
2.7 TERMINAL WEBSOCKET
------------------------------------------------------------------------

FLUX COMPLET
------------
1. Frontend ouvre :
   wss://api.openspace.cm/ws/projects/{project_id}/terminal?token={jwt}

2. Backend Go - Handler WebSocket (gorilla/websocket)
   a. Valide le JWT depuis query param
   b. Recupere le project → container_id
   c. Verifie que project.user_id == user.id
   d. Ouvre Docker exec :
        execID, _ = cli.ContainerExecCreate(ctx, containerID, types.ExecConfig{
          AttachStdin:  true,
          AttachStdout: true,
          AttachStderr: true,
          Tty:          true,
          Cmd:          []string{"/bin/sh"},
        })
        hijack, _ = cli.ContainerExecAttach(ctx, execID, types.ExecStartCheck{Tty: true})

3. Deux goroutines parallelees :
   - Goroutine 1 : lit WebSocket → ecrit dans stdin du container
   - Goroutine 2 : lit stdout/stderr container → ecrit dans WebSocket

4. Messages speciaux (JSON) :
   Resize  : { "type": "resize", "cols": 120, "rows": 40 }
            → cli.ContainerExecResize(ctx, execID, types.ResizeOptions{Height: 40, Width: 120})
   Close   : fermeture WebSocket → fermer exec Docker

5. Frontend (xterm.js) :
   const ws = new WebSocket(`wss://api.openspace.cm/ws/projects/${id}/terminal?token=${token}`)
   const term = new Terminal({ fontFamily: "JetBrains Mono", fontSize: 13 })
   ws.onmessage = (e) => term.write(e.data)
   term.onData = (data) => ws.send(data)


------------------------------------------------------------------------
2.8 API REST — ROUTES COMPLETES
------------------------------------------------------------------------

AUTH
  POST   /api/auth/register          Inscription
  POST   /api/auth/login             Connexion → JWT
  POST   /api/auth/logout            Revocation token
  POST   /api/auth/refresh           Refresh token
  POST   /api/auth/2fa/enable        Activer 2FA (TOTP)
  POST   /api/auth/2fa/verify        Verifier code TOTP

PROJECTS
  GET    /api/projects               Liste des projets user
  POST   /api/projects               Creer un projet
  GET    /api/projects/{id}          Detail projet
  PATCH  /api/projects/{id}          Mettre a jour (nom, env, etc.)
  DELETE /api/projects/{id}          Supprimer projet + container
  POST   /api/projects/{id}/deploy   Declencher deploiement
  POST   /api/projects/{id}/restart  Restart container
  POST   /api/projects/{id}/stop     Stopper container
  POST   /api/projects/{id}/start    Demarrer container arrete
  GET    /api/projects/{id}/stats    Stats RAM/CPU temps reel (JSON)
  GET    /api/projects/{id}/logs     Logs container (SSE stream)
  WS     /ws/projects/{id}/terminal  Terminal WebSocket

DEPLOYMENTS
  GET    /api/projects/{id}/deployments            Historique
  GET    /api/projects/{id}/deployments/{dep_id}   Detail + logs build

DOMAINS
  GET    /api/domains                Liste domaines user
  POST   /api/domains                Ajouter domaine custom
  DELETE /api/domains/{id}           Supprimer domaine
  POST   /api/domains/{id}/verify    Relancer verification DNS
  GET    /api/domains/{id}/dns       Records DNS actuels (lookup live)

ENV VARS
  GET    /api/projects/{id}/env      Liste variables (valeurs masquees)
  PUT    /api/projects/{id}/env      Remplacer toutes les variables
  POST   /api/projects/{id}/env      Ajouter une variable
  DELETE /api/projects/{id}/env/{key} Supprimer une variable

DATABASES
  GET    /api/databases              Liste bases de donnees user
  POST   /api/databases              Creer une base
  DELETE /api/databases/{id}         Supprimer
  POST   /api/databases/{id}/export  Generer dump SQL (tache async)
  GET    /api/databases/{id}/users   Utilisateurs DB

EMAILS
  GET    /api/emails                 Liste comptes email
  POST   /api/emails                 Creer compte (appel Mailcow API)
  DELETE /api/emails/{id}            Supprimer compte
  GET    /api/emails/{id}/quota      Quota utilise

BILLING
  GET    /api/billing/subscription   Abonnement actuel
  GET    /api/billing/payments       Historique paiements
  POST   /api/billing/checkout       Initier paiement CinetPay ou Stripe
  POST   /api/billing/webhook/cinetpay  Webhook CinetPay
  POST   /api/billing/webhook/stripe    Webhook Stripe
  GET    /api/billing/invoices/{id}  Telecharger facture PDF

USER
  GET    /api/user/profile           Profil
  PATCH  /api/user/profile           Mettre a jour profil
  GET    /api/user/ssh-keys          Liste cles SSH
  POST   /api/user/ssh-keys          Ajouter cle SSH
  DELETE /api/user/ssh-keys/{id}     Supprimer cle SSH
  GET    /api/user/api-tokens        Liste tokens API
  POST   /api/user/api-tokens        Creer token
  DELETE /api/user/api-tokens/{id}   Revoquer token


------------------------------------------------------------------------
2.9 SECURITE
------------------------------------------------------------------------

Authentification :
  JWT access token  : expire 15 minutes
  JWT refresh token : expire 30 jours, stocke en cookie httpOnly
  2FA TOTP          : Google Authenticator compatible (biblioth. pquerna/otp)

Autorisation :
  Chaque route verifie user_id sur la ressource (row-level security)
  Scopes sur API tokens : read:projects, write:projects, admin, etc.

Variables d'environnement :
  Chiffrees en base avec AES-256-GCM
  Cle de chiffrement dans variable d'env GO (jamais en base)

Container isolation :
  Reseau Docker dedie par user (openspace-{user_id})
  Pas d'acces au socket Docker depuis les containers users
  Capabilities Linux droppees : --cap-drop ALL

Rate limiting :
  Redis-based rate limiter sur toutes les routes API
  Auth : 5 tentatives / 15 minutes par IP
  Deploy : 10 deploys / heure par user

HTTPS :
  TLS 1.2 minimum, TLS 1.3 prefere
  HSTS header
  Traefik gere la terminaison TLS


------------------------------------------------------------------------
2.10 INFRASTRUCTURE CONTABO
------------------------------------------------------------------------

Serveur initial :
  Contabo VPS XL : 16 vCPU, 60 GB RAM, 400 GB SSD NVMe, 10 Gbps
  Prix : ~50 EUR/mois
  Localisation : Allemagne (Frankfurt) ou US (jusqu'a datacenter africain dispo)

Docker network :
  openspace-proxy   : reseau Traefik → containers users
  openspace-db      : reseau interne DB → API Go seulement
  openspace-{uid}   : reseau isole par user (isolation laterale)

Volumes :
  /data/projects/{slug}/  : fichiers upload, build cache
  /data/databases/        : volumes PostgreSQL, Redis users
  /data/traefik/          : certs Let's Encrypt, config dynamique

Monitoring (phase 2) :
  Prometheus + Grafana pour metriques systeme
  Loki pour aggregation logs containers
  Alertmanager → Slack/email si container down ou VPS > 80% RAM

Backup :
  Snapshot Contabo quotidien (reseau)
  pg_dump OpenSpace DB vers S3-compatible (Backblaze B2) chaque nuit


------------------------------------------------------------------------
2.11 FLUX DE PAIEMENT MOBILE MONEY (CINETPAY)
------------------------------------------------------------------------

1. User clique "Passer au plan Pro" dans /facturation
2. Frontend POST /api/billing/checkout { plan: "pro", provider: "cinetpay" }
3. Backend :
   a. Cree billing_payments { status: 'pending', amount: 5000 }
   b. Appelle CinetPay initiate payment API
   c. Retourne payment_url au frontend
4. Frontend redirige vers page CinetPay (MTN MoMo, Orange Money)
5. User effectue le paiement sur son telephone
6. CinetPay appelle POST /api/billing/webhook/cinetpay
7. Backend valide la signature HMAC du webhook
8. Si paiement confirme :
   a. billing_payments.status = 'success'
   b. billing_subscriptions.plan = 'pro', renews_at = now + 30 jours
   c. users.plan = 'pro'
   d. Relance les containers si limites augmentees
   e. Envoie email de confirmation
9. Prepaiement annuel : amount = plan.price * 12 * 0.85 (15% reduction)


================================================================================
PARTIE 3 — STACK DE DEVELOPPEMENT
================================================================================

FRONTEND
  Framework    : Next.js 14 (App Router)
  Styling      : TailwindCSS + CSS custom pour tokens
  Composants   : shadcn/ui comme base + composants custom
  Icons        : Lucide React
  State        : Zustand (state global leger)
  Fetch        : TanStack Query (React Query)
  Terminal     : xterm.js + xterm-addon-fit + xterm-addon-web-links
  Charts       : Recharts
  Formulaires  : React Hook Form + Zod validation
  i18n         : next-intl (FR par defaut, EN)

BACKEND
  Framework    : Go 1.22 + Gin
  ORM          : sqlc (generation code type-safe depuis SQL)
  Migration    : golang-migrate
  WebSocket    : gorilla/websocket
  Docker SDK   : docker/docker (Go client officiel)
  Job queue    : Redis + asynq (jobs async : build, DNS polling)
  JWT          : golang-jwt/jwt
  Paiement     : CinetPay SDK Go + Stripe Go
  Email        : Resend API (transactionnel)
  Validation   : go-playground/validator

DEVOPS
  Containerisation : Docker + Docker Compose (dev) / Docker Engine (prod)
  Reverse proxy    : Traefik v3
  Hebergement      : Contabo VPS
  CI/CD            : GitHub Actions → build image → deploy via SSH
  SSL              : Let's Encrypt via Traefik ACME
  Monitoring       : Uptime Kuma (simple, self-hosted)
  Logs             : Loki + Grafana (phase 2)


================================================================================
PARTIE 4 — ROADMAP DE CONSTRUCTION
================================================================================

SPRINT 1 — Semaines 1-2 : Fondations
  Backend :
    - Setup Go + Gin + PostgreSQL + Redis
    - Auth JWT complet (register, login, refresh, logout)
    - CRUD projets (sans containers)
    - Migrations SQL
  Frontend :
    - Layout complet (Sidebar + Topbar)
    - Page Dashboard skeleton
    - Auth pages (login, register)
    - Composants de base (Card, Button, Badge, Table)

SPRINT 2 — Semaines 3-4 : Containers
  Backend :
    - Integration Docker API
    - Workflow deploiement complet (build + run)
    - Streaming logs (SSE)
    - Stats container temps reel
    - Traefik labels auto
  Frontend :
    - Page Projets complete
    - Vue detail projet (Overview + Logs)
    - Indicateurs de deploiement live

SPRINT 3 — Semaines 5-6 : Terminal + Domaines
  Backend :
    - WebSocket terminal (Docker exec)
    - DNS polling worker
    - Logique domaine custom + SSL Traefik
  Frontend :
    - Tab Terminal avec xterm.js
    - Tab Domaines + stepper CNAME
    - Page Domaines globale

SPRINT 4 — Semaines 7-8 : Facturation
  Backend :
    - Integration CinetPay (MTN MoMo, Orange Money)
    - Integration Stripe (cartes)
    - Webhooks paiement
    - Enforcement limites par plan
  Frontend :
    - Page Facturation + plans
    - Historique paiements
    - Upgrade/downgrade plan

SPRINT 5 — Semaines 9-10 : Polish + Launch
  - Emails transactionnels (welcome, deploy, paiement)
  - 2FA TOTP
  - Tests end-to-end critiques
  - Documentation API (Swagger)
  - Landing page openspace.cm
  - Onboarding user (wizard first project)
  - Beta launch : 50 premiers users etudiants YDE


================================================================================
FIN DU DOCUMENT
Redige pour AURORA IT Corporation — OpenSpace Cloud Hosting
Contact : atanganaabogoemmanuel123@gmail.com | +237 620708947
================================================================================
