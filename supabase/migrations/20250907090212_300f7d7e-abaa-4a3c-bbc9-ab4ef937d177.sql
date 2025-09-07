-- Final fix for product_contacts RLS - ensure maximum security
-- Drop all existing policies and recreate with stricter access control
DROP POLICY IF EXISTS "Users can view their own contact info and product owners can view contacts for their products" ON public.product_contacts;
DROP POLICY IF EXISTS "Users can update their own contact info" ON public.product_contacts;
DROP POLICY IF EXISTS "Users can delete their own contact info" ON public.product_contacts;
DROP POLICY IF EXISTS "Authenticated users can insert their own contact info" ON public.product_contacts;

-- Create more restrictive policies
CREATE POLICY "Contact owners can view their own contact info" 
ON public.product_contacts 
FOR SELECT 
USING (
  (auth.uid())::text = user_id 
  OR public.get_current_user_role() = 'admin'
);

CREATE POLICY "Product owners can view contact info for their products" 
ON public.product_contacts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.products p 
    WHERE p.id = product_contacts.product_id 
    AND p.user_id = (auth.uid())::text
  )
  OR public.get_current_user_role() = 'admin'
);

CREATE POLICY "Users can update their own contact info only" 
ON public.product_contacts 
FOR UPDATE 
USING ((auth.uid())::text = user_id)
WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own contact info only" 
ON public.product_contacts 
FOR DELETE 
USING ((auth.uid())::text = user_id);

CREATE POLICY "Authenticated users can insert their own contact info only" 
ON public.product_contacts 
FOR INSERT 
WITH CHECK ((auth.uid())::text = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.product_contacts ENABLE ROW LEVEL SECURITY;