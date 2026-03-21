import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface OnboardingState {
  completed: boolean;
  needsOnboarding: boolean;
  loading: boolean;
  checklist: {
    creatorEdited: boolean;
    linkAdded: boolean;
    campaignCreated: boolean;
    published: boolean;
  };
  checklistProgress: number;
  dismissChecklist: () => void;
  checklistDismissed: boolean;
  refreshChecklist: () => Promise<void>;
}

const ONBOARDING_KEY = "kreatorz_onboarding_done";
const CHECKLIST_DISMISS_KEY = "kreatorz_checklist_dismissed";

export function useOnboarding(): OnboardingState {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(false);
  const [checklist, setChecklist] = useState({
    creatorEdited: false,
    linkAdded: false,
    campaignCreated: false,
    published: false,
  });

  const refreshChecklist = useCallback(async () => {
    if (!user) return;
    const { data: creators } = await supabase
      .from("creators")
      .select("id, name, bio, avatar_url")
      .eq("user_id", user.id);

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
        .from("creator_campaigns")
        .select("id")
        .in("creator_id", ids)
        .limit(1);
      campaignCreated = (campaigns?.length || 0) > 0;
    }

    // "published" = user has visited a creator public page (we track via localStorage)
    const published = !!localStorage.getItem("kreatorz_first_publish");

    setChecklist({ creatorEdited, linkAdded, campaignCreated, published });
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const done = localStorage.getItem(`${ONBOARDING_KEY}_${user.id}`);
    const dismissed = localStorage.getItem(`${CHECKLIST_DISMISS_KEY}_${user.id}`);
    setChecklistDismissed(!!dismissed);

    if (done) {
      setNeedsOnboarding(false);
      setLoading(false);
      refreshChecklist();
      return;
    }

    // Check if user has any creators (meaning they've been through onboarding or are existing)
    (async () => {
      const { data: creators } = await supabase
        .from("creators")
        .select("id")
        .eq("user_id", user.id);

      // If user has creators with links, they don't need onboarding
      if (creators && creators.length > 0) {
        const { data: links } = await supabase
          .from("creator_links")
          .select("id")
          .in("creator_id", creators.map(c => c.id))
          .limit(1);

        if (links && links.length > 0) {
          localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, "true");
          setNeedsOnboarding(false);
          setLoading(false);
          refreshChecklist();
          return;
        }
      }

      setNeedsOnboarding(true);
      setLoading(false);
    })();
  }, [user, refreshChecklist]);

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
