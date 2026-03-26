import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PAGARME_API_URL = "https://api.pagar.me/core/v5";
const PLAN_PRICES: Record<string, number> = { pro: 1790, scale: 8790 };

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function logAudit(
  supabaseAdmin: ReturnType<typeof createClient>,
  event_type: string,
  metadata: Record<string, unknown>,
  agency_id?: string
) {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      event_type,
      agency_id: agency_id || null,
      target_table: "subscriptions",
      metadata,
    });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

async function checkIdempotency(
  supabaseAdmin: ReturnType<typeof createClient>,
  eventType: string,
  externalId: string
): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("webhook_events")
    .select("id")
    .eq("event_type", eventType)
    .eq("external_id", externalId)
    .maybeSingle();

  if (data) return true; // Already processed

  // Record this event
  const { error } = await supabaseAdmin.from("webhook_events").insert({
    event_type: eventType,
    external_id: externalId,
  });

  // If insert fails due to unique constraint, it was processed concurrently
  if (error) return true;

  return false;
}

async function verifyPagarmeSignature(req: Request, body: string): Promise<boolean> {
  const PAGARME_WEBHOOK_SECRET = Deno.env.get("PAGARME_WEBHOOK_SECRET");
  if (!PAGARME_WEBHOOK_SECRET) {
    // TODO: Set PAGARME_WEBHOOK_SECRET in Supabase secrets for full signature validation
    console.warn("PAGARME_WEBHOOK_SECRET not configured - skipping signature verification");
    return true;
  }

  const signature = req.headers.get("x-hub-signature") || req.headers.get("x-webhook-signature") || "";
  if (!signature) {
    console.warn("No webhook signature header found");
    return false;
  }

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(PAGARME_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    const expectedSig = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const receivedSig = signature.replace("sha256=", "").replace("sha1=", "");
    return expectedSig === receivedSig;
  } catch (e) {
    console.error("Signature verification error:", e);
    return false;
  }
}

async function restoreFullPriceIfNeeded(subscriptionData: any) {
  const metadata = subscriptionData.metadata || {};
  if (metadata.discount_first_month_only !== "true") return;

  const PAGARME_API_KEY = Deno.env.get("PAGARME_API_KEY");
  if (!PAGARME_API_KEY) return;

  const pagarmeSubId = subscriptionData.id || subscriptionData.subscription?.id;
  if (!pagarmeSubId) return;

  const currentCycle = subscriptionData.current_cycle?.cycle;
  if (!currentCycle || currentCycle <= 1) return;

  const fullPrice = parseInt(metadata.full_price) || PLAN_PRICES[metadata.plan_key] || 1790;
  const planKey = metadata.plan_key || "pro";
  const planLabel = planKey === "scale" ? "Scale" : "Pro";
  const planDescriptor = planKey === "scale" ? "IN1BIO SCALE" : "IN1BIO PRO";

  try {
    const pagarmeAuth = btoa(PAGARME_API_KEY + ":");

    const updateRes = await fetch(`${PAGARME_API_URL}/subscriptions/${pagarmeSubId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Basic ${pagarmeAuth}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        minimum_price: fullPrice,
        statement_descriptor: planDescriptor,
        items: [{
          description: `Plano ${planLabel} - in1.bio`,
          quantity: 1,
          pricing_scheme: { scheme_type: "unit", price: fullPrice },
        }],
        metadata: {
          ...metadata,
          discount_first_month_only: "restored",
        },
      }),
    });

    if (updateRes.ok) {
      console.log(`Restored full price ${fullPrice} for subscription ${pagarmeSubId} on cycle ${currentCycle}`);
    } else {
      const errData = await updateRes.json();
      console.warn("Failed to restore full price:", JSON.stringify(errData));
    }
  } catch (e) {
    console.error("Error restoring full price:", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bodyText = await req.text();

    // Verify webhook signature
    const isValid = await verifyPagarmeSignature(req, bodyText);
    if (!isValid) {
      console.error("Invalid webhook signature - rejecting");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = JSON.parse(bodyText);
    const eventType = body.type;

    console.log("Webhook received:", eventType, JSON.stringify(body).slice(0, 500));

    const supabaseAdmin = getSupabaseAdmin();

    const subscriptionData = body.data;
    if (!subscriptionData) {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pagarmeSubId = subscriptionData.id || subscriptionData.subscription?.id;
    if (!pagarmeSubId) {
      console.log("No subscription ID found in webhook data");
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency check
    const eventId = body.id || `${eventType}_${pagarmeSubId}_${Date.now()}`;
    const alreadyProcessed = await checkIdempotency(supabaseAdmin, eventType, eventId);
    if (alreadyProcessed) {
      console.log(`Event already processed: ${eventType} ${eventId}`);
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // On charge.paid, restore full price if this is a renewal after a discounted 1st month
    if (eventType === "charge.paid") {
      await restoreFullPriceIfNeeded(subscriptionData);
    }

    // Find our subscription by payment_id
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("id, agency_id")
      .eq("payment_id", pagarmeSubId)
      .maybeSingle();

    if (!existingSub) {
      const agencyId = subscriptionData.metadata?.agency_id;
      if (agencyId) {
        const updateData: Record<string, unknown> = {
          payment_id: pagarmeSubId,
          payment_provider: "pagarme",
        };

        switch (eventType) {
          case "subscription.created":
          case "charge.paid":
            updateData.status = "active";
            break;
          case "subscription.canceled":
          case "subscription.expired":
            updateData.plan = "free";
            updateData.status = "canceled";
            break;
          case "charge.payment_failed":
            updateData.status = "payment_failed";
            break;
        }

        await supabaseAdmin
          .from("subscriptions")
          .update(updateData)
          .eq("agency_id", agencyId);

        await logAudit(supabaseAdmin, `webhook.${eventType}`, {
          pagarme_sub_id: pagarmeSubId,
          update_data: updateData,
          source: "metadata_lookup",
        }, agencyId);

        console.log(`Updated subscription for agency ${agencyId} via metadata`);
      }
    } else {
      const updateData: Record<string, unknown> = {};

      switch (eventType) {
        case "subscription.updated":
        case "charge.paid":
          updateData.status = "active";
          break;
        case "subscription.canceled":
        case "subscription.expired":
          updateData.plan = "free";
          updateData.status = "canceled";
          break;
        case "charge.payment_failed":
          updateData.status = "payment_failed";
          break;
        default:
          console.log("Unhandled event type:", eventType);
      }

      if (Object.keys(updateData).length > 0) {
        await supabaseAdmin
          .from("subscriptions")
          .update(updateData)
          .eq("id", existingSub.id);

        await logAudit(supabaseAdmin, `webhook.${eventType}`, {
          pagarme_sub_id: pagarmeSubId,
          subscription_id: existingSub.id,
          update_data: updateData,
        }, existingSub.agency_id);

        console.log(`Updated subscription ${existingSub.id}:`, updateData);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ received: true, error: "processing_error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
