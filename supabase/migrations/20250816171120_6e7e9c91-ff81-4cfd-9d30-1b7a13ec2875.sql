
-- Fix the RLS policies for product_contacts table to work with Edge Functions
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own contact info" ON public.product_contacts;
DROP POLICY IF EXISTS "Users can manage their own contact info" ON public.product_contacts;

-- Create new policies that work with both client-side and Edge Function contexts
CREATE POLICY "Users can view their own contact info" 
ON public.product_contacts 
FOR SELECT 
USING (
  (auth.uid()::text = user_id) OR 
  (get_current_user_role() = 'admin')
);

CREATE POLICY "Users can insert their own contact info" 
ON public.product_contacts 
FOR INSERT 
WITH CHECK (true); -- Allow inserts from Edge Functions

CREATE POLICY "Users can update their own contact info" 
ON public.product_contacts 
FOR UPDATE 
USING ((auth.uid()::text = user_id) OR (get_current_user_role() = 'admin'))
WITH CHECK ((auth.uid()::text = user_id) OR (get_current_user_role() = 'admin'));

CREATE POLICY "Users can delete their own contact info" 
ON public.product_contacts 
FOR DELETE 
USING ((auth.uid()::text = user_id) OR (get_current_user_role() = 'admin'));
