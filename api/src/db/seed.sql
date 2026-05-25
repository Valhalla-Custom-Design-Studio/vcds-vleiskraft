-- VleisKraft™ B2B Plan Seed Data
-- Consumer = Free | Starter R3,500 | Pro R5,000 | Business R7,500 | Enterprise R15,000

INSERT INTO plans (id, name, display_name, price_zar, billing_interval, max_branches, features, is_active)
VALUES
  (
    uuid_generate_v4(), 'consumer', 'Consumer (Free)', 0.00, 'monthly', 1,
    '["browse_shop","vleisai_limited","view_butcheries","basic_profile"]'::jsonb, true
  ),
  (
    uuid_generate_v4(), 'starter', 'Starter', 3500.00, 'monthly', 1,
    '["product_catalogue","order_management","whatsapp_commerce","basic_analytics","layby","demand_intelligence_basic"]'::jsonb, true
  ),
  (
    uuid_generate_v4(), 'pro', 'Pro', 5000.00, 'monthly', 1,
    '["product_catalogue","order_management","whatsapp_commerce","full_analytics","layby","stockvel","woocommerce_sync","demand_intelligence_full","meal_planner","vleisai_full"]'::jsonb, true
  ),
  (
    uuid_generate_v4(), 'business', 'Business', 7500.00, 'monthly', 3,
    '["product_catalogue","order_management","whatsapp_commerce","full_analytics","layby","stockvel","woocommerce_sync","demand_intelligence_full","meal_planner","vleisai_full","campaigns","competitions","spitbraai_bookings","academy","priority_support","up_to_3_branches"]'::jsonb, true
  ),
  (
    uuid_generate_v4(), 'enterprise', 'Enterprise', 15000.00, 'monthly', 999,
    '["product_catalogue","order_management","whatsapp_commerce","full_analytics","layby","stockvel","woocommerce_sync","demand_intelligence_full","meal_planner","vleisai_full","campaigns","competitions","spitbraai_bookings","academy","priority_support","multi_franchise","white_label_branding","dedicated_onboarding","custom_integrations","api_access","sla_support"]'::jsonb, true
  )
ON CONFLICT (name) DO UPDATE SET
  price_zar = EXCLUDED.price_zar,
  display_name = EXCLUDED.display_name,
  max_branches = EXCLUDED.max_branches,
  features = EXCLUDED.features;
