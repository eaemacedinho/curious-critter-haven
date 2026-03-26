import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

// Reward thresholds
const REWARD_3_FRIENDS_PRO_DAYS = 3;
const REWARD_5_FRIENDS_DISCOUNT = 10;
const REWARD_10_FRIENDS_BADGE_DAYS = 15;

async function applyRewards(supabase: any, referrerId: string, totalConverted: number) {
  try {
    const { data: referrerProfile } = await supabase
      .from("profiles")
      .select("agency_id")
      .eq("id", referrerId)
      .single();

    if (!referrerProfile?.agency_id) return;

    const agencyId = referrerProfile.agency_id;

    // Reward: 3 friends → 3 days Pro free
    if (totalConverted === 3) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("agency_id", agencyId)
        .single();

      if (sub && (sub.plan === "free" || sub.status !== "active")) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REWARD_3_FRIENDS_PRO_DAYS);

        await supabase
          .from("subscriptions")
          .update({
            plan: "pro",
            status: "active",
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
            payment_provider: "referral_reward",
          })
          .eq("agency_id", agencyId);

        console.log(`Reward applied: 3 days Pro for referrer ${referrerId}`);
      }
    }

    // Reward: 5 friends → 10% discount coupon for Pro (30 days)
    if (totalConverted === 5) {
      const couponCode = `REF10-${referrerId.slice(0, 6).toUpperCase()}`;

      // Check if coupon already exists
      const { data: existingCoupon } = await supabase
        .from("coupons")
        .select("id")
        .eq("code", couponCode)
        .maybeSingle();

      if (!existingCoupon) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await supabase.from("coupons").insert({
          code: couponCode,
          discount_percent: REWARD_5_FRIENDS_DISCOUNT,
          valid_plans: ["pro"],
          is_active: true,
          max_uses: 1,
          expires_at: expiresAt.toISOString(),
        });

        console.log(`Reward applied: 10% coupon ${couponCode} for referrer ${referrerId}`);
      }
    }

    // Reward: 10 friends → verified badge for 15 days
    if (totalConverted === 10) {
      // Find the referrer's creators and set verified
      const { data: creators } = await supabase
        .from("creators")
        .select("id")
        .eq("agency_id", agencyId);

      if (creators && creators.length > 0) {
        for (const creator of creators) {
          await supabase
            .from("creators")
            .update({ verified: true })
            .eq("id", creator.id);
        }
        console.log(`Reward applied: verified badge for referrer ${referrerId}, ${creators.length} creators`);
      }
    }
  } catch (err) {
    console.error("Error applying rewards:", err);
  }
}

async function sendReferralNotification(referrerEmail: string, referrerName: string, referredName: string, convertedCount: number) {
  let rewardText = "";
  if (convertedCount === 3) {
    rewardText = "🎁 Recompensa desbloqueada: 3 dias de Pro grátis!";
  } else if (convertedCount === 5) {
    rewardText = "🏷️ Recompensa desbloqueada: Cupom de 10% no Pro!";
  } else if (convertedCount === 10) {
    rewardText = "✅ Recompensa desbloqueada: Selo verificado por 15 dias!";
  } else if (convertedCount < 3) {
    rewardText = `Faltam ${3 - convertedCount} convite(s) para ganhar 3 dias de Pro grátis ⭐`;
  } else if (convertedCount < 5) {
    rewardText = `Faltam ${5 - convertedCount} convite(s) para ganhar 10% de desconto 🏷️`;
  } else if (convertedCount < 10) {
    rewardText = `Faltam ${10 - convertedCount} convite(s) para o selo verificado ✅`;
  }

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
              
              <hr style="margin:16px 0;border:none;border-top:1px solid #f0f0f0;" />
              <p style="margin:0;font-size:13px;color:#1a1a2e;font-weight:600;">
                ${rewardText}
              </p>
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

    // Get referred user's name (may need to wait for profile trigger)
    let referredName = "";
    const { data: referredProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user_id)
      .maybeSingle();

    if (referredProfile) {
      referredName = referredProfile.full_name || referredProfile.email || "";
    }

    // Create the referral record
    const { error } = await supabase.from("referrals").insert({
      referrer_user_id: referrer.id,
      referred_user_id: user_id,
      referred_email: referredProfile?.email || null,
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

    // Count total conversions for referrer
    const { count: totalConverted } = await supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("referrer_user_id", referrer.id)
      .eq("status", "converted");

    const convertedCount = totalConverted || 1;

    // Apply rewards based on thresholds
    await applyRewards(supabase, referrer.id, convertedCount);

    // Send notification email to referrer
    if (referrer.email) {
      await sendReferralNotification(
        referrer.email,
        referrer.full_name || "Creator",
        referredName,
        convertedCount
      );
    }

    return new Response(JSON.stringify({ success: true, converted_count: convertedCount }), {
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
