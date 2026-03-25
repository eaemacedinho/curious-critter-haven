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

    // Authenticate user
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
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

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

    const body = await req.json();
    const { card, customer, plan: requestedPlan } = body;

    // Determine plan and price
    const planKey = requestedPlan === "scale" ? "scale" : "pro";
    const planPrice = planKey === "scale" ? 8790 : 1790;
    const planLabel = planKey === "scale" ? "Scale" : "Pro";
    const planDescriptor = planKey === "scale" ? "IN1BIO SCALE" : "IN1BIO PRO";

    if (!card || !customer) {
      return new Response(
        JSON.stringify({ error: "Card and customer data are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields
    if (!card.number || !card.holder_name || !card.exp_month || !card.exp_year || !card.cvv) {
      return new Response(
        JSON.stringify({ error: "All card fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!customer.name || !customer.email || !customer.document) {
      return new Response(
        JSON.stringify({ error: "Customer name, email and CPF are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create subscription on Pagar.me
    const pagarmeAuth = btoa(PAGARME_API_KEY + ":");

    const subscriptionPayload = {
      payment_method: "credit_card",
      currency: "BRL",
      interval: "month",
      interval_count: 1,
      billing_type: "prepaid",
      installments: 1,
      minimum_price: planPrice,
      statement_descriptor: planDescriptor,
      card: {
        number: card.number.replace(/\s/g, ""),
        holder_name: card.holder_name,
        exp_month: parseInt(card.exp_month),
        exp_year: parseInt(card.exp_year),
        cvv: card.cvv,
        billing_address: {
          line_1: customer.address_line || "Rua Exemplo, 123",
          zip_code: customer.zip_code || "01001000",
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
      pricing_scheme: {
        scheme_type: "unit",
        price: planPrice,
      },
      quantity: 1,
      description: `Plano ${planLabel} - in1.bio`,
      metadata: {
        agency_id: profile.agency_id,
        user_id: userId,
      },
    };

    const pagarmeResponse = await fetch(`${PAGARME_API_URL}/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${pagarmeAuth}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(subscriptionPayload),
    });

    const pagarmeData = await pagarmeResponse.json();

    if (!pagarmeResponse.ok) {
      console.error("Pagar.me error:", JSON.stringify(pagarmeData));
      return new Response(
        JSON.stringify({
          error: "Payment processing failed",
          details: pagarmeData.message || pagarmeData.errors || "Unknown error",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update subscription in our database using service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabaseAdmin
      .from("subscriptions")
      .update({
        plan: planKey,
        status: "active",
        payment_id: pagarmeData.id,
        payment_provider: "pagarme",
        started_at: new Date().toISOString(),
      })
      .eq("agency_id", profile.agency_id);

    return new Response(
      JSON.stringify({
        success: true,
        subscription_id: pagarmeData.id,
        status: pagarmeData.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
