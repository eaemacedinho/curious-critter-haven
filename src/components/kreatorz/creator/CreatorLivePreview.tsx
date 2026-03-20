import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { CreatorCampaign, CreatorLink, CreatorProduct, CreatorProfile, SocialLink } from "@/hooks/useCreatorData";
import { useTenant } from "@/hooks/useTenant";
import CreatorView from "./CreatorView";
import CreatorViewLinkme from "./CreatorViewLinkme";

const DEVICE = { w: 390, h: 844 };

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

  const updateScale = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;
    const { width, height } = element.getBoundingClientRect();
    if (!width || !height) return;
    setScale(Math.min(width / DEVICE.w, height / DEVICE.h, 1));
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [updateScale]);

  const previewTheme = useMemo(() => {
    const style: CSSProperties = {};
    const cssVariables = style as CSSProperties & Record<`--${string}`, string>;
    const primary = agency?.primary_color ? hexToHsl(agency.primary_color) : null;
    const accent = agency?.accent_color ? hexToHsl(agency.accent_color) : null;

    if (primary) cssVariables["--primary"] = primary;
    if (accent) cssVariables["--k-400"] = accent;

    return style;
  }, [agency?.accent_color, agency?.primary_color]);

  const PreviewComponent = activeLayout === "layout2" ? CreatorViewLinkme : CreatorView;
  const renderedWidth = DEVICE.w * scale;
  const renderedHeight = DEVICE.h * scale;

  const publicUrl = profile.handle
    ? `/c/${profile.handle.replace(/^@+/, "")}`
    : null;

  return (
    <div className="sticky top-4 space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card/80 px-4 py-3 backdrop-blur-sm">
        <p className="text-[0.72rem] font-semibold text-foreground">
          📱 Pré-visualização · {DEVICE.w}×{DEVICE.h}
        </p>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[0.62rem] font-semibold text-muted-foreground">
            {activeLayout === "layout2" ? "Layout 2" : "Layout 1"}
          </span>
          {publicUrl && (
            <button
              onClick={() => window.open(publicUrl, "_blank")}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-[0.68rem] font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground active:scale-[0.96]"
            >
              🔗 Abrir página real
            </button>
          )}
        </div>
      </div>

      {/* Preview area */}
      <div
        ref={containerRef}
        className="relative flex h-[calc(100vh-8rem)] min-h-[620px] items-start justify-center overflow-hidden rounded-[2rem] border border-border bg-muted/20 p-4"
      >
        <div
          className="relative overflow-hidden border border-border bg-background shadow-[0_24px_80px_hsl(var(--foreground)/0.12)]"
          style={{
            width: renderedWidth,
            height: renderedHeight,
            borderRadius: "1.75rem",
          }}
        >
          <div
            className="absolute left-0 top-0"
            style={{
              width: DEVICE.w,
              height: DEVICE.h,
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
