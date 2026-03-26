import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { agency_id } = body;

    // REQUIRE explicit agency_id
    if (!agency_id || typeof agency_id !== "string") {
      return new Response(JSON.stringify({ error: "agency_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate ownership of THIS specific agency
    const { data: membership } = await adminClient
      .from("agency_memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("agency_id", agency_id)
      .eq("status", "active")
      .single();

    if (!membership || membership.role !== "owner") {
      return new Response(JSON.stringify({ error: "Apenas o owner pode excluir a conta" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get creator IDs
    const { data: creators } = await adminClient.from("creators").select("id").eq("agency_id", agency_id);
    const creatorIds = (creators || []).map((c: any) => c.id);

    // Delete all related data
    if (creatorIds.length > 0) {
      await adminClient.from("creator_testimonials").delete().in("creator_id", creatorIds);
      await adminClient.from("creator_social_links").delete().in("creator_id", creatorIds);
      await adminClient.from("creator_products").delete().in("creator_id", creatorIds);
      await adminClient.from("creator_links").delete().in("creator_id", creatorIds);
      await adminClient.from("creator_hero_reels").delete().in("creator_id", creatorIds);
      await adminClient.from("campaign_clicks").delete().in("campaign_id",
        ((await adminClient.from("campaigns").select("id").in("creator_id", creatorIds)).data || []).map((c: any) => c.id)
      );
      await adminClient.from("campaigns").delete().in("creator_id", creatorIds);
      await adminClient.from("analytics_events").delete().in("creator_id", creatorIds);
      await adminClient.from("creators").delete().eq("agency_id", agency_id);
    }

    await adminClient.from("analytics_events").delete().eq("agency_id", agency_id);
    await adminClient.from("subscriptions").delete().eq("agency_id", agency_id);
    await adminClient.from("agency_settings").delete().eq("agency_id", agency_id);
    await adminClient.from("agency_memberships").delete().eq("agency_id", agency_id);
    await adminClient.from("user_roles").delete().eq("agency_id", agency_id);
    await adminClient.from("referrals").delete().eq("referrer_user_id", user.id);
    await adminClient.from("profiles").delete().eq("id", user.id);
    await adminClient.from("agencies").delete().eq("id", agency_id);

    // Delete auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return new Response(JSON.stringify({ error: "Erro ao remover usuário: " + deleteError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Delete account error:", err);
    return new Response(JSON.stringify({ error: err.message || "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
