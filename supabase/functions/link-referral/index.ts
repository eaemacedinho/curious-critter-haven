import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ref_code, user_id } = await req.json();

    if (!ref_code || !user_id) {
      return new Response(JSON.stringify({ success: false, error: "Missing params" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Find the referrer by code
    const { data: referrer } = await supabase
      .from("profiles")
      .select("id")
      .eq("referral_code", ref_code)
      .maybeSingle();

    if (!referrer || referrer.id === user_id) {
      return new Response(JSON.stringify({ success: false, error: "Invalid referrer" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already linked
    const { data: existing } = await supabase
      .from("referrals")
      .select("id")
      .eq("referrer_user_id", referrer.id)
      .eq("referred_user_id", user_id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, already_linked: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the referral record
    const { error } = await supabase.from("referrals").insert({
      referrer_user_id: referrer.id,
      referred_user_id: user_id,
      status: "converted",
      converted_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Insert referral error:", error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Link referral error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
