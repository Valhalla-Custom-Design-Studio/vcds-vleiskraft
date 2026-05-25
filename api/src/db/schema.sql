CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  company VARCHAR(100),
  vat_number VARCHAR(20),
  phone VARCHAR(20),
  preferred_locale VARCHAR(5) DEFAULT 'en',
  tier VARCHAR(20) DEFAULT 'consumer',
  business_name VARCHAR(100),
  business_type VARCHAR(50), -- butcher, restaurant, wholesaler, farmer, consumer
  is_active BOOLEAN DEFAULT true,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B2B Butchery Subscription Plans
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,              -- consumer, starter, pro, business, enterprise
  display_name_en VARCHAR(100) NOT NULL,         -- English name
  display_name_af VARCHAR(100),                  -- Afrikaans name
  price_zar DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_interval VARCHAR(20) DEFAULT 'monthly',
  trial_days INTEGER DEFAULT 0,                  -- 30 for Starter, 0 others
  max_branches INTEGER DEFAULT 1,
  features_en JSONB NOT NULL DEFAULT '[]',
  features_af JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en VARCHAR(100) NOT NULL,
  name_af VARCHAR(100),
  price_zar DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  category VARCHAR(30),
  stock_qty INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  payfast_token VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  tier VARCHAR(20) NOT NULL DEFAULT 'consumer',
  payfast_token VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);
