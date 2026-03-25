import { useMemo } from "react";
import type { FullTemplateData } from "@/lib/templateData";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign } from "@/hooks/useCreatorData";
import type { HeroReelData } from "./HeroReel";
import type { Testimonial } from "./TestimonialsSection";
import CreatorView from "./CreatorView";

interface Props {
  template: FullTemplateData;
  fullHeight?: boolean;
}

/**
 * Renders the real CreatorView at a scaled-down size so the template
 * preview is pixel-identical to the actual creator page.
 */
export default function TemplatePreviewCard({ template, fullHeight }: Props) {
  const { profile: tp, links: tl, socialLinks: ts, products: tpr, testimonials: tt } = template;

  // Map template data → CreatorView props
  const profile = useMemo<CreatorProfile>(() => ({
    id: template.id,
    name: tp.category,
    slug: template.id,
    bio: tp.bio,
    avatar_url: tp.avatar_url || "",
    cover_url: tp.cover_url || "",
    avatar_url_layout2: "",
    cover_url_layout2: "",
    layout_type: "layout1",
    image_shape: tp.image_shape,
    image_shape_links: tp.image_shape_links,
    image_shape_products: tp.image_shape_products,
    image_shape_campaigns: tp.image_shape || "rounded",
    font_family: tp.font_family,
    font_size: tp.font_size,
    category: tp.category,
    is_published: true,
    section_order: tp.section_order,
    tags: tp.tags,
    stats: tp.stats,
    brands: tp.brands,
    brands_display_mode: tp.brands_display_mode,
    spotify_url: "",
    page_effects: { effects: [], color: undefined },
    verified: false,
  }), [template]);

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
      display_mode: l.display_mode,
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
      author_name: t.author_name,
      author_role: t.author_role,
      content: t.content,
      rating: t.rating,
      is_active: t.is_active,
      sort_order: i,
      author_avatar_url: "",
    })),
  [tt]);

  const campaigns = useMemo<CreatorCampaign[]>(() => [], []);
  const heroReels = useMemo<HeroReelData[]>(() => [], []);

  // Scale factor: render at 480px wide, scaled to fit container
  const RENDER_WIDTH = 480;

  return (
    <div className={`w-full ${fullHeight ? "min-h-full" : "h-full"} overflow-hidden relative bg-background`}>
      <div
        className="origin-top-left"
        style={{
          width: RENDER_WIDTH,
          transform: `scale(var(--preview-scale, 0.75))`,
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
      {/* Scale calculator: uses container width / render width */}
      <style>{`
        @container (min-width: 0px) {
          .origin-top-left {
            --preview-scale: 1;
          }
        }
      `}</style>
    </div>
  );
}
