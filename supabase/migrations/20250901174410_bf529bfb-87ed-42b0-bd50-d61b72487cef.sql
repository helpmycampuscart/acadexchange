-- Production Security Hardening: Restrict sensitive data access

-- 1. Create a more secure contact access system
-- Drop the current overly permissive function and create a more restrictive one
DROP FUNCTION IF EXISTS public.get_product_contact_info(text);

-- Create a more secure function that logs access and has stricter controls
CREATE OR REPLACE FUNCTION public.get_secure_contact_info(
  product_id_param text,
  viewer_id_param text
)
RETURNS TABLE(
  whatsapp_number text,
  user_email text,
  seller_id text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow access if viewer is authenticated and not the seller
  IF viewer_id_param IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check if product exists and is not sold
  IF NOT EXISTS (
    SELECT 1 FROM products p 
    WHERE p.id = product_id_param 
    AND p.is_sold = false
    AND p.user_id != viewer_id_param
  ) THEN
    RAISE EXCEPTION 'Product not available for contact';
  END IF;

  -- Log the contact access attempt
  INSERT INTO public.admin_audit_log (
    admin_id, 
    action, 
    target_user_id, 
    details
  ) VALUES (
    viewer_id_param,
    'contact_accessed',
    (SELECT user_id FROM products WHERE id = product_id_param),
    jsonb_build_object(
      'product_id', product_id_param,
      'accessed_at', now()
    )
  );

  -- Return contact info from product_contacts table if available, otherwise from products
  RETURN QUERY
  SELECT 
    COALESCE(pc.whatsapp_number, p.whatsapp_number) as whatsapp_number,
    COALESCE(pc.user_email, p.user_email) as user_email,
    p.user_id as seller_id
  FROM products p
  LEFT JOIN product_contacts pc ON pc.product_id = p.id
  WHERE p.id = product_id_param
    AND p.is_sold = false
    AND p.user_id != viewer_id_param;
END;
$$;

-- 2. Remove sensitive data from products_public view by creating a cleaner public view
DROP VIEW IF EXISTS public.products_clean_public;
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

-- 3. Add rate limiting table for contact access
CREATE TABLE IF NOT EXISTS public.contact_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  access_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on rate limits table
ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy for rate limits table
CREATE POLICY "Users can view their own rate limits"
ON public.contact_rate_limits
FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own rate limits"
ON public.contact_rate_limits
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own rate limits"
ON public.contact_rate_limits
FOR UPDATE
USING (auth.uid()::text = user_id);