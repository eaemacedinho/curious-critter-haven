import { forwardRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area } from "react-easy-crop";

interface ImageCropperProps {
  imageSrc: string;
  aspect: number;
  cropShape?: "rect" | "round";
  onCropDone: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

const ImageCropper = forwardRef<HTMLDivElement, ImageCropperProps>(function ImageCropper(
  { imageSrc, aspect, cropShape = "rect", onCropDone, onCancel },
  ref
) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    if (blob) onCropDone(blob);
  };

  return createPortal(
    <div
      ref={ref}
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: "hsl(var(--background))" }}
    >
      <div className="relative flex-1 min-h-0">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "hsl(var(--background))",
            },
          }}
        />
      </div>

      <div className="shrink-0 px-6 py-4 bg-card/80 backdrop-blur-xl border-t border-primary/10">
        <div className="max-w-[400px] mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[0.7rem] text-muted-foreground font-medium w-10">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-primary h-1.5"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 bg-secondary border border-primary/10 text-muted-foreground font-semibold text-sm rounded-xl transition-all hover:border-primary/30 active:scale-[0.98]"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
            >
              ✂️ Recortar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
});

export default ImageCropper;

async function getCroppedImg(imageSrc: string, crop: Area): Promise<Blob | null> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = imageSrc;
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
}
