import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ImageShapeValue = "rounded" | "circular" | "pill" | "shadow" | "polaroid";

export interface CreatorProfile {
  id: string;
  user_id: string;
  agency_id: string | null;
  name: string;
  handle: string;
  bio: string;
  avatar_url: string;
  cover_url: string;
  avatar_url_layout2: string;
  cover_url_layout2: string;
  verified: boolean;
  public_layout: string;
  image_shape: ImageShapeValue;
  image_shape_products: ImageShapeValue;
  image_shape_campaigns: ImageShapeValue;
  image_shape_links: ImageShapeValue;
  tags: { label: string; color?: string }[];
  stats: { value: string; label: string }[];
  brands: { name: string; logo_url?: string }[];
}

export interface CreatorLink {
  id: string;
  creator_id: string;
  title: string;
  url: string;
  subtitle: string;
  icon: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
  bg_color: string | null;
  text_color: string | null;
  border_color: string | null;
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
  sort_order: number;
  expires_at: string | null;
  bg_color: string | null;
  text_color: string | null;
  border_color: string | null;
}

const normalizeProfile = (creator: any): CreatorProfile => ({
  ...creator,
  agency_id: creator.agency_id || null,
  avatar_url_layout2: creator.avatar_url_layout2 || "",
  cover_url_layout2: creator.cover_url_layout2 || "",
  verified: creator.verified ?? false,
  public_layout: creator.public_layout || "layout1",
  image_shape: creator.image_shape || "rounded",
  image_shape_products: creator.image_shape_products || creator.image_shape || "rounded",
  image_shape_campaigns: creator.image_shape_campaigns || creator.image_shape || "rounded",
  image_shape_links: creator.image_shape_links || creator.image_shape || "rounded",
  tags: Array.isArray(creator.tags) ? (creator.tags as CreatorProfile["tags"]) : [],
  stats: Array.isArray(creator.stats) ? (creator.stats as CreatorProfile["stats"]) : [],
  brands: Array.isArray(creator.brands)
    ? (creator.brands as any[]).map((b: any) => typeof b === "string" ? { name: b } : b)
    : [],
});

/**
 * Hook to manage creator data.
 * - If `creatorId` is provided, loads that specific creator.
 * - If only `userId` is provided, loads the first creator for that user (legacy compat).
 */
export function useCreatorData(userId: string | undefined, creatorId?: string) {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [links, setLinks] = useState<CreatorLink[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [campaigns, setCampaigns] = useState<CreatorCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userId) {
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
        .eq("user_id", userId)
        .maybeSingle();
      if (error) console.error("Error fetching creator:", error);
      creator = data;
    } else {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("user_id", userId)
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

    const [linksRes, socialRes, productsRes, campaignsRes] = await Promise.all([
      supabase.from("creator_links").select("*").eq("creator_id", creator.id).order("sort_order"),
      supabase.from("creator_social_links").select("*").eq("creator_id", creator.id).order("sort_order"),
      supabase.from("creator_products").select("*").eq("creator_id", creator.id).order("sort_order"),
      supabase.from("creator_campaigns").select("*").eq("creator_id", creator.id).order("sort_order"),
    ]);

    setLinks((linksRes.data as CreatorLink[]) || []);
    setSocialLinks((socialRes.data as SocialLink[]) || []);
    setProducts((productsRes.data as CreatorProduct[]) || []);
    setCampaigns((campaignsRes.data as CreatorCampaign[]) || []);
    setLoading(false);
  }, [userId, creatorId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const persistProfile = useCallback(
    async (updates: Partial<CreatorProfile>) => {
      if (!profile || !userId) return null;

      const { data, error } = await supabase
        .from("creators")
        .update(updates as any)
        .eq("id", profile.id)
        .eq("user_id", userId)
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
    [profile, userId]
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
        normalizedLinks.map((link) => ({ id: link.id, creator_id: link.creator_id, title: link.title, url: link.url, subtitle: link.subtitle || "", icon: link.icon || "🔗", featured: link.featured || false, active: link.active !== false, sort_order: link.sort_order, bg_color: link.bg_color || null, text_color: link.text_color || null, border_color: link.border_color || null }))
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
        normalized.map((p) => ({ id: p.id, creator_id: p.creator_id, title: p.title, price: p.price || "", icon: p.icon || "📦", url: p.url || "", image_url: p.image_url || "", sort_order: p.sort_order }))
      );
      if (error) throw error;
    }
    setProducts(normalized);
  };

  const saveCampaigns = async (newCampaigns: CreatorCampaign[]) => {
    if (!profile) return;
    const normalized = newCampaigns.map((c, i) => ({ ...c, creator_id: profile.id, sort_order: i }));
    const { error: deleteError } = await supabase.from("creator_campaigns").delete().eq("creator_id", profile.id);
    if (deleteError) throw deleteError;
    if (normalized.length > 0) {
      const { error } = await supabase.from("creator_campaigns").insert(
        normalized.map((c) => ({ id: c.id, creator_id: c.creator_id, title: c.title, description: c.description || "", image_url: c.image_url || "", url: c.url || "", live: c.live || false, sort_order: c.sort_order, expires_at: c.expires_at || null }))
      );
      if (error) throw error;
    }
    setCampaigns(normalized);
  };

  const uploadImage = async (file: File, type: "avatar" | "cover" | "avatar_layout2" | "cover_layout2"): Promise<string | null> => {
    if (!userId || !profile) return null;
    const bucket = type.startsWith("avatar") ? "avatars" : "covers";
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${type}-${Date.now()}.${ext}`;
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
    if (!userId) return null;
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${folder}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("content").upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type || "image/jpeg" });
    if (uploadError) { toast.error("Erro no upload: " + uploadError.message); return null; }
    const { data } = supabase.storage.from("content").getPublicUrl(path);
    return data.publicUrl;
  };

  return {
    profile, links, socialLinks, products, campaigns, loading,
    saveProfile, saveLinks, saveSocialLinks, saveProducts, saveCampaigns,
    uploadImage, uploadContentImage, refetch: fetchData,
  };
}
