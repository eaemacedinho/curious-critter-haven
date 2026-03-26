import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);
    const body = await req.json();
    const { agency_id, target_user_id, new_role, action } = body;

    // Validate inputs
    if (!agency_id || typeof agency_id !== "string") {
      return new Response(JSON.stringify({ error: "agency_id é obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!target_user_id || typeof target_user_id !== "string") {
      return new Response(JSON.stringify({ error: "target_user_id é obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Caller cannot target themselves
    if (target_user_id === user.id) {
      return new Response(JSON.stringify({ error: "Não é possível alterar seu próprio papel" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate caller is owner of THIS agency
    const { data: callerMembership } = await adminClient
      .from("agency_memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("agency_id", agency_id)
      .eq("status", "active")
      .single();

    if (!callerMembership || callerMembership.role !== "owner") {
      return new Response(JSON.stringify({ error: "Apenas o owner pode alterar papéis" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate target is a member of this agency
    const { data: targetMembership } = await adminClient
      .from("agency_memberships")
      .select("id, role")
      .eq("user_id", target_user_id)
      .eq("agency_id", agency_id)
      .eq("status", "active")
      .single();

    if (!targetMembership) {
      return new Response(JSON.stringify({ error: "Membro não encontrado nesta agência" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cannot change another owner's role
    if (targetMembership.role === "owner") {
      return new Response(JSON.stringify({ error: "Não é possível alterar o papel de outro owner" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: remove member
    if (action === "remove") {
      await adminClient
        .from("agency_memberships")
        .update({ status: "removed" })
        .eq("user_id", target_user_id)
        .eq("agency_id", agency_id);

      // Update profile for backward compat
      await adminClient
        .from("profiles")
        .update({ agency_id: null, role: "viewer" })
        .eq("id", target_user_id);

      await adminClient.from("audit_logs").insert({
        event_type: "member.removed",
        actor_id: user.id,
        agency_id,
        target_table: "agency_memberships",
        target_id: target_user_id,
        metadata: { previous_role: targetMembership.role },
      });

      return new Response(JSON.stringify({ success: true, action: "removed" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: change role
    const validRoles = ["admin", "editor", "viewer"];
    if (!new_role || !validRoles.includes(new_role)) {
      return new Response(JSON.stringify({ error: "Papel inválido. Use: admin, editor ou viewer" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update agency_memberships (source of truth)
    await adminClient
      .from("agency_memberships")
      .update({ role: new_role, updated_at: new Date().toISOString() })
      .eq("user_id", target_user_id)
      .eq("agency_id", agency_id);

    // Update profiles for backward compat
    await adminClient
      .from("profiles")
      .update({ role: new_role })
      .eq("id", target_user_id);

    // Update user_roles for backward compat
    await adminClient.from("user_roles").upsert({
      user_id: target_user_id,
      agency_id,
      role: new_role,
    }, { onConflict: "user_id,agency_id" as any });

    await adminClient.from("audit_logs").insert({
      event_type: "member.role_changed",
      actor_id: user.id,
      agency_id,
      target_table: "agency_memberships",
      target_id: target_user_id,
      metadata: { previous_role: targetMembership.role, new_role },
    });

    return new Response(JSON.stringify({ success: true, new_role }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("Change member role error:", err);
    const errorMessage = err instanceof Error ? err.message : "Erro interno";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
