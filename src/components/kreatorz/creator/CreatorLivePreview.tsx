import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { CreatorCampaign, CreatorLink, CreatorProduct, CreatorProfile, SocialLink } from "@/hooks/useCreatorData";
import { useTenant } from "@/hooks/useTenant";
import CreatorView from "./CreatorView";
import CreatorViewLinkme from "./CreatorViewLinkme";

const PREVIEW_VIEWPORT_WIDTH = 390;
const PREVIEW_VIEWPORT_HEIGHT = 844;

interface Props {
  profile: CreatorProfile;
  links: CreatorLink[];
  socialLinks: SocialLink[];
  products: CreatorProduct[];
  campaigns: CreatorCampaign[];
  activeLayout?: "layout1" | "layout2";
}

function hexToHsl(hex: string): string | null {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return null;

  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return `0 0% ${Math.round(l * 100)}%`;
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;

  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
      break;
  }

  h /= 6;
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function CreatorLivePreview({
  profile,
  links,
  socialLinks,
  products,
  campaigns,
  activeLayout = "layout1",
}: Props) {
  const { agency } = useTenant();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateScale = () => {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;

      const nextScale = Math.min(
        width / PREVIEW_VIEWPORT_WIDTH,
        height / PREVIEW_VIEWPORT_HEIGHT,
        1,
      );

      setScale(nextScale);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  const previewTheme = useMemo(() => {
    const style: CSSProperties = {};
    const primary = agency?.primary_color ? hexToHsl(agency.primary_color) : null;
    const accent = agency?.accent_color ? hexToHsl(agency.accent_color) : null;

    if (primary) style["--primary" as keyof CSSProperties] = primary;
    if (accent) style["--k-400" as keyof CSSProperties] = accent;

    return style;
  }, [agency?.accent_color, agency?.primary_color]);

  const PreviewComponent = activeLayout === "layout2" ? CreatorViewLinkme : CreatorView;
  const renderedWidth = PREVIEW_VIEWPORT_WIDTH * scale;
  const renderedHeight = PREVIEW_VIEWPORT_HEIGHT * scale;

  return (
    <div className="sticky top-4 space-y-3">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card/80 px-4 py-3 backdrop-blur-sm">
        <div>
          <p className="text-sm font-semibold text-foreground">Pré-visualização real</p>
          <p className="text-[0.68rem] text-muted-foreground">
            Viewport móvel fiel da página pública ({PREVIEW_VIEWPORT_WIDTH}×{PREVIEW_VIEWPORT_HEIGHT})
          </p>
        </div>
        <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[0.65rem] font-semibold text-muted-foreground">
          {activeLayout === "layout2" ? "Layout 2" : "Layout 1"}
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative flex h-[calc(100vh-8rem)] min-h-[620px] items-start justify-center overflow-hidden rounded-[2rem] border border-border bg-muted/20 p-4"
      >
        <div
          className="relative overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-[0_24px_80px_hsl(var(--foreground)/0.12)]"
          style={{ width: renderedWidth, height: renderedHeight }}
        >
          <div
            className="absolute left-0 top-0"
            style={{
              width: PREVIEW_VIEWPORT_WIDTH,
              height: PREVIEW_VIEWPORT_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div className="relative h-full w-full overflow-hidden" style={previewTheme}>
              {activeLayout === "layout2" ? (
                <PreviewComponent
                  profile={profile}
                  links={links}
                  socialLinks={socialLinks}
                  products={products}
                  campaigns={campaigns}
                  agencyName={agency?.name}
                  embedded
                />
              ) : (
                <div className="h-full overflow-y-auto overflow-x-hidden">
                  <PreviewComponent
                    profile={profile}
                    links={links}
                    socialLinks={socialLinks}
                    products={products}
                    campaigns={campaigns}
                    agencyName={agency?.name}
                    embedded
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}