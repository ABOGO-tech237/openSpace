-- Migration 009 — Instances de bases de données managées (SQL + NoSQL)

CREATE TABLE IF NOT EXISTS database_instances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    container_id    UUID REFERENCES containers(id) ON DELETE SET NULL,
    name            VARCHAR(64) NOT NULL,
    engine          VARCHAR(20) NOT NULL CHECK (engine IN ('mysql', 'postgresql', 'mongodb', 'redis')),
    version         VARCHAR(16) NOT NULL DEFAULT 'latest',
    status          VARCHAR(20) DEFAULT 'creating'
                    CHECK (status IN ('creating', 'active', 'error', 'deleting', 'deleted')),
    host            VARCHAR(255),
    port            INTEGER,
    database_name   VARCHAR(64),
    username        VARCHAR(64),
    password_enc    TEXT,
    storage_mb      INTEGER DEFAULT 0,
    max_connections INTEGER DEFAULT 50,
    docker_id       VARCHAR(255),
    network_name    VARCHAR(100) DEFAULT 'openspace_network',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS database_users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id   UUID NOT NULL REFERENCES database_instances(id) ON DELETE CASCADE,
    username      VARCHAR(64) NOT NULL,
    password_enc  TEXT NOT NULL,
    permissions   JSONB DEFAULT '["read","write"]',
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(instance_id, username)
);

CREATE TABLE IF NOT EXISTS database_backups (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id   UUID NOT NULL REFERENCES database_instances(id) ON DELETE CASCADE,
    size_bytes    BIGINT DEFAULT 0,
    storage_path  VARCHAR(512),
    type          VARCHAR(20) DEFAULT 'manual' CHECK (type IN ('manual', 'scheduled')),
    status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_database_instances_user_id ON database_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_database_instances_status ON database_instances(status);
CREATE INDEX IF NOT EXISTS idx_database_instances_engine ON database_instances(engine);
CREATE INDEX IF NOT EXISTS idx_database_users_instance_id ON database_users(instance_id);
CREATE INDEX IF NOT EXISTS idx_database_backups_instance_id ON database_backups(instance_id);

DROP TRIGGER IF EXISTS update_database_instances_updated_at ON database_instances;
CREATE TRIGGER update_database_instances_updated_at
    BEFORE UPDATE ON database_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
