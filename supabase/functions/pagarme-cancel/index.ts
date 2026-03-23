import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAGARME_API_URL = "https://api.pagar.me/core/v5";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAGARME_API_KEY = Deno.env.get("PAGARME_API_KEY");
    if (!PAGARME_API_KEY) {
      throw new Error("PAGARME_API_KEY is not configured");
    }

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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.user.id;

    // Get user's agency
    const { data: profile } = await supabase
      .from("profiles")
      .select("agency_id")
      .eq("id", userId)
      .single();

    if (!profile?.agency_id) {
      return new Response(JSON.stringify({ error: "No agency found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get subscription
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("agency_id", profile.agency_id)
      .single();

    if (!sub?.payment_id) {
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cancel on Pagar.me
    const pagarmeAuth = btoa(PAGARME_API_KEY + ":");
    const cancelResponse = await fetch(
      `${PAGARME_API_URL}/subscriptions/${sub.payment_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${pagarmeAuth}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!cancelResponse.ok) {
      const errorData = await cancelResponse.json();
      console.error("Pagar.me cancel error:", JSON.stringify(errorData));
      return new Response(
        JSON.stringify({ error: "Failed to cancel subscription", details: errorData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update local DB
    await supabaseAdmin
      .from("subscriptions")
      .update({
        plan: "free",
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("agency_id", profile.agency_id);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Cancel error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
