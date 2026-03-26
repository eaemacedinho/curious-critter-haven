import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAGARME_API_URL = "https://api.pagar.me/core/v5";

/** Calculate the next renewal date from `started_at` */
function getNextRenewalDate(startedAt: string): string {
  const started = new Date(startedAt);
  const now = new Date();
  const next = new Date(started);
  while (next <= now) {
    next.setMonth(next.getMonth() + 1);
  }
  return next.toISOString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAGARME_API_KEY = Deno.env.get("PAGARME_API_KEY");

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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("agency_id", profile.agency_id)
      .single();

    if (!sub || sub.plan === "free") {
      return new Response(
        JSON.stringify({ error: "No active subscription to cancel" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate when the current billing period ends
    const expiresAt = sub.started_at ? getNextRenewalDate(sub.started_at) : new Date().toISOString();

    // Try to cancel on Pagar.me if there's a payment_id and API key
    if (sub.payment_id && PAGARME_API_KEY) {
      try {
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
          console.warn("Pagar.me cancel warning (proceeding with local cancel):", JSON.stringify(errorData));
        }
      } catch (pagarmeErr) {
        console.warn("Pagar.me cancel request failed (proceeding with local cancel):", pagarmeErr);
      }
    }

    // Mark subscription as canceled but keep current plan until expires_at
    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "canceled",
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("agency_id", profile.agency_id);

    return new Response(
      JSON.stringify({ success: true, expires_at: expiresAt }),
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
