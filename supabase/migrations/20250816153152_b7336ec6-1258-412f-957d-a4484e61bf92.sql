-- Fix critical security issue: Restrict access to sensitive data in products table

-- Drop the overly permissive SELECT policy that allows public access to sensitive data
DROP POLICY IF EXISTS "Secure product viewing policy" ON public.products;

-- Create a new restrictive SELECT policy - only owners and admins can see full product details
CREATE POLICY "Users can view their own products and admins can view all" 
ON public.products 
FOR SELECT 
USING (
  auth.uid()::text = user_id OR 
  public.get_current_user_role() = 'admin'
);

-- Ensure the products_public view grants proper access for public browsing
-- This view should exclude sensitive fields like whatsapp_number, user_email, user_id
GRANT SELECT ON public.products_public TO anon;
GRANT SELECT ON public.products_public TO authenticated;

-- Update other policies to be more secure
DROP POLICY IF EXISTS "Allow product creation for Clerk users" ON public.products;
CREATE POLICY "Users can create their own products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
CREATE POLICY "Users can update their own products or admins can update any" 
ON public.products 
FOR UPDATE 
USING (
  auth.uid()::text = user_id OR 
  public.get_current_user_role() = 'admin'
) 
WITH CHECK (
  auth.uid()::text = user_id OR 
  public.get_current_user_role() = 'admin'
);

DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;
CREATE POLICY "Users can delete their own products or admins can delete any" 
ON public.products 
FOR DELETE 
USING (
  auth.uid()::text = user_id OR 
  public.get_current_user_role() = 'admin'
);

-- Fix the function search path issue
DROP FUNCTION IF EXISTS public.log_product_deletion();
CREATE OR REPLACE FUNCTION public.log_product_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Log the deletion attempt
  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (
    OLD.user_id,
    'product_deleted',
    OLD.user_id,
    jsonb_build_object(
      'product_id', OLD.id,
      'product_name', OLD.name,
      'unique_id', OLD.unique_id
    )
  );
  
  RETURN OLD;
END;
$function$;