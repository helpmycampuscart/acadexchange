-- Create a secure separation between product data and contact information

-- Step 1: Create a separate secure table for contact information
CREATE TABLE IF NOT EXISTS public.product_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on the contact table with strict policies
ALTER TABLE public.product_contacts ENABLE ROW LEVEL SECURITY;

-- Only the product owner can see their own contact info
CREATE POLICY "Users can view their own contact info" 
ON public.product_contacts 
FOR SELECT 
USING (auth.uid()::text = user_id);

-- Only the product owner can create/update their contact info
CREATE POLICY "Users can manage their own contact info" 
ON public.product_contacts 
FOR ALL 
USING (auth.uid()::text = user_id) 
WITH CHECK (auth.uid()::text = user_id);

-- Step 2: Migrate existing contact data to the secure table
INSERT INTO public.product_contacts (product_id, user_id, user_email, whatsapp_number)
SELECT id, user_id, user_email, whatsapp_number 
FROM public.products 
WHERE whatsapp_number IS NOT NULL 
ON CONFLICT (product_id) DO NOTHING;

-- Step 3: Update the get_product_contact_info function to use the secure table
CREATE OR REPLACE FUNCTION public.get_product_contact_info(product_id text)
RETURNS TABLE(user_email text, whatsapp_number text, user_id text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT pc.user_email, pc.whatsapp_number, pc.user_id
  FROM public.product_contacts pc
  JOIN public.products p ON pc.product_id = p.id
  WHERE pc.product_id = get_product_contact_info.product_id
    AND auth.uid() IS NOT NULL -- Only authenticated users can access
    AND NOT p.is_sold -- Don't show contact info for sold items
    AND auth.uid()::text != pc.user_id; -- Don't return own contact info
$function$;

-- Step 4: Remove sensitive fields from products table (in future migration)
-- For now, we'll keep them to avoid breaking existing code
-- ALTER TABLE public.products DROP COLUMN IF EXISTS whatsapp_number;
-- ALTER TABLE public.products DROP COLUMN IF EXISTS user_email;

-- Add comment explaining the security model
COMMENT ON TABLE public.product_contacts IS 'Secure table for storing sensitive contact information separate from public product data. Protected by strict RLS policies.';