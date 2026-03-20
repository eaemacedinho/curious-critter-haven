import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { CreatorCampaign, CreatorLink, CreatorProduct, CreatorProfile, SocialLink } from "@/hooks/useCreatorData";
import { useTenant } from "@/hooks/useTenant";
import CreatorView from "./CreatorView";
import CreatorViewLinkme from "./CreatorViewLinkme";

type DeviceKey = "mobile" | "tablet" | "desktop";

const DEVICES: Record<DeviceKey, { label: string; icon: string; w: number; h: number }> = {
  mobile:  { label: "Mobile",  icon: "📱", w: 390, h: 844 },
  tablet:  { label: "Tablet",  icon: "📟", w: 768, h: 1024 },
  desktop: { label: "Desktop", icon: "🖥", w: 1280, h: 800 },
};

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
  const [device, setDevice] = useState<DeviceKey>("mobile");

  const currentDevice = DEVICES[device];

  const updateScale = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;
    const { width, height } = element.getBoundingClientRect();
    if (!width || !height) return;
    setScale(Math.min(width / currentDevice.w, height / currentDevice.h, 1));
  }, [currentDevice.w, currentDevice.h]);

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
  const renderedWidth = currentDevice.w * scale;
  const renderedHeight = currentDevice.h * scale;

  const publicUrl = profile.handle
    ? `/c/${profile.handle.replace(/^@+/, "")}`
    : null;

  return (
    <div className="sticky top-4 space-y-3">
      {/* Header bar */}
      <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-[0.72rem] font-semibold text-foreground">
            Pré-visualização · {currentDevice.w}×{currentDevice.h}
          </p>
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[0.62rem] font-semibold text-muted-foreground">
            {activeLayout === "layout2" ? "Layout 2" : "Layout 1"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device toggles */}
          <div className="flex overflow-hidden rounded-xl border border-border bg-background">
            {(Object.keys(DEVICES) as DeviceKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setDevice(key)}
                className={`px-3 py-1.5 text-[0.68rem] font-semibold transition-all active:scale-[0.96] ${
                  device === key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {DEVICES[key].icon}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Open real page */}
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
          className="relative overflow-hidden border border-border bg-background shadow-[0_24px_80px_hsl(var(--foreground)/0.12)] transition-all duration-300"
          style={{
            width: renderedWidth,
            height: renderedHeight,
            borderRadius: device === "mobile" ? "1.75rem" : device === "tablet" ? "1.25rem" : "0.75rem",
          }}
        >
          <div
            className="absolute left-0 top-0"
            style={{
              width: currentDevice.w,
              height: currentDevice.h,
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