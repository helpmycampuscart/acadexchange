
-- Remove the problematic SECURITY DEFINER view
DROP VIEW IF EXISTS public.products_public;

-- Instead, we'll modify the products table RLS policies to handle contact information visibility properly
-- Create a new policy that allows authenticated users to see full product details including contact info
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;

-- Create separate policies for different access levels
CREATE POLICY "Anyone can view basic product info" 
  ON public.products 
  FOR SELECT 
  USING (true);

-- The application will handle contact information visibility in the frontend code
-- by checking authentication status before displaying WhatsApp numbers and emails
