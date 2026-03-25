import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns true if the given hex/rgb color is perceptually light (should use black text). */
export function isLightColor(color: string | null | undefined): boolean {
  if (!color) return false;
  let r = 0, g = 0, b = 0;
  const hex = color.replace("#", "");
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else if (/^[0-9a-f]{3}$/i.test(hex)) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (color.startsWith("rgb")) {
    const m = color.match(/(\d+)/g);
    if (m && m.length >= 3) { r = +m[0]; g = +m[1]; b = +m[2]; }
  } else {
    return false;
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

/** Auto-compute text color: if bg is light and no explicit text_color, use black. */
export function autoTextColor(bgColor: string | null | undefined, textColor: string | null | undefined): string | undefined {
  if (textColor) return textColor;
  if (isLightColor(bgColor)) return "#000000";
  return undefined;
}
