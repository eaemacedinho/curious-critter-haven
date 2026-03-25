import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, Sparkles, ArrowRight } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

interface UpgradeGateProps {
  /** The feature key to check — must be a boolean allow_ field */
  feature?: "allow_analytics" | "allow_custom_colors" | "allow_layout_immersive" | "allow_page_effects" | "allow_verified_badge" | "allow_remove_branding" | "allow_custom_domain" | "allow_team_members";
  /** Or check a count limit */
  resource?: "creators" | "links" | "products" | "campaigns" | "hero_reels";
  currentCount?: number;
  /** Fallback: just check if pro */
  requirePro?: boolean;
  /** What to show when locked */
  featureLabel?: string;
  children: ReactNode;
}

export default function UpgradeGate({
  feature,
  resource,
  currentCount = 0,
  requirePro,
  featureLabel = "Este recurso",
  children,
}: UpgradeGateProps) {
  const { canUse, isWithinLimit, isPro } = useSubscription();
  const [showModal, setShowModal] = useState(false);

  let isLocked = false;

  if (requirePro) {
    isLocked = !isPro;
  } else if (feature) {
    isLocked = !canUse(feature);
  } else if (resource) {
    isLocked = !isWithinLimit(resource, currentCount);
  }

  if (!isLocked) return <>{children}</>;

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => setShowModal(true)}>
        <div className="pointer-events-none opacity-40 blur-[1px] select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl border border-primary/10">
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs font-bold text-foreground">Recurso Pro</p>
            <p className="text-[0.65rem] text-muted-foreground max-w-[200px]">
              Faça upgrade para desbloquear
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <UpgradeModal featureLabel={featureLabel} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function UpgradeModal({ featureLabel, onClose }: { featureLabel: string; onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>

          <h3 className="font-display text-xl font-extrabold text-foreground mb-2">
            Desbloqueie o {featureLabel}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-[320px]">
            Faça upgrade para o plano <span className="text-primary font-bold">Pro</span> e tenha acesso a todos os recursos premium por apenas <span className="text-foreground font-bold">R$17,90/mês</span>.
          </p>

          <div className="w-full space-y-2.5 mb-6 text-left">
            {[
              "Até 2 perfis",
              "Layout Imersivo",
              "Links & produtos ilimitados",
              "Analytics completo",
              "Campanhas Spotlight",
              "Hero Reels",
              "Cores e efeitos personalizados",
              "Selo verificado",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <button
            onClick={() => { onClose(); navigate("/app/checkout"); }}
            className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl transition-all hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Fazer upgrade — R$17,90/mês
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[0.65rem] text-muted-foreground/50 mt-3">
            Cancele quando quiser. Sem compromisso.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Inline pro badge for menu items / labels */
export function ProBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-primary/10 text-primary text-[0.55rem] font-extrabold rounded-md uppercase tracking-wider">
      <Crown className="w-2.5 h-2.5" />
      Pro
    </span>
  );
}
