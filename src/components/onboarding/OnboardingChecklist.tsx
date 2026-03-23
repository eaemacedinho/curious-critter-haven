import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import type { OnboardingState } from "@/hooks/useOnboarding";
import ConfettiCelebration from "./ConfettiCelebration";

const TASKS = [
  { key: "creatorEdited" as const, icon: "👤", label: "Personalizar creator", desc: "Edite bio, foto e estilo", link: "/app/creators" },
  { key: "linkAdded" as const, icon: "🔗", label: "Adicionar um link", desc: "Insira links para suas redes", link: "/app/creators" },
  { key: "campaignCreated" as const, icon: "📢", label: "Criar campanha", desc: "Lance uma campanha spotlight", link: "/app/campaigns" },
  { key: "published" as const, icon: "🚀", label: "Publicar página", desc: "Compartilhe com o mundo", link: null },
];

const CONFETTI_KEY = "in1_confetti_shown";

export default function OnboardingChecklist({ state }: { state: OnboardingState }) {
  const [expanded, setExpanded] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (state.checklistProgress === 4 && !localStorage.getItem(CONFETTI_KEY)) {
      setShowConfetti(true);
      localStorage.setItem(CONFETTI_KEY, "true");
    }
  }, [state.checklistProgress]);

  if (state.checklistDismissed && state.checklistProgress < 4) return null;

  const progress = (state.checklistProgress / 4) * 100;

  return (
    <>
      {showConfetti && <ConfettiCelebration onComplete={() => setShowConfetti(false)} />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden mb-6"
      >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-primary/5 transition-colors"
      >
        <div className="relative w-10 h-10 flex-shrink-0">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="2.5"
            />
            <motion.path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${progress}, 100`}
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${progress}, 100` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
            {state.checklistProgress}/4
          </span>
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-foreground">Primeiros passos</div>
          <div className="text-xs text-muted-foreground">Complete para dominar sua plataforma</div>
        </div>
        <span className={`text-muted-foreground text-xs transition-transform ${expanded ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Tasks */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-1.5">
              {TASKS.map((task, i) => {
                const done = state.checklist[task.key];
                return (
                  <Link
                    key={task.key}
                    to={task.link}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      done
                        ? "bg-primary/5 opacity-60"
                        : "bg-card hover:bg-primary/5 border border-border hover:border-primary/20"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all ${
                      done
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {done ? "✓" : task.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.label}
                      </div>
                      <div className="text-[0.68rem] text-muted-foreground">{task.desc}</div>
                    </div>
                    {!done && (
                      <span className="text-xs text-primary font-medium">Fazer →</span>
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={state.dismissChecklist}
                className="text-[0.68rem] text-muted-foreground hover:text-foreground transition-colors"
              >
                Ocultar checklist
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
}
