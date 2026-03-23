import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, Sparkles, X, Save, Crown } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import templatePortfolio from "@/assets/templates/template-portfolio.jpg";
import templateSales from "@/assets/templates/template-sales.jpg";
import templateInfluencer from "@/assets/templates/template-influencer.jpg";
import templateProfessional from "@/assets/templates/template-professional.jpg";
import templateLocal from "@/assets/templates/template-local.jpg";
import templateArtist from "@/assets/templates/template-artist.jpg";
import templatePodcast from "@/assets/templates/template-podcast.jpg";
import templateCoach from "@/assets/templates/template-coach.jpg";
import templateEcommerce from "@/assets/templates/template-ecommerce.jpg";

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
  { id: "podcast", label: "Podcast", emoji: "🎙️" },
  { id: "coach", label: "Coach", emoji: "🧠" },
  { id: "ecommerce", label: "E-commerce", emoji: "🛒" },
];

export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  objective: string;
  image: string;
  niches: string[];
  popular?: boolean;
}

export const TEMPLATES: TemplateItem[] = [
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
    niches: ["freelancer", "social", "agencia", "ecommerce"],
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
    niches: ["freelancer", "agencia", "social", "coach"],
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
  {
    id: "podcast",
    name: "Podcast",
    description: "Centralize seus episódios, plataformas de áudio e links para ouvintes.",
    objective: "Crescer audiência e facilitar acesso",
    image: templatePodcast,
    niches: ["podcast", "creator"],
    popular: true,
  },
  {
    id: "coach",
    name: "Coach & Mentor",
    description: "Apresente seus serviços, depoimentos e agenda de sessões em um só lugar.",
    objective: "Atrair alunos e gerar autoridade",
    image: templateCoach,
    niches: ["coach", "freelancer"],
  },
  {
    id: "ecommerce",
    name: "Loja Online",
    description: "Vitrine de produtos com links diretos para compra e promoções em destaque.",
    objective: "Vender produtos e aumentar conversão",
    image: templateEcommerce,
    niches: ["ecommerce", "local"],
  },
];

const SAVED_TEMPLATES_KEY = "in1_saved_templates";

export default function AppTemplates() {
  const [activeNiche, setActiveNiche] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const { agency } = useTenant();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [creators, setCreators] = useState<{ id: string; name: string }[]>([]);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<string[]>([]);

  const maxSaved = isPro ? 5 : 1;

  useEffect(() => {
    if (!agency) return;
    supabase.from("creators").select("id, name").eq("agency_id", agency.id).then(({ data }) => {
      setCreators(data || []);
    });
    const stored = localStorage.getItem(`${SAVED_TEMPLATES_KEY}_${agency.id}`);
    if (stored) setSavedTemplates(JSON.parse(stored));
  }, [agency]);

  const handleApplyTemplate = async (templateId: string, creatorId: string) => {
    setApplyingTo(creatorId);
    try {
      // Template configs mapping
      const templateConfigs: Record<string, any> = {
        portfolio: { bio: "Confira meu portfólio completo ✨", category: "Fotógrafo", font_family: "default" },
        sales: { bio: "Produtos e serviços exclusivos 🛍️", category: "E-commerce", font_family: "default" },
        influencer: { bio: "Criador de conteúdo digital 🎬", category: "Influencer", font_family: "default" },
        professional: { bio: "Profissional qualificado 💼", category: "Profissional", font_family: "default" },
        local: { bio: "Venha nos visitar! 📍", category: "Negócio Local", font_family: "default" },
        artist: { bio: "Arte é minha linguagem 🎨", category: "Artista", font_family: "default" },
        podcast: { bio: "Ouça nossos episódios 🎙️", category: "Podcaster", font_family: "default" },
        coach: { bio: "Transformando vidas através do conhecimento 🧠", category: "Coach", font_family: "default" },
        ecommerce: { bio: "Loja online com os melhores produtos 🛒", category: "E-commerce", font_family: "default" },
      };

      const config = templateConfigs[templateId] || {};
      await supabase.from("creators").update({
        bio: config.bio || "",
        category: config.category || "",
      }).eq("id", creatorId);

      toast.success("Template aplicado! Edite seu creator para personalizar.");
      navigate(`/app/creators/${creatorId}/edit`);
    } catch {
      toast.error("Erro ao aplicar template");
    } finally {
      setApplyingTo(null);
    }
  };

  const handleSaveTemplate = (templateId: string) => {
    if (!agency) return;
    if (savedTemplates.includes(templateId)) {
      const updated = savedTemplates.filter(t => t !== templateId);
      setSavedTemplates(updated);
      localStorage.setItem(`${SAVED_TEMPLATES_KEY}_${agency.id}`, JSON.stringify(updated));
      toast.success("Template removido dos salvos");
      return;
    }
    if (savedTemplates.length >= maxSaved) {
      toast.error(`Você pode salvar no máximo ${maxSaved} template${maxSaved > 1 ? "s" : ""}. ${!isPro ? "Faça upgrade para Pro para salvar até 5!" : ""}`);
      return;
    }
    const updated = [...savedTemplates, templateId];
    setSavedTemplates(updated);
    localStorage.setItem(`${SAVED_TEMPLATES_KEY}_${agency.id}`, JSON.stringify(updated));
    toast.success("Template salvo!");
  };

  const filtered = activeNiche === "all" ? TEMPLATES : TEMPLATES.filter(t => t.niches.includes(activeNiche));

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-normal text-foreground">Templates</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Escolha um modelo e aplique a qualquer creator. Salve seus favoritos para usar depois.
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Save className="w-3.5 h-3.5" />
          {savedTemplates.length}/{maxSaved} salvos
          {!isPro && (
            <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[0.6rem] font-bold">
              <Crown className="w-2.5 h-2.5" /> Pro: até 5
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {NICHES.map((niche) => (
          <button
            key={niche.id}
            onClick={() => setActiveNiche(niche.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              activeNiche === niche.id
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
            }`}
          >
            <span>{niche.emoji}</span>
            {niche.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((template, i) => {
            const isSaved = savedTemplates.includes(template.id);
            return (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.35, delay: i * 0.05 } }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40"
              >
                {template.popular && (
                  <div className="absolute top-3 right-3 z-10 rounded-full bg-primary px-3 py-1 text-[0.65rem] font-bold text-primary-foreground">
                    Popular
                  </div>
                )}
                {isSaved && (
                  <div className="absolute top-3 left-3 z-10 rounded-full bg-accent/20 border border-accent/30 px-2.5 py-1 text-[0.6rem] font-bold text-foreground">
                    ⭐ Salvo
                  </div>
                )}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={template.image} alt={template.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
                    >
                      <Eye className="h-4 w-4" /> Ver preview
                    </button>
                    <button
                      onClick={() => handleSaveTemplate(template.id)}
                      className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground"
                    >
                      <Save className="h-3.5 w-3.5" /> {isSaved ? "Remover" : "Salvar"}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base font-bold text-foreground">{template.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">{template.description}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[0.68rem] font-medium text-primary">
                    <Sparkles className="h-3 w-3" /> {template.objective}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Preview / Apply Modal */}
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
              className="relative flex max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedTemplate(null)}
                className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-2 text-muted-foreground backdrop-blur-sm hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="hidden w-1/2 overflow-hidden md:block">
                <img src={selectedTemplate.image} alt={selectedTemplate.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-10 overflow-y-auto">
                <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-3 w-3" /> Template
                </div>
                <h2 className="font-display text-2xl font-extrabold text-foreground">{selectedTemplate.name}</h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{selectedTemplate.description}</p>

                <div className="mt-5 rounded-xl border border-border bg-background/50 p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Objetivo</p>
                  <p className="text-sm font-medium text-foreground">{selectedTemplate.objective}</p>
                </div>

                {creators.length > 0 ? (
                  <div className="mt-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Aplicar a um Creator</p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {creators.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleApplyTemplate(selectedTemplate.id, c.id)}
                          disabled={applyingTo === c.id}
                          className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-border bg-background hover:border-primary/30 transition-all text-sm"
                        >
                          <span className="font-medium text-foreground">{c.name || "Sem nome"}</span>
                          <span className="flex items-center gap-1 text-xs text-primary font-semibold">
                            {applyingTo === c.id ? "Aplicando..." : <>Aplicar <ArrowRight className="h-3 w-3" /></>}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-muted-foreground text-center">
                    Crie um creator primeiro para aplicar este template.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
