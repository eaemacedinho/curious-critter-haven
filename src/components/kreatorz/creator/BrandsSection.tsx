import { useEffect, useRef } from "react";

interface Brand {
  name: string;
  logo_url?: string;
}

interface Props {
  brands: Brand[];
  displayMode: "static" | "marquee";
  className?: string;
}

function BrandBadge({ brand }: { brand: Brand }) {
  return (
    <span className="text-[0.65rem] text-muted-foreground font-semibold px-2.5 py-1 bg-card/80 rounded-md border border-border flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
      {brand.logo_url && (
        <img src={brand.logo_url} alt="" className="w-4 h-4 rounded-sm object-contain" />
      )}
      {brand.name}
    </span>
  );
}

function MarqueeBrands({ brands }: { brands: Brand[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let pos = 0;
    const speed = 0.5;

    const step = () => {
      pos += speed;
      const halfWidth = el.scrollWidth / 2;
      if (pos >= halfWidth) pos = 0;
      el.style.transform = `translateX(-${pos}px)`;
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    const handleEnter = () => cancelAnimationFrame(animId);
    const handleLeave = () => { animId = requestAnimationFrame(step); };

    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [brands]);

  // Duplicate brands for seamless loop
  const doubled = [...brands, ...brands];

  return (
    <div className="overflow-hidden w-full">
      <div ref={scrollRef} className="flex items-center gap-3 w-max will-change-transform">
        {doubled.map((brand, i) => (
          <BrandBadge key={`${brand.name}-${i}`} brand={brand} />
        ))}
      </div>
    </div>
  );
}

export default function BrandsSection({ brands, displayMode, className = "" }: Props) {
  if (brands.length === 0) return null;

  return (
    <div className={`mt-4 ${className}`}>
      <div className="flex justify-center mb-2">
        <span className="text-[0.62rem] text-muted-foreground uppercase tracking-widest font-bold">
          Trabalhou com:
        </span>
      </div>
      {displayMode === "marquee" ? (
        <MarqueeBrands brands={brands} />
      ) : (
        <div className="flex justify-center items-center gap-3 flex-wrap">
          {brands.map((brand, i) => (
            <BrandBadge key={i} brand={brand} />
          ))}
        </div>
      )}
    </div>
  );
}
