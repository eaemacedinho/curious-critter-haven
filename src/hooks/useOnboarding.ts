import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useTenant } from "./useTenant";

export interface OnboardingState {
  completed: boolean;
  needsOnboarding: boolean;
  loading: boolean;
  freshOnboarding: boolean;
  checklist: {
    creatorEdited: boolean;
    linkAdded: boolean;
    campaignCreated: boolean;
    published: boolean;
  };
  checklistProgress: number;
  dismissChecklist: () => void;
  checklistDismissed: boolean;
  refreshChecklist: () => void;
  markTourDone: () => void;
}

const ONBOARDING_KEY = "in1_onboarding_done";
const CHECKLIST_DISMISS_KEY = "in1_checklist_dismissed";

export function useOnboarding(): OnboardingState {
  const { user } = useAuth();
  const { agency } = useTenant();
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [freshOnboarding, setFreshOnboarding] = useState(false);
  const [tourDone, setTourDone] = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(false);
  const [checklist, setChecklist] = useState({
    creatorEdited: false,
    linkAdded: false,
    campaignCreated: false,
    published: false,
  });

  const refreshChecklist = useCallback(async () => {
    if (!agency) return;
    const { data: creators } = await supabase
      .from("creators")
      .select("id, name, bio, avatar_url")
      .eq("agency_id", agency.id);

    const hasCreators = (creators?.length || 0) > 0;
    const creatorEdited = creators?.some(c => c.bio && c.bio.length > 0 && c.avatar_url && c.avatar_url.length > 0) || false;

    let linkAdded = false;
    let campaignCreated = false;

    if (hasCreators) {
      const ids = creators!.map(c => c.id);
      const { data: links } = await supabase
        .from("creator_links")
        .select("id")
        .in("creator_id", ids)
        .limit(1);
      linkAdded = (links?.length || 0) > 0;

      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id")
        .in("creator_id", ids)
        .limit(1);
      campaignCreated = (campaigns?.length || 0) > 0;
    }

    const published = !!localStorage.getItem("in1_first_publish");

    setChecklist({ creatorEdited, linkAdded, campaignCreated, published });
  }, [agency]);

  useEffect(() => {
    if (!user || !agency) {
      setLoading(false);
      return;
    }

    const done = localStorage.getItem(`${ONBOARDING_KEY}_${user.id}`);
    const dismissed = localStorage.getItem(`${CHECKLIST_DISMISS_KEY}_${user.id}`);
    const tourAlreadyDone = localStorage.getItem(`in1_tour_done_${user.id}`);
    setChecklistDismissed(!!dismissed);
    setTourDone(!!tourAlreadyDone);

    if (done) {
      setNeedsOnboarding(false);
      setFreshOnboarding(false);
      setLoading(false);
      refreshChecklist();
      return;
    }

    (async () => {
      const { data: settings } = await supabase
        .from("agency_settings")
        .select("onboarding_completed")
        .eq("agency_id", agency.id)
        .maybeSingle();

      if (settings?.onboarding_completed) {
        localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, "true");
        setNeedsOnboarding(false);
        setFreshOnboarding(false);
        setLoading(false);
        refreshChecklist();
        return;
      }

      setNeedsOnboarding(true);
      setLoading(false);
    })();
  }, [user, agency, refreshChecklist]);

  const completed = !needsOnboarding;

  const dismissChecklist = () => {
    if (user) {
      localStorage.setItem(`${CHECKLIST_DISMISS_KEY}_${user.id}`, "true");
    }
    setChecklistDismissed(true);
  };

  const checklistProgress = [
    checklist.creatorEdited,
    checklist.linkAdded,
    checklist.campaignCreated,
    checklist.published,
  ].filter(Boolean).length;

  return {
    completed,
    needsOnboarding,
    loading,
    checklist,
    checklistProgress,
    dismissChecklist,
    checklistDismissed,
    refreshChecklist,
  };
}

export function markOnboardingDone(userId: string) {
  localStorage.setItem(`${ONBOARDING_KEY}_${userId}`, "true");
}

export function resetOnboarding(userId: string) {
  localStorage.removeItem(`${ONBOARDING_KEY}_${userId}`);
  localStorage.removeItem(`${CHECKLIST_DISMISS_KEY}_${userId}`);
  localStorage.removeItem("in1_confetti_shown");
  localStorage.removeItem("in1_tour_done_" + userId);
}
