import { useState, useEffect, useRef, useCallback } from "react";
import { autoTextColor } from "@/lib/utils";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign } from "@/hooks/useCreatorData";
import SocialIcon, { LinkIcon } from "./SocialIcon";
import VerifiedBadge from "./VerifiedBadge";
import SpotlightCampaign from "./SpotlightCampaign";
import PageEffects from "./PageEffects";
import type { PageEffect } from "./PageEffects";
import { getFontFamily, getFontSizeScale, loadGoogleFont } from "@/lib/fontUtils";

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

export default function CreatorViewDark({ profile, links: rawLinks, socialLinks: rawSocial, products: rawProducts, campaigns: rawCampaigns, agencyName, agencyLogoUrl, agencyFooterText, agencyFooterVisible = true, agencyFooterLink, embedded }: Props) {
  const [clickedLink, setClickedLink] = useState<number | null>(null);
  const [parallaxY, setParallaxY] = useState(0);

  const handleScroll = useCallback(() => setParallaxY(window.scrollY * 0.3), []);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const links = rawLinks.filter(l => l.title?.trim() && l.url?.trim() && l.is_active !== false);
  const socialLinks = rawSocial.filter(s => s.url?.trim() && (s.label?.trim() || s.platform?.trim()));
  const products = rawProducts.filter(p => p.title?.trim() && (p as any).is_active !== false);
  const campaigns = rawCampaigns.filter(c => c.title?.trim() && (c as any).is_active !== false);
  const now = new Date();
  const liveCampaigns = campaigns.filter(c => c.live && (!c.expires_at || new Date(c.expires_at) > now));
  const pastCampaigns = campaigns.filter(c => !c.live || (c.expires_at && new Date(c.expires_at) <= now));

  const pe = profile.page_effects || { effects: [] };
  const effects = (pe.effects || []) as PageEffect[];
  const fontFam = getFontFamily(profile.font_family || "default");
  const fontScale = getFontSizeScale(profile.font_size || "medium");

  useEffect(() => { loadGoogleFont(profile.font_family || "default"); }, [profile.font_family]);

  const handleLinkClick = (i: number, url: string) => {
    setClickedLink(i);
    if (url && url !== "https://") window.open(url, "_blank");
    setTimeout(() => setClickedLink(null), 400);
  };

  // Dark theme overrides
  const darkBg = "#0a0a0f";
  const darkCard = "rgba(255,255,255,0.04)";
  const neonPrimary = profile.color_name || "#a855f7";
  const neonGlow = `0 0 20px ${neonPrimary}40, 0 0 60px ${neonPrimary}15`;

  const content = (
    <div
      className={embedded ? "min-h-full h-full relative" : "min-h-screen relative"}
      style={{ fontFamily: fontFam, fontSize: `${fontScale}rem`, background: darkBg, color: "#e2e2e8" }}
    >
      <PageEffects effects={effects} color={pe.color} emojis={pe.emojis} intensity={pe.intensity} />

      {/* Neon glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] pointer-events-none" style={{
        background: `radial-gradient(ellipse, ${neonPrimary}25, transparent 70%)`,
        filter: "blur(40px)",
      }} />

      <div className={`${embedded ? "w-full max-w-[390px]" : "w-full max-w-[480px]"} mx-auto relative z-[1] px-5 py-16`}>
        {/* Cover */}
        {profile.cover_url && (
          <div className="w-full h-[180px] rounded-2xl overflow-hidden relative mb-[-50px] border border-white/5">
            <img src={profile.cover_url} alt="" className="w-full h-full object-cover will-change-transform"
              style={{ transform: `scale(1.1) translateY(${parallaxY * -0.4}px)` }} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, ${darkBg})` }} />
          </div>
        )}

        {/* Avatar + Name */}
        <div className="text-center mb-6">
          {profile.avatar_url && (
            <div className="w-24 h-24 rounded-full mx-auto overflow-hidden relative z-[2] border-2" style={{ borderColor: neonPrimary, boxShadow: neonGlow }}>
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          {profile.name && (
            <h1 className="text-2xl font-bold mt-4 tracking-tight" style={{ color: neonPrimary, textShadow: `0 0 30px ${neonPrimary}50` }}>
              {profile.name}
              {profile.verified && <span className="inline-block ml-2 align-middle"><VerifiedBadge size={20} /></span>}
            </h1>
          )}
          {profile.slug && <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>@{profile.slug.replace(/^@+/, "")}</p>}
          {profile.bio && (
            <p className="text-sm leading-relaxed mt-3 max-w-[360px] mx-auto" style={{ color: profile.color_bio || "rgba(255,255,255,0.6)" }}>
              {profile.bio}
            </p>
          )}

          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-2.5 mt-4">
              {socialLinks.map((soc) => (
                <a key={soc.id} href={soc.url} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-95"
                  style={{ background: darkCard, border: `1px solid ${neonPrimary}30` }}
                  title={soc.platform}>
                  <SocialIcon platform={soc.platform || soc.url} url={soc.url} size={16} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Live Campaigns */}
        {liveCampaigns.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            {liveCampaigns.map((camp) => (
              <SpotlightCampaign key={camp.id} campaign={camp} variant="layout1" />
            ))}
          </div>
        )}

        {/* Links */}
        {links.length > 0 && (
          <div className="flex flex-col gap-2.5 mb-8">
            {links.map((link, i) => (
              <div key={link.id} onClick={() => handleLinkClick(i, link.url)}
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] ${clickedLink === i ? "scale-[0.97]" : ""}`}
                style={{
                  background: link.bg_color || darkCard,
                  border: `1px solid ${link.border_color || neonPrimary + "20"}`,
                  ...(link.text_color ? { color: link.text_color } : {}),
                  ...(link.is_featured ? { boxShadow: `0 0 20px ${neonPrimary}20, inset 0 0 20px ${neonPrimary}05` } : {}),
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110"
                  style={{ background: `${neonPrimary}15` }}>
                  <LinkIcon icon={link.icon} url={link.url} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold">{link.title}</h4>
                  {link.subtitle && <span className="text-[0.72rem] opacity-50">{link.subtitle}</span>}
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-25"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
            ))}
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <div className="mb-8">
            <div className="text-[0.64rem] font-bold tracking-[0.14em] uppercase mb-3"
              style={{ color: profile.color_section_titles || neonPrimary }}>
              Meus Produtos
            </div>
            <div className="grid grid-cols-2 gap-3">
              {products.map((prod) => (
                <div key={prod.id} onClick={() => prod.url && window.open(prod.url, "_blank")}
                  className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 active:scale-[0.97] group"
                  style={{
                    background: prod.bg_color || darkCard,
                    border: `1px solid ${prod.border_color || neonPrimary + "15"}`,
                    ...(prod.text_color ? { color: prod.text_color } : {}),
                  }}>
                  {prod.image_url ? (
                    <img src={prod.image_url} alt="" className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 flex items-center justify-center text-3xl" style={{ background: `${neonPrimary}08` }}>{prod.icon}</div>
                  )}
                  <div className="p-3">
                    <h5 className="text-[0.82rem] font-semibold">{prod.title}</h5>
                    {prod.price && <span className="text-[0.72rem] font-bold" style={{ color: neonPrimary }}>{prod.price}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Campaigns */}
        {pastCampaigns.length > 0 && (
          <div className="mb-8">
            <div className="text-[0.64rem] font-bold tracking-[0.14em] uppercase mb-3"
              style={{ color: profile.color_section_titles || "rgba(255,255,255,0.35)" }}>
              Campanhas Anteriores
            </div>
            {pastCampaigns.map((camp) => (
              <div key={camp.id} onClick={() => camp.url && window.open(camp.url, "_blank")}
                className="rounded-2xl p-4 mb-2.5 cursor-pointer opacity-60 hover:opacity-90 transition-all"
                style={{ background: darkCard, border: "1px solid rgba(255,255,255,0.06)" }}>
                {camp.image_url && <img src={camp.image_url} alt="" className="w-full h-24 rounded-xl object-cover mb-2" />}
                <h5 className="text-[0.82rem] font-semibold">{camp.title}</h5>
                {camp.description && <p className="text-[0.68rem] opacity-50 mt-0.5">{camp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {agencyFooterVisible !== false && (
          <div className="flex items-center justify-center py-6 mt-4">
            {agencyFooterLink ? (
              <a href={agencyFooterLink.startsWith("http") ? agencyFooterLink : `https://${agencyFooterLink}`} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-full flex items-center gap-2 text-[0.68rem] transition-colors hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                {agencyLogoUrl ? <img src={agencyLogoUrl} alt="" className="w-4 h-4 rounded-sm object-contain" /> : <span className="opacity-60">⚡</span>}
                <span>{agencyFooterText || "Powered by"} <span className="font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{agencyName || "All in 1"}</span></span>
              </a>
            ) : (
              <div className="px-4 py-2 rounded-full flex items-center gap-2 text-[0.68rem]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                {agencyLogoUrl ? <img src={agencyLogoUrl} alt="" className="w-4 h-4 rounded-sm object-contain" /> : <span className="opacity-60">⚡</span>}
                <span>{agencyFooterText || "Powered by"} <span className="font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{agencyName || "All in 1"}</span></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return content;
}
