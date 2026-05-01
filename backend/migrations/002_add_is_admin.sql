-- Migration 002 — Ajouter rôle admin
-- Ajoute la colonne is_admin à la table users

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Index pour les recherches d'administrateurs
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
