-- Ensure products_public view is completely clean of sensitive data
-- and explicitly document what fields are safe for public access

DROP VIEW IF EXISTS public.products_public;

-- Create a completely sanitized public view with only safe, non-sensitive fields
CREATE VIEW public.products_public 
WITH (security_invoker=off) 
AS 
SELECT 
    id,
    unique_id,
    name,
    description,
    price,
    category,
    location,
    image_url,
    is_sold,
    created_at,
    user_name  -- Only the display name, no contact info
FROM public.products
WHERE NOT is_sold OR is_sold IS NULL;  -- Only show available products

-- Grant proper access to the view
GRANT SELECT ON public.products_public TO anon;
GRANT SELECT ON public.products_public TO authenticated;

-- Add comprehensive documentation about security model
COMMENT ON VIEW public.products_public IS 'Public view of products containing ONLY non-sensitive information. Excludes ALL contact details (whatsapp_number, user_email, user_id). Contact information is securely stored in the product_contacts table and accessible only through the get_product_contact_info function for authenticated users.';