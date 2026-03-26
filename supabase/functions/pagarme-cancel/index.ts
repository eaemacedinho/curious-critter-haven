import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAGARME_API_URL = "https://api.pagar.me/core/v5";

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

    // Use agency_memberships as source of truth
    const { data: membership } = await supabaseAdmin
      .from("agency_memberships")
      .select("agency_id, role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!membership?.agency_id) {
      return new Response(JSON.stringify({ error: "No agency found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only owner/admin can cancel
    if (!["owner", "admin"].includes(membership.role)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sub } = await supabaseAdmin
      .from("subscriptions").select("*").eq("agency_id", membership.agency_id).single();

    if (!sub || sub.plan === "free") {
      return new Response(JSON.stringify({ error: "No active subscription to cancel" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expiresAt = sub.started_at ? getNextRenewalDate(sub.started_at) : new Date().toISOString();

    if (sub.payment_id && PAGARME_API_KEY) {
      try {
        const pagarmeAuth = btoa(PAGARME_API_KEY + ":");
        await fetch(`${PAGARME_API_URL}/subscriptions/${sub.payment_id}`, {
          method: "DELETE",
          headers: { Authorization: `Basic ${pagarmeAuth}`, "Content-Type": "application/json", Accept: "application/json" },
        });
      } catch (pagarmeErr) {
        console.warn("Pagar.me cancel request failed (proceeding with local cancel):", pagarmeErr);
      }
    }

    await supabaseAdmin.from("subscriptions").update({
      status: "canceled", expires_at: expiresAt, updated_at: new Date().toISOString(),
    }).eq("agency_id", membership.agency_id);

    await supabaseAdmin.from("audit_logs").insert({
      event_type: "subscription.canceled",
      actor_id: user.id,
      agency_id: membership.agency_id,
      target_table: "subscriptions",
      metadata: { plan: sub.plan, expires_at: expiresAt },
    });

    return new Response(JSON.stringify({ success: true, expires_at: expiresAt }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Cancel error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
