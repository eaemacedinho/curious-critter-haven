import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Loader2, Check, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import in1Icon from "@/assets/in1-icon.png";
import in1Logo from "@/assets/in1-logo.png";

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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();

  // Rotate authority phrases
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % AUTHORITY_PHRASES.length);
    }, 4000);
    return () => clearInterval(interval);
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
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Premium backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Glassmorphism card */}
          <motion.div
            className="relative w-full max-w-[460px] rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, scale: 0.92, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Gradient glass background */}
            <div className="relative bg-gradient-to-br from-card/95 via-card/90 to-card/80 backdrop-blur-2xl border border-border/40">
              {/* Decorative glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.25),transparent_70%)] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.1),transparent_70%)] pointer-events-none" />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-muted/60 backdrop-blur-sm flex items-center justify-center hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="relative z-[1] px-7 pt-8 pb-9 sm:px-9 sm:pt-10 sm:pb-10">
                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="mb-7"
                >
                  <img src={in1Logo} alt="in1.bio" className="h-7 object-contain invert dark:invert-0" />
                </motion.div>

                {/* Headline */}
                <motion.h2
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-[1.6rem] sm:text-[1.85rem] font-extrabold leading-[1.12] tracking-tight text-foreground mb-3"
                >
                  Crie sua página.
                  <br />
                  <span className="text-primary">Destaque o que importa.</span>
                </motion.h2>

                {/* Sub */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.5 }}
                  className="text-muted-foreground text-[0.88rem] leading-relaxed mb-7 max-w-[360px]"
                >
                  {creatorName
                    ? `${creatorName} usa o in1.bio para destacar links, vídeos e campanhas. Crie a sua também.`
                    : "Creators estão usando o in1.bio para destacar links, vídeos e campanhas em um só lugar."
                  }
                </motion.p>

                {/* Claim input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="flex flex-col gap-3"
                >
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[0.82rem] font-bold text-muted-foreground/60 pointer-events-none select-none">
                      in1.bio/
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && available !== false && handleClaim()}
                      placeholder="seunome"
                      className={`w-full h-[52px] pl-[5rem] pr-12 rounded-2xl bg-secondary/80 backdrop-blur-sm text-foreground text-sm font-semibold placeholder:text-muted-foreground/40 outline-none border-2 transition-all duration-300 focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] ${
                        available === true
                          ? "border-emerald-400/60 focus:border-emerald-400"
                          : available === false
                          ? "border-destructive/40 focus:border-destructive/60"
                          : "border-border/40 focus:border-primary/40"
                      }`}
                      autoFocus
                      maxLength={30}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {checking && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
                      {!checking && available === true && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
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

                  {/* Availability feedback */}
                  <AnimatePresence mode="wait">
                    {!checking && available === false && username.trim().length >= 2 && (
                      <motion.p
                        key="taken"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-destructive text-xs font-medium -mt-1 pl-1"
                      >
                        Esse nome já está em uso. Tente outro.
                      </motion.p>
                    )}
                    {!checking && available === true && (
                      <motion.p
                        key="available"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-emerald-400 text-xs font-semibold -mt-1 pl-1 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Disponível!
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* CTA Button */}
                  <motion.button
                    onClick={handleClaim}
                    disabled={!username.trim() || available === false || checking}
                    className="group/btn w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-bold text-sm transition-all duration-300 hover:shadow-[0_8px_32px_hsl(var(--primary)/0.4)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Criar minha página grátis
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </motion.button>
                </motion.div>

                {/* Secondary link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="mt-5 text-center"
                >
                  <a
                    href="/"
                    className="text-muted-foreground text-xs font-medium hover:text-foreground transition-colors duration-200 underline underline-offset-4 decoration-border hover:decoration-primary/40"
                  >
                    Ver como funciona →
                  </a>
                </motion.div>

                {/* Authority trigger */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="mt-7 pt-5 border-t border-border/30"
                >
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={phraseIdx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.4 }}
                      className="text-[0.72rem] text-muted-foreground/60 text-center font-medium italic"
                    >
                      "{AUTHORITY_PHRASES[phraseIdx]}"
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
