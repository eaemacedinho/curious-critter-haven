import { toast } from "sonner";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign } from "@/hooks/useCreatorData";
import { useState } from "react";
import SocialIcon from "./SocialIcon";
import VerifiedBadge from "./VerifiedBadge";

interface Props {
  profile: CreatorProfile;
  links: CreatorLink[];
  socialLinks: SocialLink[];
  products: CreatorProduct[];
  campaigns: CreatorCampaign[];
}

export default function CreatorView({ profile, links: rawLinks, socialLinks: rawSocial, products: rawProducts, campaigns: rawCampaigns }: Props) {
  const [contactOpen, setContactOpen] = useState(false);
  const [clickedLink, setClickedLink] = useState<number | null>(null);

  // Filter out incomplete/empty items
  const links = rawLinks.filter(l => l.title?.trim() && l.url?.trim());
  const socialLinks = rawSocial.filter(s => s.url?.trim() && (s.label?.trim() || s.platform?.trim()));
  const products = rawProducts.filter(p => p.title?.trim());
  const campaigns = rawCampaigns.filter(c => c.title?.trim());
  const stats = profile.stats.filter(s => s.value?.trim() && s.label?.trim());
  const tags = profile.tags.filter(t => t.label?.trim());
  const brands = profile.brands.filter(b => b?.name?.trim());

  const handleLinkClick = (i: number, url: string) => {
    setClickedLink(i);
    if (url && url !== "https://") window.open(url, "_blank");
    setTimeout(() => setClickedLink(null), 400);
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-6 py-20 pt-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[420px] bg-[radial-gradient(ellipse,hsl(268_69%_50%_/_0.4),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-[460px] relative z-[1]">
        {/* Cover */}
        {profile.cover_url && (
          <div className="w-full h-[200px] rounded-3xl overflow-hidden relative mb-[-56px]">
            <img src={profile.cover_url} alt="cover" className="w-full h-full object-cover" />
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
                <div className="w-full h-full bg-k-800 flex items-center justify-center text-3xl text-k-3">
                  {profile.name?.[0] || "?"}
                </div>
              )}
            </div>
            <div className="absolute bottom-1 right-1 z-[3] w-7 h-7 bg-primary rounded-full border-[3px] border-background flex items-center justify-center shadow-lg">
              <svg className="w-3.5 h-3.5 fill-primary-foreground" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
            </div>
          </div>

          {profile.name && (
            <h1 className="font-display text-[1.85rem] font-normal mt-4 text-primary-foreground tracking-tight inline-flex items-center justify-center gap-2">
              {profile.name}
              {profile.verified && <VerifiedBadge size={22} />}
            </h1>
          )}
          {profile.handle && <p className="text-sm text-k-3 mt-1">@{profile.handle.replace(/^@+/, "")}</p>}

          {tags.length > 0 && (
            <div className="flex justify-center gap-2 mt-3 flex-wrap">
              {tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-[0.68rem] font-semibold bg-primary/10 text-k-300 border border-primary/20">
                  {tag.label}
                </span>
              ))}
            </div>
          )}

          {stats.length > 0 && (
            <div className="flex justify-center gap-7 mt-5 py-4 border-t border-b border-primary-foreground/5">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <strong className="block text-lg font-extrabold text-primary-foreground tracking-tight">{stat.value}</strong>
                  <span className="text-[0.64rem] text-k-3 uppercase tracking-widest font-semibold">{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          {brands.length > 0 && (
            <div className="flex justify-center items-center gap-3 mt-4 flex-wrap">
              <span className="text-[0.62rem] text-k-4 uppercase tracking-widest font-bold">Trabalhou com:</span>
              {brands.map((brand, i) => (
                <span key={i} className="text-[0.65rem] text-k-3 font-semibold px-2 py-0.5 bg-card/80 rounded-md border border-primary/5 flex items-center gap-1.5">
                  {brand.logo_url && <img src={brand.logo_url} alt="" className="w-4 h-4 rounded-sm object-contain" />}
                  {brand.name}
                </span>
              ))}
            </div>
          )}

          {profile.bio && (
            <p className="text-sm text-k-2 leading-relaxed mt-5 max-w-[380px] mx-auto">{profile.bio}</p>
          )}

          {/* Social Icons */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-2.5 mt-5 mb-7">
              {socialLinks.map((soc) => (
                <a key={soc.id} href={soc.url} target="_blank" rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-k-800 border border-primary/10 flex items-center justify-center text-primary-foreground transition-all duration-250 hover:border-k-400 hover:bg-k-glow hover:-translate-y-0.5 hover:scale-105 active:scale-95"
                  title={soc.platform}>
                  <SocialIcon platform={soc.platform || soc.url} size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Links */}
        {links.length > 0 && (
          <div className="flex flex-col gap-2.5 mb-8 animate-k-fade-up" style={{ animationDelay: ".15s" }}>
            {links.map((link, i) => (
              <div key={link.id} onClick={() => handleLinkClick(i, link.url)}
                className={`flex items-center gap-3.5 p-4 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group
                  ${clickedLink === i ? "scale-[0.97]" : ""}
                  ${link.featured
                    ? "gradient-primary border-transparent shadow-k-purple-lg hover:-translate-y-1"
                    : "bg-card/65 backdrop-blur-2xl border border-primary/10 hover:border-k-glow hover:-translate-y-1 hover:shadow-k-purple"
                  } active:scale-[0.97]`}>
                <div className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center flex-shrink-0 text-lg transition-transform duration-300 group-hover:scale-110 ${link.featured ? "bg-primary-foreground/15" : "bg-primary-foreground/5"}`}>
                  {link.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold leading-snug">{link.title}</h4>
                  {link.subtitle && <span className="text-[0.72rem] opacity-55">{link.subtitle}</span>}
                </div>
                <div className="opacity-30 transition-all duration-200 group-hover:opacity-60 group-hover:translate-x-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <div className="animate-k-fade-up" style={{ animationDelay: ".25s" }}>
            <div className="text-[0.66rem] font-bold text-k-4 tracking-[0.14em] uppercase mb-3.5 flex items-center gap-2.5">
              Meus Produtos <span className="flex-1 h-px bg-primary/10" />
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-8">
              {products.map((prod) => (
                <div key={prod.id} onClick={() => prod.url && window.open(prod.url, "_blank")}
                  className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl p-4 transition-all duration-300 cursor-pointer group hover:border-k-glow hover:-translate-y-1 hover:shadow-k-purple active:scale-[0.97]">
                  <div className="text-2xl mb-2 transition-transform group-hover:scale-110">{prod.icon}</div>
                  <h5 className="text-[0.82rem] font-semibold text-primary-foreground mb-1">{prod.title}</h5>
                  {prod.price && <span className="text-[0.72rem] text-k-300 font-bold">{prod.price}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaigns */}
        {campaigns.length > 0 && (
          <div className="animate-k-fade-up" style={{ animationDelay: ".3s" }}>
            <div className="text-[0.66rem] font-bold text-k-4 tracking-[0.14em] uppercase mb-3.5 flex items-center gap-2.5">
              Campanhas {campaigns.some(c => c.live) && "Ativas"} <span className="flex-1 h-px bg-primary/10" />
            </div>
            <div className="flex flex-col gap-2.5 mb-8">
              {campaigns.map((camp) => (
                <div key={camp.id} onClick={() => camp.url && window.open(camp.url, "_blank")}
                  className="bg-gradient-to-br from-primary/20 to-k-600/10 border border-primary/20 rounded-2xl p-4 transition-all duration-300 hover:border-k-400 group cursor-pointer active:scale-[0.98]">
                  {camp.live && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-k-ok animate-k-pulse" />
                      <span className="text-[0.65rem] text-k-ok font-bold uppercase tracking-wider">Ao vivo</span>
                    </div>
                  )}
                  {camp.image_url && (
                    <div className="w-full h-[120px] rounded-xl overflow-hidden mb-3">
                      <img src={camp.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h5 className="text-[0.82rem] font-semibold text-primary-foreground mb-1">{camp.title}</h5>
                  {camp.description && <span className="text-[0.68rem] text-k-3">{camp.description}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact CTA */}
        <button onClick={() => setContactOpen(!contactOpen)}
          className="w-full p-4 bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:border-k-400 hover:bg-k-glow hover:shadow-k-purple mb-2 active:scale-[0.98]">
          ✉️ Contato comercial
        </button>

        {contactOpen && (
          <div className="bg-card/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-5 mb-8 animate-k-fade-up space-y-3">
            <h4 className="text-sm font-bold text-primary-foreground">Entre em contato</h4>
            <input placeholder="Seu nome" className="w-full px-3.5 py-2.5 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 transition-all placeholder:text-k-4" />
            <input placeholder="seu@email.com" className="w-full px-3.5 py-2.5 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 transition-all placeholder:text-k-4" />
            <textarea placeholder="Mensagem..." className="w-full px-3.5 py-2.5 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 transition-all resize-none min-h-[80px] placeholder:text-k-4" />
            <button onClick={() => { toast.success("Mensagem enviada! ✉️"); setContactOpen(false); }}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:bg-k-400 hover:shadow-k-purple active:scale-[0.97]">
              Enviar mensagem
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-[0.7rem] text-k-4 opacity-50 hover:opacity-90 transition-opacity py-2 mt-4">
          <span className="font-extrabold text-k-300">K</span>
          managed by Kreatorz
        </div>
      </div>
    </div>
  );
}
