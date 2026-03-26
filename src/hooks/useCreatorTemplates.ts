import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign } from "./useCreatorData";
import type { HeroReelData } from "@/components/kreatorz/creator/HeroReel";
import type { Testimonial } from "@/components/kreatorz/creator/TestimonialsSection";

export interface SavedTemplate {
  id: string;
  creator_id: string | null;
  name: string;
  template_data: TemplateData;
  is_default: boolean;
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
  sourceGalleryTemplateId?: string | null;
}

export function useCreatorTemplates(agencyId?: string, creatorId?: string) {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [defaultTemplate, setDefaultTemplate] = useState<SavedTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!agencyId) return;
    setLoading(true);

    // Fetch agency default template + ALL non-default agency templates
    const [defaultRes, allRes] = await Promise.all([
      supabase
        .from("creator_templates" as any)
        .select("*")
        .eq("agency_id", agencyId)
        .eq("is_default", true)
        .maybeSingle(),
      supabase
        .from("creator_templates" as any)
        .select("*")
        .eq("agency_id", agencyId)
        .eq("is_default", false)
        .order("created_at", { ascending: true }),
    ]);

    setDefaultTemplate((defaultRes.data as any as SavedTemplate) || null);
    setTemplates(((allRes as any).data as any as SavedTemplate[]) || []);
    setLoading(false);
  }, [agencyId]);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const saveTemplate = async (name: string, data: TemplateData): Promise<SavedTemplate | null> => {
    if (!agencyId || !creatorId) return null;
    const { data: row, error } = await supabase
      .from("creator_templates" as any)
      .insert({ agency_id: agencyId, creator_id: creatorId, name, template_data: data as any, is_default: false })
      .select()
      .single();
    if (error) return null;
    await fetchTemplates();
    return row as any;
  };

  const saveDefaultTemplate = async (data: TemplateData): Promise<boolean> => {
    if (!agencyId) return false;
    if (defaultTemplate) {
      // Update existing
      const { error } = await supabase
        .from("creator_templates" as any)
        .update({ template_data: data as any, updated_at: new Date().toISOString() })
        .eq("id", defaultTemplate.id);
      if (error) return false;
    } else {
      // Create new
      const { error } = await supabase
        .from("creator_templates" as any)
        .insert({ agency_id: agencyId, creator_id: null, name: "Meu Padrão", template_data: data as any, is_default: true })
        .select()
        .single();
      if (error) return false;
    }
    await fetchTemplates();
    return true;
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

  return {
    templates,
    defaultTemplate,
    loading,
    fetchTemplates,
    saveTemplate,
    saveDefaultTemplate,
    updateTemplate,
    deleteTemplate,
    renameTemplate,
  };
}
