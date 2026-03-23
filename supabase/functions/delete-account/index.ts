import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autenticado");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Token inválido");

    const adminClient = createClient(supabaseUrl, serviceKey);

    // Get agency_id
    const { data: profile } = await adminClient.from("profiles").select("agency_id, role").eq("id", user.id).single();
    if (!profile) throw new Error("Perfil não encontrado");
    if (profile.role !== "owner") throw new Error("Apenas o owner pode excluir a conta");

    const agencyId = profile.agency_id;

    // Get creator IDs
    const { data: creators } = await adminClient.from("creators").select("id").eq("agency_id", agencyId);
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
      await adminClient.from("creators").delete().eq("agency_id", agencyId);
    }

    await adminClient.from("analytics_events").delete().eq("agency_id", agencyId);
    await adminClient.from("subscriptions").delete().eq("agency_id", agencyId);
    await adminClient.from("agency_settings").delete().eq("agency_id", agencyId);
    await adminClient.from("user_roles").delete().eq("agency_id", agencyId);
    await adminClient.from("referrals").delete().eq("referrer_user_id", user.id);
    await adminClient.from("profiles").delete().eq("id", user.id);
    await adminClient.from("agencies").delete().eq("id", agencyId);

    // Delete auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw new Error("Erro ao remover usuário: " + deleteError.message);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
