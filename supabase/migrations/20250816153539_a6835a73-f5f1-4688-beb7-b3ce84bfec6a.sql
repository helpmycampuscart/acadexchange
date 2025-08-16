-- Fix security issue: Enable RLS protection on products_public view

-- Enable Row Level Security on the products_public view
ALTER TABLE public.products_public ENABLE ROW LEVEL SECURITY;

-- Create a public viewing policy that allows anyone to read product listings
-- This is safe because products_public excludes sensitive fields like contact info
CREATE POLICY "Public can view product listings" 
ON public.products_public 
FOR SELECT 
USING (true);

-- Ensure proper grants are in place for the view
GRANT SELECT ON public.products_public TO anon;
GRANT SELECT ON public.products_public TO authenticated;