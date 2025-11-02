
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Create product function called');
    
    // Get JWT token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user is authenticated
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { product } = await req.json();
    console.log('Product data received:', product);

    // Validate required fields
    if (!product.name || !product.description || !product.price || !product.category || !product.location || !product.whatsappNumber) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Use authenticated user ID instead of client-provided one
    const userId = user.id;
    const userEmail = user.email ?? product.userEmail;
    const userName = user.user_metadata?.name ?? product.userName;

    console.log('Inserting product into products table...');
    
    // Insert into products table
    const { data: productData, error: productError } = await supabaseClient
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
        image_url: product.imageUrl || null,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        is_sold: false,
        purchased_date: product.purchasedDate || null
      })
      .select()
      .single();

    if (productError) {
      console.error('Error inserting product:', productError);
      return new Response(
        JSON.stringify({ error: productError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Product inserted successfully, now saving contact info...');

    // Insert into product_contacts table for secure contact handling
    const { error: contactError } = await supabaseClient
      .from('product_contacts')
      .upsert({
        product_id: product.id,
        user_id: userId,
        user_email: userEmail,
        whatsapp_number: product.whatsappNumber
      }, {
        onConflict: 'product_id'
      });

    if (contactError) {
      console.error('Error saving contact info:', contactError);
      // Don't fail the entire operation, but log the error
      console.log('Contact info save failed, but product creation succeeded');
    } else {
      console.log('Contact info saved successfully');
    }

    console.log('Product creation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: productData,
        message: 'Product created successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
