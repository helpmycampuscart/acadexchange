
-- Update the RLS policy for user creation to allow Clerk sync
DROP POLICY IF EXISTS "Authenticated users can create profiles" ON public.users;

CREATE POLICY "Users can create their own profile during sync" 
ON public.users 
FOR INSERT 
WITH CHECK (true);
