import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
  agency_id: string,
  actor_id?: string
) {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      event_type,
      actor_id: actor_id || null,
      agency_id,
      target_table: "subscriptions",
      metadata,
    });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

/** Resolve agency_id and role from agency_memberships (source of truth) */
async function getMembership(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string
): Promise<{ agency_id: string; role: string } | null> {
  const { data } = await supabaseAdmin
    .from("agency_memberships")
    .select("agency_id, role")
    .eq("user_id", userId)
    .eq("status", "active")
    .in("role", ["owner", "admin"])
    .limit(1)
    .maybeSingle();

  return data;
}

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
    const supabaseAdmin = getSupabaseAdmin();

    // Get membership (source of truth) - only owner/admin can manage billing
    const membership = await getMembership(supabaseAdmin, userId);
    if (!membership) {
      return new Response(JSON.stringify({ error: "Insufficient permissions - owner or admin required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const agencyId = membership.agency_id;

    const body = await req.json();
    const { card, customer, plan: requestedPlan, coupon_code } = body;

    // Server determines the plan price - never trust client
    const planKey = requestedPlan === "scale" ? "scale" : "pro";
    const basePlanPrice = PLAN_PRICES[planKey] || 1790;
    const planLabel = planKey === "scale" ? "Scale" : "Pro";

    // Input validation
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

    // Validate input lengths
    if (card.number.replace(/\D/g, "").length < 13 || card.number.replace(/\D/g, "").length > 19) {
      return new Response(JSON.stringify({ error: "Invalid card number" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (customer.document.replace(/\D/g, "").length !== 11) {
      return new Response(JSON.stringify({ error: "Invalid CPF" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check existing subscription for prorated upgrade
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions").select("*").eq("agency_id", agencyId).single();

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

    // Validate and apply coupon atomically
    let couponId: string | null = null;
    if (coupon_code && typeof coupon_code === "string" && coupon_code.trim().length > 0) {
      try {
        const { data: couponResult, error: couponError } = await supabaseAdmin
          .rpc("atomic_consume_coupon", {
            p_coupon_code: coupon_code.trim(),
            p_plan: planKey,
          });

        if (couponError) {
          console.warn("Coupon validation failed:", couponError.message);
        } else if (couponResult && couponResult.length > 0) {
          const coupon = couponResult[0];
          finalPrice = Math.round(finalPrice * (1 - coupon.discount_percent / 100));
          discountParts.push(`cupom ${coupon.code} ${coupon.discount_percent}%`);
          couponId = coupon.coupon_id;
        }
      } catch (e) {
        console.warn("Coupon error:", e);
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
        holder_name: String(card.holder_name).slice(0, 64),
        exp_month: parseInt(card.exp_month),
        exp_year: parseInt(card.exp_year),
        cvv: String(card.cvv).slice(0, 4),
        billing_address: {
          line_1: String(customer.address_line || "Rua Exemplo, 123").slice(0, 256),
          zip_code: (customer.zip_code || "01001000").replace(/\D/g, "").slice(0, 8),
          city: String(customer.city || "São Paulo").slice(0, 64),
          state: String(customer.state || "SP").slice(0, 2),
          country: "BR",
        },
      },
      customer: {
        name: String(customer.name).slice(0, 128),
        email: String(customer.email).slice(0, 254),
        document: customer.document.replace(/\D/g, "").slice(0, 11),
        document_type: "CPF",
        type: "individual",
        phones: {
          mobile_phone: {
            country_code: "55",
            area_code: String(customer.phone_area || "11").replace(/\D/g, "").slice(0, 2),
            number: String(customer.phone_number || "999999999").replace(/\D/g, "").slice(0, 9),
          },
        },
      },
      items: [{
        description: `Plano ${planLabel} - in1.bio${descSuffix}`,
        quantity: 1,
        pricing_scheme: { scheme_type: "unit", price: finalPrice },
      }],
      metadata: {
        agency_id: agencyId,
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
      if (couponId) {
        await supabaseAdmin.rpc("rollback_coupon_usage", { p_coupon_id: couponId });
      }
      return new Response(JSON.stringify({
        error: "Payment processing failed",
        details: pagarmeData.message || pagarmeData.errors || "Unknown error",
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const pagarmeStatus = pagarmeData.status;
    const isPaymentSuccessful = pagarmeStatus === "active" || pagarmeStatus === "paid";

    if (!isPaymentSuccessful) {
      if (couponId) {
        await supabaseAdmin.rpc("rollback_coupon_usage", { p_coupon_id: couponId });
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
    }).eq("agency_id", agencyId);

    await logAudit(supabaseAdmin, "subscription.checkout", {
      plan: planKey, final_price: finalPrice, is_upgrade: isUpgrade,
      coupon_id: couponId, pagarme_subscription_id: pagarmeData.id,
    }, agencyId, userId);

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
