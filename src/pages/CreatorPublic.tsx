import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign } from "@/hooks/useCreatorData";
import CreatorView from "@/components/kreatorz/creator/CreatorView";
import CreatorViewLinkme from "@/components/kreatorz/creator/CreatorViewLinkme";

const normalizeProfile = (creator: any): CreatorProfile => ({
  ...creator,
  avatar_url_layout2: creator.avatar_url_layout2 || "",
  cover_url_layout2: creator.cover_url_layout2 || "",
  verified: creator.verified ?? false,
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
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!handle) return;

    const cleanHandle = handle.replace(/^@+/, "");

    (async () => {
      setLoading(true);

      const { data: creator, error } = await supabase
        .from("creators")
        .select("*")
        .eq("handle", cleanHandle)
        .maybeSingle();

      if (error || !creator) {
        // Try with @ prefix too
        const { data: creator2 } = await supabase
          .from("creators")
          .select("*")
          .eq("handle", `@${cleanHandle}`)
          .maybeSingle();

        if (!creator2) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProfile(normalizeProfile(creator2));
        await loadRelated(creator2.id);
      } else {
        setProfile(normalizeProfile(creator));
        await loadRelated(creator.id);
      }

      setLoading(false);
    })();

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
  }, [handle]);

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
        <h1 className="text-2xl font-bold text-primary-foreground">Creator não encontrado</h1>
        <p className="text-k-3 text-sm max-w-[320px]">
          O handle <span className="font-semibold text-k-300">@{handle?.replace(/^@+/, "")}</span> não está associado a nenhum perfil.
        </p>
      </div>
    );
  }

  const useLayout2 = profile.public_layout === "layout2";

  return useLayout2 ? (
    <CreatorViewLinkme
      profile={profile}
      links={links}
      socialLinks={socialLinks}
      products={products}
      campaigns={campaigns}
    />
  ) : (
    <CreatorView
      profile={profile}
      links={links}
      socialLinks={socialLinks}
      products={products}
      campaigns={campaigns}
    />
  );
}
