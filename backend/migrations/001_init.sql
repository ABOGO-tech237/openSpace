-- Migration 001 — OpenSpace
-- Schéma complet de la base de données

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Table utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Table paiements
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id  VARCHAR(100) UNIQUE NOT NULL,
  provider        VARCHAR(50) NOT NULL CHECK (provider IN ('cinetpay', 'notchpay')),
  amount          INT NOT NULL,
  currency        VARCHAR(10) DEFAULT 'XAF',
  status          VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  plan            VARCHAR(50) NOT NULL CHECK (plan IN ('starter', 'dev', 'pro', 'business')),
  payment_method  VARCHAR(50),
  phone_number    VARCHAR(20),
  provider_ref    VARCHAR(255),
  metadata        JSONB DEFAULT '{}',
  webhook_data    JSONB,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Table abonnements
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_id      UUID REFERENCES payments(id),
  plan            VARCHAR(50) NOT NULL CHECK (plan IN ('starter', 'dev', 'pro', 'business')),
  status          VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
  started_at      TIMESTAMP DEFAULT NOW(),
  expires_at      TIMESTAMP NOT NULL,
  auto_renew      BOOLEAN DEFAULT TRUE,
  cancelled_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Table containers
-- ============================================
CREATE TABLE IF NOT EXISTS containers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  docker_id       VARCHAR(255) DEFAULT 'pending',
  hostname        VARCHAR(100) UNIQUE NOT NULL,
  plan            VARCHAR(50) NOT NULL CHECK (plan IN ('starter', 'dev', 'pro', 'business')),
  ram_limit       VARCHAR(20) NOT NULL,
  cpu_limit       FLOAT NOT NULL,
  storage_gb      INT NOT NULL,
  status          VARCHAR(50) DEFAULT 'provisioning' CHECK (status IN ('provisioning', 'running', 'stopped', 'error', 'removed')),
  internal_ip     VARCHAR(50) DEFAULT '',
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Table domaines
-- ============================================
CREATE TABLE IF NOT EXISTS domains (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  container_id    UUID REFERENCES containers(id),
  domain_name     VARCHAR(255) UNIQUE NOT NULL,
  provider_id     VARCHAR(255),
  status          VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'suspended', 'transferring')),
  registrar       VARCHAR(100) DEFAULT 'openprovider',
  registered_at   TIMESTAMP,
  expires_at      TIMESTAMP,
  auto_renew      BOOLEAN DEFAULT TRUE,
  dns_configured  BOOLEAN DEFAULT FALSE,
  nameservers     TEXT[] DEFAULT ARRAY['ns1.openspace.cm', 'ns2.openspace.cm'],
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Index pour les recherches fréquentes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_containers_user_id ON containers(user_id);
CREATE INDEX IF NOT EXISTS idx_containers_hostname ON containers(hostname);
CREATE INDEX IF NOT EXISTS idx_containers_subscription_id ON containers(subscription_id);
CREATE INDEX IF NOT EXISTS idx_domains_user_id ON domains(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain_name ON domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_domains_container_id ON domains(container_id);

-- ============================================
-- Trigger mise à jour automatique updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour chaque table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS update_containers_updated_at ON containers;
CREATE TRIGGER update_containers_updated_at BEFORE UPDATE ON containers
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS update_domains_updated_at ON domains;
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ============================================
-- Vue utile pour les abonnements actifs avec container
-- ============================================
CREATE OR REPLACE VIEW active_subscriptions_view AS
SELECT
  s.id AS subscription_id,
  s.user_id,
  s.plan,
  s.status AS subscription_status,
  s.started_at,
  s.expires_at,
  c.id AS container_id,
  c.hostname,
  c.status AS container_status,
  c.internal_ip,
  u.email,
  u.first_name,
  u.last_name
FROM subscriptions s
JOIN users u ON s.user_id = u.id
LEFT JOIN containers c ON c.subscription_id = s.id
WHERE s.status = 'active' AND s.expires_at > NOW();
