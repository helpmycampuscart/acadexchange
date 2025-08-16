
import { supabase } from '@/integrations/supabase/client';
import { Product, User } from '@/types';

export const generateProductId = (): string => {
  return Date.now().toString();
};

// Use Edge Function for secure product creation
export const saveProductToSupabase = async (product: Product): Promise<void> => {
  try {
    console.log('Validating product data...');
    
    // Validate required fields
    if (!product.name || !product.description || !product.price || !product.category || !product.location || !product.whatsappNumber) {
      throw new Error('Missing required fields');
    }

    if (product.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    console.log('Inserting product via Edge Function...');
    
    // Call the Edge Function instead of direct database insert
    const { data, error } = await supabase.functions.invoke('create-product', {
      body: { product }
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(error.message || 'Failed to create product');
    }

    if (!data || !data.data) {
      throw new Error('Invalid response from server');
    }

    console.log('Product created successfully via Edge Function');

    // Also save to product_contacts for secure contact info
    await saveProductContactInfo(product);
    
  } catch (error) {
    console.error('Database error saving product:', error);
    
    // Security event logging
    console.log('Security Event: database_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      productId: product.id,
      userId: product.userId
    });
    
    throw error;
  }
};

export const saveProductContactInfo = async (product: Product): Promise<void> => {
  try {
    const { error } = await supabase
      .from('product_contacts')
      .upsert({
        product_id: product.id,
        user_id: product.userId,
        user_email: product.userEmail,
        whatsapp_number: product.whatsappNumber
      });

    if (error) {
      console.error('Error saving product contact info:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in saveProductContactInfo:', error);
    throw error;
  }
};

export const getProductsFromSupabase = async (): Promise<Product[]> => {
  try {
    console.log('Fetching products from Supabase...');
    
    const { data, error } = await supabase
      .from('products_public')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    if (!data) {
      console.log('No products found in database');
      return [];
    }

    // Map the data to our Product interface
    const products: Product[] = data.map(item => ({
      id: item.id,
      uniqueId: item.unique_id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      location: item.location,
      whatsappNumber: '', // Not exposed in public view for security
      imageUrl: item.image_url || '',
      userId: '', // Not exposed in public view
      userEmail: '', // Not exposed in public view
      userName: item.user_name,
      createdAt: item.created_at,
      isSold: item.is_sold
    }));

    console.log(`Fetched ${products.length} products from Supabase`);
    return products;
    
  } catch (error) {
    console.error('Error in getProductsFromSupabase:', error);
    throw error;
  }
};

export const updateProductInSupabase = async (id: string, updates: Partial<Product>) => {
  try {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateProductInSupabase:', error);
    return { success: false, error: 'Failed to update product' };
  }
};

export const deleteProductFromSupabase = async (id: string, userId?: string) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteProductFromSupabase:', error);
    return { success: false, error: 'Failed to delete product' };
  }
};

export const getUsersFromClerk = async (): Promise<User[]> => {
  try {
    console.log('Fetching users from Supabase...');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    if (!data) {
      console.log('No users found in database');
      return [];
    }

    // Map the data to our User interface
    const users: User[] = data.map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      role: item.role as 'user' | 'admin',
      createdAt: item.created_at
    }));

    console.log(`Fetched ${users.length} users from Supabase`);
    return users;
    
  } catch (error) {
    console.error('Error in getUsersFromClerk:', error);
    throw error;
  }
};
