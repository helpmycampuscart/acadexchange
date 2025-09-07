-- Fix critical security vulnerabilities for user data exposure

-- 1. Fix product_contacts table RLS - ensure only authorized users can access contact info
DROP POLICY IF EXISTS "Users can view their own contact info" ON public.product_contacts;

CREATE POLICY "Users can view their own contact info and product owners can view contacts for their products" 
ON public.product_contacts 
FOR SELECT 
USING (
  (auth.uid())::text = user_id 
  OR EXISTS (
    SELECT 1 FROM public.products p 
    WHERE p.id = product_contacts.product_id 
    AND p.user_id = (auth.uid())::text
  )
  OR public.get_current_user_role() = 'admin'
);

-- 2. Fix products_public table to remove email exposure
-- First, let's see what user_name field contains and clean it up
-- Update user_name to remove email addresses and keep only actual names
UPDATE public.products_public 
SET user_name = CASE 
  WHEN user_name ~ '\S+@\S+\.\S+' THEN 
    -- Extract name part before email if format is "EMAIL NAME" 
    CASE 
      WHEN user_name ~ '^\S+@\S+\.\S+\s+(.+)$' THEN 
        regexp_replace(user_name, '^\S+@\S+\.\S+\s+(.+)$', '\1')
      -- If format is "NAME EMAIL", extract name before @
      WHEN user_name ~ '^(.+)\s+\S+@\S+\.\S+$' THEN 
        regexp_replace(user_name, '^(.+)\s+\S+@\S+\.\S+$', '\1')
      -- If just email, use "User" as placeholder
      ELSE 'User'
    END
  ELSE user_name
END
WHERE user_name ~ '\S+@\S+\.\S+';

-- 3. Add a trigger to prevent future email exposure in products_public
CREATE OR REPLACE FUNCTION public.sanitize_user_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove email addresses from user_name field before insert/update
  IF NEW.user_name ~ '\S+@\S+\.\S+' THEN
    NEW.user_name := CASE 
      WHEN NEW.user_name ~ '^\S+@\S+\.\S+\s+(.+)$' THEN 
        regexp_replace(NEW.user_name, '^\S+@\S+\.\S+\s+(.+)$', '\1')
      WHEN NEW.user_name ~ '^(.+)\s+\S+@\S+\.\S+$' THEN 
        regexp_replace(NEW.user_name, '^(.+)\s+\S+@\S+\.\S+$', '\1')
      ELSE 'User'
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sanitize user names automatically
DROP TRIGGER IF EXISTS sanitize_user_name_trigger ON public.products_public;
CREATE TRIGGER sanitize_user_name_trigger
  BEFORE INSERT OR UPDATE ON public.products_public
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_user_name();

-- 4. Update the main products table sync trigger to ensure clean data
CREATE OR REPLACE FUNCTION public.sync_products_public_upsert()
RETURNS TRIGGER AS $$
DECLARE
  clean_user_name TEXT;
BEGIN
  -- Sanitize user_name to remove email addresses
  clean_user_name := NEW.user_name;
  IF clean_user_name ~ '\S+@\S+\.\S+' THEN
    clean_user_name := CASE 
      WHEN clean_user_name ~ '^\S+@\S+\.\S+\s+(.+)$' THEN 
        regexp_replace(clean_user_name, '^\S+@\S+\.\S+\s+(.+)$', '\1')
      WHEN clean_user_name ~ '^(.+)\s+\S+@\S+\.\S+$' THEN 
        regexp_replace(clean_user_name, '^(.+)\s+\S+@\S+\.\S+$', '\1')
      ELSE 'User'
    END;
  END IF;

  INSERT INTO public.products_public (
    id, unique_id, name, description, price, category, location, image_url, user_name, created_at, is_sold
  )
  VALUES (
    NEW.id, NEW.unique_id, NEW.name, NEW.description, NEW.price, NEW.category, NEW.location, NEW.image_url, clean_user_name, NEW.created_at, NEW.is_sold
  )
  ON CONFLICT (id) DO UPDATE SET
    unique_id   = EXCLUDED.unique_id,
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    price       = EXCLUDED.price,
    category    = EXCLUDED.category,
    location    = EXCLUDED.location,
    image_url   = EXCLUDED.image_url,
    user_name   = EXCLUDED.user_name,
    created_at  = EXCLUDED.created_at,
    is_sold     = EXCLUDED.is_sold;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;