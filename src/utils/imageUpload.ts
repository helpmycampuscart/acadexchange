
import { supabase } from '@/integrations/supabase/client';

// Allowed file types for security
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadImageToSupabase = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    console.log('Starting image upload...');
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'File size too large. Maximum size is 10MB.' };
    }

    // Use a simple timestamp-based filename instead of user-based
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

    console.log('Uploading file:', fileName);
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: `Upload failed: ${error.message}` };
    }

    console.log('Getting public URL...');
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    console.log('Upload successful:', publicUrl);
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Unexpected upload error:', error);
    return { success: false, error: 'Failed to upload image' };
  }
};
