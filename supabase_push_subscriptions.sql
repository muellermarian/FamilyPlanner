-- Tabelle für Push-Notification Subscriptions
-- Führe dieses SQL in deinem Supabase SQL-Editor aus

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  family_id UUID NOT NULL,
  subscription JSONB NOT NULL,
  endpoint TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);

-- Index für schnellere Abfragen
CREATE INDEX idx_push_subscriptions_family ON push_subscriptions(family_id);
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);

-- RLS Policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- User kann ihre eigenen Subscriptions sehen
CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- User kann ihre eigenen Subscriptions erstellen
CREATE POLICY "Users can create own subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- User kann ihre eigenen Subscriptions aktualisieren
CREATE POLICY "Users can update own subscriptions"
  ON push_subscriptions
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- User kann ihre eigenen Subscriptions löschen
CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();
