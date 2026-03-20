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
  avatar_url_layout2: string;
  cover_url_layout2: string;
  verified: boolean;
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

const normalizeProfile = (creator: any): CreatorProfile => ({
  ...creator,
  avatar_url_layout2: creator.avatar_url_layout2 || "",
  cover_url_layout2: creator.cover_url_layout2 || "",
  verified: creator.verified ?? false,
  tags: Array.isArray(creator.tags) ? (creator.tags as CreatorProfile["tags"]) : [],
  stats: Array.isArray(creator.stats) ? (creator.stats as CreatorProfile["stats"]) : [],
  brands: Array.isArray(creator.brands)
    ? (creator.brands as any[]).map((b: any) => typeof b === "string" ? { name: b } : b)
    : [],
});

export function useCreatorData(userId: string | undefined) {
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

    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (creatorError) {
      console.error("Error fetching creator profile:", creatorError);
      setLoading(false);
      return;
    }

    if (!creator) {
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
  }, [userId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const persistProfile = useCallback(
    async (updates: Partial<CreatorProfile>) => {
      if (!profile || !userId) return null;

      const { data, error } = await supabase
        .from("creators")
        .update(updates)
        .eq("id", profile.id)
        .eq("user_id", userId)
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Profile persist error:", error);
        return null;
      }

      if (!data) {
        console.error("Profile persist error: no creator row updated", {
          profileId: profile.id,
          userId,
          updates,
        });
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
    if (!updated) {
      throw new Error("Erro ao salvar perfil");
    }
  };

  const saveLinks = async (newLinks: CreatorLink[]) => {
    if (!profile) return;

    const normalizedLinks = newLinks.map((link, index) => ({
      ...link,
      creator_id: profile.id,
      sort_order: index,
    }));

    const { error: deleteError } = await supabase.from("creator_links").delete().eq("creator_id", profile.id);
    if (deleteError) {
      console.error("Error deleting links:", deleteError);
      throw deleteError;
    }

    if (normalizedLinks.length > 0) {
      const { error: insertError } = await supabase.from("creator_links").insert(
        normalizedLinks.map((link) => ({
          id: link.id,
          creator_id: link.creator_id,
          title: link.title,
          url: link.url,
          subtitle: link.subtitle || "",
          icon: link.icon || "🔗",
          featured: link.featured || false,
          active: link.active !== false,
          sort_order: link.sort_order,
        }))
      );

      if (insertError) {
        console.error("Error inserting links:", insertError);
        throw insertError;
      }
    }

    setLinks(normalizedLinks);
  };

  const saveSocialLinks = async (newLinks: SocialLink[]) => {
    if (!profile) return;

    const normalizedLinks = newLinks.map((link, index) => ({
      ...link,
      creator_id: profile.id,
      sort_order: index,
    }));

    const { error: deleteError } = await supabase.from("creator_social_links").delete().eq("creator_id", profile.id);
    if (deleteError) {
      console.error("Error deleting social links:", deleteError);
      throw deleteError;
    }

    if (normalizedLinks.length > 0) {
      const { error: insertError } = await supabase.from("creator_social_links").insert(
        normalizedLinks.map((link) => ({
          id: link.id,
          creator_id: link.creator_id,
          platform: link.platform,
          label: link.label || "",
          url: link.url,
          sort_order: link.sort_order,
        }))
      );

      if (insertError) {
        console.error("Error inserting social links:", insertError);
        throw insertError;
      }
    }

    setSocialLinks(normalizedLinks);
  };

  const saveProducts = async (newProducts: CreatorProduct[]) => {
    if (!profile) return;

    const normalizedProducts = newProducts.map((product, index) => ({
      ...product,
      creator_id: profile.id,
      sort_order: index,
    }));

    const { error: deleteError } = await supabase.from("creator_products").delete().eq("creator_id", profile.id);
    if (deleteError) {
      console.error("Error deleting products:", deleteError);
      throw deleteError;
    }

    if (normalizedProducts.length > 0) {
      const { error: insertError } = await supabase.from("creator_products").insert(
        normalizedProducts.map((product) => ({
          id: product.id,
          creator_id: product.creator_id,
          title: product.title,
          price: product.price || "",
          icon: product.icon || "📦",
          url: product.url || "",
          image_url: product.image_url || "",
          sort_order: product.sort_order,
        }))
      );

      if (insertError) {
        console.error("Error inserting products:", insertError);
        throw insertError;
      }
    }

    setProducts(normalizedProducts);
  };

  const saveCampaigns = async (newCampaigns: CreatorCampaign[]) => {
    if (!profile) return;

    const normalizedCampaigns = newCampaigns.map((campaign, index) => ({
      ...campaign,
      creator_id: profile.id,
      sort_order: index,
    }));

    const { error: deleteError } = await supabase.from("creator_campaigns").delete().eq("creator_id", profile.id);
    if (deleteError) {
      console.error("Error deleting campaigns:", deleteError);
      throw deleteError;
    }

    if (normalizedCampaigns.length > 0) {
      const { error: insertError } = await supabase.from("creator_campaigns").insert(
        normalizedCampaigns.map((campaign) => ({
          id: campaign.id,
          creator_id: campaign.creator_id,
          title: campaign.title,
          description: campaign.description || "",
          image_url: campaign.image_url || "",
          url: campaign.url || "",
          live: campaign.live || false,
          sort_order: campaign.sort_order,
        }))
      );

      if (insertError) {
        console.error("Error inserting campaigns:", insertError);
        throw insertError;
      }
    }

    setCampaigns(normalizedCampaigns);
  };

  const uploadImage = async (file: File, type: "avatar" | "cover" | "avatar_layout2" | "cover_layout2"): Promise<string | null> => {
    if (!userId || !profile) return null;

    const bucket = type.startsWith("avatar") ? "avatars" : "covers";
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${type}-${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      cacheControl: "3600",
      contentType: file.type || "image/jpeg",
    });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      toast.error("Erro no upload: " + uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = data.publicUrl;
    const fieldMap: Record<string, keyof CreatorProfile> = {
      avatar: "avatar_url",
      cover: "cover_url",
      avatar_layout2: "avatar_url_layout2",
      cover_layout2: "cover_url_layout2",
    };
    const field = fieldMap[type];

    const updatedProfile = await persistProfile({ [field]: publicUrl } as Partial<CreatorProfile>);

    if (!updatedProfile) {
      toast.error("A imagem foi enviada, mas não conseguiu ser salva no perfil.");
      return null;
    }

    return (updatedProfile[field] as string) || publicUrl;
  };

  const uploadContentImage = async (file: File, folder: string): Promise<string | null> => {
    if (!userId) return null;

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${folder}-${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage.from("content").upload(path, file, {
      upsert: true,
      cacheControl: "3600",
      contentType: file.type || "image/jpeg",
    });

    if (uploadError) {
      console.error("Content upload error:", uploadError);
      toast.error("Erro no upload: " + uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from("content").getPublicUrl(path);
    return data.publicUrl;
  };

  return {
    profile,
    links,
    socialLinks,
    products,
    campaigns,
    loading,
    saveProfile,
    saveLinks,
    saveSocialLinks,
    saveProducts,
    saveCampaigns,
    uploadImage,
    uploadContentImage,
    refetch: fetchData,
  };
}
