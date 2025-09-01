-- Fix the security definer view issue
DROP VIEW IF EXISTS public.products_clean_public;

-- Create a regular view without SECURITY DEFINER
CREATE VIEW public.products_clean_public AS
SELECT 
  id,
  unique_id,
  name,
  description,
  price,
  category,
  location,
  image_url,
  user_name,
  created_at,
  is_sold
FROM public.products_public;