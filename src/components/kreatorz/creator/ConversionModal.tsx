import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Loader2, Check, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import in1Logo from "@/assets/in1-logo.png";
import heroImg from "@/assets/conversion-hero.jpg";

interface ConversionModalProps {
  open: boolean;
  onClose: () => void;
  creatorName?: string;
}

const AUTHORITY_PHRASES = [
  "Feito para quem leva conteúdo a sério.",
  "Criadores estão migrando para bio inteligente.",
  "Sua marca merece mais que um link genérico.",
];

export default function ConversionModal({ open, onClose, creatorName }: ConversionModalProps) {
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Rotate authority phrases
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % AUTHORITY_PHRASES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [open]);

  // Parallax on mouse move
  useEffect(() => {
    if (!open) return;
    const handleMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [open]);

  // Real-time availability check
  useEffect(() => {
    const clean = username.trim().replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
    if (!clean || clean.length < 2) {
      setAvailable(null);
      setChecking(false);
      return;
    }
    setChecking(true);
    setAvailable(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from("creators")
        .select("id")
        .or(`slug.eq.${clean},slug.eq.@${clean}`)
        .limit(1);
      setAvailable(!data || data.length === 0);
      setChecking(false);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username]);

  const handleClaim = () => {
    if (!username.trim()) return;
    const clean = username.trim().replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
    navigate(`/login?claim=${encodeURIComponent(clean)}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop — heavy blur + grain */}
          <motion.div
            className="absolute inset-0"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            {/* Grain texture */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }} />
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,hsl(268_69%_50%_/_0.2),transparent_70%)] pointer-events-none" />
          </motion.div>

          {/* Card */}
          <motion.div
            ref={cardRef}
            className="relative w-full max-w-[880px] max-h-[90vh] overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]"
            initial={{ opacity: 0, scale: 0.88, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.94, y: 20, filter: "blur(6px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              boxShadow: "0 40px 100px -20px rgba(0,0,0,0.7), 0 0 60px -10px hsl(268 69% 50% / 0.15), inset 0 1px 0 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Border glow */}
            <div className="absolute inset-0 rounded-[1.75rem] sm:rounded-[2rem] pointer-events-none z-10"
              style={{
                background: "linear-gradient(135deg, hsl(268 69% 50% / 0.2) 0%, transparent 40%, transparent 60%, hsl(268 69% 50% / 0.1) 100%)",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "xor",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_380px] bg-card/95 backdrop-blur-2xl">

              {/* ─── LEFT: Content ─── */}
              <div className="relative z-[2] px-7 py-8 sm:px-10 sm:py-10 flex flex-col justify-center">
                {/* Decorative glow */}
                <div className="absolute top-0 left-0 w-[300px] h-[250px] bg-[radial-gradient(ellipse,hsl(268_69%_50%_/_0.12),transparent_70%)] pointer-events-none" />

                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 lg:top-6 lg:right-6 z-20 w-9 h-9 rounded-full bg-muted/50 backdrop-blur-sm flex items-center justify-center hover:bg-muted transition-all duration-200 hover:scale-110 hover:rotate-90 active:scale-95"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-6 relative z-[1]"
                >
                  <img src={in1Logo} alt="in1.bio" className="h-6 object-contain invert dark:invert-0 opacity-60" />
                </motion.div>

                {/* Headline */}
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-[1] text-[1.65rem] sm:text-[2rem] lg:text-[2.2rem] font-extrabold leading-[1.08] tracking-[-0.02em] text-foreground mb-4"
                >
                  Sua bio pode fazer
                  <br />
                  <span className="bg-gradient-to-r from-primary via-[hsl(268_85%_65%)] to-primary bg-clip-text text-transparent">
                    muito mais.
                  </span>
                </motion.h2>

                {/* Sub */}
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="relative z-[1] text-muted-foreground text-[0.92rem] leading-relaxed mb-8 max-w-[400px]"
                >
                  {creatorName
                    ? `${creatorName} usa o in1.bio. Destaque campanhas, vídeos e links em um só lugar — do jeito que realmente converte.`
                    : "Destaque campanhas, vídeos e links em um só lugar — do jeito que realmente converte."
                  }
                </motion.p>

                {/* Input + CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.5 }}
                  className="relative z-[1] flex flex-col gap-3 max-w-[400px]"
                >
                  {/* Username input */}
                  <div className="relative group/input">
                    {/* Glow ring on focus */}
                    <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-500 blur-sm pointer-events-none" />
                    <div className="relative flex items-center bg-secondary/70 backdrop-blur-sm rounded-2xl border border-border/40 transition-all duration-300 group-focus-within/input:border-primary/30 group-focus-within/input:shadow-[0_0_24px_hsl(268_69%_50%_/_0.12)]">
                      <span className="pl-4 text-[0.82rem] font-bold text-muted-foreground/50 select-none whitespace-nowrap">
                        in1.bio/
                      </span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                        onKeyDown={(e) => e.key === "Enter" && available !== false && handleClaim()}
                        placeholder="seunome"
                        className="flex-1 h-[52px] bg-transparent text-foreground text-sm font-semibold placeholder:text-muted-foreground/30 outline-none pr-11"
                        autoFocus
                        maxLength={30}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {checking && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
                        {!checking && available === true && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
                            <Check className="w-5 h-5 text-emerald-500" />
                          </motion.div>
                        )}
                        {!checking && available === false && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Availability feedback */}
                  <AnimatePresence mode="wait">
                    {!checking && available === false && username.trim().length >= 2 && (
                      <motion.p key="taken" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="text-destructive text-xs font-medium -mt-1 pl-1">
                        Esse nome já está em uso. Tente outro.
                      </motion.p>
                    )}
                    {!checking && available === true && (
                      <motion.p key="available" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="text-emerald-400 text-xs font-semibold -mt-1 pl-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Disponível!
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* CTA Button */}
                  <motion.button
                    onClick={handleClaim}
                    disabled={!username.trim() || available === false || checking}
                    className="group/cta relative w-full h-[54px] rounded-2xl font-bold text-sm overflow-hidden transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Gradient bg */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-[hsl(268_85%_58%)] to-primary transition-all duration-500" />
                    {/* Shine sweep on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/cta:translate-x-full transition-transform duration-700 ease-out" />
                    {/* Content */}
                    <span className="relative z-[1] flex items-center justify-center gap-2 text-primary-foreground">
                      Criar minha página grátis
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                    </span>
                  </motion.button>

                  {/* Secondary */}
                  <a
                    href="/"
                    className="text-muted-foreground text-xs font-medium hover:text-foreground transition-colors duration-200 text-center mt-1"
                  >
                    Ver como funciona →
                  </a>
                </motion.div>

                {/* Authority phrase */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="relative z-[1] mt-8 pt-5 border-t border-border/20 max-w-[400px]"
                >
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={phraseIdx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.4 }}
                      className="text-[0.72rem] text-muted-foreground/50 font-medium italic flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary/40 flex-shrink-0" />
                      {AUTHORITY_PHRASES[phraseIdx]}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* ─── RIGHT: Hero Image ─── */}
              <div className="hidden lg:block relative overflow-hidden">
                {/* Gradient overlay on image */}
                <div className="absolute inset-0 z-[1] pointer-events-none"
                  style={{
                    background: "linear-gradient(to right, hsl(var(--card)) 0%, hsl(var(--card) / 0.6) 12%, transparent 40%), linear-gradient(to top, hsl(var(--card) / 0.5) 0%, transparent 30%)",
                  }}
                />
                {/* Purple glow overlay */}
                <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-bl from-primary/10 via-transparent to-transparent" />

                {/* Floating image with parallax */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1.05, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    transform: `scale(1.05) translate(${mousePos.x * -8}px, ${mousePos.y * -8}px)`,
                    transition: "transform 0.3s ease-out",
                  }}
                >
                  <img
                    src={heroImg}
                    alt=""
                    className="w-full h-full object-cover object-center"
                  />
                </motion.div>

                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute bottom-6 left-6 z-[3]"
                  style={{
                    animation: "conversion-float 4s ease-in-out infinite",
                  }}
                >
                  <div className="px-4 py-2.5 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl">
                    <p className="text-[0.7rem] font-bold text-foreground flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Criadores ativos agora
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
