import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    // Find our subscription by payment_id
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("id, agency_id")
      .eq("payment_id", pagarmeSubId)
      .maybeSingle();

    if (!existingSub) {
      // Try metadata fallback
      const agencyId = subscriptionData.metadata?.agency_id;
      if (agencyId) {
        const updateData: Record<string, unknown> = {
          payment_id: pagarmeSubId,
          payment_provider: "pagarme",
        };

        switch (eventType) {
          case "subscription.created":
            updateData.plan = "pro";
            updateData.status = "active";
            break;
          case "charge.paid":
            updateData.plan = "pro";
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
          updateData.plan = "pro";
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
    // Always return 200 to Pagar.me so it doesn't retry
    return new Response(JSON.stringify({ received: true, error: "processing_error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
