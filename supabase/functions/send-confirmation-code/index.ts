import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if user exists and email is already confirmed
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    if (user?.email_confirmed_at) {
      return new Response(
        JSON.stringify({ error: "already_confirmed", message: "E-mail já confirmado." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = Date.now();

    // Rate limit: max 5 codes in 30 minutes
    const thirtyMinAgo = new Date(now - 30 * 60 * 1000).toISOString();
    const { data: recentCodes } = await supabase
      .from("confirmation_codes")
      .select("id, created_at")
      .eq("email", normalizedEmail)
      .gte("created_at", thirtyMinAgo)
      .order("created_at", { ascending: false });

    if (recentCodes && recentCodes.length >= 5) {
      // Find when the oldest of the 5 was created and lock for 2h from that
      const oldestTime = new Date(recentCodes[recentCodes.length - 1].created_at).getTime();
      const lockedUntil = new Date(oldestTime + 2 * 60 * 60 * 1000).toISOString();
      return new Response(
        JSON.stringify({
          error: "too_many_requests",
          message: "Muitas tentativas. Aguarde para tentar novamente.",
          locked_until: lockedUntil,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cooldown: 60 seconds between sends
    if (recentCodes && recentCodes.length > 0) {
      const lastSentAt = new Date(recentCodes[0].created_at).getTime();
      const elapsed = (now - lastSentAt) / 1000;
      if (elapsed < 60) {
        const retryAfter = Math.ceil(60 - elapsed);
        return new Response(
          JSON.stringify({
            error: "cooldown",
            message: "Aguarde antes de solicitar um novo código.",
            retry_after: retryAfter,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Store code
    const { error: insertError } = await supabase.from("confirmation_codes").insert({
      email: normalizedEmail,
      code,
      expires_at: new Date(now + 10 * 60 * 1000).toISOString(),
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to store code");
    }

    // Send email via Resend
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
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a2e;letter-spacing:-0.5px;">Confirme seu e-mail</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
            Use o código abaixo para confirmar sua conta na in1.bio. O código expira em 10 minutos.
          </p>
          
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr><td align="center" style="padding:24px 0;">
              <div style="display:inline-block;padding:20px 48px;background:#0a0a0f;border-radius:16px;letter-spacing:12px;font-size:36px;font-weight:800;color:#c8ff00;font-family:'Courier New',monospace;">
                ${code}
              </div>
            </td></tr>
          </table>

          <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
            Se você não criou uma conta na in1.bio, ignore este e-mail.
          </p>

          <hr style="margin:32px 0;border:none;border-top:1px solid #f0f0f0;" />

          <p style="margin:0;font-size:12px;color:#d1d5db;line-height:1.5;">
            Este código é válido por 10 minutos. Não compartilhe com ninguém.
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

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "in1.bio <noreply@in1.bio>",
        to: [normalizedEmail],
        subject: `${code} — Código de confirmação in1.bio`,
        html,
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      throw new Error("Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true, sent_count: (recentCodes?.length || 0) + 1 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send confirmation code error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
