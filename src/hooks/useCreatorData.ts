import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { HeroReelData } from "@/components/kreatorz/creator/HeroReel";
import type { Testimonial } from "@/components/kreatorz/creator/TestimonialsSection";

export type ImageShapeValue = "rounded" | "circular" | "pill" | "shadow" | "polaroid";

export interface CreatorProfile {
  id: string;
  user_id: string | null;
  agency_id: string | null;
  name: string;
  slug: string;
  bio: string;
  avatar_url: string;
  cover_url: string;
  avatar_url_layout2: string;
  cover_url_layout2: string;
  verified: boolean;
  layout_type: string;
  image_shape: ImageShapeValue;
  image_shape_products: ImageShapeValue;
  image_shape_campaigns: ImageShapeValue;
  image_shape_links: ImageShapeValue;
  tags: { label: string; color?: string }[];
  stats: { value: string; label: string }[];
  brands: { name: string; logo_url?: string }[];
  brands_display_mode: "static" | "marquee";
  page_effects: { effects: string[]; color?: string; emojis?: string[]; intensity?: Record<string, number>; display_modes?: { links?: "list" | "carousel"; products?: "list" | "carousel"; campaigns?: "list" | "carousel" } };
  font_family: string;
  font_size: string;
  color_name: string | null;
  color_bio: string | null;
  color_section_titles: string | null;
  section_order: string[];
  spotify_url: string;
}

export interface CreatorLink {
  id: string;
  creator_id: string;
  title: string;
  url: string;
  subtitle: string;
  icon: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  bg_color: string | null;
  text_color: string | null;
  border_color: string | null;
  image_url: string | null;
  display_mode: "full" | "half";
}

export interface SocialLink {
  id: string;
  creator_id: string;
  platform: string;
  label: string;
  url: string;
  sort_order: number;
}

export interface CreatorProduct {
  id: string;
  creator_id: string;
  title: string;
  price: string;
  icon: string;
  url: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  bg_color: string | null;
  text_color: string | null;
  border_color: string | null;
}

export interface CreatorCampaign {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  image_url: string;
  url: string;
  live: boolean;
  is_active: boolean;
  sort_order: number;
  expires_at: string | null;
  bg_color: string | null;
  text_color: string | null;
  border_color: string | null;
}

export type { HeroReelData };

const normalizeProfile = (creator: any): CreatorProfile => ({
  ...creator,
  agency_id: creator.agency_id || null,
  slug: creator.slug || "",
  layout_type: creator.layout_type || "layout1",
  avatar_url_layout2: creator.avatar_url_layout2 || "",
  cover_url_layout2: creator.cover_url_layout2 || "",
  verified: creator.verified ?? false,
  image_shape: creator.image_shape || "rounded",
  image_shape_products: creator.image_shape_products || creator.image_shape || "rounded",
  image_shape_campaigns: creator.image_shape_campaigns || creator.image_shape || "rounded",
  image_shape_links: creator.image_shape_links || creator.image_shape || "rounded",
  font_family: creator.font_family || "default",
  font_size: creator.font_size || "medium",
  color_name: creator.color_name || null,
  color_bio: creator.color_bio || null,
  color_section_titles: creator.color_section_titles || null,
  section_order: Array.isArray(creator.section_order) ? creator.section_order : ["spotlight", "links", "products", "past_campaigns", "hero_reel", "testimonials"],
  tags: Array.isArray(creator.tags) ? (creator.tags as CreatorProfile["tags"]) : [],
  stats: Array.isArray(creator.stats) ? (creator.stats as CreatorProfile["stats"]) : [],
  brands: Array.isArray(creator.brands)
    ? (creator.brands as any[]).map((b: any) => typeof b === "string" ? { name: b } : b)
    : [],
  brands_display_mode: creator.brands_display_mode || "static",
  page_effects: (() => {
    const pe = creator.page_effects;
    if (!pe) return { effects: [], color: undefined, emojis: undefined, intensity: undefined };
    if (Array.isArray(pe)) return { effects: pe, color: undefined, emojis: undefined, intensity: undefined };
    if (typeof pe === "object" && Array.isArray((pe as any).effects)) return { effects: (pe as any).effects, color: (pe as any).color, emojis: (pe as any).emojis, intensity: (pe as any).intensity };
    return { effects: [], color: undefined, emojis: undefined, intensity: undefined };
  })(),
  spotify_url: creator.spotify_url || "",
});

export function useCreatorData(agencyId: string | undefined, creatorId?: string) {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [links, setLinks] = useState<CreatorLink[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [campaigns, setCampaigns] = useState<CreatorCampaign[]>([]);
  const [heroReels, setHeroReels] = useState<HeroReelData[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!agencyId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    let creator: any = null;

    if (creatorId) {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("id", creatorId)
        .eq("agency_id", agencyId)
        .maybeSingle();
      if (error) console.error("Error fetching creator:", error);
      creator = data;
    } else {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("agency_id", agencyId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) console.error("Error fetching creator profile:", error);
      creator = data;
    }

    if (!creator) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setProfile(normalizeProfile(creator));

    const [linksRes, socialRes, productsRes, campaignsRes, reelsRes, testimonialsRes] = await Promise.all([
      supabase.from("creator_links").select("*").eq("creator_id", creator.id).order("sort_order"),
      supabase.from("creator_social_links").select("*").eq("creator_id", creator.id).order("sort_order"),
      supabase.from("creator_products").select("*").eq("creator_id", creator.id).order("sort_order"),
      supabase.from("campaigns").select("*").eq("creator_id", creator.id).order("sort_order"),
      supabase.from("creator_hero_reels").select("*").eq("creator_id", creator.id).order("sort_order"),
      supabase.from("creator_testimonials").select("*").eq("creator_id", creator.id).order("sort_order"),
    ]);

    setLinks((linksRes.data as CreatorLink[]) || []);
    setSocialLinks((socialRes.data as SocialLink[]) || []);
    setProducts((productsRes.data as CreatorProduct[]) || []);
    setCampaigns((campaignsRes.data as CreatorCampaign[]) || []);
    setHeroReels((reelsRes.data as HeroReelData[]) || []);
    setTestimonials((testimonialsRes.data as Testimonial[]) || []);
    setLoading(false);
  }, [agencyId, creatorId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const persistProfile = useCallback(
    async (updates: Partial<CreatorProfile>) => {
      if (!profile || !agencyId) return null;

      const { data, error } = await supabase
        .from("creators")
        .update(updates as any)
        .eq("id", profile.id)
        .eq("agency_id", agencyId)
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Profile persist error:", error);
        return null;
      }

      if (!data) {
        console.error("Profile persist error: no creator row updated");
        return null;
      }

      const normalized = normalizeProfile(data);
      setProfile(normalized);
      return normalized;
    },
    [profile, agencyId]
  );

  const saveProfile = async (updates: Partial<CreatorProfile>) => {
    const updated = await persistProfile(updates);
    if (!updated) throw new Error("Erro ao salvar perfil");
  };

  const saveLinks = async (newLinks: CreatorLink[]) => {
    if (!profile) return;
    const normalizedLinks = newLinks.map((link, index) => ({ ...link, creator_id: profile.id, sort_order: index }));
    const { error: deleteError } = await supabase.from("creator_links").delete().eq("creator_id", profile.id);
    if (deleteError) throw deleteError;
    if (normalizedLinks.length > 0) {
      const { error } = await supabase.from("creator_links").insert(
        normalizedLinks.map((link) => ({ id: link.id, creator_id: link.creator_id, title: link.title, url: link.url, subtitle: link.subtitle || "", icon: link.icon || "🔗", is_featured: link.is_featured || false, is_active: link.is_active !== false, sort_order: link.sort_order, bg_color: link.bg_color || null, text_color: link.text_color || null, border_color: link.border_color || null, image_url: link.image_url || null, display_mode: link.display_mode || "full" }))
      );
      if (error) throw error;
    }
    setLinks(normalizedLinks);
  };

  const saveSocialLinks = async (newLinks: SocialLink[]) => {
    if (!profile) return;
    const normalizedLinks = newLinks.map((link, index) => ({ ...link, creator_id: profile.id, sort_order: index }));
    const { error: deleteError } = await supabase.from("creator_social_links").delete().eq("creator_id", profile.id);
    if (deleteError) throw deleteError;
    if (normalizedLinks.length > 0) {
      const { error } = await supabase.from("creator_social_links").insert(
        normalizedLinks.map((link) => ({ id: link.id, creator_id: link.creator_id, platform: link.platform, label: link.label || "", url: link.url, sort_order: link.sort_order }))
      );
      if (error) throw error;
    }
    setSocialLinks(normalizedLinks);
  };

  const saveProducts = async (newProducts: CreatorProduct[]) => {
    if (!profile) return;
    const normalized = newProducts.map((p, i) => ({ ...p, creator_id: profile.id, sort_order: i }));
    const { error: deleteError } = await supabase.from("creator_products").delete().eq("creator_id", profile.id);
    if (deleteError) throw deleteError;
    if (normalized.length > 0) {
      const { error } = await supabase.from("creator_products").insert(
        normalized.map((p) => ({ id: p.id, creator_id: p.creator_id, title: p.title, price: p.price || "", icon: p.icon || "📦", url: p.url || "", image_url: p.image_url || "", sort_order: p.sort_order, bg_color: p.bg_color || null, text_color: p.text_color || null, border_color: p.border_color || null }))
      );
      if (error) throw error;
    }
    setProducts(normalized);
  };

  const saveCampaigns = async (newCampaigns: CreatorCampaign[]) => {
    if (!profile) return;
    const normalized = newCampaigns.map((c, i) => ({ ...c, creator_id: profile.id, sort_order: i }));
    const { error: deleteError } = await supabase.from("campaigns").delete().eq("creator_id", profile.id);
    if (deleteError) throw deleteError;
    if (normalized.length > 0) {
      const { error } = await supabase.from("campaigns").insert(
        normalized.map((c) => ({ id: c.id, creator_id: c.creator_id, title: c.title, description: c.description || "", image_url: c.image_url || "", url: c.url || "", live: c.live || false, sort_order: c.sort_order, expires_at: c.expires_at || null, bg_color: c.bg_color || null, text_color: c.text_color || null, border_color: c.border_color || null }))
      );
      if (error) throw error;
    }
    setCampaigns(normalized);
  };

  const saveHeroReels = async (newReels: HeroReelData[]) => {
    if (!profile) return;
    const normalized = newReels.map((r, i) => ({ ...r, creator_id: profile.id, sort_order: i }));
    const { error: deleteError } = await supabase.from("creator_hero_reels").delete().eq("creator_id", profile.id);
    if (deleteError) throw deleteError;
    if (normalized.length > 0) {
      const { error } = await supabase.from("creator_hero_reels").insert(
        normalized.map((r) => ({
          id: r.id, creator_id: r.creator_id, title: r.title || "", subtitle: r.subtitle || "",
          video_url: r.video_url || "", thumbnail_url: r.thumbnail_url || "",
          cta_label: r.cta_label || "", cta_url: r.cta_url || "",
          aspect_ratio: r.aspect_ratio || "9:16", playback_mode: r.playback_mode || "autoplay",
          is_active: r.is_active !== false, sort_order: r.sort_order,
        }))
      );
      if (error) throw error;
    }
    setHeroReels(normalized);
  };

  const saveTestimonials = async (newTestimonials: Testimonial[]) => {
    if (!profile) return;
    const normalized = newTestimonials.map((t, i) => ({ ...t, creator_id: profile.id, sort_order: i }));
    const { error: deleteError } = await supabase.from("creator_testimonials").delete().eq("creator_id", profile.id);
    if (deleteError) throw deleteError;
    if (normalized.length > 0) {
      const { error } = await supabase.from("creator_testimonials").insert(
        normalized.map((t) => ({
          id: t.id, creator_id: t.creator_id, author_name: t.author_name || "",
          author_role: t.author_role || "", author_avatar_url: t.author_avatar_url || "",
          content: t.content || "", rating: t.rating ?? 5,
          is_active: t.is_active !== false, sort_order: t.sort_order,
        }))
      );
      if (error) throw error;
    }
    setTestimonials(normalized);
  };

  const uploadImage = async (file: File, type: "avatar" | "cover" | "avatar_layout2" | "cover_layout2"): Promise<string | null> => {
    if (!agencyId || !profile) return null;
    const bucket = type.startsWith("avatar") ? "avatars" : "covers";
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${agencyId}/${profile.id}/${type}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type || "image/jpeg" });
    if (uploadError) { toast.error("Erro no upload: " + uploadError.message); return null; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = data.publicUrl;
    const fieldMap: Record<string, keyof CreatorProfile> = { avatar: "avatar_url", cover: "cover_url", avatar_layout2: "avatar_url_layout2", cover_layout2: "cover_url_layout2" };
    const field = fieldMap[type];
    const updated = await persistProfile({ [field]: publicUrl } as Partial<CreatorProfile>);
    if (!updated) { toast.error("Imagem enviada, mas não salva no perfil."); return null; }
    return (updated[field] as string) || publicUrl;
  };

  const uploadContentImage = async (file: File, folder: string): Promise<string | null> => {
    if (!agencyId || !profile) return null;
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${agencyId}/${profile.id}/${folder}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("content").upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type || "image/jpeg" });
    if (uploadError) { toast.error("Erro no upload: " + uploadError.message); return null; }
    const { data } = supabase.storage.from("content").getPublicUrl(path);
    return data.publicUrl;
  };

  return {
    profile, links, socialLinks, products, campaigns, heroReels, testimonials, loading,
    saveProfile, saveLinks, saveSocialLinks, saveProducts, saveCampaigns, saveHeroReels, saveTestimonials,
    uploadImage, uploadContentImage, refetch: fetchData,
  };
}
