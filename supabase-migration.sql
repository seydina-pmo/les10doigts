-- ============================================================
-- LES 10 DOIGTS — Script de création de base de données
-- À exécuter dans Supabase → SQL Editor → New query
-- ============================================================

-- 1. ENUM
CREATE TYPE public.app_role AS ENUM (
  'eleve',
  'formateur',
  'particulier',
  'admin_ecole',
  'super_admin'
);

-- 2. TABLES

-- Schools (écoles)
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  nb_classes INTEGER NOT NULL DEFAULT 1,
  nb_students INTEGER NOT NULL DEFAULT 0,
  admin_user_id UUID REFERENCES auth.users(id),
  activated_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  upgrade_requested_at TIMESTAMPTZ,
  upgrade_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (utilisateurs)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  school_id UUID REFERENCES public.schools(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Classes
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  school_id UUID REFERENCES public.schools(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Class members
CREATE TABLE public.class_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, user_id)
);

-- Lesson attempts (progression)
CREATE TABLE public.lesson_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  mpm REAL NOT NULL,
  accuracy REAL NOT NULL,
  duration_ms INTEGER NOT NULL,
  key_errors JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEXES
CREATE INDEX idx_lesson_attempts_user ON public.lesson_attempts(user_id);
CREATE INDEX idx_lesson_attempts_level ON public.lesson_attempts(user_id, level);
CREATE INDEX idx_class_members_class ON public.class_members(class_id);
CREATE INDEX idx_class_members_user ON public.class_members(user_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_profiles_school ON public.profiles(school_id);

-- 4. FUNCTION: join class by code
CREATE OR REPLACE FUNCTION public.join_class_by_code(_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _class_id UUID;
  _user_id UUID := auth.uid();
BEGIN
  SELECT id INTO _class_id FROM public.classes WHERE join_code = _code;
  IF _class_id IS NULL THEN
    RAISE EXCEPTION 'Code de classe invalide';
  END IF;
  INSERT INTO public.class_members (class_id, user_id)
  VALUES (_class_id, _user_id)
  ON CONFLICT (class_id, user_id) DO NOTHING;
  RETURN _class_id::TEXT;
END;
$$;

-- 5. AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE public.lesson_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own attempts" ON public.lesson_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON public.lesson_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admin can manage roles" ON public.user_roles FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can manage classes" ON public.classes FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Members can view classes" ON public.classes FOR SELECT USING (EXISTS (SELECT 1 FROM public.class_members WHERE class_id = id AND user_id = auth.uid()));

ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Class owner can manage members" ON public.class_members FOR ALL USING (EXISTS (SELECT 1 FROM public.classes WHERE id = class_id AND owner_id = auth.uid()));
CREATE POLICY "Members can view own membership" ON public.class_members FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view own school" ON public.schools FOR SELECT USING (auth.uid() = admin_user_id);
CREATE POLICY "Admin can update own school" ON public.schools FOR UPDATE USING (auth.uid() = admin_user_id);
CREATE POLICY "Anyone can insert school request" ON public.schools FOR INSERT WITH CHECK (true);
CREATE POLICY "Super admin can manage all schools" ON public.schools FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Formateurs can view class student attempts" ON public.lesson_attempts FOR SELECT USING (EXISTS (SELECT 1 FROM public.class_members cm JOIN public.classes c ON c.id = cm.class_id WHERE cm.user_id = lesson_attempts.user_id AND c.owner_id = auth.uid()));

CREATE POLICY "Super admin full access attempts" ON public.lesson_attempts FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));
