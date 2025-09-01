-- Fix the product_contacts table security issue
-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "Users can insert their own contact info" ON public.product_contacts;

-- Create a more restrictive policy that only allows authenticated users to create their own contact records
CREATE POLICY "Authenticated users can insert their own contact info" 
ON public.product_contacts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid()::text = user_id);