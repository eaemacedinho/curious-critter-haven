import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import SocialIcon from "./SocialIcon";
import VerifiedBadge from "./VerifiedBadge";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign } from "@/hooks/useCreatorData";

interface Props {
  profile: CreatorProfile;
  links: CreatorLink[];
  socialLinks: SocialLink[];
  products: CreatorProduct[];
  campaigns: CreatorCampaign[];
}

export default function CreatorViewLinkme({ profile, links: rawLinks, socialLinks: rawSocial, products: rawProducts, campaigns: rawCampaigns }: Props) {
  const [contactOpen, setContactOpen] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const links = rawLinks.filter(l => l.title?.trim() && l.url?.trim());
  const socialLinks = rawSocial.filter(s => s.url?.trim() && (s.label?.trim() || s.platform?.trim()));
  const products = rawProducts.filter(p => p.title?.trim());
  const campaigns = rawCampaigns.filter(c => c.title?.trim());
  const stats = profile.stats.filter(s => s.value?.trim() && s.label?.trim());
  const tags = profile.tags.filter(t => t.label?.trim());
  const brands = profile.brands.filter(b => b?.name?.trim());

  const heroImage = profile.cover_url_layout2 || profile.cover_url || profile.avatar_url;
  const headerAvatar = profile.avatar_url_layout2 || profile.avatar_url;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollY = el.scrollTop;
    // Darken overlay: starts at scroll 0, fully dark at ~400px
    const opacity = Math.min(scrollY / 350, 1);
    setOverlayOpacity(opacity);
    // Header appears after scrolling past hero
    setHeaderVisible(scrollY > 300);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="fixed inset-0 top-14 flex justify-center bg-background">
      {/* Single 430px column — all content and hero stay inside */}
      <div className="w-full max-w-[430px] relative overflow-hidden">
        {/* Hero background — absolute within the column */}
        {heroImage && (
          <div className="absolute inset-0 z-0">
            <div className="sticky top-0 w-full h-screen">
              <img
                src={heroImage}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
              {/* Dark overlay that increases on scroll */}
              <div
                className="absolute inset-0 bg-background transition-opacity duration-100"
                style={{ opacity: overlayOpacity }}
              />
            </div>
          </div>
        )}

        {/* Scrollable content area */}
        <div
          ref={scrollRef}
          className="w-full h-full relative z-[1] overflow-y-auto overflow-x-hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Sticky top header — inside scroll container so sticky works */}
          <div
            className="sticky top-0 z-50 transition-all duration-300"
            style={{
              opacity: headerVisible ? 1 : 0,
              pointerEvents: headerVisible ? "auto" : "none",
              transform: headerVisible ? "translateY(0)" : "translateY(-100%)",
            }}
          >
            <div className="w-full flex items-center gap-3 px-4 py-2.5 bg-background/90 backdrop-blur-xl border-b border-primary/10">
              {headerAvatar ? (
                <img src={headerAvatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-k-800 flex items-center justify-center text-sm text-k-3 ring-2 ring-primary/20">
                  {profile.name?.[0] || "?"}
                </div>
              )}
              <h1 className="text-sm font-bold text-primary-foreground truncate flex items-center gap-1.5">
                {profile.name}
                {profile.verified && <VerifiedBadge size={16} />}
              </h1>
            </div>
          </div>
          {/* Hero spacer — transparent area so hero image shows through */}
          <div className="relative w-full" style={{ height: "75vh", minHeight: "480px", maxHeight: "680px" }}>
            {/* Bottom gradient on hero area */}
            <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
            
            {/* Fallback if no image */}
            {!heroImage && (
              <div className="w-full h-full bg-gradient-to-b from-primary/30 to-background flex items-center justify-center">
                <span className="text-7xl text-k-3">{profile.name?.[0] || "?"}</span>
              </div>
            )}
          </div>

          {/* Content section — dark bg that scrolls over the hero */}
          <div className="relative bg-background rounded-t-[2rem] -mt-8 pb-12">
            {/* Name + handle */}
            <div className="text-center pt-6 px-6">
              <h2 className="font-display text-[2rem] font-bold text-primary-foreground tracking-tight leading-tight inline-flex items-center justify-center gap-2">
                {profile.name}
                {profile.verified && <VerifiedBadge size={24} />}
              </h2>
              {profile.handle && (
                <p className="text-sm text-k-3 mt-1">
                  @{profile.handle.replace(/^@+/, "")}
                </p>
              )}
            </div>

            {/* Social Icons Row */}
            {socialLinks.length > 0 && (
              <div className="flex justify-center gap-2.5 mt-4 px-6">
                {socialLinks.map((soc) => (
                  <a
                    key={soc.id}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-all duration-300 hover:scale-110 active:scale-95"
                    title={soc.platform}
                  >
                    <SocialIcon platform={soc.platform || soc.url} url={soc.url} size={18} />
                  </a>
                ))}
              </div>
            )}

            {/* Total Followers / Stats */}
            {stats.length > 0 && (
              <div className="flex justify-center items-center gap-1.5 mt-4 px-6">
                {stats.map((stat, i) => (
                  <p key={i} className="text-sm text-primary-foreground flex items-center gap-1">
                    <span className="font-semibold">{stat.value}</span>
                    <span className="text-k-2">{stat.label}</span>
                  </p>
                ))}
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex justify-center gap-2 mt-3 px-6 flex-wrap">
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-[0.7rem] font-semibold bg-primary/10 text-k-300 border border-primary/20">
                    {tag.label}
                  </span>
                ))}
              </div>
            )}

            {/* Brands */}
            {brands.length > 0 && (
              <div className="flex justify-center items-center gap-3 mt-4 flex-wrap px-6">
                <span className="text-[0.62rem] text-k-400 uppercase tracking-widest font-bold">Trabalhou com:</span>
                {brands.map((brand, i) => (
                  <span key={i} className="text-[0.65rem] text-primary-foreground font-semibold px-2 py-0.5 bg-primary/10 rounded-md border border-primary/10 flex items-center gap-1.5">
                    {brand.logo_url && <img src={brand.logo_url} alt="" className="w-4 h-4 rounded-sm object-contain" />}
                    {brand.name}
                  </span>
                ))}
              </div>
            )}

            {profile.bio && (
              <p className="text-sm text-primary-foreground text-center leading-relaxed mt-3 px-8 max-w-[380px] mx-auto" style={{ whiteSpace: "pre-wrap" }}>
                {profile.bio}
              </p>
            )}

            {/* Links as large image cards (Linkme style) */}
            {links.length > 0 && (
              <div className="flex flex-col gap-3 mt-6 px-4">
                {links.map((link) => (
                  <LinkmeCard key={link.id} link={link} />
                ))}
              </div>
            )}

            {/* Products */}
            {products.length > 0 && (
              <div className="mt-8 px-4">
                <SectionLabel label="Produtos" />
                <div className="grid grid-cols-2 gap-2.5">
                  {products.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => prod.url && window.open(prod.url, "_blank")}
                      className="bg-card/70 backdrop-blur-xl border border-primary/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group hover:border-primary/30 hover:-translate-y-1 active:scale-[0.97]"
                    >
                      {prod.image_url ? (
                        <div className="w-full aspect-square overflow-hidden">
                          <img src={prod.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="text-2xl mb-2 transition-transform group-hover:scale-110">{prod.icon}</div>
                        </div>
                      )}
                      <div className="p-3">
                        <h5 className="text-[0.82rem] font-semibold text-primary-foreground mb-1">{prod.title}</h5>
                        {prod.price && <span className="text-[0.72rem] text-k-300 font-bold">{prod.price}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campaigns */}
            {campaigns.length > 0 && (
              <div className="mt-8 px-4">
                <SectionLabel label={`Campanhas ${campaigns.some(c => c.live) ? "Ativas" : ""}`} />
                <div className="flex flex-col gap-3">
                  {campaigns.map((camp) => (
                    <div
                      key={camp.id}
                      onClick={() => camp.url && window.open(camp.url, "_blank")}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
                    >
                      {camp.image_url ? (
                        <>
                          <div className="w-full aspect-[16/9] overflow-hidden">
                            <img src={camp.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 p-4">
                            {camp.live && <LiveBadge />}
                            <h5 className="text-sm font-bold text-primary-foreground">{camp.title}</h5>
                            {camp.description && <p className="text-[0.7rem] text-k-2 mt-1 line-clamp-2">{camp.description}</p>}
                          </div>
                        </>
                      ) : (
                        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-5">
                          {camp.live && <LiveBadge />}
                          <h5 className="text-sm font-bold text-primary-foreground">{camp.title}</h5>
                          {camp.description && <p className="text-[0.7rem] text-k-3 mt-1">{camp.description}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact CTA */}
            <div className="px-4 mt-8">
              <button
                onClick={() => setContactOpen(!contactOpen)}
                className="w-full p-4 bg-card/70 backdrop-blur-xl border border-primary/10 rounded-2xl text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:border-primary/30 active:scale-[0.98]"
              >
                ✉️ Contato comercial
              </button>

              {contactOpen && (
                <div className="bg-card/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-5 mt-3 animate-k-fade-up space-y-3">
                  <h4 className="text-sm font-bold text-primary-foreground">Entre em contato</h4>
                  <input placeholder="Seu nome" className="w-full px-3.5 py-2.5 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 transition-all placeholder:text-k-4" />
                  <input placeholder="seu@email.com" className="w-full px-3.5 py-2.5 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 transition-all placeholder:text-k-4" />
                  <textarea placeholder="Mensagem..." className="w-full px-3.5 py-2.5 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 transition-all resize-none min-h-[80px] placeholder:text-k-4" />
                  <button
                    onClick={() => { toast.success("Mensagem enviada! ✉️"); setContactOpen(false); }}
                    className="w-full py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:bg-k-400 hover:shadow-k-purple active:scale-[0.97]"
                  >
                    Enviar mensagem
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 text-[0.7rem] text-k-4 opacity-50 hover:opacity-90 transition-opacity py-4 mt-6">
              <span className="font-extrabold text-k-300">K</span>
              managed by Kreatorz
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function LinkmeCard({ link }: { link: CreatorLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block w-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
    >
      <div className={`flex items-center gap-3.5 p-4 ${
        link.featured
          ? "bg-gradient-to-r from-primary/25 to-primary/10 border border-primary/25"
          : "bg-card/70 backdrop-blur-xl border border-primary/10"
      } rounded-2xl transition-all duration-300 group-hover:border-primary/30`}>
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg transition-transform group-hover:scale-110">
          {link.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-primary-foreground leading-snug">{link.title}</h4>
          {link.subtitle && <span className="text-[0.72rem] text-k-3 line-clamp-1">{link.subtitle}</span>}
        </div>
        <div className="opacity-30 group-hover:opacity-60 transition-opacity">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </div>
      </div>
    </a>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="text-[0.66rem] font-bold text-k-4 tracking-[0.14em] uppercase mb-3 flex items-center gap-2.5 px-1">
      {label} <span className="flex-1 h-px bg-primary/10" />
    </div>
  );
}

function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span className="w-2 h-2 rounded-full bg-k-ok animate-pulse" />
      <span className="text-[0.62rem] text-k-ok font-bold uppercase tracking-wider">Ao vivo</span>
    </div>
  );
}

