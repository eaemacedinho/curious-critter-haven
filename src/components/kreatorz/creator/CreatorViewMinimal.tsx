import { useState, useEffect, useCallback } from "react";
import { autoTextColor } from "@/lib/utils";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign } from "@/hooks/useCreatorData";
import SocialIcon, { LinkIcon } from "./SocialIcon";
import VerifiedBadge from "./VerifiedBadge";
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

export default function CreatorViewMinimal({ profile, links: rawLinks, socialLinks: rawSocial, products: rawProducts, campaigns: rawCampaigns, agencyName, agencyLogoUrl, agencyFooterText, agencyFooterVisible = true, agencyFooterLink, embedded }: Props) {
  const links = rawLinks.filter(l => l.title?.trim() && l.url?.trim() && l.is_active !== false);
  const socialLinks = rawSocial.filter(s => s.url?.trim() && (s.label?.trim() || s.platform?.trim()));
  const products = rawProducts.filter(p => p.title?.trim() && (p as any).is_active !== false);
  const campaigns = rawCampaigns.filter(c => c.title?.trim() && c.live && (c as any).is_active !== false);

  const pe = profile.page_effects || { effects: [] };
  const effects = (pe.effects || []) as PageEffect[];
  const fontFam = getFontFamily(profile.font_family || "default");
  const fontScale = getFontSizeScale(profile.font_size || "medium");

  useEffect(() => { loadGoogleFont(profile.font_family || "default"); }, [profile.font_family]);

  const content = (
    <div
      className={embedded ? "min-h-full h-full px-6 py-16 relative" : "min-h-screen px-6 py-16 relative"}
      style={{ fontFamily: fontFam, fontSize: `${fontScale}rem` }}
    >
      <PageEffects effects={effects} color={pe.color} emojis={pe.emojis} intensity={pe.intensity} />

      <div className={`${embedded ? "w-full max-w-[390px]" : "w-full max-w-[440px]"} mx-auto relative z-[1]`}>
        {/* Avatar + Name — ultra clean */}
        <div className="flex flex-col items-center text-center mb-10">
          {profile.avatar_url && (
            <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-border">
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          {profile.name && (
            <h1 className="text-xl font-semibold tracking-tight" style={profile.color_name ? { color: profile.color_name } : { color: "hsl(var(--foreground))" }}>
              {profile.name}
              {profile.verified && <span className="inline-block ml-1.5 align-middle"><VerifiedBadge size={18} /></span>}
            </h1>
          )}
          {profile.slug && <p className="text-xs text-muted-foreground mt-1">@{profile.slug.replace(/^@+/, "")}</p>}
          {profile.bio && (
            <p className="text-sm leading-relaxed mt-3 max-w-[320px]" style={profile.color_bio ? { color: profile.color_bio } : { color: "hsl(var(--muted-foreground))" }}>
              {profile.bio}
            </p>
          )}

          {socialLinks.length > 0 && (
            <div className="flex gap-2.5 mt-4">
              {socialLinks.map((soc) => (
                <a key={soc.id} href={soc.url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-border transition-all hover:scale-110 hover:border-primary/30">
                  <SocialIcon platform={soc.platform || soc.url} url={soc.url} size={14} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Links — minimal cards */}
        {links.length > 0 && (
          <div className="flex flex-col gap-2.5 mb-8">
            {links.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-card/50 transition-all hover:border-primary/20 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  ...(link.bg_color ? { backgroundColor: link.bg_color } : {}),
                  color: autoTextColor(link.bg_color, link.text_color),
                  ...(link.border_color ? { borderColor: link.border_color } : {}),
                }}>
                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <LinkIcon icon={link.icon} url={link.url} size={16} />
                </div>
                <span className="text-sm font-medium flex-1">{link.title}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-30"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
            ))}
          </div>
        )}

        {/* Products — simple list */}
        {products.length > 0 && (
          <div className="mb-8">
            <div className="text-[0.62rem] font-bold tracking-[0.14em] uppercase mb-3"
              style={profile.color_section_titles ? { color: profile.color_section_titles } : { color: "hsl(var(--muted-foreground))" }}>Produtos</div>
            <div className="grid grid-cols-2 gap-2.5">
              {products.map((prod) => (
                <div key={prod.id} onClick={() => prod.url && window.open(prod.url, "_blank")}
                  className="rounded-xl border border-border bg-card/50 overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{ ...(prod.bg_color ? { backgroundColor: prod.bg_color } : {}), ...(prod.text_color ? { color: prod.text_color } : {}) }}>
                  {prod.image_url && <img src={prod.image_url} alt="" className="w-full h-24 object-cover" />}
                  <div className="p-3">
                    <h5 className="text-[0.78rem] font-semibold">{prod.title}</h5>
                    {prod.price && <span className="text-[0.7rem] font-bold text-primary">{prod.price}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaigns */}
        {campaigns.length > 0 && (
          <div className="mb-8">
            <div className="text-[0.62rem] font-bold tracking-[0.14em] uppercase mb-3"
              style={profile.color_section_titles ? { color: profile.color_section_titles } : { color: "hsl(var(--muted-foreground))" }}>Em destaque</div>
            {campaigns.map((camp) => (
              <div key={camp.id} onClick={() => camp.url && window.open(camp.url, "_blank")}
                className="rounded-xl border border-border bg-card/50 overflow-hidden cursor-pointer mb-2.5 transition-all hover:-translate-y-0.5"
                style={{ ...(camp.bg_color ? { backgroundColor: camp.bg_color } : {}), ...(camp.text_color ? { color: camp.text_color } : {}) }}>
                {camp.image_url && <img src={camp.image_url} alt="" className="w-full h-32 object-cover" />}
                <div className="p-3.5">
                  <h5 className="text-sm font-semibold">{camp.title}</h5>
                  {camp.description && <p className="text-[0.72rem] text-muted-foreground mt-1">{camp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {agencyFooterVisible !== false && (
          <div className="flex items-center justify-center py-6 mt-4">
            {agencyFooterLink ? (
              <a href={agencyFooterLink.startsWith("http") ? agencyFooterLink : `https://${agencyFooterLink}`} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-card/60 border border-border/40 flex items-center gap-2 text-[0.64rem] text-muted-foreground/70 hover:text-muted-foreground transition-colors">
                {agencyLogoUrl ? <img src={agencyLogoUrl} alt="" className="w-3.5 h-3.5 rounded-sm object-contain" /> : <span className="opacity-60">⚡</span>}
                <span>{agencyFooterText || "Powered by"} <span className="font-semibold text-foreground/60">{agencyName || "All in 1"}</span></span>
              </a>
            ) : (
              <div className="px-3 py-1.5 rounded-full bg-card/60 border border-border/40 flex items-center gap-2 text-[0.64rem] text-muted-foreground/70">
                {agencyLogoUrl ? <img src={agencyLogoUrl} alt="" className="w-3.5 h-3.5 rounded-sm object-contain" /> : <span className="opacity-60">⚡</span>}
                <span>{agencyFooterText || "Powered by"} <span className="font-semibold text-foreground/60">{agencyName || "All in 1"}</span></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return content;
}
