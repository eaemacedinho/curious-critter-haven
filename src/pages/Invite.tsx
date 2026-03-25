import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { captureReferralCode } from "@/hooks/useReferral";
import { ArrowRight, Sparkles, Link2, BarChart3, Palette, Zap, Users, CheckCircle2 } from "lucide-react";

const BENEFITS = [
  { icon: <Link2 className="w-5 h-5" />, title: "Página de Links Premium", desc: "Centralize todos os seus links em uma única página com design profissional." },
  { icon: <Palette className="w-5 h-5" />, title: "Templates Exclusivos", desc: "Escolha entre layouts modernos: Dark, Grid, Minimal, Linkme e mais." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Analytics em Tempo Real", desc: "Acompanhe cliques, visualizações e engajamento da sua audiência." },
  { icon: <Zap className="w-5 h-5" />, title: "Campanhas & Spotlights", desc: "Promova marcas e produtos com cards interativos na sua página." },
  { icon: <Users className="w-5 h-5" />, title: "Gestão de Equipe", desc: "Convide membros para colaborar e gerenciar múltiplos perfis." },
  { icon: <Sparkles className="w-5 h-5" />, title: "Hero Reels & Efeitos", desc: "Vídeos em destaque e efeitos visuais que impressionam." },
];

export default function Invite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const refCode = searchParams.get("ref");
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [referrerAvatar, setReferrerAvatar] = useState<string | null>(null);
  const [referrerSlug, setReferrerSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Capture the ref code into localStorage
    captureReferralCode();

    if (!refCode) {
      setLoading(false);
      return;
    }

    // Look up the referrer's name via edge function (public access)
    const fetchReferrer = async () => {
      try {
        const { data } = await supabase.functions.invoke("get-referrer", {
          body: { ref_code: refCode },
        });
        if (data?.name) {
          setReferrerName(data.name);
          setReferrerAvatar(data.avatar_url || null);
          setReferrerSlug(data.slug || null);
        }
      } catch {}
      setLoading(false);
    };

    fetchReferrer();
  }, [refCode]);

  const handleGetStarted = () => {
    navigate("/login?signup=1");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute w-[600px] h-[600px] -top-[20%] -right-[15%] rounded-full bg-primary/15 blur-[150px] animate-k-orb" />
      <div className="absolute w-[500px] h-[500px] -bottom-[20%] -left-[15%] rounded-full bg-primary/10 blur-[150px] animate-k-orb" style={{ animationDelay: "-5s" }} />
      <div className="absolute w-[300px] h-[300px] top-[40%] left-[50%] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-[1100px] mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-xl tracking-tight text-foreground">
          <span className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-xs text-primary-foreground font-extrabold">1</span>
          All in<span className="text-primary-readable"> 1</span>
        </Link>
        <Link
          to="/login"
          className="px-5 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Já tenho conta
        </Link>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-[680px] mx-auto px-6 pt-8 pb-16 text-center">
        {/* Referrer badge */}
        {!loading && referrerName && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-card border border-border rounded-full mb-8 shadow-lg"
          >
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
              {referrerName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">{referrerName}</strong> te convidou!
            </span>
            <Sparkles className="w-4 h-4 text-primary-readable" />
          </motion.div>
        )}

        {!loading && !referrerName && refCode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary-readable" />
            <span className="text-sm text-muted-foreground">Você recebeu um convite especial!</span>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-5"
        >
          Sua presença digital{" "}
          <span className="text-primary-readable">em um só lugar</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-base sm:text-lg text-muted-foreground max-w-[520px] mx-auto mb-8 leading-relaxed"
        >
          Crie uma página personalizada com seus links, vídeos, campanhas e muito mais.
          Tudo com design premium e analytics em tempo real.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-primary text-primary-foreground font-bold text-base rounded-2xl transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--primary)/0.3)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5"
          >
            Criar minha página grátis
            <ArrowRight className="w-5 h-5" />
          </button>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Saiba mais sobre a plataforma →
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 mt-6"
        >
          <div className="flex -space-x-2">
            {["🎨", "📸", "🎵", "💼"].map((emoji, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-card border-2 border-background flex items-center justify-center text-xs"
              >
                {emoji}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-1">
            Centenas de creators já estão usando
          </span>
        </motion.div>
      </div>

      {/* Benefits grid */}
      <div className="relative z-10 max-w-[900px] mx-auto px-6 pb-20">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center text-lg font-bold text-foreground mb-8"
        >
          Tudo que você precisa em uma página
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.08, duration: 0.5 }}
              className="bg-card border border-border rounded-2xl p-5 hover:border-primary/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary-readable mb-3 group-hover:bg-primary/15 transition-colors">
                {b.icon}
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">{b.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-12 text-center"
        >
          <div className="bg-card border border-border rounded-2xl p-8 max-w-[500px] mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-primary-readable" />
              <span className="text-sm font-bold text-foreground">100% gratuito para começar</span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Crie sua conta em segundos. Sem cartão de crédito, sem compromisso.
            </p>
            <button
              onClick={handleGetStarted}
              className="px-8 py-3.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)] hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 mx-auto"
            >
              Começar agora
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-[0.68rem] text-muted-foreground mt-8"
        >
          © {new Date().getFullYear()} in1.bio — Sua página de links premium
        </motion.p>
      </div>
    </div>
  );
}
