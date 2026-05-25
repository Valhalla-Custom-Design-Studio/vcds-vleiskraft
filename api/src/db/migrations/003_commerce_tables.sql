-- VleisKraft™ Migration 003 — Commerce & Feature Tables
-- Generated: 2026-05-25 by ODIN™

CREATE TABLE IF NOT EXISTS meat_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES users(id) ON DELETE SET NULL,
  butchery_id UUID REFERENCES butcheries(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  name_af VARCHAR(200),
  species VARCHAR(50) NOT NULL,
  cut VARCHAR(100),
  grade VARCHAR(20),
  weight_kg DECIMAL(8,3),
  price_per_kg DECIMAL(10,2),
  price_unit DECIMAL(10,2),
  unit VARCHAR(20) DEFAULT 'kg',
  stock_qty INTEGER DEFAULT 0,
  description TEXT,
  description_af TEXT,
  origin VARCHAR(100),
  is_halaal BOOLEAN DEFAULT false,
  is_kosher BOOLEAN DEFAULT false,
  is_free_range BOOLEAN DEFAULT false,
  is_grass_fed BOOLEAN DEFAULT false,
  qr_code TEXT,
  blockchain_hash VARCHAR(64),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_meat_products_species ON meat_products(species);
CREATE INDEX IF NOT EXISTS idx_meat_products_butchery ON meat_products(butchery_id);
CREATE INDEX IF NOT EXISTS idx_meat_products_active ON meat_products(is_active);

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(200) NOT NULL,
  registration_number VARCHAR(50),
  vat_number VARCHAR(20),
  is_verified BOOLEAN DEFAULT false,
  is_halaal_certified BOOLEAN DEFAULT false,
  halaal_cert_number VARCHAR(100),
  halaal_cert_expiry DATE,
  province VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  phone VARCHAR(30),
  email VARCHAR(255),
  bank_name VARCHAR(100),
  bank_account VARCHAR(50),
  bank_branch_code VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_suppliers_user ON suppliers(user_id);

CREATE TABLE IF NOT EXISTS traceability_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES meat_products(id) ON DELETE SET NULL,
  batch_number VARCHAR(100),
  animal_id VARCHAR(100),
  farm_name VARCHAR(200),
  farm_province VARCHAR(100),
  abattoir_name VARCHAR(200),
  abattoir_license VARCHAR(100),
  slaughter_date DATE,
  processing_date DATE,
  cold_chain_temp_c DECIMAL(5,2),
  packaging_date DATE,
  best_before DATE,
  qr_code TEXT,
  blockchain_hash VARCHAR(64),
  is_halaal BOOLEAN DEFAULT false,
  halaal_cert_number VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_traceability_product ON traceability_records(product_id);
CREATE INDEX IF NOT EXISTS idx_traceability_batch ON traceability_records(batch_number);

CREATE TABLE IF NOT EXISTS stockvel_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  target_amount DECIMAL(10,2),
  monthly_contribution DECIMAL(10,2),
  payout_month INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stockvel_groups_created_by ON stockvel_groups(created_by);

CREATE TABLE IF NOT EXISTS stockvel_members (
  group_id UUID REFERENCES stockvel_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS stockvel_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES stockvel_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(30) DEFAULT 'payfast',
  payfast_token VARCHAR(255),
  paid_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stockvel_contributions_group ON stockvel_contributions(group_id);
CREATE INDEX IF NOT EXISTS idx_stockvel_contributions_user ON stockvel_contributions(user_id);

CREATE TABLE IF NOT EXISTS layby_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  butchery_id UUID REFERENCES butcheries(id) ON DELETE SET NULL,
  product_name VARCHAR(200) NOT NULL,
  product_id UUID REFERENCES meat_products(id) ON DELETE SET NULL,
  total_price DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  installments INTEGER DEFAULT 3,
  next_due TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_layby_plans_user ON layby_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_layby_plans_status ON layby_plans(status);

CREATE TABLE IF NOT EXISTS layby_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  layby_plan_id UUID REFERENCES layby_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(30) DEFAULT 'payfast',
  payfast_token VARCHAR(255),
  paid_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_layby_payments_plan ON layby_payments(layby_plan_id);

CREATE TABLE IF NOT EXISTS spitbraai_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  butchery_id UUID REFERENCES butcheries(id) ON DELETE SET NULL,
  event_date DATE NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 0,
  meat_packages JSONB DEFAULT '[]',
  total_price DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_spitbraai_user ON spitbraai_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_spitbraai_event_date ON spitbraai_bookings(event_date);

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  title_af VARCHAR(200),
  description TEXT,
  description_af TEXT,
  prize VARCHAR(200),
  prize_af VARCHAR(200),
  ends_at TIMESTAMPTZ,
  category VARCHAR(50) DEFAULT 'braai',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entry_data JSONB DEFAULT '{}',
  photo_url TEXT,
  votes INTEGER DEFAULT 0,
  entered_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_challenge_entries_challenge ON challenge_entries(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_entries_user ON challenge_entries(user_id);

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  butchery_id UUID REFERENCES butcheries(id) ON DELETE CASCADE,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#B22222',
  accent_color VARCHAR(7) DEFAULT '#FFD700',
  tagline TEXT,
  contact_email VARCHAR(255),
  phone VARCHAR(30),
  address TEXT,
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  operating_hours JSONB DEFAULT '{}',
  enabled_features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_butchery ON tenants(butchery_id);

ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

CREATE TABLE IF NOT EXISTS woocommerce_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  butchery_id UUID REFERENCES butcheries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  store_url TEXT,
  products_synced INTEGER DEFAULT 0,
  categories_synced INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  error_details JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'success',
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_woo_sync_butchery ON woocommerce_sync_logs(butchery_id);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  butchery_id UUID REFERENCES butcheries(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  title_af VARCHAR(200),
  description TEXT,
  discount_pct DECIMAL(5,2) DEFAULT 0,
  discount_amount_zar DECIMAL(10,2) DEFAULT 0,
  applies_to JSONB DEFAULT '[]',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_campaigns_butchery ON campaigns(butchery_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(is_active, ends_at);

INSERT INTO challenges (title, title_af, description, description_af, prize, prize_af, ends_at, category)
VALUES
  ('Best Braai Photo', 'Beste Braai Foto', 'Share your best braai photo and win!', 'Deel jou beste braai foto en wen!', 'R500 VleisKraft voucher', 'R500 VleisKraft koepon', NOW() + INTERVAL '30 days', 'braai'),
  ('Boerewors Master', 'Boerewors Meester', 'Make the best homemade boerewors.', 'Maak die beste tuisgemaakte boerewors.', 'Free meat for 1 month', 'Gratis vleis vir 1 maand', NOW() + INTERVAL '45 days', 'boerewors'),
  ('Braai Champion', 'Braai Kampioen', 'Show your braai skills!', 'Wys jou braai vaardighede!', 'Platinum VleisKraft for 6 months', 'Platinum VleisKraft lid vir 6 maande', NOW() + INTERVAL '60 days', 'braai')
ON CONFLICT DO NOTHING;
