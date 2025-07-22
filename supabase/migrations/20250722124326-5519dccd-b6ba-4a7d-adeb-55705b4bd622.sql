-- Fix infinite recursion in RLS policies by creating security definer function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()::text;
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can manage all products" 
ON public.products 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all users" 
ON public.users 
FOR ALL 
USING (public.get_current_user_role() = 'admin');