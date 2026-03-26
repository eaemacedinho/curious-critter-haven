import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { agency_id, discount_percent } = body;

    // REQUIRE explicit agency_id from client
    if (!agency_id || typeof agency_id !== "string") {
      return new Response(JSON.stringify({ error: "agency_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate membership for THIS specific agency_id - owner/admin only
    const { data: membership } = await supabaseAdmin
      .from("agency_memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("agency_id", agency_id)
      .eq("status", "active")
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions - owner or admin required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const discountPercent = Number(discount_percent);
    if (!discountPercent || discountPercent < 1 || discountPercent > 50) {
      return new Response(JSON.stringify({ error: "Invalid discount (1-50)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sub } = await supabaseAdmin
      .from("subscriptions").select("*").eq("agency_id", agency_id).single();

    if (!sub || sub.status !== "active" || sub.plan === "free") {
      return new Response(JSON.stringify({ error: "No active paid subscription" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const existingMeta = (sub as any).metadata || {};
    if (existingMeta.discount_applied) {
      return new Response(
        JSON.stringify({ error: "Desconto já foi aplicado anteriormente." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const PAGARME_API_KEY = Deno.env.get("PAGARME_API_KEY");
    if (sub.payment_id && PAGARME_API_KEY) {
      try {
        const pagarmeAuth = btoa(PAGARME_API_KEY + ":");
        const planPrices: Record<string, number> = { pro: 1790, scale: 8790 };
        const currentPrice = planPrices[sub.plan] || 1790;
        const discountedPrice = Math.round(currentPrice * (1 - discountPercent / 100));

        await fetch(`https://api.pagar.me/core/v5/subscriptions/${sub.payment_id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Basic ${pagarmeAuth}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            items: [{
              description: `Plano ${sub.plan === "scale" ? "Scale" : "Pro"} - in1.bio (com desconto ${discountPercent}%)`,
              quantity: 1,
              pricing_scheme: { scheme_type: "unit", price: discountedPrice },
            }],
            metadata: {
              discount_first_month_only: "true",
              full_price: currentPrice,
              plan_key: sub.plan,
            },
          }),
        });
      } catch (e) {
        console.warn("Pagar.me discount error:", e);
      }
    }

    await supabaseAdmin.from("audit_logs").insert({
      event_type: "subscription.discount_applied",
      actor_id: user.id,
      agency_id,
      target_table: "subscriptions",
      metadata: { discount_percent: discountPercent, plan: sub.plan },
    });

    return new Response(
      JSON.stringify({ success: true, discount_percent: discountPercent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Apply discount error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
