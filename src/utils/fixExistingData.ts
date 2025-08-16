
import { supabase } from '@/integrations/supabase/client';

export const fixExistingUserData = async (userId: string, userEmail: string, userName: string) => {
  try {
    console.log('Fixing existing data for user:', { userId, userEmail, userName });
    
    // First, find products in the public table that belong to this user
    const { data: publicProducts, error: publicError } = await supabase
      .from('products_public')
      .select('*')
      .eq('user_name', userName);

    if (publicError) {
      console.error('Error fetching public products:', publicError);
      return { success: false, error: publicError.message };
    }

    if (!publicProducts?.length) {
      console.log('No products found to fix');
      return { success: true };
    }

    console.log(`Found ${publicProducts.length} products to fix`);

    // Update each product in the private products table
    for (const product of publicProducts) {
      // Update the products table with correct user_id
      const { error: updateError } = await supabase
        .from('products')
        .update({
          user_id: userId,
          user_email: userEmail,
          user_name: userName
        })
        .eq('id', product.id);

      if (updateError) {
        console.error('Error updating product:', product.id, updateError);
        continue;
      }

      // Create contact info if it doesn't exist
      const { error: contactError } = await supabase
        .from('product_contacts')
        .upsert({
          product_id: product.id,
          user_id: userId,
          user_email: userEmail,
          whatsapp_number: '+91 8639081837' // You might want to get this from user profile
        }, {
          onConflict: 'product_id'
        });

      if (contactError) {
        console.error('Error creating contact info:', product.id, contactError);
      }
    }

    console.log('Data fix completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error fixing existing data:', error);
    return { success: false, error: 'Failed to fix existing data' };
  }
};
