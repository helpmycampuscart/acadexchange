-- Fix critical security issues for production readiness

-- 1. Fix users table INSERT policy to prevent role escalation
DROP POLICY IF EXISTS "Users can create their own profile during sync" ON public.users;
CREATE POLICY "Users can create their own profile during sync" 
ON public.users 
FOR INSERT 
WITH CHECK (
  id = (auth.uid())::text 
  AND role = 'user'  -- Force role to be 'user' for new accounts
);

-- 2. Change products to use UUIDs instead of predictable IDs
ALTER TABLE public.products ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.products ALTER COLUMN unique_id SET DEFAULT gen_random_uuid()::text;

-- 3. Add proper storage policies for secure file uploads
-- Delete overly permissive policies
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;

-- Create secure folder-based policies
CREATE POLICY "Users can upload to their own folder" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Add rate limiting trigger for contact access
CREATE OR REPLACE FUNCTION enforce_contact_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INT;
BEGIN
  -- Check how many times this user accessed contact info in last hour
  SELECT COUNT(*) INTO recent_count
  FROM contact_rate_limits 
  WHERE user_id = NEW.user_id 
    AND product_id = NEW.product_id
    AND last_accessed > NOW() - INTERVAL '1 hour';
  
  -- Allow max 5 contacts per hour per product
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before accessing more contact information.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER contact_rate_limit_trigger
  BEFORE INSERT ON contact_rate_limits
  FOR EACH ROW EXECUTE FUNCTION enforce_contact_rate_limit();

-- 5. Add security audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION audit_sensitive_operations()
RETURNS TRIGGER AS $$
BEGIN
  -- Log product deletions
  IF TG_OP = 'DELETE' THEN
    INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
    VALUES (
      (auth.uid())::text,
      'product_deleted',
      OLD.user_id,
      jsonb_build_object(
        'product_id', OLD.id,
        'product_name', OLD.name,
        'table', TG_TABLE_NAME,
        'timestamp', NOW()
      )
    );
    RETURN OLD;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to products table
DROP TRIGGER IF EXISTS audit_product_operations ON products;
CREATE TRIGGER audit_product_operations
  BEFORE DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operations();