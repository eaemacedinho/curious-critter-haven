import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

export type PlanType = "free" | "pro" | "scale";

export interface PlanLimits {
  plan: PlanType;
  max_creators: number;
  max_links: number;
  max_products: number;
  max_campaigns: number;
  max_hero_reels: number;
  allow_analytics: boolean;
  allow_custom_colors: boolean;
  allow_layout_immersive: boolean;
  allow_page_effects: boolean;
  allow_verified_badge: boolean;
  allow_remove_branding: boolean;
  allow_custom_domain: boolean;
  allow_team_members: boolean;
}

export interface Subscription {
  id: string;
  agency_id: string;
  plan: PlanType;
  status: string;
  started_at: string;
  expires_at: string | null;
}

const FREE_LIMITS: PlanLimits = {
  plan: "free",
  max_creators: 1,
  max_links: 5,
  max_products: 3,
  max_campaigns: 0,
  max_hero_reels: 0,
  allow_analytics: false,
  allow_custom_colors: false,
  allow_layout_immersive: false,
  allow_page_effects: false,
  allow_verified_badge: false,
  allow_remove_branding: false,
  allow_custom_domain: false,
  allow_team_members: false,
};

export function useSubscription() {
  const { agency } = useTenant();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [limits, setLimits] = useState<PlanLimits>(FREE_LIMITS);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!agency?.id) {
      setSubscription(null);
      setLimits(FREE_LIMITS);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [subRes, limitsRes, profileRes] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("*")
        .eq("agency_id", agency.id)
        .maybeSingle(),
      supabase.from("plan_limits").select("*"),
      supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("id", (await supabase.auth.getUser()).data.user?.id || "")
        .maybeSingle(),
    ]);

    const sub = subRes.data as Subscription | null;
    setSubscription(sub);

    // Check super admin from DB (not email)
    setIsSuperAdmin(profileRes.data?.is_super_admin === true);

    // If canceled but expires_at is in the future, keep the current plan active
    let effectivePlan: PlanType = "free";
    if (sub) {
      if (sub.status === "active") {
        effectivePlan = sub.plan;
      } else if (sub.status === "canceled" && sub.expires_at) {
        const expiresAt = new Date(sub.expires_at);
        if (expiresAt > new Date()) {
          effectivePlan = sub.plan;
        }
      }
    }

    const allLimits = (limitsRes.data || []) as unknown as PlanLimits[];
    const planLimits = allLimits.find((l) => l.plan === effectivePlan);
    setLimits(planLimits || FREE_LIMITS);
    setLoading(false);
  }, [agency?.id]);

  useEffect(() => {
    void fetchSubscription();
  }, [fetchSubscription]);

  // Derive effective plan considering canceled-but-still-active subscriptions
  const currentPlan: PlanType = (() => {
    if (!subscription) return "free";
    if (subscription.status === "active") return subscription.plan;
    if (subscription.status === "canceled" && subscription.expires_at) {
      return new Date(subscription.expires_at) > new Date() ? subscription.plan : "free";
    }
    return "free";
  })();
  const isPro = currentPlan === "pro" || currentPlan === "scale";
  const isScale = currentPlan === "scale";

  return {
    subscription,
    limits,
    currentPlan,
    isPro,
    isScale,
    loading,
    refetch: fetchSubscription,
    isSuperAdmin,
    canUse: (feature: keyof Omit<PlanLimits, "plan" | `max_${string}`>) => {
      if (isSuperAdmin) return true;
      return limits[feature] === true;
    },
    isWithinLimit: (resource: "creators" | "links" | "products" | "campaigns" | "hero_reels", count: number) => {
      if (isSuperAdmin) return true;
      const key = `max_${resource}` as keyof PlanLimits;
      const max = limits[key] as number;
      return count < max;
    },
  };
}
