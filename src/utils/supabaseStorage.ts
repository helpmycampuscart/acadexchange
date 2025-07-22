import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

// Product operations with Supabase
export const saveProductToSupabase = async (product: Product): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('products')
      .insert({
        id: product.id,
        unique_id: product.uniqueId,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        location: product.location,
        whatsapp_number: product.whatsappNumber,
        image_url: product.imageUrl,
        user_id: product.userId,
        user_email: product.userEmail,
        user_name: product.userName,
        is_sold: product.isSold,
      });

    if (error) {
      console.error('Error saving product:', error);
      return { success: false, error: error.message };
    }

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
    
    if (updates.name) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price) updateData.price = updates.price;
    if (updates.category) updateData.category = updates.category;
    if (updates.location) updateData.location = updates.location;
    if (updates.whatsappNumber) updateData.whatsapp_number = updates.whatsappNumber;
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