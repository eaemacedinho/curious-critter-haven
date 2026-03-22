import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import in1Icon from "@/assets/in1-icon.png";
import ConversionModal from "./ConversionModal";

interface GrowthWatermarkProps {
  creatorName?: string;
}

export default function GrowthWatermark({ creatorName }: GrowthWatermarkProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="group relative flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/60 shadow-lg transition-all duration-500 hover:shadow-[0_0_24px_hsl(var(--primary)/0.3)] hover:border-primary/30 hover:scale-105 active:scale-95"
        aria-label="Criar sua página no in1.bio"
      >
        {/* Glow ring on hover */}
        <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: "inset 0 0 12px hsl(var(--primary) / 0.15), 0 0 20px hsl(var(--primary) / 0.1)" }} />
        <img
          src={in1Icon}
          alt="in1.bio"
          className="w-5 h-5 object-contain invert dark:invert-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-4deg]"
        />
        <span className="text-[0.68rem] font-bold text-foreground/70 group-hover:text-foreground transition-colors duration-300 tracking-wide">
          in1.bio
        </span>
      </button>

      <ConversionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        creatorName={creatorName}
      />
    </>
  );
}
