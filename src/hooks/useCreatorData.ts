import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreatorProfile {
  id: string;
  user_id: string;
  name: string;
  handle: string;
  bio: string;
  avatar_url: string;
  cover_url: string;
  tags: { label: string; color?: string }[];
  stats: { value: string; label: string }[];
  brands: string[];
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
  sort_order: number;
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
}

export function useCreatorData(userId: string | undefined) {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [links, setLinks] = useState<CreatorLink[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [campaigns, setCampaigns] = useState<CreatorCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    const { data: creator } = await supabase
      .from("creators")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!creator) { setLoading(false); return; }

    const parsed: CreatorProfile = {
      ...creator,
      tags: Array.isArray(creator.tags) ? creator.tags as any : [],
      stats: Array.isArray(creator.stats) ? creator.stats as any : [],
      brands: Array.isArray(creator.brands) ? creator.brands as any : [],
    };
    setProfile(parsed);

    const [linksRes, socialRes, productsRes, campaignsRes] = await Promise.all([
      supabase.from("creator_links").select("*").eq("creator_id", creator.id).order("sort_order"),
      supabase.from("creator_social_links").select("*").eq("creator_id", creator.id).order("sort_order"),
      supabase.from("creator_products").select("*").eq("creator_id", creator.id).order("sort_order"),
      supabase.from("creator_campaigns").select("*").eq("creator_id", creator.id).order("sort_order"),
    ]);

    setLinks((linksRes.data as any) || []);
    setSocialLinks((socialRes.data as any) || []);
    setProducts((productsRes.data as any) || []);
    setCampaigns((campaignsRes.data as any) || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveProfile = async (updates: Partial<CreatorProfile>) => {
    if (!profile) return;
    const { error } = await supabase.from("creators").update(updates).eq("id", profile.id);
    if (error) { toast.error("Erro ao salvar perfil"); return; }
    setProfile({ ...profile, ...updates });
    toast.success("Perfil salvo!");
  };

  const saveLinks = async (newLinks: CreatorLink[]) => {
    if (!profile) return;
    // Delete existing, re-insert
    await supabase.from("creator_links").delete().eq("creator_id", profile.id);
    if (newLinks.length > 0) {
      const toInsert = newLinks.map((l, i) => ({
        creator_id: profile.id,
        title: l.title,
        url: l.url,
        subtitle: l.subtitle || "",
        icon: l.icon || "🔗",
        featured: l.featured || false,
        active: l.active !== false,
        sort_order: i,
      }));
      await supabase.from("creator_links").insert(toInsert);
    }
    await fetchData();
  };

  const saveSocialLinks = async (newLinks: SocialLink[]) => {
    if (!profile) return;
    await supabase.from("creator_social_links").delete().eq("creator_id", profile.id);
    if (newLinks.length > 0) {
      const toInsert = newLinks.map((l, i) => ({
        creator_id: profile.id,
        platform: l.platform,
        label: l.label || "",
        url: l.url,
        sort_order: i,
      }));
      await supabase.from("creator_social_links").insert(toInsert);
    }
    await fetchData();
  };

  const saveProducts = async (newProducts: CreatorProduct[]) => {
    if (!profile) return;
    await supabase.from("creator_products").delete().eq("creator_id", profile.id);
    if (newProducts.length > 0) {
      const toInsert = newProducts.map((p, i) => ({
        creator_id: profile.id,
        title: p.title,
        price: p.price || "",
        icon: p.icon || "📦",
        url: p.url || "",
        sort_order: i,
      }));
      await supabase.from("creator_products").insert(toInsert);
    }
    await fetchData();
  };

  const saveCampaigns = async (newCampaigns: CreatorCampaign[]) => {
    if (!profile) return;
    await supabase.from("creator_campaigns").delete().eq("creator_id", profile.id);
    if (newCampaigns.length > 0) {
      const toInsert = newCampaigns.map((c, i) => ({
        creator_id: profile.id,
        title: c.title,
        description: c.description || "",
        image_url: c.image_url || "",
        url: c.url || "",
        live: c.live || false,
        sort_order: i,
      }));
      await supabase.from("creator_campaigns").insert(toInsert);
    }
    await fetchData();
  };

  const uploadImage = async (file: File, type: "avatar" | "cover"): Promise<string | null> => {
    if (!userId) return null;
    const bucket = type === "avatar" ? "avatars" : "covers";
    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { toast.error("Erro no upload"); return null; }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  return {
    profile, links, socialLinks, products, campaigns, loading,
    saveProfile, saveLinks, saveSocialLinks, saveProducts, saveCampaigns,
    uploadImage, refetch: fetchData,
  };
}
