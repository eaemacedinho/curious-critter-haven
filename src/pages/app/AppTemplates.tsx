import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, Sparkles, X, Save, Crown, Undo2 } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TEMPLATE_DATA, type FullTemplateData } from "@/lib/templateData";
import TemplatePreviewCard from "@/components/kreatorz/creator/TemplatePreviewCard";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  { id: "fitness", label: "Fitness", emoji: "💪" },
  { id: "musica", label: "Música", emoji: "🎵" },
  { id: "gamer", label: "Gamer", emoji: "🎮" },
  { id: "saude", label: "Saúde", emoji: "🩺" },
  { id: "tech", label: "Tecnologia", emoji: "💻" },
  { id: "moda", label: "Moda", emoji: "👗" },
  { id: "educacao", label: "Educação", emoji: "📚" },
];

const SAVED_TEMPLATES_KEY = "in1_saved_templates";
const BACKUP_KEY = "in1_template_backup";

interface CreatorBackup {
  creatorId: string;
  creatorName: string;
  templateName: string;
  timestamp: number;
  profile: Record<string, any>;
  links: Record<string, any>[];
  socialLinks: Record<string, any>[];
  products: Record<string, any>[];
  testimonials: Record<string, any>[];
}

export default function AppTemplates() {
  const [activeNiche, setActiveNiche] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<FullTemplateData | null>(null);
  const { agency } = useTenant();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [creators, setCreators] = useState<{ id: string; name: string }[]>([]);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<string[]>([]);
  const [backups, setBackups] = useState<CreatorBackup[]>([]);
  const [undoConfirm, setUndoConfirm] = useState<CreatorBackup | null>(null);
  const [undoing, setUndoing] = useState(false);

  const maxSaved = isPro ? 5 : 1;

  useEffect(() => {
    if (!agency) return;
    supabase.from("creators").select("id, name").eq("agency_id", agency.id).then(({ data }) => {
      setCreators(data || []);
    });
    const stored = localStorage.getItem(`${SAVED_TEMPLATES_KEY}_${agency.id}`);
    if (stored) setSavedTemplates(JSON.parse(stored));
    const backupStored = localStorage.getItem(`${BACKUP_KEY}_${agency.id}`);
    if (backupStored) setBackups(JSON.parse(backupStored));
  }, [agency]);

  const saveBackup = (backup: CreatorBackup) => {
    if (!agency) return;
    // Keep max 5 backups, replace if same creator
    const updated = backups.filter(b => b.creatorId !== backup.creatorId);
    updated.unshift(backup);
    const trimmed = updated.slice(0, 5);
    setBackups(trimmed);
    localStorage.setItem(`${BACKUP_KEY}_${agency.id}`, JSON.stringify(trimmed));
  };

  const handleApplyTemplate = async (template: FullTemplateData, creatorId: string) => {
    setApplyingTo(creatorId);
    try {
      // --- BACKUP current data before applying ---
      const [profileRes, linksRes, socialRes, productsRes, testimonialsRes] = await Promise.all([
        supabase.from("creators").select("*").eq("id", creatorId).single(),
        supabase.from("creator_links").select("*").eq("creator_id", creatorId).order("sort_order"),
        supabase.from("creator_social_links").select("*").eq("creator_id", creatorId).order("sort_order"),
        supabase.from("creator_products").select("*").eq("creator_id", creatorId).order("sort_order"),
        supabase.from("creator_testimonials").select("*").eq("creator_id", creatorId).order("sort_order"),
      ]);

      const creatorName = creators.find(c => c.id === creatorId)?.name || "Creator";

      saveBackup({
        creatorId,
        creatorName,
        templateName: template.name,
        timestamp: Date.now(),
        profile: profileRes.data || {},
        links: linksRes.data || [],
        socialLinks: socialRes.data || [],
        products: productsRes.data || [],
        testimonials: testimonialsRes.data || [],
      });

      // --- Apply template ---
      const { profile, links, socialLinks, products, testimonials } = template;

      const updateData: Record<string, any> = {
        bio: profile.bio,
        category: profile.category,
        font_family: profile.font_family,
        font_size: profile.font_size,
        image_shape: profile.image_shape,
        image_shape_links: profile.image_shape_links,
        image_shape_products: profile.image_shape_products,
        image_shape_campaigns: profile.image_shape || "rounded",
        tags: profile.tags as any,
        stats: profile.stats as any,
        brands: profile.brands as any,
        brands_display_mode: profile.brands_display_mode,
        section_order: profile.section_order as any,
      };
      if (profile.avatar_url) updateData.avatar_url = profile.avatar_url;
      if (profile.cover_url) updateData.cover_url = profile.cover_url;

      const { error: profileError } = await supabase.from("creators").update(updateData).eq("id", creatorId);
      if (profileError) {
        console.error("Error updating creator profile:", profileError);
        throw profileError;
      }

      const { error: delLinksErr } = await supabase.from("creator_links").delete().eq("creator_id", creatorId);
      if (delLinksErr) console.error("Error deleting links:", delLinksErr);
      if (links.length > 0) {
        const { error: insLinksErr } = await supabase.from("creator_links").insert(
          links.map((l, i) => ({
            creator_id: creatorId,
            title: l.title, url: l.url, subtitle: l.subtitle, icon: l.icon,
            is_featured: l.is_featured, is_active: l.is_active, sort_order: i,
            display_mode: l.display_mode,
          }))
        );
        if (insLinksErr) console.error("Error inserting links:", insLinksErr);
      }

      const { error: delSocialErr } = await supabase.from("creator_social_links").delete().eq("creator_id", creatorId);
      if (delSocialErr) console.error("Error deleting social links:", delSocialErr);
      if (socialLinks.length > 0) {
        const { error: insSocialErr } = await supabase.from("creator_social_links").insert(
          socialLinks.map((s, i) => ({
            creator_id: creatorId, platform: s.platform, label: s.label, url: s.url, sort_order: i,
          }))
        );
        if (insSocialErr) console.error("Error inserting social links:", insSocialErr);
      }

      const { error: delProdErr } = await supabase.from("creator_products").delete().eq("creator_id", creatorId);
      if (delProdErr) console.error("Error deleting products:", delProdErr);
      if (products.length > 0) {
        const { error: insProdErr } = await supabase.from("creator_products").insert(
          products.map((p, i) => ({
            creator_id: creatorId, title: p.title, price: p.price, icon: p.icon,
            url: p.url, is_active: p.is_active, sort_order: i,
            image_url: p.image_url || null,
          }))
        );
        if (insProdErr) console.error("Error inserting products:", insProdErr);
      }

      const { error: delTestErr } = await supabase.from("creator_testimonials").delete().eq("creator_id", creatorId);
      if (delTestErr) console.error("Error deleting testimonials:", delTestErr);
      if (testimonials.length > 0) {
        const { error: insTestErr } = await supabase.from("creator_testimonials").insert(
          testimonials.map((t, i) => ({
            creator_id: creatorId, author_name: t.author_name, author_role: t.author_role,
            content: t.content, rating: t.rating, is_active: t.is_active, sort_order: i,
          }))
        );
        if (insTestErr) console.error("Error inserting testimonials:", insTestErr);
      }

      toast.success("Template aplicado! Você pode desfazer a qualquer momento.", { duration: 5000 });
      navigate(`/app/creators/${creatorId}/edit`);
    } catch (err) {
      console.error("Error applying template:", err);
      toast.error("Erro ao aplicar template");
    } finally {
      setApplyingTo(null);
    }
  };

  const handleUndoTemplate = async (backup: CreatorBackup) => {
    setUndoing(true);
    try {
      const { creatorId, profile, links, socialLinks, products, testimonials } = backup;

      // Restore profile (only the fields we changed)
      const { id, created_at, updated_at, slug, name, agency_id, user_id, avatar_url, cover_url, avatar_url_layout2, cover_url_layout2, layout_type, is_published, ...restoreFields } = profile;
      await supabase.from("creators").update(restoreFields).eq("id", creatorId);

      // Restore links
      await supabase.from("creator_links").delete().eq("creator_id", creatorId);
      if (links.length > 0) {
        await supabase.from("creator_links").insert(
          links.map(({ id: _id, created_at: _ca, ...rest }: any) => ({ ...rest, creator_id: creatorId }))
        );
      }

      // Restore social links
      await supabase.from("creator_social_links").delete().eq("creator_id", creatorId);
      if (socialLinks.length > 0) {
        await supabase.from("creator_social_links").insert(
          socialLinks.map(({ id: _id, ...rest }: any) => ({ ...rest, creator_id: creatorId }))
        );
      }

      // Restore products
      await supabase.from("creator_products").delete().eq("creator_id", creatorId);
      if (products.length > 0) {
        await supabase.from("creator_products").insert(
          products.map(({ id: _id, ...rest }: any) => ({ ...rest, creator_id: creatorId }))
        );
      }

      // Restore testimonials
      await supabase.from("creator_testimonials").delete().eq("creator_id", creatorId);
      if (testimonials.length > 0) {
        await supabase.from("creator_testimonials").insert(
          testimonials.map(({ id: _id, created_at: _ca, ...rest }: any) => ({ ...rest, creator_id: creatorId }))
        );
      }

      // Remove this backup
      const updated = backups.filter(b => b.creatorId !== creatorId);
      setBackups(updated);
      if (agency) localStorage.setItem(`${BACKUP_KEY}_${agency.id}`, JSON.stringify(updated));

      toast.success("Template desfeito! Dados anteriores restaurados.");
      setUndoConfirm(null);
    } catch (err) {
      console.error("Error undoing template:", err);
      toast.error("Erro ao desfazer template");
    } finally {
      setUndoing(false);
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

  const filtered = useMemo(
    () => activeNiche === "all" ? TEMPLATE_DATA : TEMPLATE_DATA.filter(t => t.niches.includes(activeNiche)),
    [activeNiche]
  );

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-normal text-foreground">Templates</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Escolha um modelo e aplique a qualquer creator. O resultado será idêntico ao preview.
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Save className="w-3.5 h-3.5" />
          {savedTemplates.length}/{maxSaved} salvos
          {!isPro && (
            <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-primary/10 text-primary-readable rounded-md text-[0.6rem] font-bold">
              <Crown className="w-2.5 h-2.5" /> Pro: até 5
            </span>
          )}
        </div>
      </div>

      {/* Undo backups banner */}
      {backups.length > 0 && (
        <div className="mb-6 space-y-2">
          {backups.map((backup) => (
            <div
              key={backup.creatorId}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-accent/30 bg-accent/5"
            >
              <div className="flex items-center gap-2 text-sm">
                <Undo2 className="w-4 h-4 text-accent-foreground" />
                <span className="text-foreground font-medium">{backup.creatorName}</span>
                <span className="text-muted-foreground">
                  — template "{backup.templateName}" aplicado em{" "}
                  {new Date(backup.timestamp).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <button
                onClick={() => setUndoConfirm(backup)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-all"
              >
                <Undo2 className="w-3 h-3" /> Desfazer
              </button>
            </div>
          ))}
        </div>
      )}

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
                  <TemplatePreviewCard template={template} />
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
                  <div className="mt-2 flex items-center gap-1.5 text-[0.68rem] font-medium text-primary-readable">
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
              <div className="hidden w-1/2 overflow-y-auto md:block bg-background">
                <TemplatePreviewCard template={selectedTemplate} fullHeight />
              </div>
              <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-10 overflow-y-auto">
                <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-readable">
                  <Sparkles className="h-3 w-3" /> Template
                </div>
                <h2 className="font-display text-2xl font-extrabold text-foreground">{selectedTemplate.name}</h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{selectedTemplate.description}</p>

                <div className="mt-5 rounded-xl border border-border bg-background/50 p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Objetivo</p>
                  <p className="text-sm font-medium text-foreground">{selectedTemplate.objective}</p>
                </div>

                <div className="mt-4 rounded-xl border border-border bg-background/50 p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Incluso neste template</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-lg bg-primary/10 text-foreground font-medium">{selectedTemplate.links.length} links</span>
                    <span className="px-2 py-1 rounded-lg bg-primary/10 text-foreground font-medium">{selectedTemplate.socialLinks.length} redes sociais</span>
                    <span className="px-2 py-1 rounded-lg bg-primary/10 text-foreground font-medium">{selectedTemplate.products.length} produtos</span>
                    {selectedTemplate.testimonials.length > 0 && (
                      <span className="px-2 py-1 rounded-lg bg-primary/10 text-foreground font-medium">{selectedTemplate.testimonials.length} depoimentos</span>
                    )}
                  </div>
                </div>

                {creators.length > 0 ? (
                  <div className="mt-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Aplicar a um Creator</p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {creators.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleApplyTemplate(selectedTemplate, c.id)}
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

      {/* Undo confirmation dialog */}
      <ConfirmDialog
        open={!!undoConfirm}
        onOpenChange={(open) => !open && setUndoConfirm(null)}
        title="Desfazer template?"
        description={`Isso vai restaurar todos os dados anteriores de "${undoConfirm?.creatorName}" (antes do template "${undoConfirm?.templateName}" ser aplicado). Esta ação não pode ser desfeita.`}
        confirmLabel="Desfazer e restaurar"
        variant="destructive"
        onConfirm={() => undoConfirm && handleUndoTemplate(undoConfirm)}
        loading={undoing}
      />
    </div>
  );
}
