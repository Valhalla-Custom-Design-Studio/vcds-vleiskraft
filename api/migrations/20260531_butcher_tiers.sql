-- VleisKraft™ 5-Tier Butcher Subscription Migration
-- Run on Render Postgres

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL DEFAULT 'free',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  amount DECIMAL(10,2),
  payfast_token VARCHAR(255),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Butcher profile product count cache
ALTER TABLE butcher_profiles ADD COLUMN IF NOT EXISTS product_count INTEGER DEFAULT 0;

-- Trigger to keep product_count in sync
CREATE OR REPLACE FUNCTION update_product_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE butcher_profiles
  SET product_count = (
    SELECT COUNT(*) FROM products
    WHERE butcher_id = COALESCE(NEW.butcher_id, OLD.butcher_id)
    AND is_active = true
  )
  WHERE user_id = COALESCE(NEW.butcher_id, OLD.butcher_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_product_count ON products;
CREATE TRIGGER trg_product_count
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_product_count();

-- Default all existing butchers to free tier
INSERT INTO subscriptions (user_id, tier, status)
SELECT id, 'free', 'active' FROM users
WHERE user_type = 'butcher'
ON CONFLICT (user_id) DO NOTHING;
