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
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!agency?.id) {
      setSubscription(null);
      setLimits(FREE_LIMITS);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [subRes, limitsRes] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("*")
        .eq("agency_id", agency.id)
        .maybeSingle(),
      supabase.from("plan_limits").select("*"),
    ]);

    const sub = subRes.data as Subscription | null;
    setSubscription(sub);

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

  const currentPlan = subscription?.plan || "free";
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
    // Helper to check if a feature is available
    canUse: (feature: keyof Omit<PlanLimits, "plan" | `max_${string}`>) => {
      return limits[feature] === true;
    },
    // Helper to check count limits
    isWithinLimit: (resource: "creators" | "links" | "products" | "campaigns" | "hero_reels", count: number) => {
      const key = `max_${resource}` as keyof PlanLimits;
      const max = limits[key] as number;
      return count < max;
    },
  };
}
