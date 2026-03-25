import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ref_code } = await req.json();

    if (!ref_code) {
      return new Response(JSON.stringify({ name: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get referrer profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("referral_code", ref_code)
      .maybeSingle();

    if (!profile) {
      return new Response(JSON.stringify({ name: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get creator slug for the @ handle
    const { data: creator } = await supabase
      .from("creators")
      .select("slug, avatar_url")
      .eq("user_id", profile.id)
      .limit(1)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        name: profile.full_name || null,
        avatar_url: creator?.avatar_url || profile.avatar_url || null,
        slug: creator?.slug || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ name: null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
