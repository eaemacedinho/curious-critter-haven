import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, LogIn, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Turnstile } from "@marsidev/react-turnstile";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const claimedUsername = searchParams.get("claim") || "";
  const templateParam = searchParams.get("template") || "";
  const { user, loading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(!!claimedUsername);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/app", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      toast.error("Complete a verificação de segurança.");
      return;
    }
    setLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        toast.error("As senhas não coincidem.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        toast.error("A senha deve ter no mínimo 6 caracteres.");
        setLoading(false);
        return;
      }

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
      } else {
        if (claimedUsername && data.user) {
          await new Promise((r) => setTimeout(r, 1500));
          const { data: profile } = await supabase
            .from("profiles")
            .select("agency_id")
            .eq("id", data.user.id)
            .single();

          if (profile?.agency_id) {
            await supabase.from("creators").insert({
              slug: claimedUsername.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
              name: name || claimedUsername,
              agency_id: profile.agency_id,
              is_published: false,
            });
          }
        }
        toast.success("Conta criada com sucesso!");
        const dest = templateParam ? `/app?template=${templateParam}` : "/app";
        navigate(dest);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Login realizado!");
        const dest = templateParam ? `/app?template=${templateParam}` : "/app";
        navigate(dest);
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: templateParam
          ? `${window.location.origin}/app?template=${templateParam}`
          : `${window.location.origin}/app`,
      },
    });
    if (error) toast.error(error.message);
  };

  const inputClass =
    "w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative overflow-hidden bg-background">
      <div className="absolute w-[500px] h-[500px] -top-[15%] -right-[10%] rounded-full bg-primary/20 blur-[120px] animate-k-orb" />
      <div
        className="absolute w-[400px] h-[400px] -bottom-[15%] -left-[10%] rounded-full bg-primary/10 blur-[120px] animate-k-orb"
        style={{ animationDelay: "-5s" }}
      />

      <motion.div
        key={isSignUp ? "signup" : "login"}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] relative z-[1]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 font-extrabold text-2xl tracking-tight text-foreground mb-3"
          >
            <span className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-sm text-primary-foreground font-extrabold">
              1
            </span>
            All in<span className="text-primary-readable"> 1</span>
          </Link>

          {isSignUp ? (
            <div className="mt-2">
              {claimedUsername ? (
                <>
                  <p className="text-sm text-muted-foreground">Crie sua conta e garanta</p>
                  <p className="text-base font-bold text-primary-readable mt-1">
                    in1.bio/<span className="text-foreground">{claimedUsername}</span>
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-foreground">Crie sua conta</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comece grátis e monte sua página em minutos
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="mt-2">
              <h1 className="text-xl font-bold text-foreground">Bem-vindo de volta</h1>
              <p className="text-sm text-muted-foreground mt-1">Entre na sua conta para continuar</p>
            </div>
          )}
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Google */}
          <div className="mb-6">
            <button
              onClick={handleGoogle}
              className="flex items-center justify-center gap-2.5 w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-muted-foreground font-medium transition-all duration-200 hover:border-primary/30 hover:text-foreground active:scale-[0.97]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar com Google
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[0.68rem] text-muted-foreground font-medium uppercase tracking-wider">
              ou
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-11`}
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

            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Confirmar senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive mt-1.5">As senhas não coincidem</p>
                )}
              </div>
            )}

            <div className="flex justify-center">
              <Turnstile
                siteKey="0x4AAAAAACvqwBQdJ_LF7iNRvImfGpur5RU"
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                options={{ theme: "auto", size: "normal" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !turnstileToken || (isSignUp && confirmPassword !== "" && password !== confirmPassword)}
              className="w-full py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all duration-300 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Carregando..."
              ) : isSignUp ? (
                <>
                  Criar conta
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Entrar
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {!isSignUp && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={async () => {
                  if (!email) {
                    toast.error("Digite seu e-mail primeiro");
                    return;
                  }
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  if (error) toast.error(error.message);
                  else toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
                }}
                className="text-xs text-muted-foreground hover:text-primary-readable transition-colors"
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setConfirmPassword("");
                }}
                className="text-primary-readable font-semibold hover:underline"
              >
                {isSignUp ? "Fazer login" : "Cadastre-se grátis"}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-[0.65rem] text-muted-foreground mt-6">
          Ao continuar, você concorda com os{" "}
          <Link to="/termos" className="underline">
            Termos de Uso
          </Link>{" "}
          e{" "}
          <Link to="/privacidade" className="underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}
