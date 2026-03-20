import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign } from "@/hooks/useCreatorData";
import CreatorView from "@/components/kreatorz/creator/CreatorView";
import CreatorViewLinkme from "@/components/kreatorz/creator/CreatorViewLinkme";

const normalizeProfile = (creator: any): CreatorProfile => ({
  ...creator,
  agency_id: creator.agency_id || null,
  avatar_url_layout2: creator.avatar_url_layout2 || "",
  cover_url_layout2: creator.cover_url_layout2 || "",
  verified: creator.verified ?? false,
  public_layout: creator.public_layout || "layout1",
  image_shape: creator.image_shape || "rounded",
  tags: Array.isArray(creator.tags) ? creator.tags : [],
  stats: Array.isArray(creator.stats) ? creator.stats : [],
  brands: Array.isArray(creator.brands)
    ? (creator.brands as any[]).map((b: any) => (typeof b === "string" ? { name: b } : b))
    : [],
});

export default function CreatorPublic() {
  const { handle } = useParams<{ handle: string }>();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [links, setLinks] = useState<CreatorLink[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [campaigns, setCampaigns] = useState<CreatorCampaign[]>([]);
  const [agencyName, setAgencyName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!handle) return;
    const cleanHandle = handle.replace(/^@+/, "");

    (async () => {
      setLoading(true);

      let creator: any = null;

      const { data } = await supabase
        .from("creators")
        .select("*")
        .eq("handle", cleanHandle)
        .maybeSingle();

      creator = data;

      if (!creator) {
        const { data: data2 } = await supabase
          .from("creators")
          .select("*")
          .eq("handle", `@${cleanHandle}`)
          .maybeSingle();
        creator = data2;
      }

      if (!creator) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(normalizeProfile(creator));

      // Fetch agency name for footer
      if (creator.agency_id) {
        const { data: agencyData } = await supabase
          .from("agencies")
          .select("name, primary_color, accent_color")
          .eq("id", creator.agency_id)
          .maybeSingle();
        if (agencyData) {
          setAgencyName(agencyData.name || "");
          // Apply agency colors to public page
          const root = document.documentElement;
          if (agencyData.primary_color) {
            const hsl = hexToHsl(agencyData.primary_color);
            if (hsl) root.style.setProperty("--primary", hsl);
          }
          if (agencyData.accent_color) {
            const hsl = hexToHsl(agencyData.accent_color);
            if (hsl) root.style.setProperty("--k-400", hsl);
          }
        }
      }

      await loadRelated(creator.id);
      setLoading(false);
    })();

    return () => {
      // Reset colors on unmount
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--k-400");
    };
  }, [handle]);

  async function loadRelated(creatorId: string) {
    const [linksRes, socialRes, productsRes, campaignsRes] = await Promise.all([
      supabase.from("creator_links").select("*").eq("creator_id", creatorId).order("sort_order"),
      supabase.from("creator_social_links").select("*").eq("creator_id", creatorId).order("sort_order"),
      supabase.from("creator_products").select("*").eq("creator_id", creatorId).order("sort_order"),
      supabase.from("creator_campaigns").select("*").eq("creator_id", creatorId).order("sort_order"),
    ]);
    setLinks((linksRes.data as CreatorLink[]) || []);
    setSocialLinks((socialRes.data as SocialLink[]) || []);
    setProducts((productsRes.data as CreatorProduct[]) || []);
    setCampaigns((campaignsRes.data as CreatorCampaign[]) || []);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-6">
        <span className="text-6xl">🔍</span>
        <h1 className="text-2xl font-bold text-foreground">Creator não encontrado</h1>
        <p className="text-muted-foreground text-sm max-w-[320px]">
          O handle <span className="font-semibold text-primary">@{handle?.replace(/^@+/, "")}</span> não está associado a nenhum perfil.
        </p>
      </div>
    );
  }

  const useLayout2 = profile.public_layout === "layout2";

  return useLayout2 ? (
    <CreatorViewLinkme profile={profile} links={links} socialLinks={socialLinks} products={products} campaigns={campaigns} agencyName={agencyName} />
  ) : (
    <CreatorView profile={profile} links={links} socialLinks={socialLinks} products={products} campaigns={campaigns} agencyName={agencyName} />
  );
}

function hexToHsl(hex: string): string | null {
  if (!hex || !hex.startsWith("#")) return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
