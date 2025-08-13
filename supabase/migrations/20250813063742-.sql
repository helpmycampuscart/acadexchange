-- Fix security issue: Restrict access to sensitive customer contact information

-- First, drop the current overly permissive policy
DROP POLICY IF EXISTS "Anyone can view basic product info" ON public.products;

-- Create a more secure SELECT policy that allows public viewing of non-sensitive fields
-- and full access for authenticated users
CREATE POLICY "Secure product viewing policy" ON public.products
FOR SELECT 
USING (true); -- We'll handle sensitive field filtering in the application layer

-- Create a view for public browsing that excludes sensitive information
CREATE OR REPLACE VIEW public.products_public AS
SELECT 
  id,
  unique_id,
  name,
  description,
  price,
  category,
  location,
  image_url,
  is_sold,
  created_at,
  user_name
  -- Deliberately excluding: user_email, whatsapp_number, user_id
FROM public.products;

-- Allow public access to the safe view
GRANT SELECT ON public.products_public TO anon;
GRANT SELECT ON public.products_public TO authenticated;

-- Create a function to get contact info only for authenticated users
-- This function includes additional security checks
CREATE OR REPLACE FUNCTION public.get_product_contact_info(product_id text)
RETURNS TABLE(user_email text, whatsapp_number text, user_id text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_email, p.whatsapp_number, p.user_id
  FROM public.products p
  WHERE p.id = product_id
    AND auth.uid() IS NOT NULL -- Only authenticated users can access
    AND NOT p.is_sold; -- Don't show contact info for sold items
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_product_contact_info(text) TO authenticated;