import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReferral } from "@/hooks/useReferral";
import { toast } from "sonner";
import { Copy, Check, Share2, Gift, Users, Trophy, Sparkles } from "lucide-react";

const SHARE_CHANNELS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    icon: "💬",
    getUrl: (link: string, text: string) => `https://wa.me/?text=${encodeURIComponent(text + " " + link)}`,
  },
  {
    id: "x",
    label: "X / Twitter",
    color: "#000",
    icon: "𝕏",
    getUrl: (link: string, text: string) => `https://x.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    icon: "in",
    getUrl: (link: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
  },
];

export default function Referrals() {
  const { referralCode, referralLink, convertedReferrals, rewards, loading } = useReferral();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = "Crie sua página premium no in1.bio — links, vídeos e campanhas em um só lugar 🚀";

  const nextReward = rewards.find((r) => !r.unlocked);
  const progressToNext = nextReward
    ? Math.min(100, (convertedReferrals / nextReward.threshold) * 100)
    : 100;

  if (loading) {
    return (
      <div className="max-w-[700px] mx-auto py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary-readable" />
            Programa de Indicações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Convide amigos e desbloqueie recompensas exclusivas.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: <Users className="w-5 h-5" />, value: convertedReferrals, label: "Convites aceitos" },
            { icon: <Trophy className="w-5 h-5" />, value: rewards.filter(r => r.unlocked).length, label: "Recompensas" },
            { icon: <Sparkles className="w-5 h-5" />, value: `${Math.round(progressToNext)}%`, label: "Próximo nível" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-card border border-border rounded-2xl p-4 text-center"
            >
              <div className="flex justify-center text-primary-readable mb-2">{stat.icon}</div>
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[0.66rem] text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Invite link */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5 mb-6"
        >
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary-readable" />
            Seu link de convite
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground font-mono truncate">
              {referralLink || "Carregando..."}
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.97] flex items-center gap-2 whitespace-nowrap"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>

          {/* Share buttons */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[0.68rem] text-muted-foreground">Compartilhar via:</span>
            {SHARE_CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => window.open(ch.getUrl(referralLink, shareText), "_blank")}
                className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-sm transition-all hover:bg-accent/10 hover:border-primary/30 hover:scale-105 active:scale-95"
                title={ch.label}
              >
                {ch.icon}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Recompensas
          </h2>

          <div className="space-y-3">
            {rewards.map((reward, i) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  reward.unlocked
                    ? "bg-primary/5 border-primary/20"
                    : "bg-background border-border"
                }`}
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                  reward.unlocked ? "bg-primary/15" : "bg-muted"
                }`}>
                  {reward.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${reward.unlocked ? "text-primary-readable" : "text-foreground"}`}>
                      {reward.label}
                    </span>
                    {reward.unlocked && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-0.5 bg-primary/15 text-primary-readable text-[0.6rem] font-bold rounded-full"
                      >
                        DESBLOQUEADO
                      </motion.span>
                    )}
                  </div>
                  <p className="text-[0.68rem] text-muted-foreground">{reward.description}</p>
                </div>

                {/* Progress */}
                <div className="text-right shrink-0">
                  <div className={`text-sm font-bold ${reward.unlocked ? "text-primary-readable" : "text-muted-foreground"}`}>
                    {Math.min(convertedReferrals, reward.threshold)}/{reward.threshold}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Progress bar to next reward */}
          {nextReward && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.68rem] text-muted-foreground">
                  Progresso para "{nextReward.label}"
                </span>
                <span className="text-[0.68rem] font-bold text-foreground">
                  {convertedReferrals}/{nextReward.threshold}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Authority text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[0.68rem] text-muted-foreground mt-6"
        >
          Criadores estão migrando para bio inteligente. Convide quem você admira.
        </motion.p>
      </motion.div>
    </div>
  );
}
