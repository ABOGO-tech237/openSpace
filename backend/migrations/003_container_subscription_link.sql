-- Migration 003 — OpenSpace Container Subscription Link

-- Ajouter la colonne subscription_id aux containers
ALTER TABLE containers
  ADD COLUMN subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_containers_subscription_id ON containers(subscription_id);
