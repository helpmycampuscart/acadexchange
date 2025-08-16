
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return "";
  let clean = phoneNumber.replace(/\\D/g, "");
  if (clean.startsWith("91") && clean.length === 12) return clean;
  if (clean.length === 10) return "91" + clean;
  if (clean.startsWith("0") && clean.length === 11) return "91" + clean.substring(1);
  return clean;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { productId, viewerId } = await req.json();

    if (!productId) {
      return new Response(JSON.stringify({ error: "Missing productId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load product
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (prodErr || !product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (product.is_sold) {
      return new Response(JSON.stringify({ error: "Product sold" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prevent returning own contact info (optional)
    if (viewerId && product.user_id === viewerId) {
      return new Response(JSON.stringify({ error: "Own product" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prefer product_contacts
    let whatsapp = "";
    let sellerId = product.user_id;
    let sellerEmail = product.user_email;

    const { data: contact, error: contactErr } = await supabase
      .from("product_contacts")
      .select("whatsapp_number, user_id, user_email")
      .eq("product_id", productId)
      .maybeSingle();

    if (!contactErr && contact?.whatsapp_number) {
      whatsapp = contact.whatsapp_number;
      sellerId = contact.user_id ?? sellerId;
      sellerEmail = contact.user_email ?? sellerEmail;
    } else if (product.whatsapp_number) {
      // Fallback to products table
      whatsapp = product.whatsapp_number;
    }

    whatsapp = formatPhoneNumber(whatsapp);

    if (!whatsapp) {
      return new Response(JSON.stringify({ error: "Contact unavailable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        contact: { whatsappNumber: whatsapp, sellerId, sellerEmail },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("[get-product-contact] unexpected error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
