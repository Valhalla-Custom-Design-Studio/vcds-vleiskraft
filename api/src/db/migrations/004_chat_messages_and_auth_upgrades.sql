-- Migration: Add chat_messages table for VleisAI™ chat history
-- Ported from nodejs_space NestJS migration (Wave 1 Express compatibility)
-- TODO: Replace with Prisma schema in Wave 2 refactor

CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  butchery_id UUID REFERENCES butcheries(id) ON DELETE SET NULL,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content     TEXT NOT NULL,
  channel     VARCHAR(50) NOT NULL DEFAULT 'vleisai',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_channel ON chat_messages(user_id, channel);
CREATE INDEX IF NOT EXISTS idx_chat_messages_butchery ON chat_messages(butchery_id);

-- Add subscription_status + role columns to existing tables if not present
ALTER TABLE butcheries ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(30) DEFAULT 'active';
ALTER TABLE butcheries ADD COLUMN IF NOT EXISTS subscription_activated_at TIMESTAMPTZ;
ALTER TABLE butcheries ADD COLUMN IF NOT EXISTS last_payment_id VARCHAR(100);
ALTER TABLE butcheries ADD COLUMN IF NOT EXISTS last_payment_amount DECIMAL(10,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'USER';
