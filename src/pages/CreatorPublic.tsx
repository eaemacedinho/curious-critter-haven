import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign, HeroReelData } from "@/hooks/useCreatorData";
import type { Testimonial } from "@/components/kreatorz/creator/TestimonialsSection";
import CreatorView from "@/components/kreatorz/creator/CreatorView";
import CreatorViewLinkme from "@/components/kreatorz/creator/CreatorViewLinkme";
import ThemeToggle, { usePageTheme } from "@/components/kreatorz/creator/ThemeToggle";
import GrowthWatermark from "@/components/kreatorz/creator/GrowthWatermark";
import PremiumShareModal from "@/components/kreatorz/creator/PremiumShareModal";

const normalizeProfile = (creator: any): CreatorProfile => ({
  ...creator,
  agency_id: creator.agency_id || null,
  avatar_url_layout2: creator.avatar_url_layout2 || "",
  cover_url_layout2: creator.cover_url_layout2 || "",
  verified: creator.verified ?? false,
  layout_type: creator.layout_type || "layout1",
  image_shape: creator.image_shape || "rounded",
  image_shape_products: creator.image_shape_products || creator.image_shape || "rounded",
  image_shape_campaigns: creator.image_shape_campaigns || creator.image_shape || "rounded",
  image_shape_links: creator.image_shape_links || creator.image_shape || "rounded",
  font_family: creator.font_family || "default",
  font_size: creator.font_size || "medium",
  color_name: creator.color_name || null,
  color_bio: creator.color_bio || null,
  color_section_titles: creator.color_section_titles || null,
  section_order: Array.isArray(creator.section_order) ? creator.section_order : ["spotlight", "links", "products", "past_campaigns"],
  tags: Array.isArray(creator.tags) ? creator.tags : [],
  stats: Array.isArray(creator.stats) ? creator.stats : [],
  brands: Array.isArray(creator.brands)
    ? (creator.brands as any[]).map((b: any) => (typeof b === "string" ? { name: b } : b))
    : [],
  brands_display_mode: creator.brands_display_mode || "static",
  page_effects: (() => {
    const pe = creator.page_effects;
    if (!pe) return { effects: [], color: undefined, emojis: undefined, intensity: undefined };
    if (Array.isArray(pe)) return { effects: pe, color: undefined, emojis: undefined, intensity: undefined };
    if (typeof pe === "object" && Array.isArray((pe as any).effects)) return { effects: (pe as any).effects, color: (pe as any).color, emojis: (pe as any).emojis, intensity: (pe as any).intensity };
    return { effects: [], color: undefined, emojis: undefined, intensity: undefined };
  })(),
});

export default function CreatorPublic() {
  const { handle } = useParams<{ handle: string }>();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [links, setLinks] = useState<CreatorLink[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [campaigns, setCampaigns] = useState<CreatorCampaign[]>([]);
  const [heroReels, setHeroReels] = useState<HeroReelData[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [agencyName, setAgencyName] = useState<string>("");
  const [agencyLogoUrl, setAgencyLogoUrl] = useState<string>("");
  const [agencyFooterText, setAgencyFooterText] = useState<string>("Powered by");
  const [agencyFooterVisible, setAgencyFooterVisible] = useState<boolean>(true);
  const [agencyFooterLink, setAgencyFooterLink] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pageTheme, setPageTheme] = usePageTheme();
  const [topButtonsOpacity, setTopButtonsOpacity] = useState(1);

  // Scroll-based fade for top buttons (like Linktree)
  useEffect(() => {
    const handleScroll = () => {
      const scrollEl = document.querySelector('[data-preview-scroll]') as HTMLElement | null;
      const scrollY = scrollEl ? scrollEl.scrollTop : window.scrollY;
      setTopButtonsOpacity(Math.max(0, 1 - scrollY / 60));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Also listen on layout2's internal scroll container
    const timer = setTimeout(() => {
      const scrollEl = document.querySelector('[data-preview-scroll]') as HTMLElement | null;
      scrollEl?.addEventListener("scroll", handleScroll, { passive: true });
    }, 500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
      const scrollEl = document.querySelector('[data-preview-scroll]') as HTMLElement | null;
      scrollEl?.removeEventListener("scroll", handleScroll);
    };
  }, [profile]);

  useEffect(() => {
    if (!handle) return;
    const cleanHandle = handle.replace(/^@+/, "");

    (async () => {
      setLoading(true);

      let creator: any = null;

      const { data } = await supabase
        .from("creators")
        .select("*")
        .eq("slug", cleanHandle)
        .maybeSingle();

      creator = data;

      if (!creator) {
        const { data: data2 } = await supabase
          .from("creators")
          .select("*")
          .eq("slug", `@${cleanHandle}`)
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
          .select("name, primary_color, accent_color, logo_url, footer_text, footer_visible, footer_link")
          .eq("id", creator.agency_id)
          .maybeSingle();
        if (agencyData) {
          setAgencyName(agencyData.name || "");
          setAgencyLogoUrl(agencyData.logo_url || "");
          setAgencyFooterText(agencyData.footer_text || "Powered by");
          setAgencyFooterVisible(agencyData.footer_visible ?? true);
          setAgencyFooterLink(agencyData.footer_link || "");
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

      // Track page view
      trackEvent({
        event_type: "page_view",
        creator_id: creator.id,
        agency_id: creator.agency_id,
        metadata: { handle: cleanHandle, referrer: document.referrer || null },
      });

      setLoading(false);
    })();

    return () => {
      // Reset colors on unmount
      document.documentElement.style.removeProperty("--primary");
      document.documentElement.style.removeProperty("--k-400");
    };
  }, [handle]);

  async function loadRelated(creatorId: string) {
    const [linksRes, socialRes, productsRes, campaignsRes, reelsRes, testimonialsRes] = await Promise.all([
      supabase.from("creator_links").select("*").eq("creator_id", creatorId).order("sort_order"),
      supabase.from("creator_social_links").select("*").eq("creator_id", creatorId).order("sort_order"),
      supabase.from("creator_products").select("*").eq("creator_id", creatorId).order("sort_order"),
      supabase.from("campaigns").select("*").eq("creator_id", creatorId).order("sort_order"),
      supabase.from("creator_hero_reels").select("*").eq("creator_id", creatorId).order("sort_order"),
      supabase.from("creator_testimonials").select("*").eq("creator_id", creatorId).order("sort_order"),
    ]);
    setLinks((linksRes.data as CreatorLink[]) || []);
    setSocialLinks((socialRes.data as SocialLink[]) || []);
    setProducts((productsRes.data as CreatorProduct[]) || []);
    setCampaigns((campaignsRes.data as CreatorCampaign[]) || []);
    setHeroReels((reelsRes.data as HeroReelData[]) || []);
    setTestimonials((testimonialsRes.data as Testimonial[]) || []);
  }

  const handleLinkClick = useCallback((link: CreatorLink) => {
    if (!profile) return;
    trackEvent({
      event_type: "link_click",
      creator_id: profile.id,
      agency_id: profile.agency_id,
      link_id: link.id,
      metadata: { title: link.title, url: link.url },
    });
  }, [profile]);

  const handleCampaignClick = useCallback((campaign: CreatorCampaign) => {
    if (!profile) return;
    trackEvent({
      event_type: "campaign_click",
      creator_id: profile.id,
      agency_id: profile.agency_id,
      campaign_id: campaign.id,
      metadata: { title: campaign.title },
    });
  }, [profile]);

  // Apply theme class to root for public page
  useEffect(() => {
    const root = document.documentElement;
    if (pageTheme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
    return () => {
      root.classList.remove("light");
      root.classList.add("dark");
    };
  }, [pageTheme]);

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

  const layoutProps = { profile, links, socialLinks, products, campaigns, heroReels, testimonials, agencyName, agencyLogoUrl, agencyFooterText, agencyFooterVisible, agencyFooterLink, onLinkClick: handleLinkClick, onCampaignClick: handleCampaignClick };

  const LayoutComponent = (() => {
    switch (profile.layout_type) {
      case "layout2": return CreatorViewLinkme;
      default: return CreatorView;
    }
  })();


  return (
    <div className="relative">
      {/* Top buttons - inside content area, fade on scroll */}
      <div
        className="fixed top-0 left-0 right-0 z-[30] pointer-events-none transition-opacity duration-200"
        style={{ opacity: topButtonsOpacity, pointerEvents: topButtonsOpacity < 0.1 ? "none" : undefined }}
      >
        <div className="max-w-[520px] mx-auto flex items-center justify-between px-4 pt-3">
          <div className="pointer-events-auto">
            <GrowthWatermark creatorName={profile.name} />
          </div>
          <div className="pointer-events-auto flex items-center gap-1.5">
            <ThemeToggle theme={pageTheme} onChange={setPageTheme} />
            <PremiumShareModal
              creatorName={profile.name}
              creatorSlug={profile.slug}
              creatorAvatar={profile.avatar_url || undefined}
              creatorBio={profile.bio || undefined}
            />
          </div>
        </div>
      </div>
      <LayoutComponent {...layoutProps} />
    </div>
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
