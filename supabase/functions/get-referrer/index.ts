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

    // Get referrer profile with agency info
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, agency_id")
      .eq("referral_code", ref_code)
      .maybeSingle();

    if (!profile) {
      return new Response(JSON.stringify({ name: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get agency info (name + slug)
    let agencyName: string | null = null;
    let agencySlug: string | null = null;
    let agencyLogo: string | null = null;

    if (profile.agency_id) {
      const { data: agency } = await supabase
        .from("agencies")
        .select("name, slug, logo_url")
        .eq("id", profile.agency_id)
        .maybeSingle();

      if (agency) {
        agencyName = agency.name;
        agencySlug = agency.slug;
        agencyLogo = agency.logo_url;
      }
    }

    // Count how many creators the user has in their agency
    let creatorCount = 0;
    let singleCreatorSlug: string | null = null;
    let singleCreatorAvatar: string | null = null;

    if (profile.agency_id) {
      const { data: creators } = await supabase
        .from("creators")
        .select("slug, avatar_url")
        .eq("agency_id", profile.agency_id);

      creatorCount = creators?.length || 0;

      // If exactly 1 creator, use that creator's slug as @handle
      if (creatorCount === 1 && creators?.[0]) {
        singleCreatorSlug = creators[0].slug;
        singleCreatorAvatar = creators[0].avatar_url;
      }
    }

    // Logic:
    // - If agency has multiple creators → show agency name + agency slug
    // - If agency has 1 creator → show creator slug as @handle (personal account)
    const isPersonalAccount = creatorCount <= 1;

    const name = isPersonalAccount
      ? profile.full_name || singleCreatorSlug || agencyName || null
      : agencyName || profile.full_name || null;

    const slug = isPersonalAccount
      ? singleCreatorSlug || agencySlug || null
      : agencySlug || null;

    const avatar = isPersonalAccount
      ? singleCreatorAvatar || agencyLogo || profile.avatar_url || null
      : agencyLogo || profile.avatar_url || null;

    return new Response(
      JSON.stringify({ name, avatar_url: avatar, slug }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ name: null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
