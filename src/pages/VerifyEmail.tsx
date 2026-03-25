import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const COOLDOWN_SECONDS = 60;
const MAX_REQUESTS = 5;
const LOCK_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

interface RateLimitState {
  timestamps: number[];
  lockedUntil: number | null;
}

function getRateLimitState(email: string): RateLimitState {
  try {
    const raw = localStorage.getItem(`otp_rate_${email}`);
    if (!raw) return { timestamps: [], lockedUntil: null };
    return JSON.parse(raw);
  } catch {
    return { timestamps: [], lockedUntil: null };
  }
}

function setRateLimitState(email: string, state: RateLimitState) {
  localStorage.setItem(`otp_rate_${email}`, JSON.stringify(state));
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const fromSignup = searchParams.get("from") === "signup";

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const sentOnMount = useRef(false);

  // Check lock status on mount
  useEffect(() => {
    if (!email) return;
    const state = getRateLimitState(email);
    if (state.lockedUntil && state.lockedUntil > Date.now()) {
      setLocked(true);
      setLockCountdown(Math.ceil((state.lockedUntil - Date.now()) / 1000));
    }
  }, [email]);

  // Lock countdown
  useEffect(() => {
    if (!locked || lockCountdown <= 0) return;
    const timer = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          setLocked(false);
          if (email) {
            setRateLimitState(email, { timestamps: [], lockedUntil: null });
          }
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [locked, lockCountdown, email]);

  // Cooldown countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const sendCode = useCallback(async () => {
    if (!email || sending || locked || countdown > 0) return;

    // Client-side rate limit check
    const state = getRateLimitState(email);
    const now = Date.now();

    // Clean old timestamps
    state.timestamps = state.timestamps.filter(
      (t) => now - t < RATE_LIMIT_WINDOW_MS
    );

    if (state.timestamps.length >= MAX_REQUESTS) {
      const lockedUntil = now + LOCK_DURATION_MS;
      setRateLimitState(email, { ...state, lockedUntil });
      setLocked(true);
      setLockCountdown(Math.ceil(LOCK_DURATION_MS / 1000));
      toast.error("Muitas tentativas. Aguarde 2 horas.");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "send-confirmation-code",
        { body: { email } }
      );

      if (error) {
        toast.error("Erro ao enviar código. Tente novamente.");
        return;
      }

      if (data?.error === "too_many_requests") {
        const lockedUntil = new Date(data.locked_until).getTime();
        setRateLimitState(email, { timestamps: state.timestamps, lockedUntil });
        setLocked(true);
        setLockCountdown(Math.ceil((lockedUntil - now) / 1000));
        toast.error(data.message);
        return;
      }

      if (data?.error === "cooldown") {
        setCountdown(data.retry_after || COOLDOWN_SECONDS);
        toast.info("Aguarde para solicitar um novo código.");
        return;
      }

      if (data?.error === "already_confirmed") {
        toast.success("E-mail já confirmado! Faça login.");
        navigate("/login", { replace: true });
        return;
      }

      if (data?.error) {
        toast.error(data.message || "Erro ao enviar código.");
        return;
      }

      // Success
      state.timestamps.push(now);
      setRateLimitState(email, state);
      setCountdown(COOLDOWN_SECONDS);
      setCodeSent(true);
      toast.success("Código enviado para seu e-mail!");
    } catch {
      toast.error("Erro ao enviar código.");
    } finally {
      setSending(false);
    }
  }, [email, sending, locked, countdown, navigate]);

  // Send code on mount if coming from signup
  useEffect(() => {
    if (fromSignup && email && !sentOnMount.current && !locked) {
      sentOnMount.current = true;
      sendCode();
    }
  }, [fromSignup, email, locked, sendCode]);

  const verifyCode = async () => {
    if (code.length !== 6 || verifying) return;
    setVerifying(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "verify-confirmation-code",
        { body: { email, code } }
      );

      if (error) {
        toast.error("Erro ao verificar código.");
        setVerifying(false);
        return;
      }

      if (data?.error === "wrong_code") {
        toast.error("Código incorreto. Tente novamente.");
        setCode("");
        setVerifying(false);
        return;
      }

      if (data?.error === "expired") {
        toast.error(data.message);
        setCode("");
        setVerifying(false);
        return;
      }

      if (data?.error) {
        toast.error(data.message || "Erro na verificação.");
        setVerifying(false);
        return;
      }

      toast.success("E-mail confirmado com sucesso!");
      navigate("/login?verified=1", { replace: true });
    } catch {
      toast.error("Erro ao verificar código.");
    } finally {
      setVerifying(false);
    }
  };

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (code.length === 6) {
      verifyCode();
    }
  }, [code]);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Nenhum e-mail informado.</p>
          <Link to="/login" className="text-primary-readable font-semibold hover:underline">
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative overflow-hidden bg-background">
      <div className="absolute w-[500px] h-[500px] -top-[15%] -right-[10%] rounded-full bg-primary/20 blur-[120px] animate-k-orb" />
      <div
        className="absolute w-[400px] h-[400px] -bottom-[15%] -left-[10%] rounded-full bg-primary/10 blur-[120px] animate-k-orb"
        style={{ animationDelay: "-5s" }}
      />

      <motion.div
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
          <div className="mt-2">
            <h1 className="text-xl font-bold text-foreground">Confirme seu e-mail</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Digite o código de 6 dígitos enviado para
            </p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{email}</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {locked ? (
            <div className="text-center py-8">
              <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground mb-2">Muitas tentativas</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Por segurança, aguarde antes de solicitar novos códigos.
              </p>
              <div className="text-2xl font-mono font-bold text-primary-readable">
                {formatTime(lockCountdown)}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary-readable" />
                </div>
              </div>

              {!codeSent && !fromSignup ? (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-6">
                    Clique abaixo para receber o código de confirmação no seu e-mail.
                  </p>
                  <button
                    onClick={sendCode}
                    disabled={sending}
                    className="w-full py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all duration-300 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sending ? "Enviando..." : "Enviar código"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <InputOTP
                      maxLength={6}
                      value={code}
                      onChange={setCode}
                      disabled={verifying}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="w-12 h-14 text-lg font-bold" />
                        <InputOTPSlot index={1} className="w-12 h-14 text-lg font-bold" />
                        <InputOTPSlot index={2} className="w-12 h-14 text-lg font-bold" />
                        <InputOTPSlot index={3} className="w-12 h-14 text-lg font-bold" />
                        <InputOTPSlot index={4} className="w-12 h-14 text-lg font-bold" />
                        <InputOTPSlot index={5} className="w-12 h-14 text-lg font-bold" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {verifying && (
                    <p className="text-center text-sm text-muted-foreground mb-4">
                      Verificando...
                    </p>
                  )}

                  <div className="text-center mt-4">
                    {countdown > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Reenviar código em{" "}
                        <span className="font-mono font-bold text-foreground">
                          {formatTime(countdown)}
                        </span>
                      </p>
                    ) : (
                      <button
                        onClick={sendCode}
                        disabled={sending}
                        className="inline-flex items-center gap-1.5 text-sm text-primary-readable font-semibold hover:underline disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${sending ? "animate-spin" : ""}`} />
                        Reenviar código
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          <div className="mt-6 pt-5 border-t border-border">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
