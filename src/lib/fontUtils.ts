const FONT_MAP: Record<string, string> = {
  default: "'Instrument Serif', 'Plus Jakarta Sans', serif",
  inter: "'Inter', sans-serif",
  playfair: "'Playfair Display', serif",
  "space-grotesk": "'Space Grotesk', sans-serif",
  "dm-serif": "'DM Serif Display', serif",
  outfit: "'Outfit', sans-serif",
  crimson: "'Crimson Pro', serif",
  sora: "'Sora', sans-serif",
  bebas: "'Bebas Neue', sans-serif",
};

const GOOGLE_FONT_MAP: Record<string, string> = {
  inter: "Inter:wght@400;500;600;700",
  playfair: "Playfair+Display:wght@400;500;600;700",
  "space-grotesk": "Space+Grotesk:wght@400;500;600;700",
  "dm-serif": "DM+Serif+Display:wght@400",
  outfit: "Outfit:wght@400;500;600;700",
  crimson: "Crimson+Pro:wght@400;500;600;700",
  sora: "Sora:wght@400;500;600;700",
  bebas: "Bebas+Neue",
};

const SIZE_SCALE: Record<string, number> = {
  small: 0.85,
  medium: 1,
  large: 1.15,
  xlarge: 1.3,
};

const loadedFonts = new Set<string>();

export function getFontFamily(id: string): string {
  return FONT_MAP[id] || FONT_MAP.default;
}

export function getFontSizeScale(id: string): number {
  return SIZE_SCALE[id] || 1;
}

export function loadGoogleFont(id: string): void {
  if (id === "default" || loadedFonts.has(id)) return;
  const fontParam = GOOGLE_FONT_MAP[id];
  if (!fontParam) return;
  loadedFonts.add(id);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;
  document.head.appendChild(link);
}
