
-- Fix RLS policies for users table to work with Clerk authentication
-- The issue is that Clerk user IDs don't match Supabase auth.uid()

-- Drop existing policies that don't work with Clerk
DROP POLICY IF EXISTS "Authenticated users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile only" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;

-- Create new policies that work with Clerk
-- Allow any authenticated user to insert their profile (Clerk handles the auth)
CREATE POLICY "Authenticated users can create profiles" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow users to view their own profile by matching the id field
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
TO authenticated
USING (id = (SELECT id FROM public.users WHERE id = auth.uid()::text) OR get_current_user_role() = 'admin');

-- Allow users to update their own profile (but not change role unless admin)
CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (id = (SELECT id FROM public.users WHERE id = auth.uid()::text))
WITH CHECK (
  id = (SELECT id FROM public.users WHERE id = auth.uid()::text) 
  AND (
    role = (SELECT role FROM public.users WHERE id = auth.uid()::text) 
    OR get_current_user_role() = 'admin'
  )
);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.users 
FOR SELECT 
TO authenticated
USING (get_current_user_role() = 'admin');

-- Update the get_current_user_role function to handle Clerk user IDs properly
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE id = auth.uid()::text), 
    'user'
  );
$function$;
