import { useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode[];
  itemWidth?: string;
}

export default function SectionCarousel({ children, itemWidth = "75%" }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!children || children.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children.map((child, i) => (
          <div key={i} className="snap-start flex-shrink-0" style={{ width: itemWidth, minWidth: "200px", maxWidth: "320px" }}>
            {child}
          </div>
        ))}
      </div>
      {children.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {children.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const el = scrollRef.current;
                if (!el) return;
                const cards = el.children;
                if (cards[i]) (cards[i] as HTMLElement).scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
              }}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/60 transition-colors"
              aria-label={`Item ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
