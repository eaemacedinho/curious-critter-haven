import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { trackEvent } from "@/lib/analytics";

export interface HeroReelData {
  id: string;
  creator_id: string;
  title: string;
  subtitle: string;
  video_url: string;
  thumbnail_url: string;
  cta_label: string;
  cta_url: string;
  aspect_ratio: "9:16" | "1:1" | "16:9";
  playback_mode: "autoplay" | "click";
  is_active: boolean;
  sort_order: number;
}

const ASPECT_MAP: Record<string, string> = {
  "9:16": "aspect-[9/16]",
  "1:1": "aspect-square",
  "16:9": "aspect-video",
};

const MAX_HEIGHT_MAP: Record<string, string> = {
  "9:16": "max-h-[520px]",
  "1:1": "max-h-[400px]",
  "16:9": "max-h-[320px]",
};

// --- YouTube / Vimeo URL parsing ---

export type EmbedInfo = { type: "youtube"; id: string } | { type: "vimeo"; id: string } | null;

export function parseEmbedUrl(url: string): EmbedInfo {
  if (!url) return null;
  const ytPatterns = [
    /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of ytPatterns) {
    const m = url.match(re);
    if (m) return { type: "youtube", id: m[1] };
  }
  const vmPatterns = [
    /vimeo\.com\/(?:video\/)?(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];
  for (const re of vmPatterns) {
    const m = url.match(re);
    if (m) return { type: "vimeo", id: m[1] };
  }
  return null;
}

function getEmbedSrc(info: EmbedInfo, autoplay: boolean): string {
  if (!info) return "";
  if (info.type === "youtube") {
    const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1" });
    if (autoplay) { params.set("autoplay", "1"); params.set("mute", "1"); params.set("loop", "1"); params.set("playlist", info.id); }
    return `https://www.youtube-nocookie.com/embed/${info.id}?${params}`;
  }
  const params = new URLSearchParams({ dnt: "1", playsinline: "1" });
  if (autoplay) { params.set("autoplay", "1"); params.set("muted", "1"); params.set("loop", "1"); params.set("background", "1"); }
  return `https://player.vimeo.com/video/${info.id}?${params}`;
}

// --- Analytics helpers ---

interface AnalyticsContext {
  creatorId: string;
  agencyId?: string | null;
  reelId: string;
  reelTitle?: string;
  source?: string;
}

function trackReelPlay(ctx: AnalyticsContext) {
  trackEvent({
    event_type: "reel_play",
    creator_id: ctx.creatorId,
    agency_id: ctx.agencyId,
    metadata: { reel_id: ctx.reelId, reel_title: ctx.reelTitle || "", source: ctx.source || "native" },
  });
}

function trackReelWatchTime(ctx: AnalyticsContext, seconds: number) {
  trackEvent({
    event_type: "reel_watch_time",
    creator_id: ctx.creatorId,
    agency_id: ctx.agencyId,
    metadata: { reel_id: ctx.reelId, reel_title: ctx.reelTitle || "", seconds: Math.round(seconds), source: ctx.source || "native" },
  });
}

function trackReelCtaClick(ctx: AnalyticsContext, ctaUrl: string) {
  trackEvent({
    event_type: "reel_cta_click",
    creator_id: ctx.creatorId,
    agency_id: ctx.agencyId,
    metadata: { reel_id: ctx.reelId, reel_title: ctx.reelTitle || "", cta_url: ctaUrl },
  });
}

// --- Watch-time tracker hook ---

function useWatchTimeTracker(ctx: AnalyticsContext | null, isPlaying: boolean) {
  const startRef = useRef<number | null>(null);
  const totalRef = useRef(0);
  const flushedRef = useRef(false);

  useEffect(() => {
    if (isPlaying) {
      startRef.current = Date.now();
    } else if (startRef.current) {
      totalRef.current += (Date.now() - startRef.current) / 1000;
      startRef.current = null;
    }
  }, [isPlaying]);

  // Flush on unmount or every 30s
  useEffect(() => {
    if (!ctx) return;
    const interval = setInterval(() => {
      if (startRef.current) {
        totalRef.current += (Date.now() - startRef.current) / 1000;
        startRef.current = Date.now();
      }
      if (totalRef.current >= 3) {
        trackReelWatchTime(ctx, totalRef.current);
        totalRef.current = 0;
      }
    }, 30_000);

    return () => {
      clearInterval(interval);
      if (startRef.current) {
        totalRef.current += (Date.now() - startRef.current) / 1000;
        startRef.current = null;
      }
      if (totalRef.current >= 3 && !flushedRef.current) {
        flushedRef.current = true;
        trackReelWatchTime(ctx, totalRef.current);
      }
    };
  }, [ctx]);
}

// --- Components ---

interface ReelProps {
  reel: HeroReelData;
  embedded?: boolean;
  analyticsCtx?: AnalyticsContext | null;
}

function EmbedPlayer({ embed, autoplay, aspectClass, maxHeightClass, analyticsCtx }: {
  embed: EmbedInfo; autoplay: boolean; aspectClass: string; maxHeightClass: string; analyticsCtx?: AnalyticsContext | null;
}) {
  const [loaded, setLoaded] = useState(false);
  const src = getEmbedSrc(embed, autoplay);

  // Track play on load for embeds (we can't detect actual play from iframe)
  useEffect(() => {
    if (loaded && analyticsCtx) {
      trackReelPlay({ ...analyticsCtx, source: embed?.type || "embed" });
    }
  }, [loaded, analyticsCtx, embed?.type]);

  return (
    <div
      className={`relative ${aspectClass} ${maxHeightClass} w-full mx-auto rounded-2xl overflow-hidden`}
      style={{ boxShadow: "0 8px 40px -8px hsl(var(--primary) / 0.2), 0 4px 20px -4px hsl(0 0% 0% / 0.3)" }}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-card animate-pulse z-[1] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}
      <iframe
        src={src}
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoaded(true)}
        style={{ border: 0 }}
      />
      <div className="absolute inset-0 z-[5] pointer-events-none rounded-2xl ring-1 ring-inset ring-white/10" />
    </div>
  );
}

function NativePlayer({ reel, aspectClass, maxHeightClass, embedded, analyticsCtx }: ReelProps & { aspectClass: string; maxHeightClass: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const hasTrackedPlay = useRef(false);

  const isAutoplay = reel.playback_mode === "autoplay";

  useWatchTimeTracker(analyticsCtx || null, isPlaying);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isAutoplay) return;
    if (isVisible && isLoaded) {
      video.play().catch(() => {});
      setIsPlaying(true);
      if (!hasTrackedPlay.current && analyticsCtx) {
        hasTrackedPlay.current = true;
        trackReelPlay(analyticsCtx);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isVisible, isLoaded, isAutoplay, analyticsCtx]);

  const handlePlayClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
      if (!hasTrackedPlay.current && analyticsCtx) {
        hasTrackedPlay.current = true;
        trackReelPlay(analyticsCtx);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [analyticsCtx]);

  const handleCtaClick = useCallback((e: React.MouseEvent, ctaUrl: string) => {
    e.stopPropagation();
    if (analyticsCtx) trackReelCtaClick(analyticsCtx, ctaUrl);
  }, [analyticsCtx]);

  return (
    <div
      ref={containerRef}
      className={`relative ${aspectClass} ${maxHeightClass} w-full mx-auto rounded-2xl overflow-hidden group cursor-pointer`}
      style={{ boxShadow: "0 8px 40px -8px hsl(var(--primary) / 0.2), 0 4px 20px -4px hsl(0 0% 0% / 0.3)" }}
      onClick={!isAutoplay ? handlePlayClick : undefined}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {reel.thumbnail_url && !isLoaded && (
        <img src={reel.thumbnail_url} alt={reel.title || "Video preview"} className="absolute inset-0 w-full h-full object-cover z-[1]" />
      )}
      {!isLoaded && !reel.thumbnail_url && (
        <div className="absolute inset-0 bg-card animate-pulse z-[1] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}
      {isVisible && reel.video_url && (
        <video
          ref={videoRef}
          src={reel.video_url}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          muted={isAutoplay}
          loop={isAutoplay}
          playsInline
          preload="metadata"
          onLoadedData={() => setIsLoaded(true)}
          onEnded={() => !isAutoplay && setIsPlaying(false)}
        />
      )}
      <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/10" />

      {!isAutoplay && !isPlaying && isLoaded && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 z-[3] flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </motion.div>
      )}

      {!isAutoplay && isPlaying && showControls && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[3] flex items-center justify-center" onClick={handlePlayClick}>
          <div className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
          </div>
        </motion.div>
      )}

      {(reel.title || reel.cta_label) && (
        <div className="absolute bottom-0 inset-x-0 z-[4] p-4 pb-5">
          {reel.title && <h3 className="text-white text-sm font-bold leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] mb-0.5">{reel.title}</h3>}
          {reel.subtitle && <p className="text-white/70 text-[0.72rem] leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] mb-2">{reel.subtitle}</p>}
          {reel.cta_label && reel.cta_url && (
            <a href={reel.cta_url} target="_blank" rel="noopener noreferrer" onClick={(e) => handleCtaClick(e, reel.cta_url)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white text-[0.72rem] font-semibold transition-all hover:bg-white/30 hover:scale-[1.02] active:scale-[0.98]">
              {reel.cta_label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          )}
        </div>
      )}

      <div className="absolute inset-0 z-[5] pointer-events-none rounded-2xl ring-1 ring-inset ring-white/10" />
    </div>
  );
}

interface Props {
  reel: HeroReelData;
  embedded?: boolean;
  agencyId?: string | null;
}

export default function HeroReel({ reel, embedded, agencyId }: Props) {
  const aspectClass = ASPECT_MAP[reel.aspect_ratio] || ASPECT_MAP["9:16"];
  const maxHeightClass = MAX_HEIGHT_MAP[reel.aspect_ratio] || MAX_HEIGHT_MAP["9:16"];
  const embed = parseEmbedUrl(reel.video_url);

  const analyticsCtx: AnalyticsContext | null = embedded ? null : {
    creatorId: reel.creator_id,
    agencyId,
    reelId: reel.id,
    reelTitle: reel.title,
    source: embed?.type || "native",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      {embed ? (
        <>
          <EmbedPlayer embed={embed} autoplay={reel.playback_mode === "autoplay"} aspectClass={aspectClass} maxHeightClass={maxHeightClass} analyticsCtx={analyticsCtx} />
          {(reel.title || reel.cta_label) && (
            <div className="mt-3 px-1">
              {reel.title && <h3 className="text-sm font-bold text-foreground leading-snug mb-0.5">{reel.title}</h3>}
              {reel.subtitle && <p className="text-muted-foreground text-[0.72rem] leading-relaxed mb-2">{reel.subtitle}</p>}
              {reel.cta_label && reel.cta_url && (
                <a href={reel.cta_url} target="_blank" rel="noopener noreferrer"
                  onClick={() => analyticsCtx && trackReelCtaClick(analyticsCtx, reel.cta_url)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[0.72rem] font-semibold transition-all hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98]">
                  {reel.cta_label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </a>
              )}
            </div>
          )}
        </>
      ) : (
        <NativePlayer reel={reel} aspectClass={aspectClass} maxHeightClass={maxHeightClass} embedded={embedded} analyticsCtx={analyticsCtx} />
      )}
    </motion.div>
  );
}
