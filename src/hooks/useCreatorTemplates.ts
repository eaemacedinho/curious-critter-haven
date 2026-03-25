import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign } from "./useCreatorData";
import type { HeroReelData } from "@/components/kreatorz/creator/HeroReel";
import type { Testimonial } from "@/components/kreatorz/creator/TestimonialsSection";

export interface SavedTemplate {
  id: string;
  name: string;
  template_data: TemplateData;
  created_at: string;
  updated_at: string;
}

export interface TemplateData {
  profile: Partial<CreatorProfile>;
  links: CreatorLink[];
  socialLinks: SocialLink[];
  products: CreatorProduct[];
  campaigns: CreatorCampaign[];
  heroReels: HeroReelData[];
  testimonials: Testimonial[];
}

export function useCreatorTemplates(agencyId?: string, creatorId?: string) {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!agencyId || !creatorId) return;
    setLoading(true);
    const { data } = await supabase
      .from("creator_templates" as any)
      .select("*")
      .eq("agency_id", agencyId)
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: true });
    setTemplates((data as any as SavedTemplate[]) || []);
    setLoading(false);
  }, [agencyId, creatorId]);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const saveTemplate = async (name: string, data: TemplateData): Promise<SavedTemplate | null> => {
    if (!agencyId || !creatorId) return null;
    const { data: row, error } = await supabase
      .from("creator_templates" as any)
      .insert({ agency_id: agencyId, creator_id: creatorId, name, template_data: data as any })
      .select()
      .single();
    if (error) return null;
    await fetchTemplates();
    return row as any;
  };

  const updateTemplate = async (templateId: string, data: TemplateData): Promise<boolean> => {
    const { error } = await supabase
      .from("creator_templates" as any)
      .update({ template_data: data as any, updated_at: new Date().toISOString() })
      .eq("id", templateId);
    if (error) return false;
    await fetchTemplates();
    return true;
  };

  const deleteTemplate = async (templateId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("creator_templates" as any)
      .delete()
      .eq("id", templateId);
    if (error) return false;
    await fetchTemplates();
    return true;
  };

  const renameTemplate = async (templateId: string, name: string): Promise<boolean> => {
    const { error } = await supabase
      .from("creator_templates" as any)
      .update({ name })
      .eq("id", templateId);
    if (error) return false;
    await fetchTemplates();
    return true;
  };

  return { templates, loading, fetchTemplates, saveTemplate, updateTemplate, deleteTemplate, renameTemplate };
}
