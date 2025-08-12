
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { sanitizeInput, validateProductInput, logSecurityEvent, checkRateLimit } from './securityUtils';

// Generate unique product ID
export const generateProductId = (): string => {
  const prefix = 'MCC';
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

// Enhanced product operations with security
export const saveProductToSupabase = async (product: Product): Promise<{ success: boolean; error?: string }> => {
  try {
    // Rate limiting check
    if (!checkRateLimit(`product-create-${product.userId}`, 5, 300000)) { // 5 products per 5 minutes
      await logSecurityEvent('rate_limit_exceeded', { userId: product.userId, action: 'create_product' });
      return { success: false, error: 'Too many products created recently. Please wait before creating another.' };
    }

    console.log('Validating product data...');
    // Enhanced validation
    const validation = validateProductInput(product);
    if (!validation.valid) {
      console.error('Validation failed:', validation.error);
      await logSecurityEvent('validation_failed', { userId: product.userId, error: validation.error });
      return { success: false, error: validation.error };
    }

    // Enhanced sanitization
    const sanitizedProduct = {
      ...product,
      name: sanitizeInput(product.name),
      description: product.description ? sanitizeInput(product.description) : '',
      category: sanitizeInput(product.category),
      location: sanitizeInput(product.location),
      userEmail: sanitizeInput(product.userEmail),
      userName: sanitizeInput(product.userName)
    };

    console.log('Inserting product into database...');
    const { error } = await supabase
      .from('products')
      .insert({
        id: sanitizedProduct.id,
        unique_id: sanitizedProduct.uniqueId,
        name: sanitizedProduct.name,
        description: sanitizedProduct.description,
        price: sanitizedProduct.price,
        category: sanitizedProduct.category,
        location: sanitizedProduct.location,
        whatsapp_number: sanitizedProduct.whatsappNumber,
        image_url: sanitizedProduct.imageUrl,
        user_id: sanitizedProduct.userId,
        user_email: sanitizedProduct.userEmail,
        user_name: sanitizedProduct.userName,
        is_sold: sanitizedProduct.isSold,
      });

    if (error) {
      console.error('Database error saving product:', error);
      await logSecurityEvent('database_error', { userId: product.userId, error: error.message });
      return { success: false, error: `Database error: ${error.message}` };
    }

    console.log('Product saved successfully');
    await logSecurityEvent('product_created', { userId: product.userId, productId: product.id });
    return { success: true };
  } catch (error) {
    console.error('Unexpected error saving product:', error);
    await logSecurityEvent('unexpected_error', { userId: product.userId, error: String(error) });
    return { success: false, error: 'Unexpected error occurred' };
  }
};

export const getProductsFromSupabase = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      await logSecurityEvent('fetch_error', { error: error.message });
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      uniqueId: item.unique_id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      location: item.location,
      whatsappNumber: item.whatsapp_number,
      imageUrl: item.image_url,
      userId: item.user_id,
      userEmail: item.user_email,
      userName: item.user_name,
      createdAt: item.created_at,
      isSold: item.is_sold,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    await logSecurityEvent('fetch_error', { error: String(error) });
    return [];
  }
};

export const updateProductInSupabase = async (productId: string, updates: Partial<Product>): Promise<{ success: boolean; error?: string }> => {
  try {
    // Rate limiting check
    if (!checkRateLimit(`product-update-${productId}`, 10, 60000)) { // 10 updates per minute
      await logSecurityEvent('rate_limit_exceeded', { productId, action: 'update_product' });
      return { success: false, error: 'Too many update requests. Please wait before trying again.' };
    }

    const updateData: any = {};
    
    if (updates.name) {
      const sanitized = sanitizeInput(updates.name);
      if (sanitized.length < 2 || sanitized.length > 100) {
        return { success: false, error: 'Product name must be between 2 and 100 characters long' };
      }
      updateData.name = sanitized;
    }
    
    if (updates.description !== undefined) {
      const sanitized = updates.description ? sanitizeInput(updates.description) : '';
      if (sanitized.length > 1000) {
        return { success: false, error: 'Description must be less than 1000 characters' };
      }
      updateData.description = sanitized;
    }
    
    if (updates.price) {
      if (updates.price <= 0 || updates.price > 10000000) {
        return { success: false, error: 'Price must be between ₹1 and ₹1,00,00,000' };
      }
      updateData.price = updates.price;
    }
    
    if (updates.category) {
      updateData.category = sanitizeInput(updates.category);
    }
    
    if (updates.location) {
      updateData.location = sanitizeInput(updates.location);
    }
    
    if (updates.whatsappNumber) {
      const whatsappRegex = /^[+]?[1-9]\d{7,14}$/;
      if (!whatsappRegex.test(updates.whatsappNumber.replace(/[\s-]/g, ''))) {
        return { success: false, error: 'Please enter a valid WhatsApp number' };
      }
      updateData.whatsapp_number = updates.whatsappNumber;
    }
    
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.isSold !== undefined) updateData.is_sold = updates.isSold;

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId);

    if (error) {
      console.error('Error updating product:', error);
      await logSecurityEvent('update_error', { productId, error: error.message });
      return { success: false, error: error.message };
    }

    await logSecurityEvent('product_updated', { productId, updates: Object.keys(updateData) });
    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating product:', error);
    await logSecurityEvent('unexpected_error', { productId, error: String(error) });
    return { success: false, error: 'Unexpected error occurred' };
  }
};

export const deleteProductFromSupabase = async (productId: string, userId?: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Starting product deletion:', { productId, userId });
    
    // Rate limiting check
    if (!checkRateLimit(`product-delete-${productId}`, 3, 60000)) { // 3 deletions per minute
      await logSecurityEvent('rate_limit_exceeded', { productId, action: 'delete_product' });
      return { success: false, error: 'Too many delete requests. Please wait before trying again.' };
    }

    // First, verify the product exists and get its details
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.error('Error fetching product for deletion:', fetchError);
      return { success: false, error: 'Product not found or access denied' };
    }

    if (!existingProduct) {
      return { success: false, error: 'Product not found' };
    }

    console.log('Product found for deletion:', existingProduct);

    // Check ownership if userId is provided
    if (userId && existingProduct.user_id !== userId) {
      await logSecurityEvent('unauthorized_delete_attempt', { productId, userId, actualOwner: existingProduct.user_id });
      return { success: false, error: 'You can only delete your own products' };
    }

    // Perform the deletion
    const { error: deleteError, count } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('user_id', existingProduct.user_id); // Extra security check

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      await logSecurityEvent('delete_error', { productId, error: deleteError.message });
      return { success: false, error: `Failed to delete product: ${deleteError.message}` };
    }

    console.log('Product deletion result:', { count });

    if (count === 0) {
      return { success: false, error: 'Product not found or already deleted' };
    }

    await logSecurityEvent('product_deleted', { productId, userId: existingProduct.user_id });
    console.log('Product deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting product:', error);
    await logSecurityEvent('unexpected_error', { productId, error: String(error) });
    return { success: false, error: 'Unexpected error occurred while deleting product' };
  }
};

export const getUsersFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      await logSecurityEvent('users_fetch_error', { error: error.message });
      return [];
    }

    return (data || []).map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'user' | 'admin',
      createdAt: user.created_at,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    await logSecurityEvent('users_fetch_error', { error: String(error) });
    return [];
  }
};
