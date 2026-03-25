import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const displayName = name || "Creator";

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header with gradient -->
        <tr><td style="background:linear-gradient(135deg,#0a0a0f 0%,#141420 50%,#1a1a2e 100%);padding:48px 40px 40px;text-align:center;">
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="width:40px;height:40px;background:#c8ff00;border-radius:12px;text-align:center;vertical-align:middle;font-weight:800;font-size:16px;color:#0a0a0f;">1</td>
              <td style="padding-left:12px;font-size:26px;font-weight:800;color:#f5f5f7;letter-spacing:-0.5px;">All in<span style="color:#c8ff00;"> 1</span></td>
            </tr>
          </table>
          <p style="margin:20px 0 0;font-size:14px;color:#9ca3af;letter-spacing:0.5px;text-transform:uppercase;font-weight:600;">Bem-vindo à plataforma</p>
        </td></tr>

        <!-- Welcome body -->
        <tr><td style="padding:40px;">
          <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;color:#1a1a2e;letter-spacing:-0.5px;">
            Olá, ${displayName}! 👋
          </h1>
          <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.7;">
            Sua conta foi criada com sucesso. Você agora faz parte da <strong style="color:#1a1a2e;">in1.bio</strong> — a plataforma premium para centralizar sua presença digital.
          </p>

          <!-- Feature cards -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #f0f0f5;margin-bottom:12px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:40px;vertical-align:top;padding-top:2px;">
                    <div style="width:36px;height:36px;background:#c8ff00;border-radius:10px;text-align:center;line-height:36px;font-size:18px;">🔗</div>
                  </td>
                  <td style="padding-left:14px;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a2e;">Página de Links Personalizada</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Centralize todos os seus links importantes em uma única página com design profissional.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #f0f0f5;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:40px;vertical-align:top;padding-top:2px;">
                    <div style="width:36px;height:36px;background:#c8ff00;border-radius:10px;text-align:center;line-height:36px;font-size:18px;">📊</div>
                  </td>
                  <td style="padding-left:14px;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a2e;">Analytics em Tempo Real</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Acompanhe cliques, visualizações e engajamento da sua audiência.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td style="padding:20px;background:#f8fafc;border-radius:12px;border:1px solid #f0f0f5;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:40px;vertical-align:top;padding-top:2px;">
                    <div style="width:36px;height:36px;background:#c8ff00;border-radius:10px;text-align:center;line-height:36px;font-size:18px;">🎨</div>
                  </td>
                  <td style="padding-left:14px;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a2e;">Layouts Premium</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Múltiplos templates profissionais, Hero Reels, Spotlights e muito mais.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr><td align="center">
              <a href="https://in1.bio/app" style="display:inline-block;padding:16px 48px;background:#c8ff00;color:#0a0a0f;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:-0.2px;">
                Criar minha página agora
              </a>
            </td></tr>
          </table>

          <!-- Pro upsell -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;">
            <tr><td style="padding:28px;background:linear-gradient(135deg,#0a0a0f 0%,#1a1a2e 100%);border-radius:14px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;color:#c8ff00;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">✨ Upgrade Pro</p>
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#f5f5f7;letter-spacing:-0.5px;">Desbloqueie todo o potencial</h2>
              <p style="margin:0 0 20px;font-size:13px;color:#9ca3af;line-height:1.6;">
                Domínio personalizado · Analytics avançado · Layouts exclusivos · Selo verificado · Sem marca d'água
              </p>
              <a href="https://in1.bio/app/checkout?plan=pro" style="display:inline-block;padding:12px 32px;background:transparent;color:#c8ff00;font-size:13px;font-weight:700;text-decoration:none;border-radius:10px;border:2px solid #c8ff00;letter-spacing:-0.2px;">
                Conhecer planos →
              </a>
            </td></tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:28px 40px;background:#fafafa;border-top:1px solid #f0f0f0;text-align:center;">
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
            Dúvidas? Responda este e-mail — estamos aqui para ajudar.
          </p>
          <p style="margin:0;font-size:12px;color:#d1d5db;">
            © ${new Date().getFullYear()} in1.bio — Sua página de links premium
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "in1.bio <noreply@in1.bio>",
        to: [email],
        subject: `Bem-vindo à in1.bio, ${displayName}! 🎉`,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: data }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Welcome email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
