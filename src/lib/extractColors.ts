/**
 * Extract dominant colors from an image URL using canvas.
 * Returns an array of hex color strings sorted by dominance.
 */
export async function extractColorsFromImage(
  imageUrl: string,
  numColors = 2
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 64; // downsample for speed
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));

        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        // Collect pixels, skip near-white/near-black/transparent
        const pixels: [number, number, number][] = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 128) continue; // skip transparent
          const brightness = (r + g + b) / 3;
          if (brightness > 240 || brightness < 15) continue; // skip near-white/black
          // Skip very desaturated pixels
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          if (max - min < 20 && brightness > 60 && brightness < 200) continue;
          pixels.push([r, g, b]);
        }

        if (pixels.length === 0) {
          resolve(["#6B2BD4", "#A855F7"]);
          return;
        }

        // Simple k-means-ish: quantize to buckets
        const bucketSize = 32;
        const buckets = new Map<string, { sum: [number, number, number]; count: number }>();

        for (const [r, g, b] of pixels) {
          const key = `${Math.floor(r / bucketSize)}-${Math.floor(g / bucketSize)}-${Math.floor(b / bucketSize)}`;
          const existing = buckets.get(key);
          if (existing) {
            existing.sum[0] += r;
            existing.sum[1] += g;
            existing.sum[2] += b;
            existing.count++;
          } else {
            buckets.set(key, { sum: [r, g, b], count: 1 });
          }
        }

        const sorted = [...buckets.values()]
          .sort((a, b) => b.count - a.count)
          .slice(0, Math.max(numColors, 2));

        const colors = sorted.map(({ sum, count }) => {
          const r = Math.round(sum[0] / count);
          const g = Math.round(sum[1] / count);
          const b = Math.round(sum[2] / count);
          return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        });

        // Ensure we always return numColors
        while (colors.length < numColors) {
          colors.push(colors[colors.length - 1]);
        }

        resolve(colors.slice(0, numColors));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}
