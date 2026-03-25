import { useState, useEffect } from "react";
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

export default function CreatorViewGrid({ profile, links: rawLinks, socialLinks: rawSocial, products: rawProducts, campaigns: rawCampaigns, agencyName, agencyLogoUrl, agencyFooterText, agencyFooterVisible = true, agencyFooterLink, embedded }: Props) {
  const links = rawLinks.filter(l => l.title?.trim() && l.url?.trim() && l.is_active !== false);
  const socialLinks = rawSocial.filter(s => s.url?.trim() && (s.label?.trim() || s.platform?.trim()));
  const products = rawProducts.filter(p => p.title?.trim() && (p as any).is_active !== false);
  const campaigns = rawCampaigns.filter(c => c.title?.trim() && c.live && (c as any).is_active !== false);

  const pe = profile.page_effects || { effects: [] };
  const effects = (pe.effects || []) as PageEffect[];
  const fontFam = getFontFamily(profile.font_family || "default");
  const fontScale = getFontSizeScale(profile.font_size || "medium");

  useEffect(() => { loadGoogleFont(profile.font_family || "default"); }, [profile.font_family]);

  // Build bento items from all content
  const bentoItems: { type: string; data: any }[] = [];
  campaigns.forEach(c => bentoItems.push({ type: "campaign", data: c }));
  links.forEach(l => bentoItems.push({ type: "link", data: l }));
  products.forEach(p => bentoItems.push({ type: "product", data: p }));

  const content = (
    <div
      className={embedded ? "min-h-full h-full px-4 py-12 relative" : "min-h-screen px-4 py-12 relative"}
      style={{ fontFamily: fontFam, fontSize: `${fontScale}rem` }}
    >
      <PageEffects effects={effects} color={pe.color} emojis={pe.emojis} intensity={pe.intensity} />

      <div className={`${embedded ? "w-full max-w-[390px]" : "w-full max-w-[520px]"} mx-auto relative z-[1]`}>
        {/* Header card */}
        <div className="rounded-3xl bg-card/70 backdrop-blur-xl border border-border p-6 mb-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            {profile.avatar_url && (
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-border flex-shrink-0">
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="text-left">
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-1.5"
                style={profile.color_name ? { color: profile.color_name } : { color: "hsl(var(--foreground))" }}>
                {profile.name}
                {profile.verified && <VerifiedBadge size={18} />}
              </h1>
              {profile.slug && <p className="text-xs text-muted-foreground">@{profile.slug.replace(/^@+/, "")}</p>}
            </div>
          </div>
          {profile.bio && (
            <p className="text-[0.82rem] leading-relaxed mb-3 max-w-[340px] mx-auto"
              style={profile.color_bio ? { color: profile.color_bio } : { color: "hsl(var(--muted-foreground))" }}>{profile.bio}</p>
          )}
          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-2 mt-2">
              {socialLinks.map((soc) => (
                <a key={soc.id} href={soc.url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary/5 border border-border transition-all hover:scale-110">
                  <SocialIcon platform={soc.platform || soc.url} url={soc.url} size={14} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 gap-3">
          {bentoItems.map((item, idx) => {
            const isWide = idx % 5 === 0; // Every 5th item spans full width
            const colSpan = isWide ? "col-span-2" : "";

            if (item.type === "campaign") {
              const camp = item.data as CreatorCampaign;
              return (
                <div key={`camp-${camp.id}`}
                  onClick={() => camp.url && window.open(camp.url, "_blank")}
                  className={`${colSpan} rounded-2xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-1 active:scale-[0.98] relative border border-border`}
                  style={{ ...(camp.bg_color ? { backgroundColor: camp.bg_color } : { backgroundColor: "hsl(var(--card))" }) }}>
                  {camp.image_url ? (
                    <>
                      <div className={`w-full ${isWide ? "aspect-[21/9]" : "aspect-square"} overflow-hidden`}>
                        <img src={camp.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <span className="text-[0.58rem] font-bold uppercase tracking-wider text-primary bg-primary/20 px-2 py-0.5 rounded-full backdrop-blur-sm">🔴 Live</span>
                        <h5 className="text-sm font-bold text-white mt-1.5 drop-shadow-lg" style={camp.text_color ? { color: camp.text_color } : undefined}>{camp.title}</h5>
                      </div>
                    </>
                  ) : (
                    <div className="p-4">
                      <span className="text-[0.58rem] font-bold uppercase tracking-wider text-primary">🔴 Live</span>
                      <h5 className="text-sm font-bold mt-1" style={camp.text_color ? { color: camp.text_color } : undefined}>{camp.title}</h5>
                      {camp.description && <p className="text-[0.7rem] text-muted-foreground mt-1">{camp.description}</p>}
                    </div>
                  )}
                </div>
              );
            }

            if (item.type === "link") {
              const link = item.data as CreatorLink;
              return (
                <a key={`link-${link.id}`} href={link.url} target="_blank" rel="noopener noreferrer"
                  className={`${colSpan} rounded-2xl overflow-hidden transition-all hover:-translate-y-1 active:scale-[0.98] group relative border border-border`}
                  style={{
                    ...(link.bg_color ? { backgroundColor: link.bg_color } : { backgroundColor: "hsl(var(--card))" }),
                    color: autoTextColor(link.bg_color, link.text_color),
                    ...(link.border_color ? { borderColor: link.border_color } : {}),
                  }}>
                  {link.image_url ? (
                    <>
                      <div className={`w-full ${isWide ? "aspect-[21/9]" : "aspect-[4/3]"} overflow-hidden`}>
                        <img src={link.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="text-[0.82rem] font-semibold text-white drop-shadow-lg">{link.title}</h4>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 flex items-center gap-3 min-h-[80px]">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                        <LinkIcon icon={link.icon} url={link.url} size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[0.82rem] font-semibold leading-snug">{link.title}</h4>
                        {link.subtitle && <span className="text-[0.68rem] opacity-55 line-clamp-1">{link.subtitle}</span>}
                      </div>
                    </div>
                  )}
                </a>
              );
            }

            if (item.type === "product") {
              const prod = item.data as CreatorProduct;
              return (
                <div key={`prod-${prod.id}`}
                  onClick={() => prod.url && window.open(prod.url, "_blank")}
                  className={`rounded-2xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-1 active:scale-[0.98] border border-border`}
                  style={{ ...(prod.bg_color ? { backgroundColor: prod.bg_color } : { backgroundColor: "hsl(var(--card))" }), color: autoTextColor(prod.bg_color, prod.text_color) }}>
                  {prod.image_url ? (
                    <div className="w-full aspect-square overflow-hidden">
                      <img src={prod.image_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-primary/5 text-3xl">{prod.icon}</div>
                  )}
                  <div className="p-3">
                    <h5 className="text-[0.78rem] font-semibold">{prod.title}</h5>
                    {prod.price && <span className="text-[0.7rem] font-bold text-primary">{prod.price}</span>}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Footer */}
        {agencyFooterVisible !== false && (
          <div className="flex items-center justify-center py-6 mt-6">
            {agencyFooterLink ? (
              <a href={agencyFooterLink.startsWith("http") ? agencyFooterLink : `https://${agencyFooterLink}`} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/40 flex items-center gap-2 text-[0.68rem] text-muted-foreground/70 hover:text-muted-foreground transition-colors">
                {agencyLogoUrl ? <img src={agencyLogoUrl} alt="" className="w-4 h-4 rounded-sm object-contain" /> : <span className="opacity-60">⚡</span>}
                <span>{agencyFooterText || "Powered by"} <span className="font-semibold text-foreground/60">{agencyName || "All in 1"}</span></span>
              </a>
            ) : (
              <div className="px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/40 flex items-center gap-2 text-[0.68rem] text-muted-foreground/70">
                {agencyLogoUrl ? <img src={agencyLogoUrl} alt="" className="w-4 h-4 rounded-sm object-contain" /> : <span className="opacity-60">⚡</span>}
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
