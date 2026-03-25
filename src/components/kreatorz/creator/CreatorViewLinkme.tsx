import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import SocialIcon, { LinkIcon } from "./SocialIcon";
import VerifiedBadge from "./VerifiedBadge";
import SpotlightCampaign from "./SpotlightCampaign";
import HeroReel from "./HeroReel";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign } from "@/hooks/useCreatorData";
import type { HeroReelData } from "./HeroReel";
import type { Testimonial } from "./TestimonialsSection";
import TestimonialsSection from "./TestimonialsSection";
import SectionCarousel from "./SectionCarousel";
import PageEffects from "./PageEffects";
import BrandsSection from "./BrandsSection";
import type { PageEffect } from "./PageEffects";
import { getFontFamily, getFontSizeScale, loadGoogleFont } from "@/lib/fontUtils";

const shapeClass = (shape?: string) => {
  switch (shape) {
    case "circular": return "rounded-full";
    case "pill": return "rounded-[2rem]";
    case "shadow": return "rounded-2xl shadow-[0_6px_24px_-4px_hsl(var(--primary)/0.25)] border-transparent";
    case "polaroid": return "rounded-sm bg-card p-1.5 pb-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.25)] border border-border/40";
    default: return "rounded-2xl";
  }
};

interface Props {
  profile: CreatorProfile;
  links: CreatorLink[];
  socialLinks: SocialLink[];
  products: CreatorProduct[];
  campaigns: CreatorCampaign[];
  heroReels?: HeroReelData[];
  testimonials?: Testimonial[];
  agencyName?: string;
  agencyLogoUrl?: string;
  agencyFooterText?: string;
  agencyFooterVisible?: boolean;
  agencyFooterLink?: string;
  embedded?: boolean;
  onLinkClick?: (link: CreatorLink) => void;
  onCampaignClick?: (campaign: CreatorCampaign) => void;
}

export default function CreatorViewLinkme({ profile, links: rawLinks, socialLinks: rawSocial, products: rawProducts, campaigns: rawCampaigns, heroReels: rawReels, testimonials: rawTestimonials, agencyName, agencyLogoUrl, agencyFooterText, agencyFooterVisible = true, agencyFooterLink, embedded, onLinkClick, onCampaignClick }: Props) {
  const [contactOpen, setContactOpen] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const links = rawLinks.filter(l => l.title?.trim() && l.url?.trim() && l.is_active !== false);
  const socialLinks = rawSocial.filter(s => s.url?.trim() && (s.label?.trim() || s.platform?.trim()));
  const products = rawProducts.filter(p => p.title?.trim() && (p as any).is_active !== false);
  const campaigns = rawCampaigns.filter(c => c.title?.trim() && (c as any).is_active !== false);
  const activeReels = (rawReels || []).filter(r => r.is_active && r.video_url?.trim());
  const stats = profile.stats.filter(s => s.value?.trim() && s.label?.trim());
  const tags = profile.tags.filter(t => t.label?.trim());
  const brands = profile.brands.filter(b => b?.name?.trim());

  const heroImage = profile.cover_url_layout2 || profile.cover_url || profile.avatar_url;
  const headerAvatar = profile.avatar_url_layout2 || profile.avatar_url;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollY = el.scrollTop;
    const opacity = Math.min(scrollY / 500, 1);
    setOverlayOpacity(opacity);
    setHeaderVisible(scrollY > 250);
    setParallaxY(scrollY * 0.35);
  }, []);

  useEffect(() => {
    if (embedded) {
      setOverlayOpacity(0);
      setHeaderVisible(false);
      setParallaxY(0);
      return;
    }
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [embedded, handleScroll]);

  const pe = profile.page_effects || { effects: [], color: undefined };
  const effects = (pe.effects || []) as PageEffect[];
  const effectColor = pe.color;
  const effectEmojis = pe.emojis;
  const effectIntensity = pe.intensity;
  const displayModes = pe.display_modes || {};

  const fontFam = getFontFamily(profile.font_family || "default");
  const fontScale = getFontSizeScale(profile.font_size || "medium");

  useEffect(() => {
    loadGoogleFont(profile.font_family || "default");
  }, [profile.font_family]);

  const content = (
    <div className={embedded ? "absolute inset-0 flex justify-center bg-background" : "fixed inset-0 flex justify-center bg-background"}
      style={{ fontFamily: fontFam, fontSize: `${fontScale}rem` }}>
      <PageEffects effects={effects} color={effectColor} emojis={effectEmojis} intensity={effectIntensity} />
      <div className={`${embedded ? "w-full max-w-[390px]" : "w-full sm:max-w-[480px] md:max-w-[520px]"} relative overflow-hidden h-full`}>
        {/* Hero background */}
        {heroImage && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={heroImage}
              alt={profile.name}
              className="absolute inset-0 w-full h-full object-cover will-change-transform"
              style={{
                transform: `scale(1.15) translateY(${parallaxY * -0.5}px)`,
                filter: `blur(${Math.min(overlayOpacity * 3, 3)}px)`,
              }}
            />
            {/* Cinematic vignette overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `radial-gradient(ellipse 90% 70% at 50% 40%, transparent 0%, hsl(var(--background) / 0.04) 60%, hsl(var(--background) / 0.12) 100%)`
            }} />
            {/* Scroll-driven fade */}
            <div className="absolute inset-0 transition-opacity duration-500 ease-out" style={{
              background: `linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.7) 30%, transparent 60%)`,
              opacity: Math.max(0.0, overlayOpacity * 0.4),
            }} />
          </div>
        )}

        {/* Scrollable content */}
        <div ref={scrollRef} data-preview-scroll className="w-full h-full relative z-[1] overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "none" }}>
          {/* Sticky header */}
          <div className="sticky top-0 z-50 transition-all duration-500 ease-out"
            style={{ opacity: headerVisible ? 1 : 0, pointerEvents: headerVisible ? "auto" : "none", transform: headerVisible ? "translateY(0)" : "translateY(-8px)" }}>
            <div className="w-full flex items-center gap-3 px-4 py-3 bg-background/85 backdrop-blur-2xl border-b border-border/50">
              {headerAvatar ? (
                <img src={headerAvatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-sm text-muted-foreground ring-2 ring-primary/20">
                  {profile.name?.[0] || "?"}
                </div>
              )}
              <h1 className="text-sm font-bold text-foreground truncate flex items-center gap-1.5">
                {profile.name}
                {profile.verified && <VerifiedBadge size={16} />}
              </h1>
            </div>
          </div>

          {/* Hero spacer with name + handle overlaid */}
          <div className="relative w-full" style={{ height: "58vh", minHeight: "360px", maxHeight: "520px" }}>
            {/* Multi-layer cinematic gradient — extends full height, solid at bottom */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background)) 16%, hsl(var(--background) / 0.9) 28%, hsl(var(--background) / 0.5) 46%, hsl(var(--background) / 0.1) 65%, transparent 85%)`
            }} />
            <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none" style={{
              background: `linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background)) 52%, hsl(var(--background) / 0.86) 74%, transparent 100%)`
            }} />
            {!heroImage && (
              <div className="w-full h-full bg-gradient-to-b from-primary/30 to-background flex items-center justify-center">
                <span className="text-7xl text-muted-foreground">{profile.name?.[0] || "?"}</span>
              </div>
            )}

            {/* Name + handle + socials overlaid at bottom of hero */}
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center pb-5 px-5">
              <h2 className="font-display text-[1.85rem] font-bold tracking-[-0.01em] leading-[1.1] inline-flex items-center justify-center gap-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6)", color: profile.color_name || "hsl(var(--foreground))" }}>
                {profile.name}
                {profile.verified && <VerifiedBadge size={24} />}
              </h2>
              {profile.slug && (
                <p className="font-body text-[0.82rem] text-muted-foreground mt-1 tracking-wide drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">@{profile.slug.replace(/^@+/, "")}</p>
              )}

              {/* Social Icons */}
              {socialLinks.length > 0 && (
                <div className="flex justify-center gap-2.5 mt-3.5">
                  {socialLinks.map((soc) => (
                    <a key={soc.id} href={soc.url} target="_blank" rel="noopener noreferrer"
                      className="w-[46px] h-[46px] flex items-center justify-center rounded-full bg-card/60 backdrop-blur-md border border-border/50 transition-all duration-300 hover:scale-110 hover:bg-card/80 active:scale-95"
                      title={soc.platform}>
                      <SocialIcon platform={soc.platform || soc.url} url={soc.url} size={22} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content — no gap, seamless transition */}
          <div className="relative pb-12 -mt-6 pt-1" style={{ background: "hsl(var(--background))" }}>

            {/* Stats */}
            {stats.length > 0 && (
              <div className="flex justify-center items-center gap-4 mt-5 px-5">
                {stats.map((stat, i) => (
                  <div key={i} className="flex items-baseline gap-1.5">
                    <span className="font-body text-[1rem] font-bold text-foreground tracking-tight">{stat.value}</span>
                    <span className="font-body text-[0.78rem] text-foreground/50">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex justify-center gap-2 mt-4 px-5 flex-wrap">
                {tags.map((tag, i) => (
                  <span key={i} className="font-body px-3 py-1 rounded-full text-[0.7rem] font-semibold bg-primary/10 text-primary border border-primary/20">
                    {tag.label}
                  </span>
                ))}
              </div>
            )}

            {/* Brands */}
            <BrandsSection
              brands={brands}
              displayMode={profile.brands_display_mode || "static"}
            />

            {profile.bio && (
              <p className="font-body text-[0.88rem] text-center leading-relaxed mt-5 px-6 max-w-[360px] mx-auto"
                style={{ whiteSpace: "pre-wrap", color: profile.color_bio || "hsl(var(--foreground) / 0.9)" }}>
                {profile.bio}
              </p>
            )}

            {/* Dynamic sections based on section_order */}
            {(() => {
              const order = profile.section_order || ["spotlight", "links", "products", "past_campaigns"];
              let final = order.includes("hero_reel") ? order : [...order, "hero_reel"];
              final = final.includes("testimonials") ? final : [...final, "testimonials"];
              return final;
            })().map((sectionKey) => {
              const now = new Date();
              const liveCamps = campaigns.filter(c => c.live && (!c.expires_at || new Date(c.expires_at) > now));
              const pastCamps = campaigns.filter(c => !c.live || (c.expires_at && new Date(c.expires_at) <= now));

              switch (sectionKey) {
                case "spotlight":
                  return liveCamps.length > 0 ? (
                    <div key="spotlight" className="mt-6 px-4 flex flex-col gap-3">
                      {liveCamps.map((camp) => (
                        <SpotlightCampaign key={camp.id} campaign={camp} variant="layout2" />
                      ))}
                    </div>
                  ) : null;

                case "links":
                  return links.length > 0 ? (
                    displayModes.links === "carousel" && links.length > 1 ? (
                      <div key="links" className="mt-6 px-4" data-preview-section="links">
                        <SectionCarousel itemWidth="80%">
                          {links.map(link => <LinkmeCard key={link.id} link={link} shape={profile.image_shape_links} onLinkClick={onLinkClick} />)}
                        </SectionCarousel>
                      </div>
                    ) : (
                      <div key="links" className="flex flex-col gap-3 mt-6 px-4" data-preview-section="links">
                        {(() => {
                          const elements: React.ReactNode[] = [];
                          let i = 0;
                          while (i < links.length) {
                            const link = links[i];
                            if (link.display_mode === "half") {
                              const next = links[i + 1]?.display_mode === "half" ? links[i + 1] : null;
                              elements.push(
                                <div key={link.id + "-row"} className="grid grid-cols-2 gap-3">
                                  <LinkmeCard link={link} shape={profile.image_shape_links} onLinkClick={onLinkClick} />
                                  {next && <LinkmeCard link={next} shape={profile.image_shape_links} onLinkClick={onLinkClick} />}
                                </div>
                              );
                              i += next ? 2 : 1;
                            } else {
                              elements.push(<LinkmeCard key={link.id} link={link} shape={profile.image_shape_links} onLinkClick={onLinkClick} />);
                              i++;
                            }
                          }
                          return elements;
                        })()}
                      </div>
                    )
                  ) : null;

                case "products":
                  return products.length > 0 ? (
                    <div key="products" data-preview-section="products" className="mt-8 px-4">
                      <SectionLabel label="Produtos" color={profile.color_section_titles} />
                      {displayModes.products === "carousel" && products.length > 1 ? (
                        <SectionCarousel itemWidth="65%">
                          {products.map((prod) => (
                            <div key={prod.id} onClick={() => prod.url && window.open(prod.url, "_blank")}
                              className={`backdrop-blur-xl ${shapeClass(profile.image_shape_products)} overflow-hidden cursor-pointer transition-all duration-300 group hover:-translate-y-1 active:scale-[0.97] h-full ${!prod.bg_color ? "bg-card/70 border border-border hover:border-primary/30" : ""}`}
                              style={{
                                ...(prod.bg_color ? { backgroundColor: prod.bg_color } : {}),
                                ...(prod.text_color ? { color: prod.text_color } : {}),
                                ...(prod.border_color ? { borderColor: prod.border_color, borderWidth: "1px", borderStyle: "solid" } : {}),
                              }}>
                              {prod.image_url ? (
                                <div className="w-full aspect-square overflow-hidden">
                                  <img src={prod.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                              ) : (
                                <div className="p-4">
                                  <div className="text-2xl mb-2 transition-transform group-hover:scale-110">{prod.icon}</div>
                                </div>
                              )}
                              <div className="p-3.5">
                                <h5 className="text-[0.82rem] font-semibold mb-1">{prod.title}</h5>
                                {prod.price && <span className="text-[0.72rem] font-bold text-foreground" style={prod.text_color ? { color: prod.text_color } : undefined}>{prod.price}</span>}
                              </div>
                            </div>
                          ))}
                        </SectionCarousel>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {products.map((prod) => (
                            <div key={prod.id} onClick={() => prod.url && window.open(prod.url, "_blank")}
                              className={`backdrop-blur-xl ${shapeClass(profile.image_shape_products)} overflow-hidden cursor-pointer transition-all duration-300 group hover:-translate-y-1 active:scale-[0.97] ${!prod.bg_color ? "bg-card/70 border border-border hover:border-primary/30" : ""}`}
                              style={{
                                ...(prod.bg_color ? { backgroundColor: prod.bg_color } : {}),
                                ...(prod.text_color ? { color: prod.text_color } : {}),
                                ...(prod.border_color ? { borderColor: prod.border_color, borderWidth: "1px", borderStyle: "solid" } : {}),
                              }}>
                              {prod.image_url ? (
                                <div className="w-full aspect-square overflow-hidden">
                                  <img src={prod.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                              ) : (
                                <div className="p-4">
                                  <div className="text-2xl mb-2 transition-transform group-hover:scale-110">{prod.icon}</div>
                                </div>
                              )}
                              <div className="p-3.5">
                                <h5 className="text-[0.82rem] font-semibold mb-1">{prod.title}</h5>
                                {prod.price && <span className="text-[0.72rem] font-bold text-foreground" style={prod.text_color ? { color: prod.text_color } : undefined}>{prod.price}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null;

                case "past_campaigns":
                  return pastCamps.length > 0 ? (
                    <div key="past_campaigns" data-preview-section="past_campaigns" className="mt-8 px-4">
                      <SectionLabel label="Campanhas Anteriores" color={profile.color_section_titles} />
                      {displayModes.campaigns === "carousel" && pastCamps.length > 1 ? (
                        <SectionCarousel itemWidth="80%">
                          {pastCamps.map((camp) => (
                            <div key={camp.id} onClick={() => camp.url && window.open(camp.url, "_blank")}
                              className={`relative ${shapeClass(profile.image_shape_campaigns)} overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] h-full`}
                              style={{
                                ...(camp.bg_color ? { backgroundColor: camp.bg_color } : {}),
                                ...(camp.text_color ? { color: camp.text_color } : {}),
                                ...(camp.border_color ? { borderColor: camp.border_color, borderWidth: "1px", borderStyle: "solid" } : {}),
                              }}>
                              {camp.image_url ? (
                                <>
                                  <div className="w-full aspect-[16/9] overflow-hidden">
                                    <img src={camp.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                                  <div className="absolute inset-x-0 bottom-0 p-4">
                                    <h5 className="text-sm font-bold text-foreground">{camp.title}</h5>
                                    {camp.description && <p className="text-[0.7rem] text-muted-foreground mt-1 line-clamp-2">{camp.description}</p>}
                                  </div>
                                </>
                              ) : (
                                <div className="bg-card/70 border border-border rounded-2xl p-5">
                                  <h5 className="text-sm font-bold text-foreground">{camp.title}</h5>
                                  {camp.description && <p className="text-[0.7rem] text-muted-foreground mt-1">{camp.description}</p>}
                                </div>
                              )}
                            </div>
                          ))}
                        </SectionCarousel>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {pastCamps.map((camp) => (
                            <div key={camp.id} onClick={() => camp.url && window.open(camp.url, "_blank")}
                              className={`relative ${shapeClass(profile.image_shape_campaigns)} overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] opacity-75 hover:opacity-100`}
                              style={{
                                ...(camp.bg_color ? { backgroundColor: camp.bg_color } : {}),
                                ...(camp.text_color ? { color: camp.text_color } : {}),
                                ...(camp.border_color ? { borderColor: camp.border_color, borderWidth: "1px", borderStyle: "solid" } : {}),
                              }}>
                              {camp.image_url ? (
                                <>
                                  <div className="w-full aspect-[16/9] overflow-hidden">
                                    <img src={camp.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                                  <div className="absolute inset-x-0 bottom-0 p-4">
                                    <h5 className="text-sm font-bold text-foreground">{camp.title}</h5>
                                    {camp.description && <p className="text-[0.7rem] text-muted-foreground mt-1 line-clamp-2">{camp.description}</p>}
                                  </div>
                                </>
                              ) : (
                                <div className="bg-card/70 border border-border rounded-2xl p-5">
                                  <h5 className="text-sm font-bold text-foreground">{camp.title}</h5>
                                  {camp.description && <p className="text-[0.7rem] text-muted-foreground mt-1">{camp.description}</p>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null;

                case "hero_reel":
                  return activeReels.length > 0 ? (
                    <div key="hero_reel" data-preview-section="hero_reel" className="mt-6 px-4 flex flex-col gap-4">
                      {activeReels.slice(0, 3).map((reel) => (
                        <HeroReel key={reel.id} reel={reel} embedded={embedded} agencyId={profile.agency_id} />
                      ))}
                    </div>
                  ) : null;

                case "testimonials":
                  return (rawTestimonials || []).filter(t => t.is_active && t.content?.trim()).length > 0 ? (
                    <div key="testimonials" data-preview-section="testimonials" className="mt-6 px-4">
                      <TestimonialsSection testimonials={rawTestimonials || []} sectionTitleColor={profile.color_section_titles} />
                    </div>
                  ) : null;

                default:
                  return null;
              }
            })}

            {/* Contact CTA */}
            <div className="px-4 mt-8">
              <button onClick={() => setContactOpen(!contactOpen)}
                className="w-full p-4 sm:p-5 bg-card/70 backdrop-blur-xl border border-border rounded-2xl text-foreground font-body font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:border-primary/30 active:scale-[0.98] min-h-[52px]">
                ✉️ Contato comercial
              </button>

              {contactOpen && (
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-5 mt-3 animate-k-fade-up space-y-3">
                  <h4 className="text-sm font-bold text-foreground">Entre em contato</h4>
                  <input placeholder="Seu nome" className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground text-sm outline-none focus:border-primary/40 transition-all placeholder:text-muted-foreground" />
                  <input placeholder="seu@email.com" className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground text-sm outline-none focus:border-primary/40 transition-all placeholder:text-muted-foreground" />
                  <textarea placeholder="Mensagem..." className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground text-sm outline-none focus:border-primary/40 transition-all resize-none min-h-[80px] placeholder:text-muted-foreground" />
                  <button onClick={() => { toast.success("Mensagem enviada! ✉️"); setContactOpen(false); }}
                    className="w-full py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.97] min-h-[48px]">
                    Enviar mensagem
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {agencyFooterVisible !== false && (
              <div className="flex items-center justify-center gap-2 py-6 mt-8 mb-2">
                {agencyFooterLink ? (
                  <a href={agencyFooterLink.startsWith("http") ? agencyFooterLink : `https://${agencyFooterLink}`} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/40 flex items-center gap-2 text-[0.68rem] text-muted-foreground/70 hover:text-muted-foreground transition-colors">
                    {agencyLogoUrl ? <img src={agencyLogoUrl} alt="" className="w-4 h-4 rounded-sm object-contain" /> : <span className="opacity-60">⚡</span>}
                    {agencyName ? <span>{agencyFooterText || "Powered by"} <span className="font-semibold text-foreground/60">{agencyName}</span></span> : <span>Powered by <span className="font-semibold text-foreground/60">All in 1</span></span>}
                  </a>
                ) : (
                  <div className="px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/40 flex items-center gap-2 text-[0.68rem] text-muted-foreground/70">
                    {agencyLogoUrl ? <img src={agencyLogoUrl} alt="" className="w-4 h-4 rounded-sm object-contain" /> : <span className="opacity-60">⚡</span>}
                    {agencyName ? <span>{agencyFooterText || "Powered by"} <span className="font-semibold text-foreground/60">{agencyName}</span></span> : <span>Powered by <span className="font-semibold text-foreground/60">All in 1</span></span>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return content;
}

/* ── Sub-components ── */

function LinkmeCard({ link, shape, onLinkClick }: { link: CreatorLink; shape?: string; onLinkClick?: (link: CreatorLink) => void }) {
  const sc = shapeClass(shape);
  const customStyle: React.CSSProperties = {
    ...(link.bg_color ? { backgroundColor: link.bg_color } : {}),
    ...(link.text_color ? { color: link.text_color } : {}),
    ...(link.border_color ? { borderColor: link.border_color, borderWidth: "1px", borderStyle: "solid" } : {}),
  };
  const hasCustomBg = Boolean(link.bg_color);
  const isHalf = link.display_mode === "half";

  if (link.image_url) {
    return (
      <a href={link.url} target="_blank" rel="noopener noreferrer"
        onClick={() => onLinkClick?.(link)}
        className={`group relative block w-full ${sc} overflow-hidden transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]`}
        style={customStyle}>
        <div className={`relative w-full ${isHalf ? "aspect-square" : "aspect-[16/9]"} overflow-hidden`}>
          <img src={link.image_url} alt={link.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {link.icon && (
            <div className="absolute top-2.5 left-2.5 w-9 h-9 rounded-xl bg-black/50 backdrop-blur-md flex items-center justify-center z-10">
              <LinkIcon icon={link.icon} url={link.url} size={16} />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-3 z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative">
              <h4 className="text-white text-[0.82rem] font-semibold leading-snug drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">{link.title}</h4>
              {link.subtitle && !isHalf && <span className="text-white/70 text-[0.7rem] line-clamp-1">{link.subtitle}</span>}
            </div>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer"
      onClick={() => onLinkClick?.(link)}
      className={`group relative block w-full ${sc} overflow-hidden transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]`}>
      <div className={`flex items-center gap-4 p-4 sm:p-5 min-h-[56px] ${
        !hasCustomBg ? (link.is_featured
          ? "bg-gradient-to-r from-primary/25 to-primary/10 border border-primary/25"
          : "bg-card/70 backdrop-blur-xl border border-border") : ""
      } ${sc} transition-all duration-300 group-hover:border-primary/30`}
        style={customStyle}>
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
          <LinkIcon icon={link.icon} url={link.url} size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold leading-snug">{link.title}</h4>
          {link.subtitle && <span className="font-body text-[0.72rem] opacity-55 line-clamp-1">{link.subtitle}</span>}
        </div>
        <div className="opacity-30 group-hover:opacity-60 transition-opacity">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </div>
      </div>
    </a>
  );
}

function SectionLabel({ label, color }: { label: string; color?: string | null }) {
  return (
    <div className="font-body text-[0.64rem] font-bold tracking-[0.16em] uppercase mb-3 flex items-center gap-2.5 px-1"
      style={color ? { color } : { color: "hsl(var(--muted-foreground))" }}>
      {label} <span className="flex-1 h-px bg-border" />
    </div>
  );
}
