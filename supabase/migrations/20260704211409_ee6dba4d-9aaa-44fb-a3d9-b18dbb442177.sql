
-- Lock down SECURITY DEFINER functions: revoke broad EXECUTE, grant only where required
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.join_class_by_code(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- join_class_by_code must remain callable by signed-in users (students joining a class)
GRANT EXECUTE ON FUNCTION public.join_class_by_code(text) TO authenticated;

-- Explicitly forbid signed-in users from writing to user_roles via the Data API.
-- Role management goes through service_role only (edge/admin paths).
DROP POLICY IF EXISTS "No client inserts on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "No client updates on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "No client deletes on user_roles" ON public.user_roles;

CREATE POLICY "No client inserts on user_roles"
  ON public.user_roles FOR INSERT TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "No client updates on user_roles"
  ON public.user_roles FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);

CREATE POLICY "No client deletes on user_roles"
  ON public.user_roles FOR DELETE TO authenticated, anon
  USING (false);
