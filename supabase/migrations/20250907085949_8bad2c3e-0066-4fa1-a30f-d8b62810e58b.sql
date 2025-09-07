-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.sanitize_user_name()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.sync_products_public_upsert()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;