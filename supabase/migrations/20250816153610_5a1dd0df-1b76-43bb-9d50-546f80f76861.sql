-- Fix the products_public view to properly handle RLS and security

-- Drop and recreate the products_public view as SECURITY DEFINER
-- This allows it to bypass RLS on the underlying products table for safe public data
DROP VIEW IF EXISTS public.products_public;

CREATE VIEW public.products_public 
WITH (security_invoker=off) 
AS 
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
FROM public.products
WHERE NOT is_sold OR is_sold IS NULL;  -- Only show available products publicly

-- Grant proper access to the view
GRANT SELECT ON public.products_public TO anon;
GRANT SELECT ON public.products_public TO authenticated;

-- Add a comment explaining the security model
COMMENT ON VIEW public.products_public IS 'Public view of products excluding sensitive contact information. Uses security_invoker=off to safely bypass RLS for public product browsing.';