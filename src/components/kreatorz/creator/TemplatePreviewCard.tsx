import { useMemo, useRef, useEffect, useState } from "react";
import type { FullTemplateData } from "@/lib/templateData";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign, ImageShapeValue } from "@/hooks/useCreatorData";
import type { HeroReelData } from "./HeroReel";
import type { Testimonial } from "./TestimonialsSection";
import CreatorView from "./CreatorView";

interface Props {
  template: FullTemplateData;
  fullHeight?: boolean;
}

export default function TemplatePreviewCard({ template, fullHeight }: Props) {
  const { profile: tp, links: tl, socialLinks: ts, products: tpr, testimonials: tt } = template;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.75);

  const RENDER_WIDTH = 480;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width || 300;
      setScale(w / RENDER_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const profile = useMemo<CreatorProfile>(() => ({
    id: template.id,
    user_id: null,
    agency_id: null,
    name: tp.category,
    slug: template.id,
    bio: tp.bio,
    avatar_url: tp.avatar_url || "",
    cover_url: tp.cover_url || "",
    avatar_url_layout2: "",
    cover_url_layout2: "",
    layout_type: "layout1",
    image_shape: (tp.image_shape || "rounded") as ImageShapeValue,
    image_shape_links: (tp.image_shape_links || "rounded") as ImageShapeValue,
    image_shape_products: (tp.image_shape_products || "rounded") as ImageShapeValue,
    image_shape_campaigns: (tp.image_shape || "rounded") as ImageShapeValue,
    font_family: tp.font_family,
    font_size: tp.font_size,
    section_order: tp.section_order,
    tags: tp.tags,
    stats: tp.stats,
    brands: tp.brands,
    brands_display_mode: (tp.brands_display_mode || "static") as "static" | "marquee",
    spotify_url: "",
    page_effects: { effects: [], color: undefined },
    verified: false,
    color_name: null,
    color_bio: null,
    color_section_titles: null,
  } as CreatorProfile), [template]);

  const links = useMemo<CreatorLink[]>(() =>
    tl.map((l, i) => ({
      id: `link-${i}`,
      creator_id: template.id,
      title: l.title,
      url: l.url,
      subtitle: l.subtitle,
      icon: l.icon,
      is_featured: l.is_featured,
      is_active: l.is_active,
      sort_order: i,
      display_mode: (l.display_mode === "half" ? "half" : "full") as "full" | "half",
      image_url: null,
      bg_color: null,
      text_color: null,
      border_color: null,
    })),
  [tl, template.id]);

  const socialLinks = useMemo<SocialLink[]>(() =>
    ts.map((s, i) => ({
      id: `social-${i}`,
      creator_id: template.id,
      platform: s.platform,
      label: s.label,
      url: s.url,
      sort_order: i,
    })),
  [ts, template.id]);

  const products = useMemo<CreatorProduct[]>(() =>
    tpr.map((p, i) => ({
      id: `prod-${i}`,
      creator_id: template.id,
      title: p.title,
      price: p.price,
      icon: p.icon,
      url: p.url,
      is_active: p.is_active,
      sort_order: i,
      image_url: p.image_url || null,
      bg_color: null,
      text_color: null,
      border_color: null,
    })),
  [tpr, template.id]);

  const testimonials = useMemo<Testimonial[]>(() =>
    tt.map((t, i) => ({
      id: `test-${i}`,
      creator_id: template.id,
      author_name: t.author_name,
      author_role: t.author_role,
      content: t.content,
      rating: t.rating,
      is_active: t.is_active,
      sort_order: i,
      author_avatar_url: "",
    })),
  [tt, template.id]);

  const campaigns = useMemo<CreatorCampaign[]>(() => [], []);
  const heroReels = useMemo<HeroReelData[]>(() => [], []);

  return (
    <div
      ref={containerRef}
      className={`w-full ${fullHeight ? "min-h-full" : "h-full"} overflow-hidden relative bg-background`}
    >
      <div
        className="pointer-events-none select-none"
        style={{
          width: RENDER_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <CreatorView
          profile={profile}
          links={links}
          socialLinks={socialLinks}
          products={products}
          campaigns={campaigns}
          heroReels={heroReels}
          testimonials={testimonials}
          embedded
          agencyFooterVisible={false}
        />
      </div>
    </div>
  );
}
