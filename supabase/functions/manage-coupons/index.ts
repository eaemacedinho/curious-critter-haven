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

    // Verify super admin server-side
    const { data: profile } = await adminClient
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_super_admin) {
      return new Response(JSON.stringify({ error: "Acesso restrito a super admins" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "list": {
        const { data, error } = await adminClient
          .from("coupons")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return new Response(JSON.stringify({ coupons: data }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create": {
        const { code, discount_percent, valid_plans, max_uses, expires_at } = body;
        if (!code || typeof code !== "string" || code.trim().length === 0) {
          return new Response(JSON.stringify({ error: "Código obrigatório" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (!discount_percent || discount_percent < 1 || discount_percent > 100) {
          return new Response(JSON.stringify({ error: "Desconto deve ser entre 1 e 100" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const plans = Array.isArray(valid_plans) ? valid_plans.filter((p: string) => ["pro", "scale"].includes(p)) : ["pro", "scale"];
        if (plans.length === 0) {
          return new Response(JSON.stringify({ error: "Selecione ao menos um plano" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const payload: Record<string, unknown> = {
          code: code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 20),
          discount_percent: Math.min(100, Math.max(1, Math.round(discount_percent))),
          valid_plans: plans,
          is_active: true,
          current_uses: 0,
        };
        if (max_uses && Number.isInteger(max_uses) && max_uses > 0) payload.max_uses = max_uses;
        if (expires_at) payload.expires_at = new Date(expires_at).toISOString();

        const { data, error } = await adminClient.from("coupons").insert(payload).select().single();
        if (error) {
          const msg = error.message.includes("duplicate") ? "Esse código já existe" : error.message;
          return new Response(JSON.stringify({ error: msg }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        await adminClient.from("audit_logs").insert({
          event_type: "coupon.created",
          actor_id: user.id,
          target_table: "coupons",
          target_id: data.id,
          metadata: { code: payload.code, discount_percent: payload.discount_percent },
        });

        return new Response(JSON.stringify({ coupon: data }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "toggle": {
        const { coupon_id, is_active } = body;
        if (!coupon_id) {
          return new Response(JSON.stringify({ error: "coupon_id obrigatório" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await adminClient
          .from("coupons")
          .update({ is_active: !!is_active, updated_at: new Date().toISOString() })
          .eq("id", coupon_id);

        if (error) throw error;

        await adminClient.from("audit_logs").insert({
          event_type: is_active ? "coupon.activated" : "coupon.deactivated",
          actor_id: user.id,
          target_table: "coupons",
          target_id: coupon_id,
          metadata: {},
        });

        return new Response(JSON.stringify({ success: true }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete": {
        const { coupon_id } = body;
        if (!coupon_id) {
          return new Response(JSON.stringify({ error: "coupon_id obrigatório" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await adminClient.from("coupons").delete().eq("id", coupon_id);
        if (error) throw error;

        await adminClient.from("audit_logs").insert({
          event_type: "coupon.deleted",
          actor_id: user.id,
          target_table: "coupons",
          target_id: coupon_id,
          metadata: {},
        });

        return new Response(JSON.stringify({ success: true }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Ação inválida" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    console.error("Manage coupons error:", err);
    const msg = err instanceof Error ? err.message : "Erro interno";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
