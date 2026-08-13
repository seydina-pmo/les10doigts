
-- 1. Private schema for internal helpers
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- 2. Recreate helpers in private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION private.my_admin_school_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.schools WHERE admin_user_id = auth.uid() LIMIT 1
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.my_admin_school_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.my_admin_school_id() TO authenticated, service_role;

-- 3. Recreate all policies to reference private.*
DROP POLICY IF EXISTS "formateur creates classes" ON public.classes;
CREATE POLICY "formateur creates classes" ON public.classes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id AND private.has_role(auth.uid(), 'formateur'::public.app_role));

DROP POLICY IF EXISTS "admin ecole creates classes" ON public.classes;
CREATE POLICY "admin ecole creates classes" ON public.classes FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin_ecole'::public.app_role) AND school_id IS NOT NULL AND school_id = private.my_admin_school_id() AND owner_id = auth.uid());

DROP POLICY IF EXISTS "admin ecole reads school classes" ON public.classes;
CREATE POLICY "admin ecole reads school classes" ON public.classes FOR SELECT TO authenticated
  USING (school_id IS NOT NULL AND school_id = private.my_admin_school_id());

DROP POLICY IF EXISTS "admin ecole updates school classes" ON public.classes;
CREATE POLICY "admin ecole updates school classes" ON public.classes FOR UPDATE TO authenticated
  USING (school_id = private.my_admin_school_id()) WITH CHECK (school_id = private.my_admin_school_id());

DROP POLICY IF EXISTS "admin ecole deletes school classes" ON public.classes;
CREATE POLICY "admin ecole deletes school classes" ON public.classes FOR DELETE TO authenticated
  USING (school_id = private.my_admin_school_id());

DROP POLICY IF EXISTS "super admin reads all schools" ON public.schools;
CREATE POLICY "super admin reads all schools" ON public.schools FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "super admin updates all schools" ON public.schools;
CREATE POLICY "super admin updates all schools" ON public.schools FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::public.app_role)) WITH CHECK (private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "school admin reads school profiles" ON public.profiles;
CREATE POLICY "school admin reads school profiles" ON public.profiles FOR SELECT TO authenticated
  USING (school_id IS NOT NULL AND school_id = private.my_admin_school_id());

DROP POLICY IF EXISTS "school admin reads school user_roles" ON public.user_roles;
CREATE POLICY "school admin reads school user_roles" ON public.user_roles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_roles.user_id AND p.school_id = private.my_admin_school_id()));

DROP POLICY IF EXISTS "admin ecole sees school members" ON public.class_members;
CREATE POLICY "admin ecole sees school members" ON public.class_members FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_members.class_id AND c.school_id = private.my_admin_school_id()));

DROP POLICY IF EXISTS "admin ecole adds school members" ON public.class_members;
CREATE POLICY "admin ecole adds school members" ON public.class_members FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_members.class_id AND c.school_id = private.my_admin_school_id()));

DROP POLICY IF EXISTS "admin ecole removes school members" ON public.class_members;
CREATE POLICY "admin ecole removes school members" ON public.class_members FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_members.class_id AND c.school_id = private.my_admin_school_id()));

-- 4. Drop old exposed public helpers
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.my_admin_school_id();

-- 5. Remove permissive lookup policy on classes
DROP POLICY IF EXISTS "lookup by code" ON public.classes;

-- 6. Safe RPC to join a class by code (only exposes the fact of a match)
CREATE OR REPLACE FUNCTION public.join_class_by_code(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _class_id uuid;
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;
  IF _code IS NULL OR length(trim(_code)) = 0 THEN
    RAISE EXCEPTION 'invalid_code' USING ERRCODE = '22023';
  END IF;
  SELECT id INTO _class_id FROM public.classes WHERE join_code = upper(trim(_code)) LIMIT 1;
  IF _class_id IS NULL THEN
    RAISE EXCEPTION 'code_not_found' USING ERRCODE = 'P0002';
  END IF;
  INSERT INTO public.class_members (class_id, user_id)
    VALUES (_class_id, _uid)
    ON CONFLICT (class_id, user_id) DO NOTHING;
  RETURN _class_id;
END $$;

REVOKE ALL ON FUNCTION public.join_class_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_class_by_code(text) TO authenticated;
