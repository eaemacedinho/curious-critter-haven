import { motion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

interface PreviewPreset {
  bio: string;
  layout: string;
  style: string;
  links: { title: string; icon: string; url: string; sort_order: number }[];
  campaign?: { title: string; description: string; url: string };
}

const STYLE_THEMES: Record<string, { bg: string; card: string; text: string; accent: string; border: string }> = {
  dark: { bg: "#0f0f1a", card: "#1a1a2e", text: "#f0f0f0", accent: "#e94560", border: "#2a2a3e" },
  clean: { bg: "#faf9ff", card: "#ffffff", text: "#1a1a2e", accent: "#6B2BD4", border: "#e8e5f0" },
  neon: { bg: "#0a0a14", card: "#111128", text: "#e0e0ff", accent: "#00f0ff", border: "#1a1a3a" },
};

export default function TemplatePreview({
  preset,
  name,
  onClose,
}: {
  preset: PreviewPreset;
  name: string;
  onClose: () => void;
}) {
  const theme = STYLE_THEMES[preset.style] || STYLE_THEMES.dark;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 rounded-full bg-card border border-border p-2 text-muted-foreground hover:text-foreground transition-colors shadow-lg"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Phone frame */}
        <div className="rounded-[2.5rem] border-[3px] border-border/60 bg-border/20 p-2 shadow-2xl">
          <div
            className="rounded-[2rem] overflow-hidden"
            style={{ backgroundColor: theme.bg }}
          >
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-3 pb-1" style={{ color: theme.text }}>
              <span className="text-[10px] font-semibold opacity-60">9:41</span>
              <div className="flex gap-1 opacity-60">
                <div className="w-3.5 h-2 rounded-sm border" style={{ borderColor: theme.text }} />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-8 pt-4 space-y-4" style={{ minHeight: 480 }}>
              {/* Avatar + Name */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{ backgroundColor: theme.accent + "22", color: theme.accent }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold" style={{ color: theme.text }}>
                    {name || "Seu Nome"}
                  </h3>
                  <p className="text-xs mt-1 opacity-70 leading-relaxed max-w-[220px]" style={{ color: theme.text }}>
                    {preset.bio}
                  </p>
                </div>
              </div>

              {/* Campaign */}
              {preset.campaign && (
                <div
                  className="rounded-xl p-3 text-center"
                  style={{
                    backgroundColor: theme.accent + "15",
                    border: `1px solid ${theme.accent}30`,
                  }}
                >
                  <p className="text-xs font-bold" style={{ color: theme.accent }}>
                    {preset.campaign.title}
                  </p>
                  <p className="text-[10px] mt-0.5 opacity-70" style={{ color: theme.text }}>
                    {preset.campaign.description}
                  </p>
                </div>
              )}

              {/* Links */}
              <div className="space-y-2.5">
                {preset.links.map((link, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                    style={{
                      backgroundColor: theme.card,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <span className="text-base">{link.icon}</span>
                    <span className="text-sm font-medium flex-1" style={{ color: theme.text }}>
                      {link.title}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-40" style={{ color: theme.text }} />
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-4 text-center">
                <p className="text-[10px] opacity-40" style={{ color: theme.text }}>
                  in1.bio
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Label */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Preview — a página final será personalizável
        </p>
      </motion.div>
    </motion.div>
  );
}
