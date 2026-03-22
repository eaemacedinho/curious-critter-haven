import { useState, useRef } from "react";
import type { HeroReelData } from "./HeroReel";
import { parseEmbedUrl } from "./HeroReel";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  reels: HeroReelData[];
  onChange: (reels: HeroReelData[]) => void;
  creatorId: string;
  agencyId: string;
  onUploadContentImage: (file: File, folder: string) => Promise<string | null>;
}

const ASPECT_OPTIONS = [
  { id: "9:16", label: "9:16", desc: "Vertical" },
  { id: "1:1", label: "1:1", desc: "Quadrado" },
  { id: "16:9", label: "16:9", desc: "Paisagem" },
];

const PLAYBACK_OPTIONS = [
  { id: "autoplay", label: "Autoplay", desc: "Mudo, em loop" },
  { id: "click", label: "Click to play", desc: "Com som" },
];

const inputClass = "w-full px-3.5 py-2.5 bg-[hsl(var(--k-800))] border border-primary/10 rounded-xl text-[hsl(var(--k-text-1))] text-sm outline-none focus:border-[hsl(var(--k-400))] focus:shadow-[0_0_0_3px_hsl(268_69%_50%_/_0.12)] transition-all";
const labelClass = "block text-[0.72rem] font-semibold text-[hsl(var(--k-text-2))] mb-1.5";
const sectionTitle = "text-[0.66rem] font-bold text-[hsl(var(--k-text-4))] tracking-[0.12em] uppercase mb-3.5 flex items-center gap-2";

export default function HeroReelEditor({ reels, onChange, creatorId, agencyId, onUploadContentImage }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const videoInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const updateReel = (index: number, updates: Partial<HeroReelData>) => {
    const arr = [...reels];
    arr[index] = { ...arr[index], ...updates };
    onChange(arr);
  };

  const addReel = () => {
    onChange([
      ...reels,
      {
        id: crypto.randomUUID(),
        creator_id: creatorId,
        title: "",
        subtitle: "",
        video_url: "",
        thumbnail_url: "",
        cta_label: "",
        cta_url: "",
        aspect_ratio: "9:16" as const,
        playback_mode: "autoplay" as const,
        is_active: true,
        sort_order: reels.length,
      },
    ]);
  };

  const removeReel = (index: number) => {
    onChange(reels.filter((_, i) => i !== index));
    toast.success("Hero Reel removido. Salve para confirmar.");
  };

  const handleVideoUpload = async (file: File, index: number) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error("Vídeo muito grande. Máximo 50MB.");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const allowedExts = ["mp4", "webm", "mov"];
    if (!allowedExts.includes(ext)) {
      toast.error("Formato não suportado. Use MP4, WebM ou MOV.");
      return;
    }

    setUploading(`video-${index}`);
    try {
      const path = `${agencyId}/${creatorId}/reel-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(path, file, {
          upsert: true,
          cacheControl: "3600",
          contentType: file.type || "video/mp4",
        });

      if (uploadError) {
        toast.error("Erro no upload: " + uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("videos").getPublicUrl(path);
      updateReel(index, { video_url: data.publicUrl });
      toast.success("Vídeo enviado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar vídeo");
    } finally {
      setUploading(null);
    }
  };

  const handleThumbnailUpload = async (file: File, index: number) => {
    setUploading(`thumb-${index}`);
    try {
      const url = await onUploadContentImage(file, "reel-thumb");
      if (url) {
        updateReel(index, { thumbnail_url: url });
        toast.success("Thumbnail enviada!");
      }
    } finally {
      setUploading(null);
    }
  };

  // Drag & drop for reordering
  const handleDragStart = (i: number) => setDragIdx(i);
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const arr = [...reels];
    const [item] = arr.splice(dragIdx, 1);
    arr.splice(i, 0, item);
    onChange(arr);
    setDragIdx(i);
  };

  return (
    <div className="space-y-4 mb-8">
      <div className={sectionTitle}>
        🎬 Hero Reel
        <span className="flex-1 h-px bg-border" />
      </div>

      {reels.length > 3 && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[0.72rem] font-medium">
          <span>⚠️</span>
          <span>Você tem {reels.length} reels, mas apenas os <strong>3 primeiros</strong> serão exibidos na página pública por questões de performance.</span>
        </div>
      )}

      {reels.map((reel, i) => (
        <div
          key={reel.id}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDragEnd={() => setDragIdx(null)}
          className={`rounded-2xl border border-primary/10 bg-[hsl(var(--k-850))] p-4 space-y-3 transition-all ${
            dragIdx === i ? "opacity-50 scale-[0.98]" : ""
          }`}
        >
          {/* Header row */}
          <div className="flex items-center gap-2">
            <span className="cursor-grab text-[hsl(var(--k-text-4))] text-sm hover:text-[hsl(var(--k-text-2))]">⠿</span>
            <span className="text-sm font-semibold text-[hsl(var(--k-text-1))]">
              🎬 Reel {i + 1}
            </span>
            <div className="flex-1" />
            {/* Active toggle */}
            <button
              onClick={() => updateReel(i, { is_active: !reel.is_active })}
              className={`w-9 h-5 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0 ${
                reel.is_active ? "bg-emerald-500" : "bg-[hsl(var(--k-900))] border border-primary/10"
              }`}
              title={reel.is_active ? "Visível na página" : "Oculto da página"}
            >
              <span
                className={`absolute w-3.5 h-3.5 rounded-full bg-white top-[3px] transition-all duration-300 shadow-sm ${
                  reel.is_active ? "left-[18px]" : "left-[3px]"
                }`}
              />
            </button>
            <span
              className={`text-[0.6rem] font-semibold px-1.5 py-0.5 rounded ${
                reel.is_active
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {reel.is_active ? "ativo" : "inativo"}
            </span>
            <button onClick={() => removeReel(i)} className="text-[hsl(var(--k-text-4))] hover:text-destructive text-xs">
              ✕
            </button>
          </div>

          <div>
            <label className={labelClass}>Vídeo</label>
            {reel.video_url ? (
              <div className="relative rounded-xl overflow-hidden border border-primary/10 bg-black">
                {(() => {
                  const embed = parseEmbedUrl(reel.video_url);
                  if (embed) {
                    const src = embed.type === "youtube"
                      ? `https://www.youtube-nocookie.com/embed/${embed.id}?rel=0&modestbranding=1`
                      : `https://player.vimeo.com/video/${embed.id}?dnt=1`;
                    return (
                      <div className="relative">
                        <iframe src={src} className="w-full aspect-video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: 0 }} />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[0.6rem] font-semibold rounded-lg">
                            {embed.type === "youtube" ? "▶ YouTube" : "▶ Vimeo"}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <video
                      src={reel.video_url}
                      className="w-full max-h-[180px] object-contain"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  );
                })()}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => updateReel(i, { video_url: "" })}
                    className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[0.68rem] rounded-lg hover:bg-black/80 transition-colors"
                  >
                    ✕ Remover
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  ref={(el) => { videoInputRefs.current[i] = el; }}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoUpload(file, i);
                  }}
                />
                <button
                  onClick={() => videoInputRefs.current[i]?.click()}
                  disabled={uploading === `video-${i}`}
                  className="flex items-center justify-center gap-2 w-full h-24 border border-dashed border-primary/20 rounded-xl cursor-pointer hover:border-[hsl(var(--k-400))] hover:bg-[hsl(var(--k-glow))] transition-all disabled:opacity-50"
                >
                  {uploading === `video-${i}` ? (
                    <span className="text-sm text-[hsl(var(--k-text-4))] animate-pulse">Enviando vídeo...</span>
                  ) : (
                    <span className="text-sm text-[hsl(var(--k-text-4))]">🎬 Upload de vídeo (MP4, WebM, MOV · Max 50MB)</span>
                  )}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[0.62rem] text-[hsl(var(--k-text-4))]">ou cole a URL:</span>
                  <input
                    value={reel.video_url}
                    onChange={(e) => updateReel(i, { video_url: e.target.value })}
                    placeholder="YouTube, Vimeo ou link direto .mp4"
                    className={`${inputClass} flex-1 text-xs`}
                  />
                </div>
                <p className="text-[0.58rem] text-[hsl(var(--k-text-4))] opacity-70">
                  Suporta: YouTube, Vimeo, ou link direto para vídeo MP4/WebM
                </p>
              </div>
            )}
          </div>

          {/* Thumbnail */}
          <div>
            <label className={labelClass}>Thumbnail / Capa</label>
            {reel.thumbnail_url ? (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-primary/10 group">
                <img src={reel.thumbnail_url} alt="" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleThumbnailUpload(file, i);
                    }}
                  />
                  <span className="text-[0.68rem] text-primary-foreground font-semibold bg-primary/80 px-2 py-1 rounded-lg">📷</span>
                </label>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full h-16 border border-dashed border-primary/20 rounded-xl cursor-pointer hover:border-[hsl(var(--k-400))] hover:bg-[hsl(var(--k-glow))] transition-all">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleThumbnailUpload(file, i);
                  }}
                />
                {uploading === `thumb-${i}` ? (
                  <span className="text-sm text-[hsl(var(--k-text-4))] animate-pulse">Enviando...</span>
                ) : (
                  <span className="text-sm text-[hsl(var(--k-text-4))]">📷 Adicionar thumbnail</span>
                )}
              </label>
            )}
          </div>

          {/* Title + Subtitle */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Título (opcional)</label>
              <input
                value={reel.title}
                onChange={(e) => updateReel(i, { title: e.target.value })}
                placeholder="Meu reel"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Subtítulo (opcional)</label>
              <input
                value={reel.subtitle}
                onChange={(e) => updateReel(i, { subtitle: e.target.value })}
                placeholder="Uma breve descrição"
                className={inputClass}
              />
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Botão CTA (opcional)</label>
              <input
                value={reel.cta_label}
                onChange={(e) => updateReel(i, { cta_label: e.target.value })}
                placeholder="Assistir completo"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Link do CTA</label>
              <input
                value={reel.cta_url}
                onChange={(e) => updateReel(i, { cta_url: e.target.value })}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>

          {/* Aspect ratio + Playback mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Proporção</label>
              <div className="flex gap-1.5">
                {ASPECT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateReel(i, { aspect_ratio: opt.id as HeroReelData["aspect_ratio"] })}
                    className={`flex-1 px-2 py-2 rounded-xl text-[0.68rem] font-semibold transition-all ${
                      reel.aspect_ratio === opt.id
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-[hsl(var(--k-800))] text-[hsl(var(--k-text-3))] border border-primary/5 hover:border-primary/20"
                    }`}
                  >
                    <div>{opt.label}</div>
                    <div className="text-[0.56rem] opacity-60">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Reprodução</label>
              <div className="flex gap-1.5">
                {PLAYBACK_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateReel(i, { playback_mode: opt.id as HeroReelData["playback_mode"] })}
                    className={`flex-1 px-2 py-2 rounded-xl text-[0.68rem] font-semibold transition-all ${
                      reel.playback_mode === opt.id
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-[hsl(var(--k-800))] text-[hsl(var(--k-text-3))] border border-primary/5 hover:border-primary/20"
                    }`}
                  >
                    <div>{opt.label}</div>
                    <div className="text-[0.56rem] opacity-60">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addReel}
        className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-[hsl(var(--k-glow))] rounded-xl text-[hsl(var(--k-text-4))] text-sm font-medium transition-all hover:border-[hsl(var(--k-400))] hover:text-[hsl(var(--k-text-3))] hover:bg-[hsl(var(--k-glow))] active:scale-[0.98]"
      >
        + Adicionar Hero Reel
      </button>
    </div>
  );
}
