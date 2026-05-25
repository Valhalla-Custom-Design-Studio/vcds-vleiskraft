-- Migration: Add butcheries table + user_butchery_id FK
-- KAN-40: Butchery selector on signup, assigned to profile

CREATE TABLE IF NOT EXISTS butcheries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  province VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(30),
  whatsapp VARCHAR(30),
  email VARCHAR(255),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  tier VARCHAR(20) DEFAULT 'free',
  logo_url TEXT,
  banner_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#B22222',
  secondary_color VARCHAR(7) DEFAULT '#1A1A1A',
  woocommerce_url TEXT,
  woocommerce_key TEXT,
  woocommerce_secret TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add butchery FK to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS butchery_id UUID REFERENCES butcheries(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_butcheries_province ON butcheries(province);
CREATE INDEX IF NOT EXISTS idx_butcheries_city ON butcheries(city);
CREATE INDEX IF NOT EXISTS idx_butcheries_active ON butcheries(is_active);
CREATE INDEX IF NOT EXISTS idx_users_butchery ON users(butchery_id);

-- Seed: 9 SA provinces with sample butcheries
INSERT INTO butcheries (name, slug, province, city, address, phone, is_active, is_verified) VALUES
  ('Boland Slagtery', 'boland-slagtery', 'Western Cape', 'Paarl', '12 Main Rd, Paarl', '+27218631234', true, true),
  ('Kaapstad Vleis', 'kaapstad-vleis', 'Western Cape', 'Cape Town', '45 Bree St, Cape Town', '+27214231234', true, true),
  ('Stellenbosch Butchery', 'stellenbosch-butchery', 'Western Cape', 'Stellenbosch', '8 Dorp St, Stellenbosch', '+27218871234', true, true),
  ('Joburg Prime Cuts', 'joburg-prime-cuts', 'Gauteng', 'Johannesburg', '22 Commissioner St, JHB', '+27114321234', true, true),
  ('Pretoria Vleis', 'pretoria-vleis', 'Gauteng', 'Pretoria', '5 Church St, Pretoria', '+27124321234', true, true),
  ('Sandton Butchery', 'sandton-butchery', 'Gauteng', 'Sandton', '100 Rivonia Rd, Sandton', '+27118831234', true, true),
  ('Durban Meat Market', 'durban-meat-market', 'KwaZulu-Natal', 'Durban', '10 Smith St, Durban', '+27313011234', true, true),
  ('Pietermaritzburg Vleis', 'pmb-vleis', 'KwaZulu-Natal', 'Pietermaritzburg', '3 Church St, PMB', '+27333451234', true, true),
  ('Bloemfontein Slagtery', 'bloem-slagtery', 'Free State', 'Bloemfontein', '15 Maitland St, Bloem', '+27514471234', true, true),
  ('Welkom Vleis', 'welkom-vleis', 'Free State', 'Welkom', '7 Stateway, Welkom', '+27578571234', true, true),
  ('Port Elizabeth Butchery', 'pe-butchery', 'Eastern Cape', 'Gqeberha', '20 Main St, PE', '+27415041234', true, true),
  ('East London Vleis', 'el-vleis', 'Eastern Cape', 'East London', '5 Oxford St, EL', '+27437221234', true, true),
  ('Nelspruit Slagtery', 'nelspruit-slagtery', 'Mpumalanga', 'Mbombela', '12 Samora Machel Dr', '+27137521234', true, true),
  ('Witbank Vleis', 'witbank-vleis', 'Mpumalanga', 'eMalahleni', '3 Mandela St, Witbank', '+27137561234', true, true),
  ('Polokwane Butchery', 'polokwane-butchery', 'Limpopo', 'Polokwane', '8 Landdros Mare St', '+27152911234', true, true),
  ('Tzaneen Vleis', 'tzaneen-vleis', 'Limpopo', 'Tzaneen', '5 Agatha St, Tzaneen', '+27152071234', true, true),
  ('Kimberley Slagtery', 'kimberley-slagtery', 'Northern Cape', 'Kimberley', '10 Du Toitspan Rd', '+27538311234', true, true),
  ('Upington Vleis', 'upington-vleis', 'Northern Cape', 'Upington', '3 Scott St, Upington', '+27542321234', true, true),
  ('Rustenburg Butchery', 'rustenburg-butchery', 'North West', 'Rustenburg', '15 Fatima Bhayat St', '+27144921234', true, true),
  ('Klerksdorp Vleis', 'klerksdorp-vleis', 'North West', 'Klerksdorp', '7 Boom St, Klerksdorp', '+27184621234', true, true)
ON CONFLICT (slug) DO NOTHING;
