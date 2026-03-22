import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import { markOnboardingDone } from "@/hooks/useOnboarding";
import { useNavigate } from "react-router-dom";

type Step = "purpose" | "name" | "style" | "creating" | "done";
type Purpose = "agency" | "creators" | "myself";
type VisualStyle = "dark" | "clean" | "neon";

const STYLE_MAP: Record<VisualStyle, { primary: string; accent: string; layout: string }> = {
  dark: { primary: "#1a1a2e", accent: "#e94560", layout: "layout1" },
  clean: { primary: "#6B2BD4", accent: "#A855F7", layout: "layout1" },
  neon: { primary: "#00f0ff", accent: "#ff00e5", layout: "layout2" },
};

const LOADING_MSGS = [
  "Criando seu ambiente…",
  "Aplicando identidade visual…",
  "Gerando sua primeira página…",
  "Quase pronto…",
];

const DEMO_LINKS = [
  { title: "Meu site", url: "https://exemplo.com", icon: "🌐", sort_order: 0 },
  { title: "Instagram", url: "https://instagram.com", icon: "📸", sort_order: 1 },
  { title: "YouTube", url: "https://youtube.com", icon: "🎬", sort_order: 2 },
];

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const { agency, updateAgency, refetch } = useTenant();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("purpose");
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [agencyName, setAgencyName] = useState("");
  const [style, setStyle] = useState<VisualStyle | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [createdHandle, setCreatedHandle] = useState("");

  const handleSkip = async () => {
    if (!user || !agency) return;
    await supabase
      .from("agency_settings")
      .update({ onboarding_completed: true })
      .eq("agency_id", agency.id);
    markOnboardingDone(user.id);
    onComplete();
  };
  useEffect(() => {
    if (step !== "creating") return;
    const interval = setInterval(() => {
      setLoadingMsgIdx(prev => Math.min(prev + 1, LOADING_MSGS.length - 1));
    }, 1200);
    return () => clearInterval(interval);
  }, [step]);

  const handleStartCreation = async () => {
    if (!user || !style || !agency) return;
    setStep("creating");
    setLoadingMsgIdx(0);

    try {
      const colors = STYLE_MAP[style];
      const name = agencyName.trim() || agency.name || "Minha Agência";
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

      // Update agency branding
      await updateAgency({
        name,
        slug,
        primary_color: colors.primary,
        accent_color: colors.accent,
      });

      // Create demo creator for this agency (creator is a business entity, created here on purpose)
      const creatorName = purpose === "myself" ? (user.user_metadata?.full_name || name) : "Creator Demo";
      const handle = slug + "-" + Date.now().toString(36);

      const { data: newCreator, error: creatorError } = await supabase
        .from("creators")
        .insert({
          user_id: user.id,
          agency_id: agency.id,
          name: creatorName,
          slug: handle,
          bio: "Olá! Esta é minha página de links. Explore meus conteúdos e redes sociais. 🚀",
          layout_type: colors.layout,
        } as any)
        .select("id, slug")
        .single();

      if (creatorError) {
        console.error("Creator creation error:", creatorError);
        throw creatorError;
      }

      const creatorId = (newCreator as any).id;
      setCreatedHandle((newCreator as any).slug);

      // Create demo links + campaign in parallel
      await Promise.all([
        supabase.from("creator_links").insert(
          DEMO_LINKS.map(l => ({ ...l, creator_id: creatorId }))
        ),
        supabase.from("campaigns").insert({
          creator_id: creatorId,
          title: "🔥 Conteúdo Exclusivo",
          description: "Confira meu novo material especial",
          url: "https://exemplo.com/exclusivo",
          live: true,
          sort_order: 0,
        }),
      ]);

      // Mark onboarding as done in agency_settings
      await supabase
        .from("agency_settings")
        .update({ onboarding_completed: true })
        .eq("agency_id", agency.id);

      await refetch();
      markOnboardingDone(user.id);

      await new Promise(r => setTimeout(r, 1500));
      setStep("done");
    } catch (err) {
      console.error("Onboarding error:", err);
      markOnboardingDone(user.id);
      onComplete();
    }
  };

  const handleFinish = () => {
    onComplete();
    if (createdHandle) {
      navigate(`/app/creators`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        <AnimatePresence mode="wait">
          {step === "purpose" && (
            <motion.div
              key="purpose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="text-5xl mb-6">👋</div>
               <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                 Bem-vindo ao All in 1
               </h1>
              <p className="text-muted-foreground mb-8 text-sm">
                Para quem você está criando páginas?
              </p>
              <div className="flex flex-col gap-3">
                {([
                  { id: "agency" as Purpose, icon: "🏢", label: "Minha agência", desc: "Gerencio creators para clientes" },
                  { id: "creators" as Purpose, icon: "🎨", label: "Meus creators", desc: "Tenho uma rede de influenciadores" },
                  { id: "myself" as Purpose, icon: "🙋", label: "Eu mesmo", desc: "Quero minha própria página" },
                ]).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setPurpose(opt.id); setStep("name"); }}
                    className="group flex items-center gap-4 p-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 text-left"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{opt.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleSkip}
                className="mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Pular e configurar depois
              </button>
            </motion.div>
          )}

          {step === "name" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="text-5xl mb-6">✨</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {purpose === "myself" ? "Qual seu nome?" : "Nome da sua agência"}
              </h1>
              <p className="text-muted-foreground mb-8 text-sm">
                Isso aparecerá na sua plataforma
              </p>
              <input
                type="text"
                value={agencyName}
                onChange={e => setAgencyName(e.target.value)}
                placeholder={purpose === "myself" ? "Seu nome" : "Ex: Digital Agency"}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-center text-lg focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all mb-6"
                autoFocus
                onKeyDown={e => e.key === "Enter" && setStep("style")}
              />
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setStep("purpose")}
                  className="px-6 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep("style")}
                  className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Continuar
                </button>
              </div>
              <button
                onClick={handleSkip}
                className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Pular e configurar depois
              </button>
            </motion.div>
          )}

          {step === "style" && (
            <motion.div
              key="style"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="text-5xl mb-6">🎨</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Escolha seu estilo
              </h1>
              <p className="text-muted-foreground mb-8 text-sm">
                Você pode personalizar depois
              </p>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {([
                  { id: "dark" as VisualStyle, label: "Dark Premium", colors: ["#1a1a2e", "#e94560"], icon: "🌙" },
                  { id: "clean" as VisualStyle, label: "Clean", colors: ["#6B2BD4", "#A855F7"], icon: "☁️" },
                  { id: "neon" as VisualStyle, label: "Neon", colors: ["#00f0ff", "#ff00e5"], icon: "⚡" },
                ]).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setStyle(opt.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                      style === opt.id
                        ? "border-primary bg-primary/10 scale-[1.02]"
                        : "border-border bg-card/50 hover:border-primary/30"
                    }`}
                  >
                    <div className="text-2xl mb-2">{opt.icon}</div>
                    <div
                      className="w-full h-8 rounded-lg mb-2"
                      style={{
                        background: `linear-gradient(135deg, ${opt.colors[0]}, ${opt.colors[1]})`,
                      }}
                    />
                    <div className="text-xs font-semibold text-foreground">{opt.label}</div>
                    {style === opt.id && (
                      <motion.div
                        layoutId="style-check"
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs"
                      >
                        ✓
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setStep("name")}
                  className="px-6 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleStartCreation}
                  disabled={!style}
                  className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Criar minha página 🚀
                </button>
              </div>
            </motion.div>
          )}

          {step === "creating" && (
            <motion.div
              key="creating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-8 rounded-full border-4 border-primary/20 border-t-primary"
              />
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingMsgIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-foreground font-medium text-lg"
                >
                  {LOADING_MSGS[loadingMsgIdx]}
                </motion.p>
              </AnimatePresence>
              <div className="flex gap-1.5 justify-center mt-6">
                {LOADING_MSGS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i <= loadingMsgIdx ? "bg-primary scale-100" : "bg-border scale-75"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-6xl mb-6"
              >
                🎉
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Sua página já está pronta!
              </h1>
              <p className="text-muted-foreground mb-4 text-sm">
                {agencyName ? `${agencyName} está` : "Tudo está"} configurado e pronto para usar.
              </p>
              {createdHandle && (
                 <div className="mb-6 p-3 bg-card border border-border rounded-xl">
                   <p className="text-xs text-muted-foreground mb-1">Sua página pública</p>
                   <p className="text-sm font-mono text-primary">in1.bio/{createdHandle}</p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleFinish}
                  className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Explorar minha plataforma ✨
                </button>
                {createdHandle && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/c/${createdHandle}`);
                      const btn = document.activeElement as HTMLButtonElement;
                      if (btn) btn.textContent = "✓ Link copiado!";
                      setTimeout(() => { if (btn) btn.textContent = "📋 Copiar link da página"; }, 2000);
                    }}
                    className="px-6 py-3 rounded-xl border border-border text-foreground text-sm hover:border-primary/30 transition-colors"
                  >
                    📋 Copiar link da página
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
