import type { CreatorCampaign } from "@/hooks/useCreatorData";

interface Props {
  campaign: CreatorCampaign;
  variant?: "layout1" | "layout2";
}

export default function SpotlightCampaign({ campaign, variant = "layout1" }: Props) {
  const handleClick = () => {
    if (campaign.url) window.open(campaign.url, "_blank");
  };

  return (
    <div
      onClick={handleClick}
      className="animate-k-spotlight-enter animate-k-spotlight-shimmer animate-k-spotlight-border relative rounded-3xl border-2 cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-k-purple-lg active:scale-[0.98] overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(268 69% 50% / 0.15), hsl(268 40% 10% / 0.8))",
        boxShadow: "0 0 40px hsl(268 69% 50% / 0.15), 0 8px 32px hsl(0 0% 0% / 0.3)",
      }}
    >
      {/* Glow ring behind */}
      <div className="absolute -inset-px rounded-3xl pointer-events-none" style={{
        background: "linear-gradient(135deg, hsl(268 85% 61% / 0.2), hsl(268 69% 50% / 0.05), hsl(268 100% 71% / 0.15))",
      }} />

      {/* Image */}
      {campaign.image_url && (
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-3xl">
          <img
            src={campaign.image_url}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className={`relative p-5 ${campaign.image_url ? "-mt-12" : "pt-6"}`}>
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-3">
          {campaign.live && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider bg-k-err/20 text-k-err border border-k-err/20">
              <span className="w-2 h-2 rounded-full bg-k-err animate-k-live-dot" />
              Ao Vivo
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.62rem] font-bold uppercase tracking-wider bg-primary/15 text-k-300 border border-primary/20">
            ✨ Destaque
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-primary-foreground leading-tight mb-1.5 tracking-tight">
          {campaign.title}
        </h3>

        {/* Description */}
        {campaign.description && (
          <p className="text-[0.78rem] text-k-2 leading-relaxed mb-4 line-clamp-2">
            {campaign.description}
          </p>
        )}

        {/* CTA Button */}
        {campaign.url && (
          <div className="flex">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground text-[0.82rem] font-bold transition-all duration-300 group-hover:shadow-k-purple group-hover:gap-3">
              Acessar agora
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
