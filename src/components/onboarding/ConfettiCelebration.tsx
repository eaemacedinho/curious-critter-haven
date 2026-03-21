import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CONFETTI_COLORS = [
  "hsl(var(--primary))",
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#A855F7",
  "#F97316",
  "#06B6D4",
];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  shape: "square" | "circle" | "strip";
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.8,
    shape: (["square", "circle", "strip"] as const)[Math.floor(Math.random() * 3)],
  }));
}

export default function ConfettiCelebration({ onComplete }: { onComplete?: () => void }) {
  const [particles] = useState(() => generateParticles(50));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            rotate: 0,
            scale: p.scale,
            opacity: 1,
          }}
          animate={{
            top: `${100 + Math.random() * 20}%`,
            rotate: p.rotation + 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2.5 + Math.random() * 1.5,
            ease: "easeIn",
          }}
          className="absolute"
          style={{
            width: p.shape === "strip" ? 4 : 8,
            height: p.shape === "strip" ? 16 : 8,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : 2,
          }}
        />
      ))}

      {/* Center celebration text */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl px-8 py-5 text-center shadow-2xl pointer-events-auto">
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-lg font-bold text-foreground">Parabéns!</div>
          <div className="text-sm text-muted-foreground">Você completou todos os passos!</div>
        </div>
      </motion.div>
    </div>
  );
}
