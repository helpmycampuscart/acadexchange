
-- 1) Create a public bucket for product images (id: product-images)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2) Allow public read of files in the product-images bucket
create policy "Public read access to product-images"
on storage.objects for select
using (bucket_id = 'product-images');

-- 3) Allow uploads to product-images from both anon and authenticated roles
--    (This lets the web app upload images directly)
create policy "Upload to product-images for anyone"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'product-images');
