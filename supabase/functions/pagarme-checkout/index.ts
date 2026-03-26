import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAGARME_API_URL = "https://api.pagar.me/core/v5";
const PLAN_PRICES: Record<string, number> = { pro: 1790, scale: 8790 };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAGARME_API_KEY = Deno.env.get("PAGARME_API_KEY");
    if (!PAGARME_API_KEY) throw new Error("PAGARME_API_KEY is not configured");

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

    const userId = user.id;
    const { data: profile } = await supabase.from("profiles").select("agency_id").eq("id", userId).single();
    if (!profile?.agency_id) {
      return new Response(JSON.stringify({ error: "No agency found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { card, customer, plan: requestedPlan, coupon_code } = body;
    const planKey = requestedPlan === "scale" ? "scale" : "pro";
    const basePlanPrice = PLAN_PRICES[planKey] || 1790;
    const planLabel = planKey === "scale" ? "Scale" : "Pro";

    if (!card || !customer) {
      return new Response(JSON.stringify({ error: "Card and customer data are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!card.number || !card.holder_name || !card.exp_month || !card.exp_year || !card.cvv) {
      return new Response(JSON.stringify({ error: "All card fields are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!customer.name || !customer.email || !customer.document) {
      return new Response(JSON.stringify({ error: "Customer name, email and CPF are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check existing subscription for prorated upgrade
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions").select("*").eq("agency_id", profile.agency_id).single();

    let finalPrice = basePlanPrice;
    let isUpgrade = false;
    let discountParts: string[] = [];

    // Prorated upgrade
    if (existingSub && existingSub.plan !== "free") {
      const isActivePlan = existingSub.status === "active" ||
        (existingSub.status === "canceled" && existingSub.expires_at && new Date(existingSub.expires_at) > new Date());
      if (isActivePlan) {
        const currentPlanPrice = PLAN_PRICES[existingSub.plan] || 0;
        if (basePlanPrice > currentPlanPrice) {
          finalPrice = basePlanPrice - currentPlanPrice;
          isUpgrade = true;
          discountParts.push(`upgrade de ${existingSub.plan === "pro" ? "Pro" : "Scale"}`);

          if (existingSub.payment_id) {
            try {
              const pagarmeAuth = btoa(PAGARME_API_KEY + ":");
              await fetch(`${PAGARME_API_URL}/subscriptions/${existingSub.payment_id}`, {
                method: "DELETE",
                headers: { Authorization: `Basic ${pagarmeAuth}`, "Content-Type": "application/json", Accept: "application/json" },
              });
            } catch (e) { console.warn("Failed to cancel old subscription:", e); }
          }
        }
      }
    }

    // Validate and apply coupon
    let couponId: string | null = null;
    if (coupon_code) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", coupon_code.toUpperCase().trim())
        .eq("is_active", true)
        .single();

      if (coupon) {
        const isValid =
          (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) &&
          (coupon.max_uses === null || coupon.current_uses < coupon.max_uses) &&
          coupon.valid_plans.includes(planKey);

        if (isValid) {
          finalPrice = Math.round(finalPrice * (1 - coupon.discount_percent / 100));
          discountParts.push(`cupom ${coupon.code} ${coupon.discount_percent}%`);
          couponId = coupon.id;

          // Increment usage
          await supabaseAdmin
            .from("coupons")
            .update({ current_uses: coupon.current_uses + 1, updated_at: new Date().toISOString() })
            .eq("id", coupon.id);
        }
      }
    }

    // Ensure minimum price of 100 (R$1.00) for Pagar.me
    if (finalPrice < 100) finalPrice = 100;

    const planDescriptor = planKey === "scale" ? "IN1BIO SCALE" : "IN1BIO PRO";
    const pagarmeAuth = btoa(PAGARME_API_KEY + ":");
    const descSuffix = discountParts.length > 0 ? ` (${discountParts.join(", ")})` : "";

    const subscriptionPayload = {
      payment_method: "credit_card",
      currency: "BRL",
      interval: "month",
      interval_count: 1,
      billing_type: "prepaid",
      installments: 1,
      minimum_price: finalPrice,
      statement_descriptor: planDescriptor,
      card: {
        number: card.number.replace(/\s/g, ""),
        holder_name: card.holder_name,
        exp_month: parseInt(card.exp_month),
        exp_year: parseInt(card.exp_year),
        cvv: card.cvv,
        billing_address: {
          line_1: customer.address_line || "Rua Exemplo, 123",
          zip_code: (customer.zip_code || "01001000").replace(/\D/g, ""),
          city: customer.city || "São Paulo",
          state: customer.state || "SP",
          country: "BR",
        },
      },
      customer: {
        name: customer.name,
        email: customer.email,
        document: customer.document.replace(/\D/g, ""),
        document_type: "CPF",
        type: "individual",
        phones: {
          mobile_phone: {
            country_code: "55",
            area_code: customer.phone_area || "11",
            number: customer.phone_number || "999999999",
          },
        },
      },
      items: [{
        description: `Plano ${planLabel} - in1.bio${descSuffix}`,
        quantity: 1,
        pricing_scheme: { scheme_type: "unit", price: finalPrice },
      }],
      metadata: {
        agency_id: profile.agency_id,
        user_id: userId,
        is_upgrade: isUpgrade,
        coupon_id: couponId,
        discount_first_month_only: (isUpgrade || couponId) ? "true" : "false",
        full_price: basePlanPrice,
        plan_key: planKey,
      },
    };

    console.log("Creating subscription:", JSON.stringify({
      plan: planKey, base_price: basePlanPrice, final_price: finalPrice,
      is_upgrade: isUpgrade, coupon: coupon_code, customer_email: customer.email,
    }));

    const pagarmeResponse = await fetch(`${PAGARME_API_URL}/subscriptions`, {
      method: "POST",
      headers: { Authorization: `Basic ${pagarmeAuth}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(subscriptionPayload),
    });

    const pagarmeData = await pagarmeResponse.json();

    if (!pagarmeResponse.ok) {
      console.error("Pagar.me error:", JSON.stringify(pagarmeData));
      // Rollback coupon usage if payment failed
      if (couponId) {
        const { data: coupon } = await supabaseAdmin.from("coupons").select("current_uses").eq("id", couponId).single();
        if (coupon) {
          await supabaseAdmin.from("coupons").update({ current_uses: Math.max(0, coupon.current_uses - 1) }).eq("id", couponId);
        }
      }
      return new Response(JSON.stringify({
        error: "Payment processing failed",
        details: pagarmeData.message || pagarmeData.errors || "Unknown error",
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const pagarmeStatus = pagarmeData.status;
    const isPaymentSuccessful = pagarmeStatus === "active" || pagarmeStatus === "paid";

    if (!isPaymentSuccessful) {
      // Rollback coupon usage
      if (couponId) {
        const { data: coupon } = await supabaseAdmin.from("coupons").select("current_uses").eq("id", couponId).single();
        if (coupon) {
          await supabaseAdmin.from("coupons").update({ current_uses: Math.max(0, coupon.current_uses - 1) }).eq("id", couponId);
        }
      }
      return new Response(JSON.stringify({
        error: "Pagamento recusado",
        details: `O pagamento não foi aprovado (status: ${pagarmeStatus}). Verifique os dados do cartão e tente novamente.`,
        pagarme_status: pagarmeStatus,
      }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await supabaseAdmin.from("subscriptions").update({
      plan: planKey, status: "active", payment_id: pagarmeData.id,
      payment_provider: "pagarme", started_at: new Date().toISOString(), expires_at: null,
    }).eq("agency_id", profile.agency_id);

    return new Response(JSON.stringify({
      success: true, subscription_id: pagarmeData.id, status: pagarmeData.status,
      is_upgrade: isUpgrade, final_price: finalPrice,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
