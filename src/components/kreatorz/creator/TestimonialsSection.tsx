import { Star } from "lucide-react";

export interface Testimonial {
  id: string;
  creator_id: string;
  author_name: string;
  author_role: string;
  author_avatar_url: string;
  content: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
}

interface Props {
  testimonials: Testimonial[];
  sectionTitleColor?: string | null;
}

export default function TestimonialsSection({ testimonials, sectionTitleColor }: Props) {
  const active = testimonials.filter(t => t.is_active && t.content?.trim());
  if (active.length === 0) return null;

  return (
    <div className="mb-8 animate-k-fade-up" style={{ animationDelay: ".28s" }}>
      <div
        className="text-[0.66rem] font-bold tracking-[0.14em] uppercase mb-3.5 flex items-center gap-2.5"
        style={sectionTitleColor ? { color: sectionTitleColor } : { color: "hsl(var(--muted-foreground))" }}
      >
        Depoimentos <span className="flex-1 h-px bg-border" />
      </div>

      <div className="flex flex-col gap-3">
        {active.map((t) => (
          <div
            key={t.id}
            className="bg-card/65 backdrop-blur-xl border border-border rounded-2xl p-4 transition-all hover:border-primary/20"
          >
            {/* Stars */}
            {(t.rating ?? 0) > 0 && (
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < (t.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
            )}

            {/* Content */}
            <p className="text-sm text-foreground/90 leading-relaxed italic">
              "{t.content}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-2.5 mt-3">
              {t.author_avatar_url ? (
                <img
                  src={t.author_avatar_url}
                  alt={t.author_name}
                  className="w-8 h-8 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {t.author_name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-foreground">{t.author_name}</p>
                {t.author_role && (
                  <p className="text-[0.65rem] text-muted-foreground">{t.author_role}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
