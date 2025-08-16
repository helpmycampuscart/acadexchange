-- Fix critical privilege escalation vulnerability in users table

-- Drop the overly permissive UPDATE policy that allows any user to modify any profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Create a secure UPDATE policy that only allows users to update their own profiles
-- and prevents modification of sensitive fields like role
CREATE POLICY "Users can update their own profile only" 
ON public.users 
FOR UPDATE 
USING (auth.uid()::text = id) 
WITH CHECK (
  auth.uid()::text = id 
  AND role = (SELECT role FROM public.users WHERE id = auth.uid()::text)  -- Prevent role changes
);

-- Also ensure the INSERT policy is secure for user creation
DROP POLICY IF EXISTS "Allow user creation for Clerk sync" ON public.users;
CREATE POLICY "Authenticated users can create their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (
  auth.uid()::text = id 
  AND role = 'user'  -- Force new users to have 'user' role
);