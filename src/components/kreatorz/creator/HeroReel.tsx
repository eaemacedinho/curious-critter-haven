import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

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

interface Props {
  reel: HeroReelData;
  embedded?: boolean;
}

export default function HeroReel({ reel, embedded }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const isAutoplay = reel.playback_mode === "autoplay";

  // Intersection observer for lazy loading + autoplay
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Autoplay when visible
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isAutoplay) return;

    if (isVisible && isLoaded) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isVisible, isLoaded, isAutoplay]);

  const handlePlayClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const aspectClass = ASPECT_MAP[reel.aspect_ratio] || ASPECT_MAP["9:16"];
  const maxHeightClass = MAX_HEIGHT_MAP[reel.aspect_ratio] || MAX_HEIGHT_MAP["9:16"];

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      {/* Video container */}
      <div
        className={`relative ${aspectClass} ${maxHeightClass} w-full mx-auto rounded-2xl overflow-hidden group cursor-pointer`}
        style={{
          boxShadow: "0 8px 40px -8px hsl(var(--primary) / 0.2), 0 4px 20px -4px hsl(0 0% 0% / 0.3)",
        }}
        onClick={!isAutoplay ? handlePlayClick : undefined}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Thumbnail fallback */}
        {reel.thumbnail_url && !isLoaded && (
          <img
            src={reel.thumbnail_url}
            alt={reel.title || "Video preview"}
            className="absolute inset-0 w-full h-full object-cover z-[1]"
          />
        )}

        {/* Loading shimmer */}
        {!isLoaded && !reel.thumbnail_url && (
          <div className="absolute inset-0 bg-card animate-pulse z-[1] flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        )}

        {/* Video element */}
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

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        {/* Play button for click mode */}
        {!isAutoplay && !isPlaying && isLoaded && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-[3] flex items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </motion.div>
        )}

        {/* Pause indicator for click mode */}
        {!isAutoplay && isPlaying && showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[3] flex items-center justify-center"
            onClick={handlePlayClick}
          >
            <div className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            </div>
          </motion.div>
        )}

        {/* Title + CTA overlay at bottom */}
        {(reel.title || reel.cta_label) && (
          <div className="absolute bottom-0 inset-x-0 z-[4] p-4 pb-5">
            {reel.title && (
              <h3 className="text-white text-sm font-bold leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] mb-0.5">
                {reel.title}
              </h3>
            )}
            {reel.subtitle && (
              <p className="text-white/70 text-[0.72rem] leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] mb-2">
                {reel.subtitle}
              </p>
            )}
            {reel.cta_label && reel.cta_url && (
              <a
                href={reel.cta_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white text-[0.72rem] font-semibold transition-all hover:bg-white/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                {reel.cta_label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* Subtle border glow */}
        <div className="absolute inset-0 z-[5] pointer-events-none rounded-2xl ring-1 ring-inset ring-white/10" />
      </div>
    </motion.div>
  );
}
