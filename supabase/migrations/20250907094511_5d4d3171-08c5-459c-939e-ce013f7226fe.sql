-- Secure function to get total users count bypassing RLS (read-only)
CREATE OR REPLACE FUNCTION public.get_total_user_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::int FROM public.users;
$$;

COMMENT ON FUNCTION public.get_total_user_count() IS 'Returns total number of users from public.users; SECURITY DEFINER to bypass RLS for counts only.';