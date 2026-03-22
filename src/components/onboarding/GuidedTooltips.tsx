import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipStep {
  selector: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

const TOOLTIP_STEPS: TooltipStep[] = [
  {
    selector: '[data-tour="creators"]',
    title: "Seus Creators",
    description: "Aqui você gerencia todos os creators e edita suas páginas públicas.",
    position: "right",
  },
  {
    selector: '[data-tour="campaigns"]',
    title: "Campanhas Spotlight",
    description: "Crie campanhas que ficam em destaque no topo das páginas dos creators.",
    position: "right",
  },
  {
    selector: '[data-tour="analytics"]',
    title: "Métricas em Tempo Real",
    description: "Acompanhe cliques, CTR e engajamento de cada campanha.",
    position: "right",
  },
  {
    selector: '[data-tour="settings"]',
    title: "Personalize Tudo",
    description: "Configure cores, logo, domínio e identidade visual da sua agência.",
    position: "right",
  },
];

const TOUR_KEY = "in1_tour_done";

export default function GuidedTooltips({ userId, onComplete }: { userId: string; onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const done = localStorage.getItem(`${TOUR_KEY}_${userId}`);
    if (done) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [userId]);

  useEffect(() => {
    if (!visible) return;
    const step = TOOLTIP_STEPS[currentStep];
    const el = document.querySelector(step.selector);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    }
  }, [visible, currentStep]);

  const handleNext = () => {
    if (currentStep < TOOLTIP_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(`${TOUR_KEY}_${userId}`, "true");
    setVisible(false);
  };

  if (!visible || !targetRect) return null;

  const step = TOOLTIP_STEPS[currentStep];
  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 200,
    top: targetRect.top + targetRect.height / 2,
    left: targetRect.right + 12,
    transform: "translateY(-50%)",
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[190] bg-background/60 backdrop-blur-[2px]"
        onClick={handleDismiss}
      />

      {/* Highlight */}
      <div
        className="fixed z-[195] rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background pointer-events-none"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
        }}
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.2 }}
          style={tooltipStyle}
          className="w-64 bg-card border border-border rounded-2xl p-4 shadow-xl"
        >
          {/* Arrow */}
          <div
            className="absolute w-2.5 h-2.5 bg-card border-l border-b border-border rotate-45"
            style={{ top: "50%", left: -5, transform: "translateY(-50%) rotate(45deg)" }}
          />

          <div className="text-sm font-bold text-foreground mb-1">{step.title}</div>
          <div className="text-xs text-muted-foreground mb-4 leading-relaxed">{step.description}</div>

          <div className="flex items-center justify-between">
            <span className="text-[0.65rem] text-muted-foreground">
              {currentStep + 1}/{TOOLTIP_STEPS.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Pular
              </button>
              <button
                onClick={handleNext}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                {currentStep < TOOLTIP_STEPS.length - 1 ? "Próximo" : "Concluir"}
              </button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1 justify-center mt-3">
            {TOOLTIP_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i <= currentStep ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
