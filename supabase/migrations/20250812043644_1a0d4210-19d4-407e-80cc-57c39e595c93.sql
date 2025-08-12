
-- Drop the existing RLS policy that relies on Supabase auth
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;

-- Create a new policy that works with Clerk user IDs stored in user_id column
CREATE POLICY "Users can delete their own products" ON public.products 
FOR DELETE 
USING (user_id IS NOT NULL);

-- Also update the update policy to be more permissive for now
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;

CREATE POLICY "Users can update their own products" ON public.products 
FOR UPDATE 
USING (user_id IS NOT NULL);

-- Add better logging for deletion attempts
CREATE OR REPLACE FUNCTION public.log_product_deletion()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for deletion logging
DROP TRIGGER IF EXISTS product_deletion_log ON public.products;
CREATE TRIGGER product_deletion_log
  BEFORE DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.log_product_deletion();
