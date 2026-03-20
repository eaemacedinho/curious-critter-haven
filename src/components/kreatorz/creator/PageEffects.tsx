import { useEffect, useRef, useState, useMemo } from "react";

export type PageEffect =
  | "snow"
  | "floating-emojis"
  | "sparkle-cursor"
  | "aurora"
  | "star-rain"
  | "bubbles";

export interface EffectOption {
  id: PageEffect;
  label: string;
  emoji: string;
  description: string;
  preview: string;
}

export const EFFECT_OPTIONS: EffectOption[] = [
  { id: "snow", label: "Neve", emoji: "❄️", description: "Flocos de neve caindo suavemente", preview: "" },
  { id: "floating-emojis", label: "Emojis Flutuantes", emoji: "🎈", description: "Emojis subindo pela tela continuamente", preview: "" },
  { id: "sparkle-cursor", label: "Rastro de Brilho", emoji: "⭐", description: "Rastro de partículas ao mover o dedo/mouse", preview: "" },
  { id: "aurora", label: "Aurora Boreal", emoji: "🌌", description: "Ondas coloridas de aurora no fundo", preview: "" },
  { id: "star-rain", label: "Chuva de Estrelas", emoji: "🌠", description: "Estrelas cadentes cruzando a tela", preview: "" },
  { id: "bubbles", label: "Bolhas de Sabão", emoji: "🫧", description: "Bolhas translúcidas subindo suavemente", preview: "" },
];

export const DEFAULT_EMOJIS = ["🎈", "⭐", "💜", "🎵", "✨", "🦋", "🌸", "💎"];
export const EMOJI_PALETTE = ["🎈","⭐","💜","🎵","✨","🦋","🌸","💎","❤️","🔥","🎉","🌈","💫","🎀","🍀","🌺","💖","🎶","🥳","😍","🦄","🍕","☕","🌙","💐","🏆","👑","💝","🫶","🪄","🎯","🧸"];

// ====== Helper: hex to HSL components ======
function hexToHslParts(hex: string): { h: number; s: number; l: number } | null {
  if (!hex || !hex.startsWith("#") || hex.length < 7) return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// ====== Canvas-based particle effects ======
type CanvasType = "snow" | "floating-emojis" | "star-rain" | "bubbles";

function useParticleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  type: CanvasType,
  active: boolean,
  color?: string | null,
  container?: HTMLElement | null,
  customEmojis?: string[],
  intensity?: number // 0-100, default 50
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    const hsl = color ? hexToHslParts(color) : null;
    const baseH = hsl?.h ?? 268;
    const baseS = hsl?.s ?? 69;
    const baseL = hsl?.l ?? 50;

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

    const emojis = customEmojis && customEmojis.length > 0 ? customEmojis : DEFAULT_EMOJIS;
    const w = () => canvas.width / dpr;
    const h = () => canvas.height / dpr;

    // Intensity multiplier: 0-100 mapped to 0.2-2.0
    const intMul = intensity !== undefined ? 0.2 + (intensity / 100) * 1.8 : 1;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; life: number; maxLife: number;
      emoji?: string; color?: string; angle?: number; spin?: number;
      wobblePhase?: number; wobbleSpeed?: number;
      length?: number; speed?: number;
    }

    const particles: Particle[] = [];
    const baseCount = type === "snow" ? 40 : type === "floating-emojis" ? 12 : type === "bubbles" ? 16 : type === "star-rain" ? 8 : 30;
    const count = Math.max(2, Math.round(baseCount * intMul));

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
        base.color = `hsl(${baseH} ${Math.max(baseS - 40, 0)}% ${Math.min(baseL + 40, 100)}%)`;
      } else if (type === "floating-emojis") {
        base.y = h() + 20;
        base.vy = -(0.4 + Math.random() * 0.6);
        base.vx = (Math.random() - 0.5) * 0.3;
        base.size = 14 + Math.random() * 10;
        base.emoji = emojis[Math.floor(Math.random() * emojis.length)];
        base.opacity = 0.7;
      } else if (type === "bubbles") {
        base.y = h() + 20;
        base.vy = -(0.3 + Math.random() * 0.5);
        base.vx = 0;
        base.size = 8 + Math.random() * 20;
        base.opacity = 0.15 + Math.random() * 0.2;
        base.wobblePhase = Math.random() * Math.PI * 2;
        base.wobbleSpeed = 0.01 + Math.random() * 0.02;
        base.maxLife = 800 + Math.random() * 600;
        base.color = `hsl(${baseH} ${baseS}% ${baseL + 15}%)`;
      } else if (type === "star-rain") {
        base.x = Math.random() * w() * 1.5;
        base.y = -20;
        base.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
        base.speed = 3 + Math.random() * 4;
        base.vx = Math.cos(base.angle) * base.speed!;
        base.vy = Math.sin(base.angle) * base.speed!;
        base.length = 20 + Math.random() * 40;
        base.size = 1 + Math.random() * 1.5;
        base.opacity = 0.5 + Math.random() * 0.4;
        base.maxLife = 200 + Math.random() * 200;
        base.color = `hsl(${baseH} ${baseS}% ${baseL + 20}%)`;
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

        // Bubble wobble
        if (type === "bubbles" && p.wobblePhase !== undefined) {
          p.wobblePhase += p.wobbleSpeed || 0.015;
          p.x += Math.sin(p.wobblePhase) * 0.5;
        }

        const fadeIn = Math.min(p.life / 60, 1);
        const fadeOut = Math.max(1 - (p.life - p.maxLife + 60) / 60, 0);
        const alpha = p.opacity * fadeIn * fadeOut;

        if (p.life > p.maxLife || p.y < -50 || p.y > h() + 50 || p.x < -50 || p.x > w() + 50) {
          Object.assign(p, spawn());
          continue;
        }

        if (p.emoji) {
          ctx.globalAlpha = alpha;
          ctx.font = `${p.size}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.emoji, p.x, p.y);
        } else if (type === "bubbles") {
          // Bubble with highlight
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = p.color || `hsl(${baseH} ${baseS}% ${baseL + 20}%)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
          // Inner glow
          const grad = ctx.createRadialGradient(p.x - p.size * 0.3, p.y - p.size * 0.3, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `hsla(${baseH} ${baseS}% ${Math.min(baseL + 35, 95)}% / ${alpha * 0.4})`);
          grad.addColorStop(0.7, `hsla(${baseH} ${baseS}% ${baseL + 20}% / ${alpha * 0.08})`);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.fill();
          // Highlight spot
          ctx.globalAlpha = alpha * 0.6;
          ctx.fillStyle = `hsl(0 0% 100%)`;
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.25, p.y - p.size * 0.25, p.size * 0.15, 0, Math.PI * 2);
          ctx.fill();
        } else if (type === "star-rain") {
          // Shooting star trail
          ctx.globalAlpha = alpha;
          const tailX = p.x - (p.vx / (p.speed || 1)) * (p.length || 30);
          const tailY = p.y - (p.vy / (p.speed || 1)) * (p.length || 30);
          const grad = ctx.createLinearGradient(tailX, tailY, p.x, p.y);
          grad.addColorStop(0, "transparent");
          grad.addColorStop(1, p.color || "#fff");
          ctx.strokeStyle = grad;
          ctx.lineWidth = p.size;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          // Head glow
          ctx.globalAlpha = alpha * 0.7;
          ctx.fillStyle = `hsl(0 0% 100%)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (type === "snow") {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color || "#fff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
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
  }, [canvasRef, type, active, color, container]);
}

// ====== Matrix effect ======
function MatrixEffect({ active, color }: { active: boolean; color?: string }) {
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

    const hsl = color ? hexToHslParts(color) : null;
    const baseH = hsl?.h ?? 120;
    const baseS = hsl?.s ?? 100;
    const baseL = hsl?.l ?? 50;

    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01234567890ABCDEFabcdef<>{}[]=/\\|;:.,~!@#$%^&*";
    const charArray = chars.split("");
    const fontSize = 12;

    let columns: number[] = [];
    let cw = 0;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cw = rect.width;
      const colCount = Math.ceil(rect.width / fontSize);
      columns = Array.from({ length: colCount }, () => Math.random() * -100);
    };
    resize();

    let animId: number;
    let lastTime = 0;
    const interval = 50;

    const draw = (time: number) => {
      if (time - lastTime < interval) {
        animId = requestAnimationFrame(draw);
        return;
      }
      lastTime = time;

      const ch = canvas.height / dpr;
      ctx.fillStyle = `hsla(var(--background) / 0.08)`;
      ctx.fillRect(0, 0, cw, ch);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns.length; i++) {
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = columns[i] * fontSize;

        // Bright head character
        ctx.fillStyle = `hsl(${baseH} ${baseS}% ${Math.min(baseL + 30, 90)}%)`;
        ctx.globalAlpha = 0.9;
        ctx.fillText(char, x, y);

        // Trail chars with fading
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = `hsl(${baseH} ${baseS}% ${baseL}%)`;

        if (y > ch && Math.random() > 0.975) {
          columns[i] = 0;
        }
        columns[i]++;
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    // Initial black fill
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, cw, canvas.height / dpr);

    animId = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [active, color]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[48] opacity-40" />;
}

// ====== Sparkle cursor ======
function SparkleCursor({ active, color }: { active: boolean; color?: string }) {
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

    const hsl = color ? hexToHslParts(color) : null;
    const baseH = hsl?.h ?? 268;
    const baseS = hsl?.s ?? 69;

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
        ctx.fillStyle = `hsl(${baseH} ${baseS + Math.random() * 20}% ${60 + Math.random() * 25}%)`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (1 - s.life / s.maxLife * 0.5), 0, Math.PI * 2);
        ctx.fill();
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
  }, [active, color]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[99]" />;
}

// ====== Aurora background ======
function AuroraEffect({ active, color }: { active: boolean; color?: string }) {
  if (!active) return null;
  const hsl = color ? hexToHslParts(color) : null;
  const h1 = hsl?.h ?? 268;
  const s1 = hsl?.s ?? 69;
  const l1 = hsl?.l ?? 50;
  const h2 = (h1 + 60) % 360;
  const h3 = (h1 + 150) % 360;

  return (
    <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden" style={{ opacity: 0.45 }}>
      <div
        className="absolute w-[200%] h-[50%] top-[5%] -left-[50%]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, hsl(${h1} ${s1}% ${l1}% / 0.4) 15%, hsl(${h2} 80% 50% / 0.3) 35%, hsl(${h3} 64% 52% / 0.35) 55%, hsl(${h1} ${Math.min(s1 + 16, 100)}% ${Math.min(l1 + 11, 80)}% / 0.4) 75%, transparent 100%)`,
          filter: "blur(50px)",
          animation: "aurora-drift 10s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute w-[200%] h-[35%] top-[25%] -left-[40%]"
        style={{
          background: `linear-gradient(90deg, transparent, hsl(${h1} 100% ${Math.min(l1 + 21, 85)}% / 0.25), hsl(${(h1 + 100) % 360} 80% 60% / 0.3), hsl(${h2} 90% 60% / 0.2), hsl(${h1} ${s1}% ${l1}% / 0.25), transparent)`,
          filter: "blur(70px)",
          animation: "aurora-drift 14s ease-in-out infinite alternate-reverse",
        }}
      />
      <div
        className="absolute w-[180%] h-[30%] top-[40%] -left-[30%]"
        style={{
          background: `linear-gradient(90deg, transparent, hsl(${h3} 64% 52% / 0.2), hsl(${h1} ${s1}% ${l1}% / 0.25), hsl(${h2} 80% 50% / 0.2), transparent)`,
          filter: "blur(60px)",
          animation: "aurora-drift 18s ease-in-out infinite alternate",
          animationDelay: "3s",
        }}
      />
    </div>
  );
}

// ====== Glow Borders ======
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
  color?: string;
  containerRef?: React.RefObject<HTMLElement | null>;
}

export default function PageEffects({ effects, color, containerRef }: PageEffectsProps) {
  const particleRef = useRef<HTMLCanvasElement>(null);
  const container = containerRef?.current || null;

  const hasSnow = effects.includes("snow");
  const hasEmojis = effects.includes("floating-emojis");
  const hasStarRain = effects.includes("star-rain");
  const hasBubbles = effects.includes("bubbles");
  const hasMatrix = effects.includes("matrix");
  const hasSparkleCursor = effects.includes("sparkle-cursor");
  const hasAurora = effects.includes("aurora");

  // Pick the first canvas-based particle effect (only one canvas at a time)
  const canvasEffect: CanvasType | null = hasSnow ? "snow"
    : hasEmojis ? "floating-emojis"
    : hasStarRain ? "star-rain"
    : hasBubbles ? "bubbles"
    : null;

  useParticleCanvas(particleRef, canvasEffect || "snow", !!canvasEffect, color, container);

  return (
    <>
      {canvasEffect && (
        <canvas ref={particleRef} className="absolute inset-0 pointer-events-none z-[50]" />
      )}
      <MatrixEffect active={hasMatrix} color={color} />
      <SparkleCursor active={hasSparkleCursor} color={color} />
      <AuroraEffect active={hasAurora} color={color} />
    </>
  );
}
