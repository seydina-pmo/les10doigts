-- ============================================================
-- Migration: Subscriptions & Active Sessions
-- Tables nécessaires pour Phase 3 (monétisation + anti-partage)
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- 1. Table des abonnements
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'particulier', 'school')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  payment_method text CHECK (payment_method IN ('orange_money', 'wave', 'card', NULL)),
  payment_ref text,                         -- référence de transaction
  amount_fcfa integer,                      -- montant payé en FCFA
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,                   -- NULL = pas d'expiration
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)                           -- un seul abonnement actif par user
);

-- Index pour lookup rapide
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

-- RLS (Row Level Security)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs ne peuvent voir que leur propre abonnement
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Seul le service role peut modifier les abonnements (pas le client)
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');


-- 2. Table des sessions actives (anti-partage)
CREATE TABLE IF NOT EXISTS public.active_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint text NOT NULL,
  session_token text NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_fingerprint)       -- un seul enregistrement par device
);

-- Index pour lookup rapide
CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON public.active_sessions(user_id);

-- RLS
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent gérer leurs propres sessions
CREATE POLICY "Users can view own sessions"
  ON public.active_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.active_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.active_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.active_sessions FOR DELETE
  USING (auth.uid() = user_id);


-- 3. Nettoyage automatique des sessions inactives (> 24h)
-- Exécuter via Supabase cron ou manuellement
CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM public.active_sessions
  WHERE last_seen_at < now() - interval '24 hours';
$$;
