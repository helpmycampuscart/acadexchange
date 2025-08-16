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

// Enhanced product operations with security - now using secure contact table
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
    // Step 1: Insert product data (without sensitive contact info)
    const { error: productError } = await supabase
      .from('products')
      .insert({
        id: sanitizedProduct.id,
        unique_id: sanitizedProduct.uniqueId,
        name: sanitizedProduct.name,
        description: sanitizedProduct.description,
        price: sanitizedProduct.price,
        category: sanitizedProduct.category,
        location: sanitizedProduct.location,
        whatsapp_number: sanitizedProduct.whatsappNumber, // Keep for backward compatibility
        image_url: sanitizedProduct.imageUrl,
        user_id: sanitizedProduct.userId,
        user_email: sanitizedProduct.userEmail, // Keep for backward compatibility
        user_name: sanitizedProduct.userName,
        is_sold: sanitizedProduct.isSold,
      });

    if (productError) {
      console.error('Database error saving product:', productError);
      await logSecurityEvent('database_error', { userId: product.userId, error: productError.message });
      return { success: false, error: `Database error: ${productError.message}` };
    }

    // Step 2: Insert contact information into secure table
    const { error: contactError } = await supabase
      .from('product_contacts')
      .insert({
        product_id: sanitizedProduct.id,
        user_id: sanitizedProduct.userId,
        user_email: sanitizedProduct.userEmail,
        whatsapp_number: sanitizedProduct.whatsappNumber
      });

    if (contactError) {
      // If contact insert fails, we should clean up the product record
      await supabase.from('products').delete().eq('id', sanitizedProduct.id);
      console.error('Database error saving contact info:', contactError);
      await logSecurityEvent('database_error', { userId: product.userId, error: contactError.message });
      return { success: false, error: `Failed to save contact information: ${contactError.message}` };
    }

    console.log('Product and contact info saved successfully');
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
    console.log('Fetching products from Supabase...');
    
    // Use the public view for basic product browsing - excludes sensitive data
    const { data, error } = await supabase
      .from('products_public')
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
      whatsappNumber: '', // Not available in public view for security
      imageUrl: item.image_url,
      userId: '', // Not available in public view for security
      userEmail: '', // Not available in public view for security
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
    
    // Handle WhatsApp number updates in the secure contact table
    let contactUpdateData: any = {};
    if (updates.whatsappNumber) {
      const whatsappRegex = /^[+]?[1-9]\d{7,14}$/;
      if (!whatsappRegex.test(updates.whatsappNumber.replace(/[\s-]/g, ''))) {
        return { success: false, error: 'Please enter a valid WhatsApp number' };
      }
      updateData.whatsapp_number = updates.whatsappNumber; // Keep for backward compatibility
      contactUpdateData.whatsapp_number = updates.whatsappNumber;
    }
    
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.isSold !== undefined) updateData.is_sold = updates.isSold;

    // Update product data
    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId);

    if (error) {
      console.error('Error updating product:', error);
      await logSecurityEvent('update_error', { productId, error: error.message });
      return { success: false, error: error.message };
    }

    // Update contact information if needed
    if (Object.keys(contactUpdateData).length > 0) {
      const { error: contactError } = await supabase
        .from('product_contacts')
        .update(contactUpdateData)
        .eq('product_id', productId);

      if (contactError) {
        console.error('Error updating contact info:', contactError);
        await logSecurityEvent('contact_update_error', { productId, error: contactError.message });
        // Don't fail the entire update if contact update fails
      }
    }

    await logSecurityEvent('product_updated', { productId, updates: Object.keys(updateData) });
    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating product:', error);
    await logSecurityEvent('unexpected_error', { productId, error: String(error) });
    return { success: false, error: 'Unexpected error occurred' };
  }
};

// Enhanced deletion function with better debugging
export const deleteProductFromSupabase = async (productId: string, userId?: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('=== DELETION DEBUG START ===');
    console.log('Attempting to delete product:', { productId, userId });
    
    if (!productId) {
      console.log('ERROR: No product ID provided');
      return { success: false, error: 'Product ID is required' };
    }

    if (!userId) {
      console.log('ERROR: No user ID provided');
      return { success: false, error: 'User ID is required for deletion' };
    }
    
    // Rate limiting check
    if (!checkRateLimit(`product-delete-${productId}`, 3, 60000)) {
      await logSecurityEvent('rate_limit_exceeded', { productId, action: 'delete_product' });
      return { success: false, error: 'Too many delete requests. Please wait before trying again.' };
    }

    // First, let's check if the product exists and get its details
    console.log('Checking if product exists...');
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.log('ERROR: Failed to fetch product for verification:', fetchError);
      return { success: false, error: `Product not found: ${fetchError.message}` };
    }

    if (!existingProduct) {
      console.log('ERROR: Product not found in database');
      return { success: false, error: 'Product not found' };
    }

    console.log('Product found:', {
      id: existingProduct.id,
      name: existingProduct.name,
      owner: existingProduct.user_id,
      requestingUser: userId
    });

    // Verify ownership
    if (existingProduct.user_id !== userId) {
      console.log('ERROR: User does not own this product');
      await logSecurityEvent('unauthorized_delete_attempt', { productId, userId, actualOwner: existingProduct.user_id });
      return { success: false, error: 'You can only delete your own products' };
    }

    console.log('Ownership verified. Proceeding with deletion...');

    // Step 1: Delete contact information first
    const { error: contactDeleteError } = await supabase
      .from('product_contacts')
      .delete()
      .eq('product_id', productId)
      .eq('user_id', userId);

    if (contactDeleteError) {
      console.log('Warning: Failed to delete contact info:', contactDeleteError);
      // Continue with product deletion even if contact deletion fails
    }

    // Step 2: Delete product with detailed logging
    const { data: deletedRows, error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('user_id', userId)
      .select();

    console.log('Deletion attempt result:', {
      deletedRows,
      deleteError,
      deletedCount: deletedRows?.length || 0
    });

    if (deleteError) {
      console.log('ERROR: Database deletion failed:', deleteError);
      await logSecurityEvent('delete_error', { productId, error: deleteError.message });
      return { success: false, error: `Failed to delete product: ${deleteError.message}` };
    }

    if (!deletedRows || deletedRows.length === 0) {
      console.log('ERROR: No rows were deleted');
      return { success: false, error: 'Product could not be deleted. It may have already been removed.' };
    }

    console.log('✅ Product and contact info deleted successfully');
    await logSecurityEvent('product_deleted', { productId, userId });
    console.log('=== DELETION DEBUG END ===');
    return { success: true };
    
  } catch (error) {
    console.log('ERROR: Unexpected error during deletion:', error);
    await logSecurityEvent('unexpected_error', { productId, error: String(error) });
    return { success: false, error: 'An unexpected error occurred while deleting the product' };
  }
};

// Update getUsersFromSupabase to use Clerk users instead
export const getUsersFromClerk = async () => {
  try {
    // This will now fetch all users who have products (Clerk users who are active)
    const { data: productUsers, error } = await supabase
      .from('products')
      .select('user_id, user_email, user_name, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active users:', error);
      await logSecurityEvent('users_fetch_error', { error: error.message });
      return [];
    }

    // Group by user_id to get unique users
    const uniqueUsers = (productUsers || []).reduce((acc: any[], current) => {
      const existingUser = acc.find(user => user.id === current.user_id);
      if (!existingUser) {
        acc.push({
          id: current.user_id,
          email: current.user_email,
          name: current.user_name,
          role: 'user', // Default role for Clerk users
          createdAt: current.created_at,
          isClerkUser: true
        });
      }
      return acc;
    }, []);

    return uniqueUsers;
  } catch (error) {
    console.error('Error fetching Clerk users:', error);
    await logSecurityEvent('users_fetch_error', { error: String(error) });
    return [];
  }
};

// Keep the original function for backward compatibility
export const getUsersFromSupabase = getUsersFromClerk;
