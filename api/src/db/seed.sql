-- VleisKraft™ B2B Plan Seed Data — Bilingual (EN/AF)
-- KAN-66 | Updated: 2026-05-25
-- Consumer = Free | Starter/Beginner R3,500 (30-day trial) | Pro/Groei R5,000 | Business/Besigheid R7,500 | Enterprise/Onderneming R15,000

-- Migrate old display_name column if exists (backwards compat)
ALTER TABLE plans ADD COLUMN IF NOT EXISTS display_name_en VARCHAR(100);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS display_name_af VARCHAR(100);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS features_en JSONB DEFAULT '[]';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS features_af JSONB DEFAULT '[]';

-- Add trial_ends_at to butcheries if not exists
ALTER TABLE butcheries ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

INSERT INTO plans (id, name, display_name_en, display_name_af, price_zar, billing_interval, trial_days, max_branches, features_en, features_af, is_active)
VALUES
  (
    uuid_generate_v4(),
    'consumer',
    'Consumer (Free)',
    'Verbruiker (Gratis)',
    0.00, 'monthly', 0, 1,
    '["Browse butchery catalogue","VleisAI (5 queries/month)","View promotions","Basic profile"]'::jsonb,
    '["Blaai deur slaggery-katalogus","VleisKI (5 navrae/maand)","Sien promosies","Basiese profiel"]'::jsonb,
    true
  ),
  (
    uuid_generate_v4(),
    'starter',
    'Starter',
    'Beginner',
    3500.00, 'monthly', 30, 1,
    '["Product catalogue","Order management","WhatsApp commerce","Basic analytics","Layby","Basic demand intelligence"]'::jsonb,
    '["Produk-katalogus","Bestellingbestuur","WhatsApp-handel","Basiese analitika","Lê-by","Basiese aanvraagintelligensie"]'::jsonb,
    true
  ),
  (
    uuid_generate_v4(),
    'pro',
    'Pro',
    'Groei',
    5000.00, 'monthly', 0, 1,
    '["All Starter features","Full analytics","Stockvel management","WooCommerce sync","Full demand intelligence","Meal planner","VleisAI unlimited"]'::jsonb,
    '["Alle Beginner-funksies","Volledige analitika","Stockvel-bestuur","WooCommerce-integrasie","Volledige aanvraagintelligensie","Maaltydplanner","VleisKI onbeperk"]'::jsonb,
    true
  ),
  (
    uuid_generate_v4(),
    'business',
    'Business',
    'Besigheid',
    7500.00, 'monthly', 0, 3,
    '["All Pro features","Marketing campaigns","Competitions","Spitbraai bookings","Academy access","Up to 3 branches","Priority support"]'::jsonb,
    '["Alle Groei-funksies","Bemarkingsveldtogte","Kompetisies","Spit braai-besprekings","Akademie-toegang","Tot 3 takke","Prioriteitsondersteuning"]'::jsonb,
    true
  ),
  (
    uuid_generate_v4(),
    'enterprise',
    'Enterprise',
    'Onderneming',
    15000.00, 'monthly', 0, 999,
    '["All Business features","Multi-franchise management","White-label branding","Dedicated onboarding","Custom integrations","API access","SLA support"]'::jsonb,
    '["Alle Besigheid-funksies","Multi-franchise-bestuur","Wit-etiket-handelsmerke","Toegewyde aanboord","Pasgemaakte integrasies","API-toegang","SLA-ondersteuning"]'::jsonb,
    true
  )
ON CONFLICT (name) DO UPDATE SET
  display_name_en = EXCLUDED.display_name_en,
  display_name_af = EXCLUDED.display_name_af,
  price_zar       = EXCLUDED.price_zar,
  trial_days      = EXCLUDED.trial_days,
  max_branches    = EXCLUDED.max_branches,
  features_en     = EXCLUDED.features_en,
  features_af     = EXCLUDED.features_af;
