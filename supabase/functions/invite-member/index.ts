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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { email, role, agency_id } = await req.json();

    // Input validation
    if (!agency_id || typeof agency_id !== "string") {
      return new Response(JSON.stringify({ error: "agency_id é obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Email inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!role) {
      return new Response(JSON.stringify({ error: "role é obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validRoles = ["admin", "editor", "viewer"];
    if (!validRoles.includes(role)) {
      return new Response(JSON.stringify({ error: "Papel inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate caller is owner of THIS specific agency
    const { data: callerMembership } = await adminClient
      .from("agency_memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("agency_id", agency_id)
      .eq("status", "active")
      .single();

    if (!callerMembership || callerMembership.role !== "owner") {
      return new Response(JSON.stringify({ error: "Apenas o owner pode convidar membros" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      // Check if already in this agency via memberships
      const { data: existingMembership } = await adminClient
        .from("agency_memberships")
        .select("id")
        .eq("user_id", existingUser.id)
        .eq("agency_id", agency_id)
        .eq("status", "active")
        .maybeSingle();

      if (existingMembership) {
        return new Response(JSON.stringify({ error: "Este usuário já é membro desta agência" }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create membership (source of truth) + update profile for backward compat
      await adminClient
        .from("agency_memberships")
        .upsert({
          user_id: existingUser.id,
          agency_id,
          role,
          status: "active",
        }, { onConflict: "user_id,agency_id" });

      await adminClient
        .from("profiles")
        .update({ agency_id, role })
        .eq("id", existingUser.id);

      await adminClient.from("user_roles").upsert({
        user_id: existingUser.id,
        agency_id,
        role,
      }, { onConflict: "user_id,agency_id" as any });

      await adminClient.from("audit_logs").insert({
        event_type: "member.invited",
        actor_id: user.id,
        agency_id,
        target_table: "agency_memberships",
        target_id: existingUser.id,
        metadata: { email, role, existing_user: true },
      });

      return new Response(
        JSON.stringify({ message: "Membro adicionado com sucesso", user_id: existingUser.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Invite new user via Supabase Auth
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: "",
        invited_agency_id: agency_id,
        invited_role: role,
      },
    });

    if (inviteError) {
      return new Response(JSON.stringify({ error: inviteError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (inviteData?.user) {
      await adminClient.from("agency_memberships").upsert({
        user_id: inviteData.user.id,
        agency_id,
        role,
        status: "invited",
      }, { onConflict: "user_id,agency_id" });

      await adminClient.from("profiles").upsert({
        id: inviteData.user.id,
        agency_id,
        role,
        email,
        full_name: "",
      });
    }

    await adminClient.from("audit_logs").insert({
      event_type: "member.invited",
      actor_id: user.id,
      agency_id,
      target_table: "agency_memberships",
      target_id: inviteData?.user?.id || null,
      metadata: { email, role, existing_user: false },
    });

    return new Response(
      JSON.stringify({ message: "Convite enviado com sucesso", user_id: inviteData?.user?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Invite member error:", err);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
