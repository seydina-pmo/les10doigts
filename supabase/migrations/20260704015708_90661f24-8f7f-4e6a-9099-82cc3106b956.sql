-- Nouveau rôle admin d'école (personne qui pilote le compte école)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin_ecole';

-- Table des demandes / comptes école
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address TEXT,
  nb_classes INTEGER NOT NULL DEFAULT 1,
  nb_students INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | active | rejected
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.schools TO anon;
GRANT SELECT, INSERT, UPDATE ON public.schools TO authenticated;
GRANT ALL ON public.schools TO service_role;

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- N'importe qui peut soumettre une demande d'ouverture de compte école
CREATE POLICY "public can submit school requests"
  ON public.schools FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND admin_user_id IS NULL);

-- L'admin d'école voit et met à jour son école
CREATE POLICY "school admin reads own school"
  ON public.schools FOR SELECT TO authenticated
  USING (admin_user_id = auth.uid());

CREATE POLICY "school admin updates own school"
  ON public.schools FOR UPDATE TO authenticated
  USING (admin_user_id = auth.uid())
  WITH CHECK (admin_user_id = auth.uid());

-- Lier une classe à une école (optionnel pour l'existant)
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;

-- Lier un profil à une école (élève ou formateur d'une école)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS schools_touch_updated_at ON public.schools;
CREATE TRIGGER schools_touch_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();