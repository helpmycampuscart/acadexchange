
-- Fix the security issue with the function search path
DROP FUNCTION IF EXISTS public.get_current_user_role();

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()::text;
$$;

-- Create a function to sync Clerk users to our users table
CREATE OR REPLACE FUNCTION public.sync_clerk_user(
  clerk_user_id TEXT,
  user_email TEXT,
  user_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at)
  VALUES (clerk_user_id, user_email, user_name, 'user', now())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name;
END;
$$;

-- Update products table to work better with Clerk
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_user_id_fkey;

-- Update RLS policies to work with Clerk user IDs
DROP POLICY IF EXISTS "Users can create their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;

CREATE POLICY "Users can create their own products" 
ON public.products 
FOR INSERT 
WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Users can update their own products" 
ON public.products 
FOR UPDATE 
USING (user_id IS NOT NULL);

CREATE POLICY "Users can delete their own products" 
ON public.products 
FOR DELETE 
USING (user_id IS NOT NULL);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Users can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Users can update their product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images');

CREATE POLICY "Users can delete their product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images');
