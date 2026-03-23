import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, X, Eye, Sparkles } from "lucide-react";
import in1Logo from "@/assets/in1-logo.png";

import templatePortfolio from "@/assets/templates/template-portfolio.jpg";
import templateSales from "@/assets/templates/template-sales.jpg";
import templateInfluencer from "@/assets/templates/template-influencer.jpg";
import templateProfessional from "@/assets/templates/template-professional.jpg";
import templateLocal from "@/assets/templates/template-local.jpg";
import templateArtist from "@/assets/templates/template-artist.jpg";

const NICHES = [
  { id: "all", label: "Todos", emoji: "✨" },
  { id: "creator", label: "Creator", emoji: "🎬" },
  { id: "fotografo", label: "Fotógrafo", emoji: "📸" },
  { id: "videomaker", label: "Videomaker", emoji: "🎥" },
  { id: "freelancer", label: "Freelancer", emoji: "💻" },
  { id: "social", label: "Social Media", emoji: "📱" },
  { id: "local", label: "Negócio local", emoji: "🏪" },
  { id: "artista", label: "Artista", emoji: "🎨" },
  { id: "agencia", label: "Agência", emoji: "🏢" },
];

interface Template {
  id: string;
  name: string;
  description: string;
  objective: string;
  image: string;
  niches: string[];
  popular?: boolean;
}

const TEMPLATES: Template[] = [
  {
    id: "portfolio",
    name: "Portfólio Visual",
    description: "Mostre seu trabalho com impacto. Grid de imagens, vídeos e links organizados.",
    objective: "Exibir trabalhos e atrair clientes",
    image: templatePortfolio,
    niches: ["creator", "fotografo", "videomaker", "artista"],
    popular: true,
  },
  {
    id: "sales",
    name: "Página de Vendas",
    description: "Converta seguidores em clientes com CTA poderosos e vitrine de produtos.",
    objective: "Vender produtos e serviços",
    image: templateSales,
    niches: ["freelancer", "social", "agencia"],
  },
  {
    id: "influencer",
    name: "Influencer Bio",
    description: "Bio completa com stats, parcerias de marcas e links para todas as redes.",
    objective: "Centralizar presença digital",
    image: templateInfluencer,
    niches: ["creator", "social"],
    popular: true,
  },
  {
    id: "professional",
    name: "Profissional",
    description: "Cartão de visita digital com serviços, contato e credibilidade.",
    objective: "Gerar autoridade e leads",
    image: templateProfessional,
    niches: ["freelancer", "agencia", "social"],
  },
  {
    id: "local",
    name: "Negócio Local",
    description: "Horários, localização, cardápio e avaliações. Tudo em um link.",
    objective: "Facilitar acesso do cliente local",
    image: templateLocal,
    niches: ["local"],
  },
  {
    id: "artist",
    name: "Artista",
    description: "Galeria visual imersiva para exibir portfólio artístico e exposições.",
    objective: "Criar presença artística impactante",
    image: templateArtist,
    niches: ["artista", "fotografo", "videomaker"],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Templates() {
  const [activeNiche, setActiveNiche] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filtered =
    activeNiche === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.niches.includes(activeNiche));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={in1Logo} alt="in1.bio" className="h-7" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Entrar
            </Link>
            <Link
              to="/login"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
            >
              Criar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16 text-center">
        {/* Glow orbs */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/[0.06] blur-[120px]" />
        <motion.div
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-3xl px-6"
        >
          <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Templates prontos para usar
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Escolha um modelo.{" "}
            <span className="text-primary">Comece pronto.</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
            Templates criados para converter — não só para parecer bonito.
          </motion.p>
        </motion.div>
      </section>

      {/* Filters */}
      <section className="sticky top-[65px] z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {NICHES.map((niche) => (
              <button
                key={niche.id}
                onClick={() => setActiveNiche(niche.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  activeNiche === niche.id
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                <span>{niche.emoji}</span>
                {niche.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <motion.div
          layout
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((template, i) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.4, delay: i * 0.06 } }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-[0_0_40px_hsl(var(--primary)/0.1)]"
              >
                {template.popular && (
                  <div className="absolute top-3 right-3 z-10 rounded-full bg-primary px-3 py-1 text-[0.65rem] font-bold text-primary-foreground">
                    Popular
                  </div>
                )}
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={template.image}
                    alt={template.name}
                    loading="lazy"
                    width={640}
                    height={960}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95"
                    >
                      <Eye className="h-4 w-4" />
                      Ver preview
                    </button>
                  </div>
                </div>
                {/* Info */}
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold text-foreground">{template.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{template.description}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Sparkles className="h-3 w-3" />
                    {template.objective}
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
                  >
                    Usar este modelo
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium">Nenhum template encontrado para esse nicho.</p>
            <p className="mt-1 text-sm">Tente outro filtro ou explore todos os modelos.</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card/40 py-20 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Pronto para criar sua página?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Escolha um modelo, personalize em minutos e publique. Sem código, sem complicação.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97] shadow-[0_0_30px_hsl(var(--primary)/0.25)]"
          >
            Começar agora — é grátis
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
            onClick={() => setSelectedTemplate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setSelectedTemplate(null)}
                className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-2 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Image side */}
              <div className="hidden w-1/2 overflow-hidden md:block">
                <img
                  src={selectedTemplate.image}
                  alt={selectedTemplate.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info side */}
              <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-10">
                <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-3 w-3" />
                  Template
                </div>
                <h2 className="font-display text-3xl font-extrabold text-foreground">
                  {selectedTemplate.name}
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {selectedTemplate.description}
                </p>
                <div className="mt-5 rounded-xl border border-border bg-background/50 p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Objetivo</p>
                  <p className="text-sm font-medium text-foreground">{selectedTemplate.objective}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedTemplate.niches.map((n) => {
                    const niche = NICHES.find((x) => x.id === n);
                    return niche ? (
                      <span key={n} className="rounded-lg border border-border bg-background/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {niche.emoji} {niche.label}
                      </span>
                    ) : null;
                  })}
                </div>
                <Link
                  to="/login"
                  className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97] shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                >
                  Usar este modelo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Grátis para começar · Personalize tudo
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
