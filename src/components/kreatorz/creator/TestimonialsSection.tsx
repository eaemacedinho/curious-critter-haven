import { Star } from "lucide-react";
import { useRef } from "react";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  if (active.length === 0) return null;

  const single = active.length === 1;

  return (
    <div className="mb-8 animate-k-fade-up" style={{ animationDelay: ".28s" }}>
      <div
        className="text-[0.66rem] font-bold tracking-[0.14em] uppercase mb-3.5 flex items-center gap-2.5"
        style={sectionTitleColor ? { color: sectionTitleColor } : { color: "hsl(var(--muted-foreground))" }}
      >
        Depoimentos <span className="flex-1 h-px bg-border" />
      </div>

      {single ? (
        /* Single testimonial — full width card */
        <TestimonialCard testimonial={active[0]} />
      ) : (
        /* Multiple testimonials — horizontal scroll */
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {active.map((t) => (
              <div key={t.id} className="snap-start flex-shrink-0 w-[75%] min-w-[220px] max-w-[300px]">
                <TestimonialCard testimonial={t} compact />
              </div>
            ))}
          </div>
          {/* Scroll dots indicator */}
          {active.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {active.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => {
                    const el = scrollRef.current;
                    if (!el) return;
                    const cards = el.children;
                    if (cards[i]) (cards[i] as HTMLElement).scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/60 transition-colors"
                  aria-label={`Depoimento ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TestimonialCard({ testimonial: t, compact }: { testimonial: Testimonial; compact?: boolean }) {
  return (
    <div className="bg-card/65 backdrop-blur-xl border border-border rounded-2xl p-4 transition-all hover:border-primary/20 h-full flex flex-col">
      {/* Stars */}
      {(t.rating ?? 0) > 0 && (
        <div className="flex gap-0.5 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < (t.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <p className={`text-foreground/90 leading-relaxed italic flex-1 ${compact ? "text-xs line-clamp-4" : "text-sm"}`}>
        "{t.content}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-2.5 mt-3">
        {t.author_avatar_url ? (
          <img
            src={t.author_avatar_url}
            alt={t.author_name}
            className="w-7 h-7 rounded-full object-cover border border-border flex-shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[0.6rem] font-bold text-primary flex-shrink-0">
            {t.author_name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{t.author_name}</p>
          {t.author_role && (
            <p className="text-[0.6rem] text-muted-foreground truncate">{t.author_role}</p>
          )}
        </div>
      </div>
    </div>
  );
}
