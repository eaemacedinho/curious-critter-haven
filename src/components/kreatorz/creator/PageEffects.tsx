import { useEffect, useRef, useState, useMemo } from "react";

export type PageEffect =
  | "particles"
  | "fireflies"
  | "snow"
  | "confetti"
  | "floating-emojis"
  | "glow-borders"
  | "gradient-bg"
  | "sparkle-cursor"
  | "aurora";

export interface EffectOption {
  id: PageEffect;
  label: string;
  emoji: string;
  description: string;
  preview: string; // CSS class for preview animation
}

export const EFFECT_OPTIONS: EffectOption[] = [
  { id: "particles", label: "Partículas", emoji: "✨", description: "Partículas brilhantes flutuando pela tela", preview: "effect-preview-particles" },
  { id: "fireflies", label: "Vagalumes", emoji: "🟡", description: "Pontos luminosos suaves se movendo lentamente", preview: "effect-preview-fireflies" },
  { id: "snow", label: "Neve", emoji: "❄️", description: "Flocos de neve caindo suavemente", preview: "effect-preview-snow" },
  { id: "confetti", label: "Confete", emoji: "🎉", description: "Explosão de confete ao carregar a página", preview: "effect-preview-confetti" },
  { id: "floating-emojis", label: "Emojis Flutuantes", emoji: "🎈", description: "Emojis subindo pela tela continuamente", preview: "effect-preview-emojis" },
  { id: "glow-borders", label: "Bordas Luminosas", emoji: "💜", description: "Bordas dos cards com brilho animado", preview: "effect-preview-glow" },
  { id: "gradient-bg", label: "Gradiente Animado", emoji: "🌈", description: "Fundo com gradiente em movimento suave", preview: "effect-preview-gradient" },
  { id: "sparkle-cursor", label: "Rastro de Brilho", emoji: "⭐", description: "Rastro de partículas ao mover o dedo/mouse", preview: "effect-preview-sparkle" },
  { id: "aurora", label: "Aurora Boreal", emoji: "🌌", description: "Ondas coloridas de aurora no fundo", preview: "effect-preview-aurora" },
];

// ====== Canvas-based particle effects ======
function useParticleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  type: "particles" | "fireflies" | "snow" | "floating-emojis",
  active: boolean,
  container?: HTMLElement | null
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const parent = container || canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const emojis = ["🎈", "⭐", "💜", "🎵", "✨", "🦋", "🌸", "💎"];
    const w = () => canvas.width / dpr;
    const h = () => canvas.height / dpr;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; life: number; maxLife: number;
      emoji?: string; color?: string; angle?: number; spin?: number;
    }

    const particles: Particle[] = [];
    const count = type === "snow" ? 40 : type === "floating-emojis" ? 12 : type === "fireflies" ? 18 : 30;

    const spawn = (): Particle => {
      const base: Particle = {
        x: Math.random() * w(),
        y: Math.random() * h(),
        vx: 0, vy: 0,
        size: 3, opacity: 0.6, life: 0, maxLife: 600 + Math.random() * 400,
        angle: 0, spin: (Math.random() - 0.5) * 0.02,
      };

      if (type === "snow") {
        base.y = -10;
        base.vy = 0.3 + Math.random() * 0.7;
        base.vx = (Math.random() - 0.5) * 0.4;
        base.size = 2 + Math.random() * 4;
        base.opacity = 0.3 + Math.random() * 0.5;
        base.color = "hsl(0 0% 100%)";
      } else if (type === "floating-emojis") {
        base.y = h() + 20;
        base.vy = -(0.4 + Math.random() * 0.6);
        base.vx = (Math.random() - 0.5) * 0.3;
        base.size = 14 + Math.random() * 10;
        base.emoji = emojis[Math.floor(Math.random() * emojis.length)];
        base.opacity = 0.7;
      } else if (type === "fireflies") {
        base.vx = (Math.random() - 0.5) * 0.3;
        base.vy = (Math.random() - 0.5) * 0.3;
        base.size = 2 + Math.random() * 3;
        base.color = `hsl(${45 + Math.random() * 20} 100% ${70 + Math.random() * 20}%)`;
      } else {
        // particles
        base.vx = (Math.random() - 0.5) * 0.5;
        base.vy = -(0.2 + Math.random() * 0.5);
        base.size = 1.5 + Math.random() * 2.5;
        base.color = `hsl(268 ${60 + Math.random() * 40}% ${60 + Math.random() * 30}%)`;
      }
      return base;
    };

    for (let i = 0; i < count; i++) {
      const p = spawn();
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    const draw = () => {
      ctx.clearRect(0, 0, w(), h());

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        if (p.angle !== undefined && p.spin) p.angle += p.spin;

        // Firefly wobble
        if (type === "fireflies") {
          p.vx += (Math.random() - 0.5) * 0.05;
          p.vy += (Math.random() - 0.5) * 0.05;
          p.vx *= 0.99;
          p.vy *= 0.99;
        }

        // Fade in/out
        const fadeIn = Math.min(p.life / 60, 1);
        const fadeOut = Math.max(1 - (p.life - p.maxLife + 60) / 60, 0);
        const alpha = p.opacity * fadeIn * fadeOut;

        // Reset if offscreen or expired
        if (p.life > p.maxLife || p.y < -30 || p.y > h() + 30 || p.x < -30 || p.x > w() + 30) {
          Object.assign(p, spawn());
          continue;
        }

        if (p.emoji) {
          ctx.globalAlpha = alpha;
          ctx.font = `${p.size}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.emoji, p.x, p.y);
        } else if (type === "fireflies") {
          // Glow effect
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          gradient.addColorStop(0, `hsla(48 100% 80% / ${alpha * 0.6})`);
          gradient.addColorStop(0.5, `hsla(48 100% 70% / ${alpha * 0.15})`);
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.fillRect(p.x - p.size * 4, p.y - p.size * 4, p.size * 8, p.size * 8);

          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color || "#fff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color || "#fff";
          if (type === "snow") {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Star-like particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            // Subtle glow
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    draw();
    const ro = new ResizeObserver(resize);
    ro.observe(container || canvas.parentElement!);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [canvasRef, type, active, container]);
}

// ====== Confetti burst ======
function ConfettiBurst({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = rect.width;
    const h = rect.height;
    const colors = [
      "hsl(268 69% 50%)", "hsl(268 85% 61%)", "hsl(268 100% 71%)",
      "hsl(43 96% 56%)", "hsl(160 64% 52%)", "hsl(0 94% 71%)",
      "hsl(200 90% 60%)", "hsl(320 80% 60%)"
    ];

    interface Confetto {
      x: number; y: number; vx: number; vy: number;
      w: number; h: number; color: string; rotation: number; rotSpeed: number;
      gravity: number; life: number;
    }

    const confetti: Confetto[] = [];
    for (let i = 0; i < 80; i++) {
      confetti.push({
        x: w / 2 + (Math.random() - 0.5) * 100,
        y: h * 0.3,
        vx: (Math.random() - 0.5) * 12,
        vy: -(3 + Math.random() * 8),
        w: 4 + Math.random() * 6,
        h: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        gravity: 0.12 + Math.random() * 0.06,
        life: 0,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const c of confetti) {
        c.life++;
        c.x += c.vx;
        c.y += c.vy;
        c.vy += c.gravity;
        c.vx *= 0.99;
        c.rotation += c.rotSpeed;
        const alpha = Math.max(0, 1 - c.life / 180);
        if (alpha <= 0) continue;
        alive = true;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      }
      if (alive) animId = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(animId);
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[100]" />;
}

// ====== Sparkle cursor ======
function SparkleCursor({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    interface Spark { x: number; y: number; vx: number; vy: number; size: number; life: number; maxLife: number; }
    const sparks: Spark[] = [];

    const onMove = (e: MouseEvent | TouchEvent) => {
      const rect = parent.getBoundingClientRect();
      let x: number, y: number;
      if ("touches" in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      for (let i = 0; i < 2; i++) {
        sparks.push({
          x, y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 0.5,
          size: 1.5 + Math.random() * 2,
          life: 0,
          maxLife: 30 + Math.random() * 20,
        });
      }
    };

    parent.addEventListener("mousemove", onMove, { passive: true });
    parent.addEventListener("touchmove", onMove, { passive: true });

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.03;
        const alpha = 1 - s.life / s.maxLife;
        if (alpha <= 0) { sparks.splice(i, 1); continue; }
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = `hsl(268 ${70 + Math.random() * 30}% ${65 + Math.random() * 25}%)`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (1 - s.life / s.maxLife * 0.5), 0, Math.PI * 2);
        ctx.fill();
        // glow
        ctx.globalAlpha = alpha * 0.2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(animId);
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("touchmove", onMove);
      ro.disconnect();
    };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[99]" />;
}

// ====== Aurora background ======
function AuroraEffect({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
      <div
        className="absolute w-[200%] h-[60%] top-[10%] -left-[50%]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, hsl(268 69% 50% / 0.3) 20%, hsl(200 80% 50% / 0.2) 40%, hsl(160 64% 52% / 0.25) 60%, hsl(268 85% 61% / 0.3) 80%, transparent 100%)",
          filter: "blur(60px)",
          animation: "aurora-drift 12s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute w-[180%] h-[40%] top-[30%] -left-[40%]"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(268 100% 71% / 0.15), hsl(320 80% 60% / 0.2), hsl(268 69% 50% / 0.15), transparent)",
          filter: "blur(80px)",
          animation: "aurora-drift 16s ease-in-out infinite alternate-reverse",
        }}
      />
    </div>
  );
}

// ====== Gradient animated background ======
function GradientBg({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
      <div
        className="absolute inset-[-50%] w-[200%] h-[200%]"
        style={{
          background: "conic-gradient(from 0deg at 50% 50%, hsl(268 69% 50% / 0.3), hsl(200 80% 50% / 0.15), hsl(160 64% 52% / 0.2), hsl(320 80% 60% / 0.15), hsl(268 69% 50% / 0.3))",
          filter: "blur(80px)",
          animation: "gradient-spin 20s linear infinite",
        }}
      />
    </div>
  );
}

// ====== Glow Borders — CSS only, adds class context ======
export function GlowBorderProvider({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div className={active ? "glow-borders-active" : ""}>
      {children}
    </div>
  );
}

// ====== Main PageEffects renderer ======
interface PageEffectsProps {
  effects: PageEffect[];
  containerRef?: React.RefObject<HTMLElement | null>;
}

export default function PageEffects({ effects, containerRef }: PageEffectsProps) {
  const particleRef = useRef<HTMLCanvasElement>(null);
  const container = containerRef?.current || null;

  const hasParticles = effects.includes("particles");
  const hasFireflies = effects.includes("fireflies");
  const hasSnow = effects.includes("snow");
  const hasEmojis = effects.includes("floating-emojis");
  const hasConfetti = effects.includes("confetti");
  const hasSparkleCursor = effects.includes("sparkle-cursor");
  const hasAurora = effects.includes("aurora");
  const hasGradientBg = effects.includes("gradient-bg");

  // Pick the first canvas-based particle effect (only one canvas at a time)
  const canvasEffect = hasParticles ? "particles" as const
    : hasFireflies ? "fireflies" as const
    : hasSnow ? "snow" as const
    : hasEmojis ? "floating-emojis" as const
    : null;

  useParticleCanvas(particleRef, canvasEffect || "particles", !!canvasEffect, container);

  return (
    <>
      {canvasEffect && (
        <canvas ref={particleRef} className="absolute inset-0 pointer-events-none z-[50]" />
      )}
      <ConfettiBurst active={hasConfetti} />
      <SparkleCursor active={hasSparkleCursor} />
      <AuroraEffect active={hasAurora} />
      <GradientBg active={hasGradientBg} />
    </>
  );
}
