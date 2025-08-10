
-- Phase 1: Critical RLS Policy Fixes

-- 1. Fix Product Ownership Policies - Only owners can modify their products
DROP POLICY IF EXISTS "Allow product updates for Clerk users" ON public.products;
CREATE POLICY "Users can update their own products" 
  ON public.products 
  FOR UPDATE 
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Allow product deletion for Clerk users" ON public.products;
CREATE POLICY "Users can delete their own products" 
  ON public.products 
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- 2. Secure User Data Access - Replace overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
CREATE POLICY "Users can view their own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid()::text = id);

-- Create admin-only policy for user management
CREATE POLICY "Admins can view all profiles" 
  ON public.users 
  FOR SELECT 
  USING (get_current_user_role() = 'admin');

-- 3. Fix the get_current_user_role function with proper null handling
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE id = auth.uid()::text), 
    'user'
  );
$function$;

-- 4. Create function to check if user is product owner or admin
CREATE OR REPLACE FUNCTION public.can_access_product_details(product_user_id text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT (
    auth.uid()::text = product_user_id OR 
    public.get_current_user_role() = 'admin'
  );
$function$;

-- 5. Add audit logging for admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  target_user text DEFAULT NULL,
  action_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only log if user is admin
  IF public.get_current_user_role() = 'admin' THEN
    INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
    VALUES (auth.uid()::text, action_type, target_user, action_details);
  END IF;
END;
$function$;

-- 6. Create policy to protect WhatsApp numbers from public view
-- First add a view for public product data without sensitive info
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
  user_name,
  created_at,
  is_sold,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN whatsapp_number
    ELSE NULL
  END as whatsapp_number,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN user_email
    ELSE NULL
  END as user_email,
  user_id
FROM public.products;

-- Add RLS to the view
ALTER VIEW public.products_public SET (security_barrier = true);
