import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ClaimSignupModalProps {
  username: string;
  open: boolean;
  onClose: () => void;
}

export default function ClaimSignupModal({ username, open, onClose }: ClaimSignupModalProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Username availability
  const [slug, setSlug] = useState(username);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  // Normalize slug
  useEffect(() => {
    setSlug(username.toLowerCase().replace(/[^a-z0-9._-]/g, ""));
  }, [username]);

  // Check availability with debounce
  const checkAvailability = useCallback(async (s: string) => {
    if (!s || s.length < 2) {
      setAvailable(null);
      return;
    }
    setChecking(true);
    const { data } = await supabase
      .from("creators")
      .select("id")
      .eq("slug", s)
      .maybeSingle();
    setAvailable(!data);
    setChecking(false);
  }, []);

  useEffect(() => {
    if (!slug) return;
    setAvailable(null);
    const timer = setTimeout(() => checkAvailability(slug), 400);
    return () => clearTimeout(timer);
  }, [slug, checkAvailability]);

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (error) toast.error(error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (available === false) {
      toast.error("Esse nome de usuário já está em uso.");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await new Promise((r) => setTimeout(r, 1500));
      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", data.user.id)
        .single();

      if (profile?.agency_id) {
        await supabase.from("creators").insert({
          slug: slug,
          name: name || slug,
          agency_id: profile.agency_id,
          is_published: false,
        });
      }
    }

    toast.success("Conta criada!");
    navigate("/app");
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-[440px] bg-card border border-border rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8">
              {/* Header with username preview */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4"
                >
                  <span className="text-sm font-bold text-muted-foreground">in1.bio/</span>
                  <span className="text-sm font-extrabold text-primary-readable">{slug}</span>
                </motion.div>

                {/* Availability indicator */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center justify-center gap-1.5 h-5"
                >
                  {checking ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Verificando disponibilidade...
                    </span>
                  ) : available === true ? (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Disponível! É seu.
                    </span>
                  ) : available === false ? (
                    <span className="flex items-center gap-1.5 text-xs text-destructive font-semibold">
                      <XCircle className="w-3.5 h-3.5" />
                      Já está em uso
                    </span>
                  ) : null}
                </motion.div>

                <h3 className="text-lg font-extrabold text-foreground mt-3">
                  Crie sua conta
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  E garanta seu link personalizado
                </p>
              </div>

              {/* Google */}
              <button
                onClick={handleGoogle}
                className="flex items-center justify-center gap-2.5 w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-muted-foreground font-medium transition-all duration-200 hover:border-primary/30 hover:text-foreground active:scale-[0.97] mb-5"
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continuar com Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[0.68rem] text-muted-foreground font-medium uppercase tracking-wider">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || available === false}
                  className="w-full py-3.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      Criar minha página
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-[0.65rem] text-muted-foreground/50 mt-4">
                Ao continuar, você concorda com os{" "}
                <span className="underline cursor-pointer">Termos de Uso</span> e{" "}
                <span className="underline cursor-pointer">Política de Privacidade</span>.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
