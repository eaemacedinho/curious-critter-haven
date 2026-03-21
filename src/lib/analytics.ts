import { supabase } from "@/integrations/supabase/client";

interface TrackEventParams {
  event_type: "page_view" | "link_click" | "campaign_click";
  creator_id: string;
  agency_id?: string | null;
  link_id?: string | null;
  campaign_id?: string | null;
  metadata?: Record<string, unknown>;
}

export async function trackEvent({
  event_type,
  creator_id,
  agency_id,
  link_id,
  campaign_id,
  metadata,
}: TrackEventParams) {
  try {
    await supabase.from("analytics_events").insert({
      event_type,
      creator_id,
      agency_id: agency_id || null,
      link_id: link_id || null,
      campaign_id: campaign_id || null,
      metadata: metadata || {},
    });
  } catch {
    // Silent fail — analytics should never break the user experience
  }
}
