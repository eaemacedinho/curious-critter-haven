import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PAGARME_API_URL = "https://api.pagar.me/core/v5";
const PLAN_PRICES: Record<string, number> = { pro: 1790, scale: 8790 };

async function restoreFullPriceIfNeeded(subscriptionData: any) {
  const metadata = subscriptionData.metadata || {};
  if (metadata.discount_first_month_only !== "true") return;

  const PAGARME_API_KEY = Deno.env.get("PAGARME_API_KEY");
  if (!PAGARME_API_KEY) return;

  const pagarmeSubId = subscriptionData.id || subscriptionData.subscription?.id;
  if (!pagarmeSubId) return;

  // Pagar.me current_cycle.cycle > 1 means it's a renewal
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
    const body = await req.json();
    const eventType = body.type;

    console.log("Webhook received:", eventType, JSON.stringify(body).slice(0, 500));

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
