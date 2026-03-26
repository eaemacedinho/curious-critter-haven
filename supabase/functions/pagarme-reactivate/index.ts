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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("agency_id")
      .eq("id", user.id)
      .single();

    if (!profile?.agency_id) {
      return new Response(JSON.stringify({ error: "No agency found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("agency_id", profile.agency_id)
      .single();

    if (!sub) {
      return new Response(JSON.stringify({ error: "No subscription found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (sub.status !== "canceled") {
      return new Response(JSON.stringify({ error: "Subscription is not canceled" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if still within the active period
    if (sub.expires_at && new Date(sub.expires_at) <= new Date()) {
      return new Response(
        JSON.stringify({ error: "O período ativo já expirou. Faça uma nova assinatura." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reactivate: set status back to active, clear expires_at
    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "active",
        expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("agency_id", profile.agency_id);

    // Try to reactivate on Pagar.me if there's a payment_id
    const PAGARME_API_KEY = Deno.env.get("PAGARME_API_KEY");
    if (sub.payment_id && PAGARME_API_KEY) {
      try {
        const pagarmeAuth = btoa(PAGARME_API_KEY + ":");
        // Pagar.me doesn't have a direct reactivate, so we just log it
        console.log("Subscription reactivated locally. Pagar.me subscription:", sub.payment_id);
      } catch (e) {
        console.warn("Pagar.me reactivation note:", e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, plan: sub.plan }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Reactivate error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
