import type { FullTemplateData } from "@/lib/templateData";

interface Props {
  template: FullTemplateData;
  fullHeight?: boolean;
}

export default function TemplatePreviewCard({ template, fullHeight }: Props) {
  const { profile, links, socialLinks, products, testimonials } = template;

  return (
    <div className={`w-full ${fullHeight ? "min-h-full" : "h-full"} overflow-hidden bg-background text-foreground`}>
      {/* Cover area with real image */}
      <div className="relative h-28">
        <div className="absolute inset-0 overflow-hidden">
          {profile.cover_url ? (
            <img
              src={profile.cover_url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.category}
              className={`w-16 h-16 object-cover border-2 border-background shadow-lg ${
                profile.image_shape === "circular" ? "rounded-full" : "rounded-2xl"
              }`}
              loading="lazy"
            />
          ) : (
            <div className={`w-16 h-16 bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-background flex items-center justify-center text-2xl ${profile.image_shape === "circular" ? "rounded-full" : "rounded-2xl"}`}>
              {profile.category.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-10 px-4 pb-3 text-center">
        <p className="text-xs font-bold text-foreground">{profile.category}</p>
        <p className="text-[0.6rem] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed px-2">{profile.bio}</p>

        {profile.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mt-2">
            {profile.tags.map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[0.5rem] font-semibold">
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {profile.stats.length > 0 && (
          <div className="flex justify-center gap-3 mt-2">
            {profile.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-[0.6rem] font-bold text-foreground">{stat.value}</p>
                <p className="text-[0.45rem] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-2 mt-2">
            {socialLinks.map((s, i) => (
              <div key={i} className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                <span className="text-[0.45rem] text-muted-foreground">{s.platform.charAt(0).toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Links */}
      {links.length > 0 && (
        <div className="px-3 space-y-1.5">
          {links.map((link, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-3 py-2 border border-border/50 bg-card/50 text-[0.55rem] ${
                profile.image_shape_links === "pill" ? "rounded-full" : "rounded-xl"
              } ${link.is_featured ? "border-primary/30 bg-primary/5" : ""}`}
            >
              <span className="text-xs">{link.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{link.title}</p>
                {link.subtitle && <p className="text-[0.45rem] text-muted-foreground truncate">{link.subtitle}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products */}
      {products.length > 0 && (
        <div className="px-3 mt-3">
          <p className="text-[0.55rem] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Produtos</p>
          <div className="grid grid-cols-2 gap-1.5">
            {products.slice(0, 4).map((product, i) => (
              <div
                key={i}
                className={`px-2 py-2 border border-border/50 bg-card/50 ${
                  profile.image_shape_products === "pill" ? "rounded-full" : "rounded-xl"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-7 h-7 rounded-md object-cover flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs">{product.icon}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.5rem] font-semibold text-foreground truncate">{product.title}</p>
                    <p className="text-[0.45rem] font-bold text-primary">{product.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="px-3 mt-3">
          <p className="text-[0.55rem] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Depoimentos</p>
          <div className="space-y-1.5">
            {testimonials.slice(0, 2).map((t, i) => (
              <div key={i} className="px-2.5 py-2 rounded-xl border border-border/50 bg-card/50">
                <p className="text-[0.45rem] text-muted-foreground italic line-clamp-2">"{t.content}"</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-[0.35rem] text-primary font-bold">{t.author_name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-[0.4rem] font-semibold text-foreground">{t.author_name}</p>
                    <p className="text-[0.35rem] text-muted-foreground">{t.author_role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {profile.brands.length > 0 && (
        <div className="px-3 mt-3 pb-4">
          <p className="text-[0.55rem] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Parceiros</p>
          <div className="flex gap-2 justify-center">
            {profile.brands.map((b, i) => (
              <span key={i} className="text-[0.5rem] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">{b.name}</span>
            ))}
          </div>
        </div>
      )}

      {!fullHeight && <div className="h-4" />}
    </div>
  );
}
