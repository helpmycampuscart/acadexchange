-- Add unique constraint on product_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'product_contacts_product_id_key'
  ) THEN
    ALTER TABLE public.product_contacts 
    ADD CONSTRAINT product_contacts_product_id_key UNIQUE (product_id);
  END IF;
END $$;

-- Simplify RLS policies for product_contacts
DROP POLICY IF EXISTS "Contact owners can view their own contact info" ON public.product_contacts;
DROP POLICY IF EXISTS "Product owners can view contact info for their products" ON public.product_contacts;
DROP POLICY IF EXISTS "All users can view product contacts" ON public.product_contacts;
DROP POLICY IF EXISTS "Users can update their own contact info only" ON public.product_contacts;
DROP POLICY IF EXISTS "Users can delete their own contact info only" ON public.product_contacts;
DROP POLICY IF EXISTS "Authenticated users can insert their own contact info only" ON public.product_contacts;

-- Create simplified policies
CREATE POLICY "Anyone can view product contacts"
  ON public.product_contacts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own contacts"
  ON public.product_contacts FOR INSERT
  WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can update their own contacts"
  ON public.product_contacts FOR UPDATE
  USING ((auth.uid())::text = user_id)
  WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users and admins can delete contacts"
  ON public.product_contacts FOR DELETE
  USING (
    (auth.uid())::text = user_id 
    OR get_current_user_role() = 'admin'
  );

-- Backfill existing products into product_contacts
INSERT INTO public.product_contacts (product_id, user_id, user_email, whatsapp_number)
SELECT 
  id,
  user_id,
  user_email,
  whatsapp_number
FROM public.products
WHERE whatsapp_number IS NOT NULL
  AND whatsapp_number != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.product_contacts pc 
    WHERE pc.product_id = products.id
  )
ON CONFLICT (product_id) DO NOTHING;