
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return "";
  
  // Remove all non-digit characters
  let clean = phoneNumber.replace(/\D/g, "");
  console.log("[get-product-contact] Cleaned number:", clean);
  
  // If it already has country code (starts with 91 and is 12 digits)
  if (clean.startsWith("91") && clean.length === 12) {
    return clean;
  }
  
  // If it's a 10-digit number, add 91
  if (clean.length === 10) {
    return "91" + clean;
  }
  
  // If it starts with 0 and is 11 digits, replace 0 with 91
  if (clean.startsWith("0") && clean.length === 11) {
    return "91" + clean.substring(1);
  }
  
  // Return as is if we can't format it properly
  return clean;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Best-effort auth using Supabase JWT if present; fallback to viewerId from body
    const authHeader = req.headers.get("Authorization");
    let viewerId: string | null = null;

    if (authHeader) {
      const supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
      if (user) {
        viewerId = user.id;
      } else {
        console.warn("[get-product-contact] JWT auth failed:", authError?.message);
      }
    }

    // Service role client for DB operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse body and allow viewerId fallback when unauthenticated
    const { productId, viewerId: viewerIdFromBody } = await req.json();
    if (!viewerId && viewerIdFromBody) viewerId = viewerIdFromBody;
    console.log("[get-product-contact] Request:", { productId, viewerId });

    if (!productId) {
      return new Response(JSON.stringify({ error: "Missing productId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get product details
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (prodErr || !product) {
      console.error("[get-product-contact] Product error:", prodErr);
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

    // Don't return own contact info if we can determine viewer
    if (viewerId && product.user_id === viewerId) {
      return new Response(JSON.stringify({ error: "Own product" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let whatsapp = "";
    let sellerId = product.user_id;
    let sellerEmail = product.user_email;

    // Try to get contact from product_contacts table first
    const { data: contact } = await supabase
      .from("product_contacts")
      .select("whatsapp_number, user_id, user_email")
      .eq("product_id", productId)
      .maybeSingle();

    if (contact?.whatsapp_number) {
      console.log("[get-product-contact] Using contact table:", contact.whatsapp_number);
      whatsapp = contact.whatsapp_number;
      sellerId = contact.user_id ?? sellerId;
      sellerEmail = contact.user_email ?? sellerEmail;
    } else if (product.whatsapp_number) {
      console.log("[get-product-contact] Using product table:", product.whatsapp_number);
      whatsapp = product.whatsapp_number;
    }

    // Format the phone number
    whatsapp = formatPhoneNumber(whatsapp);
    console.log("[get-product-contact] Formatted number:", whatsapp);

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
    console.error("[get-product-contact] Unexpected error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
