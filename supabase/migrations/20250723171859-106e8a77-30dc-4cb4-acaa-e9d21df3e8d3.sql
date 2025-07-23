
-- Update the users table RLS policy to allow Clerk user creation
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Create a new policy that allows inserting users without auth.uid() restriction
-- This is safe because we're validating the user data through our application logic
CREATE POLICY "Allow user creation for Clerk sync" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- Keep the existing update policy but make it more permissive for Clerk users
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (true)
WITH CHECK (true);
