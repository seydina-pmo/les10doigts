CREATE OR REPLACE FUNCTION public.my_admin_school_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.schools WHERE admin_user_id = auth.uid() LIMIT 1
$$;

CREATE POLICY "super admin reads all schools"
  ON public.schools FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "super admin updates all schools"
  ON public.schools FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "school admin reads school profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (school_id IS NOT NULL AND school_id = public.my_admin_school_id());

CREATE POLICY "school admin reads school user_roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_roles.user_id
        AND p.school_id = public.my_admin_school_id()
    )
  );