import { useState } from "react";
import { toast } from "sonner";
import SocialIcon, { detectPlatform } from "./SocialIcon";
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

  const links = rawLinks.filter(l => l.title?.trim() && l.url?.trim());
  const socialLinks = rawSocial.filter(s => s.url?.trim() && (s.label?.trim() || s.platform?.trim()));
  const products = rawProducts.filter(p => p.title?.trim());
  const campaigns = rawCampaigns.filter(c => c.title?.trim());
  const stats = profile.stats.filter(s => s.value?.trim() && s.label?.trim());
  const tags = profile.tags.filter(t => t.label?.trim());

  return (
    <div className="min-h-screen bg-background flex justify-center">
      {/* Blurred background from cover or avatar */}
      {(profile.cover_url || profile.avatar_url) && (
        <div className="fixed inset-0 z-0">
          <img
            src={profile.cover_url || profile.avatar_url}
            alt=""
            className="w-full h-full object-cover scale-110 blur-[60px] opacity-30"
          />
          <div className="absolute inset-0 bg-background/70" />
        </div>
      )}

      <div className="w-full max-w-[430px] relative z-[1] pb-12">
        {/* Hero Photo — tall, immersive */}
        <div className="relative w-full aspect-[3/4] max-h-[520px] overflow-hidden rounded-b-[2rem]">
          {profile.avatar_url || profile.cover_url ? (
            <img
              src={profile.cover_url || profile.avatar_url}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-primary/30 to-background flex items-center justify-center">
              <span className="text-6xl text-k-3">{profile.name?.[0] || "?"}</span>
            </div>
          )}
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-background via-background/80 to-transparent" />

          {/* Name overlay */}
          <div className="absolute inset-x-0 bottom-0 px-6 pb-4 text-center">
            <h1 className="font-display text-[2rem] font-bold text-primary-foreground tracking-tight leading-tight drop-shadow-lg">
              {profile.name}
            </h1>
            {profile.handle && (
              <p className="text-sm text-k-3 mt-1">@{profile.handle}</p>
            )}
          </div>
        </div>

        {/* Social Icons Row */}
        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-3 mt-5 px-6">
            {socialLinks.map((soc) => (
              <a
                key={soc.id}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-xl border border-primary/15 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-primary/40 hover:shadow-[0_4px_20px_hsl(268_69%_50%_/_0.3)] active:scale-95"
                title={soc.platform}
              >
                <span className="text-lg">{soc.label || soc.platform?.[0] || "🔗"}</span>
              </a>
            ))}
          </div>
        )}

        {/* Stats */}
        {stats.length > 0 && (
          <div className="flex justify-center items-center gap-6 mt-5 px-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <strong className="block text-xl font-extrabold text-primary-foreground">{stat.value}</strong>
                <span className="text-[0.65rem] text-k-3 uppercase tracking-widest font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex justify-center gap-2 mt-4 px-6 flex-wrap">
            {tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-[0.7rem] font-semibold bg-primary/10 text-k-300 border border-primary/20">
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-k-2 text-center leading-relaxed mt-4 px-8 max-w-[380px] mx-auto">
            {profile.bio}
          </p>
        )}

        {/* Links as Image Cards */}
        {links.length > 0 && (
          <div className="flex flex-col gap-3 mt-7 px-4">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_hsl(268_69%_50%_/_0.25)] active:scale-[0.98]"
              >
                {/* Card with icon + text */}
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
            ))}
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <div className="mt-8 px-4">
            <div className="text-[0.66rem] font-bold text-k-4 tracking-[0.14em] uppercase mb-3 flex items-center gap-2.5 px-1">
              Produtos <span className="flex-1 h-px bg-primary/10" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => prod.url && window.open(prod.url, "_blank")}
                  className="bg-card/70 backdrop-blur-xl border border-primary/10 rounded-2xl p-4 cursor-pointer transition-all duration-300 group hover:border-primary/30 hover:-translate-y-1 hover:shadow-[0_6px_24px_hsl(268_69%_50%_/_0.2)] active:scale-[0.97]"
                >
                  <div className="text-2xl mb-2 transition-transform group-hover:scale-110">{prod.icon}</div>
                  <h5 className="text-[0.82rem] font-semibold text-primary-foreground mb-1">{prod.title}</h5>
                  {prod.price && <span className="text-[0.72rem] text-k-300 font-bold">{prod.price}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaigns as Image Cards */}
        {campaigns.length > 0 && (
          <div className="mt-8 px-4">
            <div className="text-[0.66rem] font-bold text-k-4 tracking-[0.14em] uppercase mb-3 flex items-center gap-2.5 px-1">
              Campanhas {campaigns.some(c => c.live) && "Ativas"} <span className="flex-1 h-px bg-primary/10" />
            </div>
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
                        {camp.live && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="w-2 h-2 rounded-full bg-k-ok animate-pulse" />
                            <span className="text-[0.62rem] text-k-ok font-bold uppercase tracking-wider">Ao vivo</span>
                          </div>
                        )}
                        <h5 className="text-sm font-bold text-primary-foreground">{camp.title}</h5>
                        {camp.description && <p className="text-[0.7rem] text-k-2 mt-1 line-clamp-2">{camp.description}</p>}
                      </div>
                    </>
                  ) : (
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-5">
                      {camp.live && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="w-2 h-2 rounded-full bg-k-ok animate-pulse" />
                          <span className="text-[0.62rem] text-k-ok font-bold uppercase tracking-wider">Ao vivo</span>
                        </div>
                      )}
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
            className="w-full p-4 bg-card/70 backdrop-blur-xl border border-primary/10 rounded-2xl text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_4px_20px_hsl(268_69%_50%_/_0.2)] active:scale-[0.98]"
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
  );
}
