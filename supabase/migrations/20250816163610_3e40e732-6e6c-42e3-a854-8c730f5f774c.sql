
-- 1) Replace SECURITY DEFINER view with a real table

DROP VIEW IF EXISTS public.products_public CASCADE;

CREATE TABLE public.products_public (
  id text PRIMARY KEY,
  unique_id text NOT NULL,
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  category text NOT NULL,
  location text NOT NULL,
  image_url text,
  user_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_sold boolean NOT NULL DEFAULT false
);

-- Enable RLS and allow safe public reads
ALTER TABLE public.products_public ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to products_public"
  ON public.products_public
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Helpful indexes
CREATE INDEX products_public_created_at_idx ON public.products_public (created_at DESC);
CREATE INDEX products_public_category_idx ON public.products_public (category);
CREATE INDEX products_public_location_idx ON public.products_public (location);
CREATE INDEX products_public_is_sold_idx ON public.products_public (is_sold);

-- 2) Sync functions and triggers from products -> products_public

CREATE OR REPLACE FUNCTION public.sync_products_public_upsert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.products_public (
    id, unique_id, name, description, price, category, location, image_url, user_name, created_at, is_sold
  )
  VALUES (
    NEW.id, NEW.unique_id, NEW.name, NEW.description, NEW.price, NEW.category, NEW.location, NEW.image_url, NEW.user_name, NEW.created_at, NEW.is_sold
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

CREATE OR REPLACE FUNCTION public.sync_products_public_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.products_public WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_public_insert ON public.products;
DROP TRIGGER IF EXISTS trg_products_public_update ON public.products;
DROP TRIGGER IF EXISTS trg_products_public_delete ON public.products;

CREATE TRIGGER trg_products_public_insert
AFTER INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.sync_products_public_upsert();

CREATE TRIGGER trg_products_public_update
AFTER UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.sync_products_public_upsert();

CREATE TRIGGER trg_products_public_delete
AFTER DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.sync_products_public_delete();

-- 3) Backfill existing data
INSERT INTO public.products_public (
  id, unique_id, name, description, price, category, location, image_url, user_name, created_at, is_sold
)
SELECT
  id, unique_id, name, description, price, category, location, image_url, user_name, created_at, is_sold
FROM public.products
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
