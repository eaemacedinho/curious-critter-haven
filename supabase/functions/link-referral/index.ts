import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

async function sendReferralNotification(referrerEmail: string, referrerName: string, referredName: string, convertedCount: number) {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0a0a0f 0%,#141420 100%);padding:40px 40px 32px;text-align:center;">
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="width:36px;height:36px;background:#c8ff00;border-radius:10px;text-align:center;vertical-align:middle;font-weight:800;font-size:14px;color:#0a0a0f;">1</td>
              <td style="padding-left:10px;font-size:22px;font-weight:800;color:#f5f5f7;letter-spacing:-0.5px;">All in<span style="color:#c8ff00;"> 1</span></td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#c8ff00;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">🎉 Nova indicação convertida!</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a2e;letter-spacing:-0.5px;">
            Parabéns, ${referrerName}!
          </h1>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.7;">
            <strong style="color:#1a1a2e;">${referredName || "Alguém"}</strong> aceitou seu convite e criou uma conta no in1.bio! 🚀
          </p>

          <!-- Stats card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="padding:24px;background:#f8fafc;border-radius:14px;border:1px solid #f0f0f5;text-align:center;">
              <p style="margin:0 0 4px;font-size:36px;font-weight:800;color:#1a1a2e;">${convertedCount}</p>
              <p style="margin:0;font-size:13px;color:#6b7280;font-weight:600;">convites aceitos</p>
              
              ${convertedCount >= 3 ? `
              <hr style="margin:16px 0;border:none;border-top:1px solid #f0f0f0;" />
              <p style="margin:0;font-size:12px;color:#c8ff00;font-weight:700;">
                ${convertedCount >= 10 ? "✅ Selo Verificado desbloqueado!" : convertedCount >= 5 ? "⭐ Destaque Premium desbloqueado!" : "🎨 Tema Exclusivo desbloqueado!"}
              </p>` : `
              <hr style="margin:16px 0;border:none;border-top:1px solid #f0f0f0;" />
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Faltam <strong style="color:#1a1a2e;">${3 - convertedCount}</strong> convites para desbloquear o Tema Exclusivo 🎨
              </p>`}
            </td></tr>
          </table>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr><td align="center">
              <a href="https://in1.bio/app/referrals" style="display:inline-block;padding:14px 40px;background:#c8ff00;color:#0a0a0f;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:-0.2px;">
                Ver minhas indicações
              </a>
            </td></tr>
          </table>

          <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;text-align:center;">
            Continue compartilhando seu link de convite para desbloquear mais recompensas!
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 40px;background:#fafafa;border-top:1px solid #f0f0f0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            © ${new Date().getFullYear()} in1.bio — Sua página de links premium
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "in1.bio <noreply@in1.bio>",
        to: [referrerEmail],
        subject: `🎉 ${referredName || "Alguém"} aceitou seu convite no in1.bio!`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Resend notification error:", err);
    }
  } catch (err) {
    console.error("Failed to send referral notification:", err);
  }
}

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
      .select("id, email, full_name")
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

    // Get referred user's name for the notification
    const { data: referredProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user_id)
      .maybeSingle();

    // Count total conversions for referrer
    const { count: totalConverted } = await supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("referrer_user_id", referrer.id)
      .eq("status", "converted");

    // Send notification email to referrer
    if (referrer.email) {
      await sendReferralNotification(
        referrer.email,
        referrer.full_name || "Creator",
        referredProfile?.full_name || "",
        totalConverted || 1
      );
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
