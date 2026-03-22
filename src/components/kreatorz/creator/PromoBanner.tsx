import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Loader2, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import in1Icon from "@/assets/in1-icon.png";

interface PromoBannerProps {
  creatorName?: string;
}

export default function PromoBanner({ creatorName }: PromoBannerProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();

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
  };

  return (
    <>
      {/* Floating logo button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-[60] w-10 h-10 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 group"
        aria-label="Criar sua página no in1.bio"
      >
        <img src={in1Icon} alt="in1.bio" className="w-6 h-6 object-contain invert dark:invert-0" />
      </button>

      {/* Full-screen promo overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Card */}
            <motion.div
              className="relative w-full max-w-[420px] rounded-3xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Gradient background */}
              <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 pb-10">
                {/* Close button */}
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-primary-foreground" />
                </button>

                {/* Icon */}
                <div className="mb-6">
                  <img src={in1Icon} alt="" className="w-10 h-10 object-contain brightness-0 invert" />
                </div>

                {/* Headline */}
                <h2 className="text-[1.75rem] sm:text-[2rem] font-extrabold leading-[1.1] tracking-tight text-primary-foreground mb-3">
                  Crie sua página.
                  <br />
                  <span className="opacity-90">Compartilhe tudo em um só link.</span>
                </h2>

                <p className="text-primary-foreground/80 text-sm leading-relaxed mb-7 max-w-[340px]">
                  {creatorName
                    ? `${creatorName} usa o in1.bio. Crie a sua página gratuita e compartilhe seus links, vídeos e projetos.`
                    : "Um link para compartilhar tudo que você cria, vende e divulga. Grátis pra sempre."
                  }
                </p>

                {/* Username claim input */}
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground/70 pointer-events-none select-none">
                      in1.bio/
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                      placeholder="seuusuario"
                      className="w-full h-12 pl-[4.5rem] pr-4 rounded-xl bg-white text-foreground text-sm font-medium placeholder:text-muted-foreground/50 outline-none border-2 border-transparent focus:border-primary-foreground/30 transition-colors"
                      autoFocus
                      maxLength={30}
                    />
                  </div>
                  <button
                    onClick={handleClaim}
                    disabled={!username.trim()}
                    className="w-full h-12 rounded-xl bg-foreground text-background font-bold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Criar minha página grátis
                  </button>
                </div>

                {/* Secondary links */}
                <div className="mt-5 flex flex-col gap-1">
                  <a
                    href="/"
                    className="text-primary-foreground/60 text-xs hover:text-primary-foreground/80 transition-colors underline underline-offset-2"
                  >
                    Saiba mais sobre o in1.bio
                  </a>
                </div>

                {/* Decorative phone mockup hint */}
                <div className="absolute -bottom-6 -right-4 w-32 h-48 bg-primary-foreground/10 rounded-3xl rotate-12 blur-sm pointer-events-none" />
                <div className="absolute -bottom-8 -right-2 w-28 h-44 bg-primary-foreground/5 rounded-3xl rotate-6 pointer-events-none" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
