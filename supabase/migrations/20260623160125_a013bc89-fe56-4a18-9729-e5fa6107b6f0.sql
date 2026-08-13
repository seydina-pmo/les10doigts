
-- 1. classes
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  join_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner read classes" ON public.classes FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);
CREATE POLICY "lookup by code" ON public.classes FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "formateur creates classes" ON public.classes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id AND public.has_role(auth.uid(), 'formateur'));
CREATE POLICY "owner updates classes" ON public.classes FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner deletes classes" ON public.classes FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- 2. class_members
CREATE TABLE public.class_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_members TO authenticated;
GRANT ALL ON public.class_members TO service_role;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member sees self" ON public.class_members FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "owner sees members" ON public.class_members FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.owner_id = auth.uid()));
CREATE POLICY "student joins class" ON public.class_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "student leaves class" ON public.class_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "owner removes member" ON public.class_members FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.owner_id = auth.uid()));

-- 3. lesson_attempts.key_errors (jsonb { "a": 2, "e": 5 })
ALTER TABLE public.lesson_attempts
  ADD COLUMN IF NOT EXISTS key_errors jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 4. Allow formateur to read attempts of students in their classes
CREATE POLICY "formateur reads class attempts" ON public.lesson_attempts FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.class_members cm
      JOIN public.classes c ON c.id = cm.class_id
      WHERE cm.user_id = lesson_attempts.user_id
        AND c.owner_id = auth.uid()
    )
  );

-- 5. Allow formateur to read profiles of their students
CREATE POLICY "formateur reads student profiles" ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.class_members cm
      JOIN public.classes c ON c.id = cm.class_id
      WHERE cm.user_id = profiles.id
        AND c.owner_id = auth.uid()
    )
  );
