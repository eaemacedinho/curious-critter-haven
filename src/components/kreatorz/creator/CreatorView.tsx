import { toast } from "sonner";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign } from "@/hooks/useCreatorData";
import { useState, useEffect, useRef, useCallback } from "react";
import SocialIcon, { LinkIcon } from "./SocialIcon";
import VerifiedBadge from "./VerifiedBadge";
import SpotlightCampaign from "./SpotlightCampaign";
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
  agencyName?: string;
  agencyLogoUrl?: string;
  agencyFooterText?: string;
  agencyFooterVisible?: boolean;
  agencyFooterLink?: string;
  embedded?: boolean;
}

export default function CreatorView({ profile, links: rawLinks, socialLinks: rawSocial, products: rawProducts, campaigns: rawCampaigns, agencyName, agencyLogoUrl, agencyFooterText, agencyFooterVisible = true, agencyFooterLink, embedded }: Props) {
  const [contactOpen, setContactOpen] = useState(false);
  const [clickedLink, setClickedLink] = useState<number | null>(null);
  const [parallaxY, setParallaxY] = useState(0);
  const coverRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setParallaxY(y * 0.3);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const links = rawLinks.filter(l => l.title?.trim() && l.url?.trim());
  const socialLinks = rawSocial.filter(s => s.url?.trim() && (s.label?.trim() || s.platform?.trim()));
  const products = rawProducts.filter(p => p.title?.trim());
  const campaigns = rawCampaigns.filter(c => c.title?.trim());
  const stats = profile.stats.filter(s => s.value?.trim() && s.label?.trim());
  const tags = profile.tags.filter(t => t.label?.trim());
  const brands = profile.brands.filter(b => b?.name?.trim());

  const now = new Date();
  const liveCampaigns = campaigns.filter(c => c.live && (!(c as any).expires_at || new Date((c as any).expires_at) > now));
  const pastCampaigns = campaigns.filter(c => !c.live || ((c as any).expires_at && new Date((c as any).expires_at) <= now));

  const handleLinkClick = (i: number, url: string) => {
    setClickedLink(i);
    if (url && url !== "https://") window.open(url, "_blank");
    setTimeout(() => setClickedLink(null), 400);
  };

  const pe = profile.page_effects || { effects: [], color: undefined };
  const effects = (pe.effects || []) as PageEffect[];
  const effectColor = pe.color;
  const effectEmojis = pe.emojis;
  const effectIntensity = pe.intensity;

  const fontFam = getFontFamily(profile.font_family || "default");
  const fontScale = getFontSizeScale(profile.font_size || "medium");

  useEffect(() => {
    loadGoogleFont(profile.font_family || "default");
  }, [profile.font_family]);

  const content = (
    <div className={embedded
      ? "min-h-full h-full flex items-start justify-center px-4 sm:px-6 py-16 pt-20 sm:pt-24 relative"
      : "min-h-screen flex items-start justify-center px-4 sm:px-6 py-16 pt-20 sm:pt-24 relative"}
      style={{ fontFamily: fontFam, fontSize: `${fontScale}rem` }}>
      <PageEffects effects={effects} color={effectColor} emojis={effectEmojis} intensity={effectIntensity} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[420px] bg-[radial-gradient(ellipse,hsl(268_69%_50%_/_0.4),transparent_70%)] pointer-events-none" />

      <div className={`${embedded ? "w-full max-w-[390px]" : "w-full sm:max-w-[480px] md:max-w-[520px]"} relative z-[1]`}>
        {/* Cover */}
        {profile.cover_url && (
          <div ref={coverRef} className="w-full h-[200px] rounded-3xl overflow-hidden relative mb-[-56px]">
            <img
              src={profile.cover_url}
              alt="cover"
              className="w-full h-full object-cover will-change-transform"
              style={{
                transform: `scale(1.12) translateY(${parallaxY * -0.4}px)`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/95" />
          </div>
        )}

        {/* Profile Header */}
        <div className="text-center mb-2 animate-k-fade-up">
          <div className="relative inline-block">
            <div className="w-[112px] h-[112px] rounded-full border-4 border-background overflow-hidden relative z-[2] shadow-[0_8px_36px] shadow-primary/30 mx-auto" style={{ animation: "k-glow-pulse 4s ease-in-out infinite" }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-card flex items-center justify-center text-3xl text-muted-foreground">
                  {profile.name?.[0] || "?"}
                </div>
              )}
            </div>
            <div className="absolute bottom-1 right-1 z-[3] w-7 h-7 bg-primary rounded-full border-[3px] border-background flex items-center justify-center shadow-lg">
              <svg className="w-3.5 h-3.5 fill-primary-foreground" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
            </div>
          </div>

          {profile.name && (
            <h1 className="font-display text-[1.85rem] font-normal mt-4 tracking-tight"
              style={profile.color_name ? { color: profile.color_name } : { color: "hsl(var(--foreground))" }}>
              {profile.name}
            </h1>
          )}
          {profile.handle && <p className="text-sm text-muted-foreground mt-1">@{profile.handle.replace(/^@+/, "")}</p>}

          {tags.length > 0 && (
            <div className="flex justify-center gap-2 mt-3 flex-wrap">
              {tags.map((tag, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-[0.72rem] font-semibold bg-primary/10 text-primary border border-primary/20">
                  {tag.label}
                </span>
              ))}
            </div>
          )}

          {stats.length > 0 && (
            <div className="flex justify-center gap-7 mt-5 py-4 border-t border-b border-border">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <strong className="block text-lg font-extrabold text-foreground tracking-tight">{stat.value}</strong>
                  <span className="text-[0.64rem] text-muted-foreground uppercase tracking-widest font-semibold">{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          <BrandsSection
            brands={brands}
            displayMode={profile.brands_display_mode || "static"}
          />

          {profile.bio && (
            <p className="text-sm leading-relaxed mt-5 max-w-[380px] mx-auto"
              style={profile.color_bio ? { color: profile.color_bio } : { color: "hsl(var(--muted-foreground))" }}>{profile.bio}</p>
          )}

          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-3 mt-5 mb-7">
              {socialLinks.map((soc) => (
                <a key={soc.id} href={soc.url} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-border transition-all duration-250 hover:-translate-y-0.5 hover:scale-110 active:scale-95"
                  title={soc.platform}>
                  <SocialIcon platform={soc.platform || soc.url} url={soc.url} size={16} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic sections based on section_order */}
        {(profile.section_order || ["spotlight", "links", "products", "past_campaigns"]).map((sectionKey) => {
          switch (sectionKey) {
            case "spotlight":
              return liveCampaigns.length > 0 ? (
                <div key="spotlight" className="flex flex-col gap-3 mb-6">
                  {liveCampaigns.map((camp) => (
                    <SpotlightCampaign key={camp.id} campaign={camp} variant="layout1" />
                  ))}
                </div>
              ) : null;

            case "links":
              return links.length > 0 ? (() => {
                const rows: CreatorLink[][] = [];
                let i = 0;
                while (i < links.length) {
                  if (links[i].display_mode === "half") {
                    const pair: CreatorLink[] = [links[i]];
                    if (i + 1 < links.length && links[i + 1].display_mode === "half") {
                      pair.push(links[i + 1]);
                      i += 2;
                    } else {
                      i += 1;
                    }
                    rows.push(pair);
                  } else {
                    rows.push([links[i]]);
                    i += 1;
                  }
                }

                return (
                  <div key="links" className="flex flex-col gap-3 mb-8 animate-k-fade-up" style={{ animationDelay: ".15s" }}>
                    {rows.map((row, rowIdx) => (
                      <div key={rowIdx} className={row.length > 1 ? "grid grid-cols-2 gap-3" : ""}>
                        {row.map((link) => {
                          const linkIdx = links.indexOf(link);
                          const hasImage = !!link.image_url;

                          if (hasImage) {
                            return (
                              <div
                                key={link.id}
                                onClick={() => handleLinkClick(linkIdx, link.url)}
                                className={`${shapeClass(profile.image_shape_links)} cursor-pointer transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-k-purple active:scale-[0.97] ${clickedLink === linkIdx ? "scale-[0.97]" : ""}`}
                                style={{
                                  ...(link.border_color ? { borderColor: link.border_color, borderWidth: "1px", borderStyle: "solid" } : {}),
                                }}
                              >
                                <div className={`relative ${row.length > 1 ? "aspect-square" : "aspect-[16/9]"} w-full`}>
                                  <img src={link.image_url!} alt={link.title} className="absolute inset-0 w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                  <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/10">
                                    <LinkIcon icon={link.icon} url={link.url} size={14} />
                                  </div>
                                  <div className="absolute bottom-0 left-0 right-0 p-3.5">
                                    <h4 className="text-sm font-semibold text-white leading-snug drop-shadow-lg"
                                      style={link.text_color ? { color: link.text_color } : undefined}
                                    >{link.title}</h4>
                                    {link.subtitle && <span className="text-[0.72rem] text-white/70 drop-shadow">{link.subtitle}</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={link.id} onClick={() => handleLinkClick(linkIdx, link.url)}
                              className={`flex items-center gap-4 p-4 sm:p-5 ${shapeClass(profile.image_shape_links)} cursor-pointer transition-all duration-300 relative overflow-hidden group min-h-[56px]
                                ${clickedLink === linkIdx ? "scale-[0.97]" : ""}
                                ${link.featured && !link.bg_color
                                  ? "gradient-primary border-transparent shadow-k-purple-lg hover:-translate-y-1"
                                  : !link.bg_color ? "bg-card/65 backdrop-blur-2xl border border-border hover:border-primary/20 hover:-translate-y-1 hover:shadow-k-purple" : "hover:-translate-y-1"
                                } active:scale-[0.97]`}
                              style={{
                                ...(link.bg_color ? { backgroundColor: link.bg_color } : {}),
                                ...(link.text_color ? { color: link.text_color } : {}),
                                ...(link.border_color ? { borderColor: link.border_color, borderWidth: "1px", borderStyle: "solid" } : {}),
                              }}>
                              <div className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${link.featured ? "bg-primary-foreground/15" : "bg-primary/5"}`}>
                                <LinkIcon icon={link.icon} url={link.url} size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold leading-snug">{link.title}</h4>
                                {link.subtitle && <span className="text-[0.72rem] opacity-55">{link.subtitle}</span>}
                              </div>
                              <div className="opacity-30 transition-all duration-200 group-hover:opacity-60 group-hover:translate-x-0.5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              })() : null;

            case "products":
              return products.length > 0 ? (
                <div key="products" className="animate-k-fade-up" style={{ animationDelay: ".25s" }}>
                  <div className="text-[0.66rem] font-bold tracking-[0.14em] uppercase mb-3.5 flex items-center gap-2.5"
                    style={profile.color_section_titles ? { color: profile.color_section_titles } : { color: "hsl(var(--muted-foreground))" }}>
                    Meus Produtos <span className="flex-1 h-px bg-border" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {products.map((prod) => (
                      <div key={prod.id} onClick={() => prod.url && window.open(prod.url, "_blank")}
                        className={`backdrop-blur-xl ${shapeClass(profile.image_shape_products)} overflow-hidden transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-k-purple active:scale-[0.97] ${!prod.bg_color ? "bg-card/65 border border-border hover:border-primary/20" : ""}`}
                        style={{
                          ...(prod.bg_color ? { backgroundColor: prod.bg_color } : {}),
                          ...(prod.text_color ? { color: prod.text_color } : {}),
                          ...(prod.border_color ? { borderColor: prod.border_color, borderWidth: "1px", borderStyle: "solid" } : {}),
                        }}>
                        {prod.image_url ? (
                          <img src={prod.image_url} alt={prod.title} className="w-full h-28 object-cover" />
                        ) : (
                          <div className="w-full h-28 flex items-center justify-center bg-primary/5 text-3xl">{prod.icon}</div>
                        )}
                        <div className="p-3.5">
                          <h5 className="text-[0.82rem] font-semibold mb-1">{prod.title}</h5>
                          {prod.price && <span className="text-[0.72rem] font-bold" style={{ color: prod.text_color || "hsl(var(--primary))" }}>{prod.price}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;

            case "past_campaigns":
              return pastCampaigns.length > 0 ? (
                <div key="past_campaigns" className="animate-k-fade-up" style={{ animationDelay: ".3s" }}>
                  <div className="text-[0.66rem] font-bold tracking-[0.14em] uppercase mb-3.5 flex items-center gap-2.5"
                    style={profile.color_section_titles ? { color: profile.color_section_titles } : { color: "hsl(var(--muted-foreground))" }}>
                    Campanhas Anteriores <span className="flex-1 h-px bg-border" />
                  </div>
                  <div className="flex flex-col gap-3 mb-8">
                    {pastCampaigns.map((camp) => (
                      <div key={camp.id} onClick={() => camp.url && window.open(camp.url, "_blank")}
                        className={`backdrop-blur-xl ${shapeClass(profile.image_shape_campaigns)} p-4 sm:p-5 transition-all duration-300 group cursor-pointer active:scale-[0.98] opacity-75 hover:opacity-100 ${!camp.bg_color ? "bg-card/65 border border-border hover:border-primary/20" : ""}`}
                        style={{
                          ...(camp.bg_color ? { backgroundColor: camp.bg_color } : {}),
                          ...(camp.text_color ? { color: camp.text_color } : {}),
                          ...(camp.border_color ? { borderColor: camp.border_color, borderWidth: "1px", borderStyle: "solid" } : {}),
                        }}>
                        {camp.image_url && (
                          <div className={`w-full h-[100px] ${shapeClass(profile.image_shape_campaigns)} overflow-hidden mb-3`}>
                            <img src={camp.image_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <h5 className="text-[0.82rem] font-semibold mb-1">{camp.title}</h5>
                        {camp.description && <span className="text-[0.68rem] opacity-70">{camp.description}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;

            default:
              return null;
          }
        })}

        {/* Contact CTA */}
        <button onClick={() => setContactOpen(!contactOpen)}
          className="w-full p-4 sm:p-5 bg-card/65 backdrop-blur-xl border border-border rounded-2xl text-foreground font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:border-primary/20 hover:shadow-k-purple mb-2 active:scale-[0.98] min-h-[52px]">
          ✉️ Contato comercial
        </button>

        {contactOpen && (
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-5 mb-8 animate-k-fade-up space-y-3">
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

        {/* Footer */}
        {agencyFooterVisible !== false && (
          <div className="flex items-center justify-center gap-2 py-6 mt-8 mb-2">
            {agencyFooterLink ? (
              <a href={agencyFooterLink.startsWith("http") ? agencyFooterLink : `https://${agencyFooterLink}`} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/40 flex items-center gap-2 text-[0.68rem] text-muted-foreground/70 hover:text-muted-foreground transition-colors">
                {agencyLogoUrl ? <img src={agencyLogoUrl} alt="" className="w-4 h-4 rounded-sm object-contain" /> : <span className="opacity-60">⚡</span>}
                {agencyName ? <span>{agencyFooterText || "Powered by"} <span className="font-semibold text-foreground/60">{agencyName}</span></span> : <span>Powered by <span className="font-semibold text-foreground/60">Kreatorz</span></span>}
              </a>
            ) : (
              <div className="px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/40 flex items-center gap-2 text-[0.68rem] text-muted-foreground/70">
                {agencyLogoUrl ? <img src={agencyLogoUrl} alt="" className="w-4 h-4 rounded-sm object-contain" /> : <span className="opacity-60">⚡</span>}
                {agencyName ? <span>{agencyFooterText || "Powered by"} <span className="font-semibold text-foreground/60">{agencyName}</span></span> : <span>Powered by <span className="font-semibold text-foreground/60">Kreatorz</span></span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return content;
}
