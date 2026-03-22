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
        className="group w-9 h-9 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center transition-all duration-500 hover:bg-black/40 hover:scale-110 active:scale-95"
        aria-label="Criar sua página no in1.bio"
      >
        <img
          src={in1Icon}
          alt="in1.bio"
          className="w-5 h-5 object-contain invert dark:invert-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-4deg]"
        />
      </button>

      <ConversionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        creatorName={creatorName}
      />
    </>
  );
}
