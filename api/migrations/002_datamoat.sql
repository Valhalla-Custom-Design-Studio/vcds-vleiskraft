-- TIER 1 DATA MOAT: VleisKraft Demand Intelligence Tables

CREATE TABLE IF NOT EXISTS demand_events (
  id SERIAL PRIMARY KEY,
  butchery_id TEXT,
  product_id TEXT,
  product_name TEXT,
  quantity INTEGER,
  price_zar DECIMAL(10,2),
  city TEXT,
  day_of_week INTEGER,
  hour INTEGER,
  logged_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  butchery_id TEXT,
  product_id TEXT,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2),
  reason TEXT,
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vleisai_conversations (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  user_message TEXT,
  ai_response TEXT,
  logged_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demand_product ON demand_events(product_name);
CREATE INDEX IF NOT EXISTS idx_demand_city ON demand_events(city);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id);
