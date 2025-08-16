
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { productId, userId } = await req.json();
    console.log("[delete-product] Request:", { productId, userId });

    if (!productId || !userId) {
      console.error("[delete-product] Missing data:", { productId, userId });
      return new Response(JSON.stringify({ error: "Missing productId or userId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify product exists and user owns it
    const { data: product, error: findErr } = await supabase
      .from("products")
      .select("user_id, name")
      .eq("id", productId)
      .single();

    if (findErr) {
      console.error("[delete-product] Find error:", findErr);
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check authorization
    if (product.user_id !== userId) {
      console.error("[delete-product] Auth error:", { productUserId: product.user_id, userId });
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[delete-product] Deleting product:", { productId, name: product.name });

    // Delete contact info first (if exists)
    const { error: contactErr } = await supabase
      .from("product_contacts")
      .delete()
      .eq("product_id", productId);

    if (contactErr) {
      console.warn("[delete-product] Contact delete warning:", contactErr.message);
    }

    // Delete from products_public
    const { error: pubErr } = await supabase
      .from("products_public")
      .delete()
      .eq("id", productId);

    if (pubErr) {
      console.warn("[delete-product] Public delete warning:", pubErr.message);
    }

    // Delete main product
    const { error: delErr } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (delErr) {
      console.error("[delete-product] Delete error:", delErr);
      return new Response(JSON.stringify({ error: delErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[delete-product] Success:", { productId });
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[delete-product] Unexpected error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
