-- Migration 008 — Schema alignment for existing environments

-- Ensure payment fields used by repository exist.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS webhook_data JSONB;

-- Ensure subscription fields used by repository/service exist.
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS started_at TIMESTAMP DEFAULT NOW();
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_name = 'subscriptions' AND column_name = 'starts_at'
	) AND NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_name = 'subscriptions' AND column_name = 'started_at'
	) THEN
		ALTER TABLE subscriptions RENAME COLUMN starts_at TO started_at;
	END IF;
END $$;

-- Ensure container/subscription link column exists.
ALTER TABLE containers ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_containers_subscription_id ON containers(subscription_id);
