import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

const REF_STORAGE_KEY = "in1_ref_code";

export interface ReferralData {
  referralCode: string | null;
  referralLink: string;
  totalReferrals: number;
  convertedReferrals: number;
  rewards: ReferralReward[];
  loading: boolean;
}

export interface ReferralReward {
  id: string;
  label: string;
  description: string;
  icon: string;
  threshold: number;
  unlocked: boolean;
}

const REWARDS: Omit<ReferralReward, "unlocked">[] = [
  { id: "custom_theme", label: "Tema Exclusivo", description: "Desbloqueie temas premium para sua página", icon: "🎨", threshold: 3 },
  { id: "premium_highlight", label: "Destaque Premium", description: "Seu perfil ganha destaque especial", icon: "⭐", threshold: 5 },
  { id: "verified_seal", label: "Selo Verificado", description: "Badge exclusivo de creator verificado", icon: "✅", threshold: 10 },
];

/** Capture ?ref= param from URL and store it */
export function captureReferralCode() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    try {
      localStorage.setItem(REF_STORAGE_KEY, ref);
    } catch {}
    const url = new URL(window.location.href);
    url.searchParams.delete("ref");
    window.history.replaceState({}, "", url.toString());
  }
}

/** Get stored referral code */
export function getStoredReferralCode(): string | null {
  try {
    return localStorage.getItem(REF_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Clear stored referral code after signup */
export function clearStoredReferralCode() {
  try {
    localStorage.removeItem(REF_STORAGE_KEY);
  } catch {}
}

/** Link referral after signup — uses edge function for service-role access */
export async function linkReferralOnSignup(newUserId: string) {
  const refCode = getStoredReferralCode();
  if (!refCode) return;

  try {
    await supabase.functions.invoke("link-referral", {
      body: { ref_code: refCode, user_id: newUserId },
    });
    clearStoredReferralCode();
  } catch (err) {
    console.error("Error linking referral:", err);
  }
}

export function useReferral(): ReferralData {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [convertedReferrals, setConvertedReferrals] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.referral_code) {
      setReferralCode(profile.referral_code);
    }

    const { count: total } = await supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("referrer_user_id", user.id);

    const { count: converted } = await supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("referrer_user_id", user.id)
      .eq("status", "converted");

    setTotalReferrals(total || 0);
    setConvertedReferrals(converted || 0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, fetchData]);

  // Realtime subscription for new conversions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("referrals-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "referrals",
          filter: `referrer_user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as { status?: string; referred_email?: string };
          if (row.status === "converted") {
            toast.success("🎉 Nova indicação convertida!", {
              description: "Alguém aceitou seu convite e criou uma conta!",
            });
          }
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchData]);

  const rewards: ReferralReward[] = REWARDS.map((r) => ({
    ...r,
    unlocked: convertedReferrals >= r.threshold,
  }));

  const referralLink = referralCode
    ? `${window.location.origin}/convite?ref=${referralCode}`
    : "";

  return { referralCode, referralLink, totalReferrals, convertedReferrals, rewards, loading };
}
