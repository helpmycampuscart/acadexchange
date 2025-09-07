
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
    console.log("[toggle-product-sold] Request:", { productId, userId });

    if (!productId || !userId) {
      console.error("[toggle-product-sold] Missing data:", { productId, userId });
      return new Response(JSON.stringify({ error: "Missing productId or userId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current product status
    const { data: product, error: findErr } = await supabase
      .from("products")
      .select("is_sold, user_id")
      .eq("id", productId)
      .single();

    if (findErr) {
      console.error("[toggle-product-sold] Find error:", findErr);
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
      console.error("[toggle-product-sold] Auth error:", { productUserId: product.user_id, userId });
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newStatus = !product.is_sold;
    console.log("[toggle-product-sold] Toggling status:", { from: product.is_sold, to: newStatus });

    // Update main products table
    const { error: updateErr } = await supabase
      .from("products")
      .update({ is_sold: newStatus })
      .eq("id", productId);

    if (updateErr) {
      console.error("[toggle-product-sold] Update error:", updateErr);
      return new Response(JSON.stringify({ error: updateErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Also update products_public for consistency
    const { error: pubErr } = await supabase
      .from("products_public")
      .update({ is_sold: newStatus })
      .eq("id", productId);

    if (pubErr) {
      console.warn("[toggle-product-sold] Public update warning:", pubErr.message);
    }

    console.log("[toggle-product-sold] Success:", { productId, newStatus });
    
    return new Response(JSON.stringify({ success: true, isSold: newStatus }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[toggle-product-sold] Unexpected error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
