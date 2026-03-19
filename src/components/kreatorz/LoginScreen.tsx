import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LoginScreenProps {
  onNavigate: (tab: string) => void;
}

export default function LoginScreen({ onNavigate }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Conta criada! Verifique seu email.");
        onNavigate("creator");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Login realizado!");
        onNavigate("creator");
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen pt-14 flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] -top-[15%] -right-[10%] rounded-full bg-primary/20 blur-[120px] animate-k-orb" />
      <div className="absolute w-[400px] h-[400px] -bottom-[15%] -left-[10%] rounded-full bg-k-400/10 blur-[120px] animate-k-orb" style={{ animationDelay: "-5s" }} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(107,43,212,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(107,43,212,.02)_1px,transparent_1px)] bg-[size:64px_64px]" style={{ maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000, transparent)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] relative z-[1]"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 font-extrabold text-2xl tracking-tight text-primary-foreground mb-3">
            <span className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-sm text-primary-foreground font-extrabold shadow-k-purple">K</span>
            Kreator<span className="text-k-300">z</span>
          </div>
          <p className="text-sm text-k-3">
            {isSignUp ? "Crie sua conta e comece agora" : "Bem-vindo de volta"}
          </p>
        </div>

        <div className="bg-card/70 backdrop-blur-2xl border border-primary/10 rounded-3xl p-8 shadow-k relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="mb-6">
            <button
              onClick={handleGoogle}
              className="flex items-center justify-center gap-2.5 w-full px-4 py-3 bg-k-800 border border-primary/10 rounded-xl text-sm text-k-2 font-medium transition-all duration-200 hover:border-k-400 hover:bg-k-glow hover:text-primary-foreground active:scale-[0.97]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continuar com Google
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-primary/10" />
            <span className="text-[0.68rem] text-k-4 font-medium uppercase tracking-wider">ou continue com email</span>
            <div className="flex-1 h-px bg-primary/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-[0.72rem] font-semibold text-k-2 uppercase tracking-wider mb-1.5">Nome completo</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome"
                  className="w-full px-4 py-3 bg-k-800 border border-primary/10 rounded-xl text-sm text-primary-foreground placeholder:text-k-4 outline-none focus:border-k-400 focus:shadow-[0_0_0_3px_hsl(268_69%_50%_/_0.12)] transition-all" />
              </div>
            )}
            <div>
              <label className="block text-[0.72rem] font-semibold text-k-2 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-k-800 border border-primary/10 rounded-xl text-sm text-primary-foreground placeholder:text-k-4 outline-none focus:border-k-400 focus:shadow-[0_0_0_3px_hsl(268_69%_50%_/_0.12)] transition-all" />
            </div>
            <div>
              <label className="block text-[0.72rem] font-semibold text-k-2 uppercase tracking-wider mb-1.5">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-3 bg-k-800 border border-primary/10 rounded-xl text-sm text-primary-foreground placeholder:text-k-4 outline-none focus:border-k-400 focus:shadow-[0_0_0_3px_hsl(268_69%_50%_/_0.12)] transition-all" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all duration-300 hover:bg-k-400 hover:shadow-k-purple active:scale-[0.98] disabled:opacity-50">
              {loading ? "Carregando..." : isSignUp ? "Criar conta" : "Entrar"}
            </button>
          </form>

          <p className="text-center text-sm text-k-3 mt-6">
            {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-k-300 font-semibold hover:text-k-200 transition-colors">
              {isSignUp ? "Fazer login" : "Cadastre-se"}
            </button>
          </p>
        </div>

        <p className="text-center text-[0.65rem] text-k-4 mt-6">
          Ao continuar, você concorda com os <span className="text-k-3 cursor-pointer hover:text-k-2">Termos de Uso</span> e <span className="text-k-3 cursor-pointer hover:text-k-2">Política de Privacidade</span>.
        </p>
      </motion.div>
    </div>
  );
}
