
-- Billing / plan fields on schools
ALTER TABLE public.schools 
  ADD COLUMN IF NOT EXISTS billing_cycle text NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS upgrade_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS upgrade_message text;

-- Admin école : gestion complète des classes de son école
DROP POLICY IF EXISTS "admin ecole creates classes" ON public.classes;
CREATE POLICY "admin ecole creates classes" ON public.classes
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin_ecole')
    AND school_id IS NOT NULL
    AND school_id = public.my_admin_school_id()
    AND owner_id = auth.uid()
  );

DROP POLICY IF EXISTS "admin ecole reads school classes" ON public.classes;
CREATE POLICY "admin ecole reads school classes" ON public.classes
  FOR SELECT TO authenticated
  USING (
    school_id IS NOT NULL 
    AND school_id = public.my_admin_school_id()
  );

DROP POLICY IF EXISTS "admin ecole updates school classes" ON public.classes;
CREATE POLICY "admin ecole updates school classes" ON public.classes
  FOR UPDATE TO authenticated
  USING (school_id = public.my_admin_school_id())
  WITH CHECK (school_id = public.my_admin_school_id());

DROP POLICY IF EXISTS "admin ecole deletes school classes" ON public.classes;
CREATE POLICY "admin ecole deletes school classes" ON public.classes
  FOR DELETE TO authenticated
  USING (school_id = public.my_admin_school_id());

-- Admin école : voir les membres des classes de son école
DROP POLICY IF EXISTS "admin ecole sees school members" ON public.class_members;
CREATE POLICY "admin ecole sees school members" ON public.class_members
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_members.class_id
      AND c.school_id = public.my_admin_school_id()
  ));

-- Admin école : ajouter/supprimer des membres dans les classes de son école
DROP POLICY IF EXISTS "admin ecole adds school members" ON public.class_members;
CREATE POLICY "admin ecole adds school members" ON public.class_members
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_members.class_id
      AND c.school_id = public.my_admin_school_id()
  ));

DROP POLICY IF EXISTS "admin ecole removes school members" ON public.class_members;
CREATE POLICY "admin ecole removes school members" ON public.class_members
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_members.class_id
      AND c.school_id = public.my_admin_school_id()
  ));
