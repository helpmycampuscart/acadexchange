
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

// Generate unique product ID
export const generateProductId = (): string => {
  const prefix = 'MCC';
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

// Input validation functions
const validateProduct = (product: Product): { valid: boolean; error?: string } => {
  if (!product.name || product.name.trim().length < 2) {
    return { valid: false, error: 'Product name must be at least 2 characters long' };
  }
  
  if (product.price <= 0 || product.price > 1000000) {
    return { valid: false, error: 'Price must be between ₹1 and ₹10,00,000' };
  }
  
  if (!product.category || product.category.trim().length === 0) {
    return { valid: false, error: 'Category is required' };
  }
  
  if (!product.location || product.location.trim().length === 0) {
    return { valid: false, error: 'Location is required' };
  }
  
  // Validate WhatsApp number format (basic validation)
  const whatsappRegex = /^[+]?[1-9]\d{1,14}$/;
  if (!product.whatsappNumber || !whatsappRegex.test(product.whatsappNumber.replace(/\s/g, ''))) {
    return { valid: false, error: 'Please enter a valid WhatsApp number' };
  }
  
  return { valid: true };
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// Product operations with Supabase
export const saveProductToSupabase = async (product: Product): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Validating product data...');
    // Validate product data
    const validation = validateProduct(product);
    if (!validation.valid) {
      console.error('Validation failed:', validation.error);
      return { success: false, error: validation.error };
    }

    // Sanitize string inputs
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
      return { success: false, error: `Database error: ${error.message}` };
    }

    console.log('Product saved successfully');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error saving product:', error);
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
    return [];
  }
};

export const updateProductInSupabase = async (productId: string, updates: Partial<Product>): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: any = {};
    
    if (updates.name) {
      updateData.name = sanitizeInput(updates.name);
      if (updateData.name.length < 2) {
        return { success: false, error: 'Product name must be at least 2 characters long' };
      }
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description ? sanitizeInput(updates.description) : '';
    }
    if (updates.price) {
      if (updates.price <= 0 || updates.price > 1000000) {
        return { success: false, error: 'Price must be between ₹1 and ₹10,00,000' };
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
      const whatsappRegex = /^[+]?[1-9]\d{1,14}$/;
      if (!whatsappRegex.test(updates.whatsappNumber.replace(/\s/g, ''))) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating product:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

export const deleteProductFromSupabase = async (productId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting product:', error);
    return { success: false, error: 'Unexpected error occurred' };
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
    return [];
  }
};
