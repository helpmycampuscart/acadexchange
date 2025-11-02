-- Add purchased_date column to products table
ALTER TABLE public.products 
ADD COLUMN purchased_date DATE;

-- Add purchased_date column to products_public table
ALTER TABLE public.products_public 
ADD COLUMN purchased_date DATE;

-- Update the sync trigger to include purchased_date
CREATE OR REPLACE FUNCTION public.sync_products_public_upsert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    id, unique_id, name, description, price, category, location, image_url, user_name, created_at, is_sold, purchased_date
  )
  VALUES (
    NEW.id, NEW.unique_id, NEW.name, NEW.description, NEW.price, NEW.category, NEW.location, NEW.image_url, clean_user_name, NEW.created_at, NEW.is_sold, NEW.purchased_date
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
    is_sold     = EXCLUDED.is_sold,
    purchased_date = EXCLUDED.purchased_date;
  RETURN NEW;
END;
$function$;