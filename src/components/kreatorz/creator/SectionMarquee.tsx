import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode[];
  speed?: number;
  itemWidth?: string;
}

export default function SectionMarquee({ children, speed = 0.5, itemWidth = "75%" }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let pos = 0;
    let paused = false;

    const step = () => {
      if (!paused) {
        pos += speed;
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0 && pos >= halfWidth) pos = 0;
        el.style.transform = `translateX(-${pos}px)`;
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    const handleEnter = () => { paused = true; };
    const handleLeave = () => { paused = false; };

    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);
    el.addEventListener("touchstart", handleEnter, { passive: true });
    el.addEventListener("touchend", handleLeave);

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
      el.removeEventListener("touchstart", handleEnter);
      el.removeEventListener("touchend", handleLeave);
    };
  }, [children, speed]);

  if (!children || children.length === 0) return null;

  // Duplicate children for seamless loop
  const doubled = [...children, ...children];

  return (
    <div className="overflow-hidden w-full">
      <div ref={scrollRef} className="flex gap-3 w-max will-change-transform">
        {doubled.map((child, i) => (
          <div key={i} className="flex-shrink-0" style={{ width: itemWidth, minWidth: "200px", maxWidth: "320px" }}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
