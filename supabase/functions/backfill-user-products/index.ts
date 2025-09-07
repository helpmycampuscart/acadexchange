
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to format phone number
const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // If number starts with 91, assume it already has country code
  if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
    return cleanNumber;
  }
  
  // If number is 10 digits, add Indian country code
  if (cleanNumber.length === 10) {
    return '91' + cleanNumber;
  }
  
  // If number starts with 0, remove it and add country code
  if (cleanNumber.startsWith('0') && cleanNumber.length === 11) {
    return '91' + cleanNumber.substring(1);
  }
  
  // Return as is for other formats
  return cleanNumber;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[backfill-user-products] invoked");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, userEmail, userName } = await req.json();
    console.log("[backfill-user-products] payload:", { userId, userEmail, userName });

    if (!userId || !userEmail || !userName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, userEmail, userName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1) Find products likely belonging to this user
    //    - either already linked by user_id
    //    - or previously created with matching user_name/email
    const { data: products, error: findError } = await supabaseClient
      .from("products")
      .select("*")
      .or(
        [
          `user_id.eq.${userId}`,
          `user_email.eq.${userEmail}`,
          `user_name.eq.${userName}`
        ].join(",")
      );

    if (findError) {
      console.error("[backfill-user-products] findError:", findError);
      return new Response(
        JSON.stringify({ error: findError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!products || products.length === 0) {
      console.log("[backfill-user-products] No products to backfill");
      return new Response(
        JSON.stringify({ success: true, updated: 0, contactsUpserted: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[backfill-user-products] Found ${products.length} candidate products`);

    let updated = 0;
    let contactsUpserted = 0;

    for (const p of products) {
      // 2) Ensure product is attributed to the current user
      if (p.user_id !== userId || p.user_email !== userEmail || p.user_name !== userName) {
        const { error: updErr } = await supabaseClient
          .from("products")
          .update({
            user_id: userId,
            user_email: userEmail,
            user_name: userName,
          })
          .eq("id", p.id);

        if (updErr) {
          console.error("[backfill-user-products] update product failed", p.id, updErr);
        } else {
          updated += 1;
        }
      }

      // 3) Ensure contact info exists for the product
      let whatsapp = p.whatsapp_number || null;
      if (!whatsapp) {
        console.log(`[backfill-user-products] Product ${p.id} has no whatsapp_number, skipping contact upsert`);
        continue;
      }

      // Format the phone number properly
      whatsapp = formatPhoneNumber(whatsapp);

      const { error: contactErr } = await supabaseClient
        .from("product_contacts")
        .upsert(
          {
            product_id: p.id,
            user_id: userId,
            user_email: userEmail,
            whatsapp_number: whatsapp,
          },
          { onConflict: "product_id" }
        );

      if (contactErr) {
        console.error("[backfill-user-products] contact upsert failed", p.id, contactErr);
      } else {
        contactsUpserted += 1;
      }
    }

    console.log("[backfill-user-products] Completed", { updated, contactsUpserted });

    return new Response(
      JSON.stringify({ success: true, updated, contactsUpserted }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[backfill-user-products] Unexpected error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
