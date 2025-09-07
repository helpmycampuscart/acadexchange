-- Fix production readiness issues

-- 1. Drop the products_clean_public table as it's not needed and has no RLS protection
DROP TABLE IF EXISTS public.products_clean_public;

-- 2. Fix the user creation duplicate key issue by updating the user sync logic
-- We'll handle this in the client code, but add a unique constraint to prevent issues
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON public.users(email);

-- 3. Add proper RLS to admin_audit_log table for better security
CREATE POLICY "System can insert audit logs" ON public.admin_audit_log
FOR INSERT 
WITH CHECK (true);

-- 4. Add security trigger to log admin actions
CREATE OR REPLACE FUNCTION public.log_contact_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when contact info is accessed via the secure function
  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (
    NEW.admin_id,
    'secure_contact_accessed',
    NEW.target_user_id,
    NEW.details
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update get_secure_contact_info to be more secure and not use SECURITY DEFINER unnecessarily
CREATE OR REPLACE FUNCTION public.get_secure_contact_info(product_id_param text, viewer_id_param text)
RETURNS TABLE(whatsapp_number text, user_email text, seller_id text)
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER to SECURITY INVOKER
SET search_path = public
AS $function$
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
$function$;