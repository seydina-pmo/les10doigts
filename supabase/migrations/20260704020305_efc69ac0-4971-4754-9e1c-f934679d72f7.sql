REVOKE ALL ON FUNCTION public.my_admin_school_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_admin_school_id() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;