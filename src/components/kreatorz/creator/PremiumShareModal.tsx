import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Link2, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import in1Icon from "@/assets/in1-icon.png";

interface PremiumShareModalProps {
  creatorName: string;
  creatorSlug: string;
  creatorAvatar?: string;
  creatorBio?: string;
}

const SHARE_CHANNELS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
    action: (url: string, text: string) => window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank"),
  },
  {
    id: "x",
    label: "X",
    color: "#000000",
    icon: <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
    action: (url: string, text: string) => window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank"),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
    action: (url: string) => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank"),
  },
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
    action: (url: string) => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank"),
  },
  {
    id: "telegram",
    label: "Telegram",
    color: "#0088CC",
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>,
    action: (url: string, text: string) => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank"),
  },
];

export default function PremiumShareModal({ creatorName, creatorSlug, creatorAvatar, creatorBio }: PremiumShareModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const pageUrl = `${window.location.origin}/c/${creatorSlug}`;
  const shareText = `Confira a página de ${creatorName} no in1.bio`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = (channel: typeof SHARE_CHANNELS[0]) => {
    channel.action(pageUrl, shareText);
  };

  // Try native share on mobile
  const handleOpen = async () => {
    if (navigator.share && window.innerWidth < 640) {
      try {
        await navigator.share({ title: creatorName, text: shareText, url: pageUrl });
        return;
      } catch {}
    }
    setOpen(true);
  };

  return (
    <>
      {/* Share trigger button */}
      <button
        onClick={handleOpen}
        className="group w-9 h-9 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:bg-black/40 hover:scale-110 active:scale-95"
        aria-label="Compartilhar página"
      >
        <Share2 className="w-[18px] h-[18px] text-foreground/80 group-hover:text-foreground transition-colors" />
      </button>

      {/* Premium Share Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="relative w-full max-w-[440px] rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.6)]"
              initial={{ opacity: 0, y: 80, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative bg-card/95 backdrop-blur-2xl border border-border/40">
                {/* Decorative glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] h-[150px] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.15),transparent_70%)] pointer-events-none" />

                {/* Header */}
                <div className="relative z-[1] flex items-center justify-between px-6 pt-6 pb-4">
                  <h3 className="text-base font-bold text-foreground">Compartilhar</h3>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Creator preview card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="mx-6 mb-5 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/90 via-primary/80 to-primary/60 p-5 relative"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_60%)] pointer-events-none" />
                  <div className="relative z-[1] flex items-center gap-4">
                    {creatorAvatar ? (
                      <img
                        src={creatorAvatar}
                        alt=""
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-primary-foreground/20 shadow-lg"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 flex items-center justify-center text-xl font-bold text-primary-foreground">
                        {creatorName?.[0] || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-primary-foreground truncate">{creatorName}</h4>
                      <p className="text-xs text-primary-foreground/60 flex items-center gap-1 mt-0.5">
                        <img src={in1Icon} alt="" className="w-3 h-3 brightness-0 invert inline" />
                        /{creatorSlug}
                      </p>
                      {creatorBio && (
                        <p className="text-[0.7rem] text-primary-foreground/50 mt-1 line-clamp-1">{creatorBio}</p>
                      )}
                    </div>
                    <a
                      href={pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-primary-foreground/70" />
                    </a>
                  </div>
                </motion.div>

                {/* Copy link bar */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="mx-6 mb-5"
                >
                  <div
                    onClick={handleCopy}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/60 border border-border/40 cursor-pointer group/copy transition-all duration-200 hover:border-primary/20 hover:bg-secondary/80 active:scale-[0.99]"
                  >
                    <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 text-sm text-foreground/70 truncate font-mono">{pageUrl}</span>
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                      copied
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-primary/10 text-primary group-hover/copy:bg-primary/20"
                    }`}>
                      {copied ? (
                        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Copiado</span>
                      ) : "Copiar"}
                    </span>
                  </div>
                </motion.div>

                {/* Share channels */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="px-6 pb-2"
                >
                  <p className="text-[0.66rem] font-bold text-muted-foreground/50 tracking-[0.12em] uppercase mb-3">Compartilhar via</p>
                  <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                    {SHARE_CHANNELS.map((channel, i) => (
                      <motion.button
                        key={channel.id}
                        onClick={() => handleShare(channel)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 + i * 0.04, duration: 0.3 }}
                        className="flex flex-col items-center gap-2 min-w-[60px] group/ch"
                      >
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover/ch:scale-110 group-hover/ch:shadow-lg active:scale-95"
                          style={{ backgroundColor: channel.color }}
                        >
                          {channel.icon}
                        </div>
                        <span className="text-[0.62rem] text-muted-foreground font-medium group-hover/ch:text-foreground transition-colors">
                          {channel.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Growth CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="px-6 pt-5 pb-7 border-t border-border/30 mt-4"
                >
                  <div className="flex items-start gap-3">
                    <img src={in1Icon} alt="" className="w-5 h-5 object-contain invert dark:invert-0 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[0.82rem] font-bold text-foreground mb-0.5">
                        Crie sua página no in1.bio
                      </p>
                      <p className="text-[0.7rem] text-muted-foreground mb-3 leading-relaxed">
                        Compartilhe tudo em um só link. Grátis pra sempre.
                      </p>
                      <a
                        href="/login"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl transition-all duration-300 hover:shadow-[0_4px_20px_hsl(var(--primary)/0.3)] hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Criar minha página grátis
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
