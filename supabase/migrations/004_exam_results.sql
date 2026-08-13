-- ============================================================
-- Migration: Exam Results
-- Table pour stocker les résultats des examens de certification
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS public.exam_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold')),
  passed boolean NOT NULL DEFAULT false,
  mpm integer NOT NULL,
  accuracy integer NOT NULL,
  duration_ms integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour lookup rapide
CREATE INDEX IF NOT EXISTS idx_exam_results_user ON public.exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_tier ON public.exam_results(user_id, tier);

-- RLS
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres résultats
CREATE POLICY "Users can view own exam results"
  ON public.exam_results FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leurs propres résultats
CREATE POLICY "Users can insert own exam results"
  ON public.exam_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);
