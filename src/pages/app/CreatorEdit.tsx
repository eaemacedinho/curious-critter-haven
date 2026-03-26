import { useRef, useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, Save, ChevronDown, Trash2, Pencil, RotateCcw, Star, Info, Palette } from "lucide-react";
import { useTenant } from "@/hooks/useTenant";
import { useCreatorData } from "@/hooks/useCreatorData";
import { useSubscription } from "@/hooks/useSubscription";
import { useCreatorTemplates, type TemplateData } from "@/hooks/useCreatorTemplates";
import CreatorEditPanel, { type CreatorEditPanelHandle } from "@/components/kreatorz/creator/CreatorEditPanel";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TEMPLATE_DATA, type FullTemplateData } from "@/lib/templateData";

export default function CreatorEdit() {
  const navigate = useNavigate();
  const { agency } = useTenant();
  const { creatorId } = useParams<{ creatorId: string }>();
  const {
    profile, links, socialLinks, products, campaigns, heroReels, testimonials, loading,
    saveProfile, saveLinks, saveSocialLinks, saveProducts, saveCampaigns, saveHeroReels, saveTestimonials,
    uploadImage, uploadContentImage, refetch,
  } = useCreatorData(agency?.id, creatorId);
  const { canUse, currentPlan } = useSubscription();
  const { templates, defaultTemplate, saveTemplate, saveDefaultTemplate, updateTemplate, deleteTemplate, renameTemplate, fetchTemplates } = useCreatorTemplates(agency?.id, creatorId);
  const editorRef = useRef<CreatorEditPanelHandle>(null);
  const templateButtonRef = useRef<HTMLButtonElement>(null);
  const [saving, setSaving] = useState(false);

  // Template state
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState<{ templateId: string | null; isDefault?: boolean } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [templateNameInput, setTemplateNameInput] = useState("");
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [usingDefault, setUsingDefault] = useState(false);
  const [activeGalleryTemplateId, setActiveGalleryTemplateId] = useState<string | null>(null);
  const [activeGalleryTemplateName, setActiveGalleryTemplateName] = useState<string | null>(null);
  const [templateDropdownStyle, setTemplateDropdownStyle] = useState<{ top: number; left: number; width: number } | null>(null);

  // Track original template data for "em edição" detection and reset
  const [originalTemplateSnapshot, setOriginalTemplateSnapshot] = useState<TemplateData | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState("");
  const [resetting, setResetting] = useState(false);

  const maxTemplates = currentPlan === "free" ? 1 : currentPlan === "pro" ? 5 : 10;

  // Gallery saved templates (from AppTemplates page localStorage)
  const SAVED_TEMPLATES_KEY = "in1_saved_templates";
  const [savedGalleryIds, setSavedGalleryIds] = useState<string[]>([]);

  // Read saved gallery templates — re-read on mount and when coming back from other pages
  useEffect(() => {
    if (!agency) return;
    const readSaved = () => {
      const stored = localStorage.getItem(`${SAVED_TEMPLATES_KEY}_${agency.id}`);
      setSavedGalleryIds(stored ? JSON.parse(stored) : []);
    };
    readSaved();
    // Re-read when window gains focus (user navigates back from templates page)
    window.addEventListener("focus", readSaved);
    // Also re-read when navigating within SPA via visibilitychange
    document.addEventListener("visibilitychange", readSaved);
    return () => {
      window.removeEventListener("focus", readSaved);
      document.removeEventListener("visibilitychange", readSaved);
    };
  }, [agency, creatorId]);

  useEffect(() => {
    if (!showTemplateDropdown) return;

    void fetchTemplates();

    const updateDropdownPosition = () => {
      const rect = templateButtonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const maxWidth = Math.min(300, window.innerWidth - 24);
      const left = Math.min(
        Math.max(12, rect.left),
        Math.max(12, window.innerWidth - maxWidth - 12),
      );

      setTemplateDropdownStyle({
        top: rect.bottom + 8,
        left,
        width: maxWidth,
      });
    };

    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [showTemplateDropdown, fetchTemplates]);

  const savedGalleryTemplates = useMemo(() =>
    savedGalleryIds.map(id => TEMPLATE_DATA.find(t => t.id === id)).filter(Boolean) as FullTemplateData[],
  [savedGalleryIds]);

  const galleryTemplateOverrides = useMemo(
    () => new Map(
      templates
        .filter((template) => template.template_data?.sourceGalleryTemplateId)
        .map((template) => [template.template_data.sourceGalleryTemplateId as string, template]),
    ),
    [templates],
  );

  const ownTemplates = useMemo(
    () => templates.filter((template) => !template.template_data?.sourceGalleryTemplateId),
    [templates],
  );

  const cloneTemplateData = (data: TemplateData): TemplateData => JSON.parse(JSON.stringify(data)) as TemplateData;

  // Detect if template has been edited
  const isTemplateEdited = useMemo(() => {
    if (!originalTemplateSnapshot || (!activeTemplateId && !usingDefault && !activeGalleryTemplateId)) return false;
    const current = getCurrentData();
    const snap = originalTemplateSnapshot;
    return JSON.stringify(current) !== JSON.stringify(snap);
  }, [profile, links, socialLinks, products, campaigns, heroReels, testimonials, originalTemplateSnapshot, activeTemplateId, activeGalleryTemplateId, usingDefault]);

  const [applyingGallery, setApplyingGallery] = useState(false);

  const handleApplyGalleryTemplate = async (template: FullTemplateData) => {
    if (!creatorId) return;
    setApplyingGallery(true);
    try {
      const override = galleryTemplateOverrides.get(template.id);
      const data = override?.template_data;

      if (data?.profile) {
        await saveProfile(data.profile as any);
      } else {
        const { profile: tp } = template;
        await saveProfile({
          bio: tp.bio,
          font_family: tp.font_family,
          font_size: tp.font_size,
          image_shape: tp.image_shape,
          image_shape_links: tp.image_shape_links,
          image_shape_products: tp.image_shape_products,
          image_shape_campaigns: tp.image_shape || "rounded",
          tags: tp.tags as any,
          stats: tp.stats as any,
          brands: tp.brands as any,
          brands_display_mode: tp.brands_display_mode,
          section_order: tp.section_order as any,
          ...(tp.avatar_url ? { avatar_url: tp.avatar_url } : {}),
          ...(tp.cover_url ? { cover_url: tp.cover_url } : {}),
        } as any);
      }

      if (data?.links) {
        await saveLinks(data.links);
      } else {
        await saveLinks(template.links.map((l, i) => ({
          creator_id: creatorId, title: l.title, url: l.url, subtitle: l.subtitle, icon: l.icon,
          is_featured: l.is_featured, is_active: l.is_active, sort_order: i, display_mode: l.display_mode,
        })) as any);
      }

      if (data?.socialLinks) {
        await saveSocialLinks(data.socialLinks);
      } else {
        await saveSocialLinks(template.socialLinks.map((s, i) => ({
          creator_id: creatorId, platform: s.platform, label: s.label, url: s.url, sort_order: i,
        })) as any);
      }

      if (data?.products) {
        await saveProducts(data.products);
      } else {
        await saveProducts(template.products.map((p, i) => ({
          creator_id: creatorId, title: p.title, price: p.price, icon: p.icon,
          url: p.url, is_active: p.is_active, sort_order: i, image_url: p.image_url || null,
        })) as any);
      }

      if (data?.testimonials) {
        await saveTestimonials(data.testimonials);
      } else {
        await saveTestimonials(template.testimonials.map((t, i) => ({
          creator_id: creatorId, author_name: t.author_name, author_role: t.author_role,
          content: t.content, rating: t.rating, is_active: t.is_active, sort_order: i,
        })) as any);
      }

      await refetch();
      const snapshotData = data ? cloneTemplateData(data) : getCurrentData();
      setOriginalTemplateSnapshot(snapshotData);
      setActiveTemplateId(override?.id ?? null);
      setActiveGalleryTemplateId(template.id);
      setUsingDefault(false);
      setActiveGalleryTemplateName(template.name);
      toast.success(`Template "${template.name}" aplicado!`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao aplicar template");
    } finally {
      setApplyingGallery(false);
    }
  };

  function getCurrentData(): TemplateData {
    return {
      profile: profile ? {
        name: profile.name, slug: profile.slug, bio: profile.bio,
        avatar_url: profile.avatar_url, cover_url: profile.cover_url,
        avatar_url_layout2: profile.avatar_url_layout2, cover_url_layout2: profile.cover_url_layout2,
        verified: profile.verified, layout_type: profile.layout_type,
        image_shape: profile.image_shape, image_shape_products: profile.image_shape_products,
        image_shape_campaigns: profile.image_shape_campaigns, image_shape_links: profile.image_shape_links,
        tags: profile.tags, stats: profile.stats, brands: profile.brands,
        brands_display_mode: profile.brands_display_mode, page_effects: profile.page_effects,
        font_family: profile.font_family, font_size: profile.font_size,
        color_name: profile.color_name, color_bio: profile.color_bio,
        color_section_titles: profile.color_section_titles, section_order: profile.section_order,
        spotify_url: profile.spotify_url,
      } : {},
      links: links || [],
      socialLinks: socialLinks || [],
      products: products || [],
      campaigns: campaigns || [],
      heroReels: heroReels || [],
      testimonials: testimonials || [],
    };
  }

  const handleSave = async () => {
    if (!editorRef.current) return;
    setSaving(true);
    try {
      const saved = await editorRef.current.saveAll();
      if (!saved) return;

      await refetch();
      const currentData = getCurrentData();

      if (usingDefault) {
        const ok = await saveDefaultTemplate(currentData);
        if (!ok) throw new Error("default_template_update_failed");
      } else if (activeGalleryTemplateId && activeGalleryTemplateName) {
        const galleryPayload: TemplateData = {
          ...currentData,
          sourceGalleryTemplateId: activeGalleryTemplateId,
        };
        const existingOverride = galleryTemplateOverrides.get(activeGalleryTemplateId);

        if (existingOverride) {
          const ok = await updateTemplate(existingOverride.id, galleryPayload);
          if (!ok) throw new Error("gallery_template_update_failed");
          setActiveTemplateId(existingOverride.id);
        } else {
          const created = await saveTemplate(activeGalleryTemplateName, galleryPayload);
          if (!created) throw new Error("gallery_template_create_failed");
          setActiveTemplateId(created.id);
        }

        await fetchTemplates();
      } else if (activeTemplateId) {
        const ok = await updateTemplate(activeTemplateId, currentData);
        if (!ok) throw new Error("template_update_failed");
        await fetchTemplates();
      }

      setOriginalTemplateSnapshot(cloneTemplateData(currentData));
      toast.success("Alterações salvas com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateNameInput.trim()) {
      toast.error("Digite um nome para o template");
      return;
    }
    if (totalSavedTemplateCount >= maxTemplates) {
      toast.error(`Limite de ${maxTemplates} template(s) atingido. ${currentPlan === "free" ? "Faça upgrade para o Pro!" : ""}`);
      return;
    }
    const result = await saveTemplate(templateNameInput.trim(), getCurrentData());
    if (result) {
      setActiveTemplateId(result.id);
      setActiveGalleryTemplateId(null);
      setActiveGalleryTemplateName(null);
      setUsingDefault(false);
      setOriginalTemplateSnapshot(cloneTemplateData(result.template_data));
      toast.success(`Template "${templateNameInput.trim()}" salvo!`);
    } else {
      toast.error("Erro ao salvar template");
    }
    setShowNewTemplateDialog(false);
    setTemplateNameInput("");
  };

  const handleSaveAsDefault = async () => {
    const ok = await saveDefaultTemplate(getCurrentData());
    if (ok) {
      setUsingDefault(true);
      setActiveTemplateId(null);
      setActiveGalleryTemplateId(null);
      setActiveGalleryTemplateName(null);
      setOriginalTemplateSnapshot(cloneTemplateData(getCurrentData()));
      toast.success("Meu Padrão salvo! Este será o template base para criação em lote.");
    } else {
      toast.error("Erro ao salvar Meu Padrão");
    }
  };

  const handleSwitchTemplate = (templateId: string | null, isDefault?: boolean) => {
    if (isDefault && usingDefault) return;
    if (!isDefault && templateId === activeTemplateId) return;
    setShowSwitchConfirm({ templateId, isDefault });
  };

  const confirmSwitch = async () => {
    if (!showSwitchConfirm) return;
    const { templateId, isDefault } = showSwitchConfirm;

    if (isDefault && defaultTemplate) {
      const data = defaultTemplate.template_data;
      if (data.profile) await saveProfile(data.profile as any);
      if (data.links) await saveLinks(data.links);
      if (data.socialLinks) await saveSocialLinks(data.socialLinks);
      if (data.products) await saveProducts(data.products);
      if (data.campaigns) await saveCampaigns(data.campaigns);
      if (data.heroReels) await saveHeroReels(data.heroReels);
      if (data.testimonials) await saveTestimonials(data.testimonials);
      await refetch();
      setOriginalTemplateSnapshot(cloneTemplateData(defaultTemplate.template_data));
      setActiveTemplateId(null);
      setActiveGalleryTemplateId(null);
      setUsingDefault(true);
      setActiveGalleryTemplateName(null);
      setShowSwitchConfirm(null);
      toast.success("Meu Padrão aplicado!");
      return;
    }



    const tpl = templates.find(t => t.id === templateId);
    if (!tpl) return;

    const data = tpl.template_data;
    if (data.profile) await saveProfile(data.profile as any);
    if (data.links) await saveLinks(data.links);
    if (data.socialLinks) await saveSocialLinks(data.socialLinks);
    if (data.products) await saveProducts(data.products);
    if (data.campaigns) await saveCampaigns(data.campaigns);
    if (data.heroReels) await saveHeroReels(data.heroReels);
    if (data.testimonials) await saveTestimonials(data.testimonials);
    await refetch();
    setOriginalTemplateSnapshot(cloneTemplateData(tpl.template_data));
    setActiveTemplateId(templateId);
    setActiveGalleryTemplateId(null);
    setUsingDefault(false);
    setActiveGalleryTemplateName(null);
    setShowSwitchConfirm(null);
    toast.success(`Template "${tpl.name}" aplicado!`);
  };

  const handleDeleteTemplate = async () => {
    if (!showDeleteConfirm) return;
    const tpl = templates.find(t => t.id === showDeleteConfirm);
    await deleteTemplate(showDeleteConfirm);
    if (activeTemplateId === showDeleteConfirm) {
      setActiveTemplateId(null);
      setActiveGalleryTemplateId(null);
      setActiveGalleryTemplateName(null);
      setOriginalTemplateSnapshot(null);
    }
    toast.success(`Template "${tpl?.name}" removido`);
    setShowDeleteConfirm(null);
  };

  const handleRename = async (id: string) => {
    if (!renameValue.trim()) return;
    await renameTemplate(id, renameValue.trim());
    toast.success("Nome atualizado");
    setRenamingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Carregando agência...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Creator não encontrado. Tente recarregar.</p>
      </div>
    );
  }

  const layoutOptions = [
    { id: "layout1", label: "Padrão" },
    { id: "layout2", label: "Imersivo", pro: true },
  ];

  const handleSetPublicLayout = async (layout: string) => {
    if (layout === "layout2" && !canUse("allow_layout_immersive")) {
      toast.error("Layout Imersivo é exclusivo do plano Pro. Faça upgrade!");
      return;
    }
    try {
      await saveProfile({ layout_type: layout } as any);
      const name = layoutOptions.find(l => l.id === layout)?.label || layout;
      toast.success(`Layout "${name}" definido como página pública`);
    } catch {
      toast.error("Erro ao salvar layout");
    }
  };

  const handleResetTemplate = async () => {
    if (!originalTemplateSnapshot) return;
    setResetting(true);
    try {
      const data = originalTemplateSnapshot;
      if (data.profile) await saveProfile(data.profile as any);
      if (data.links) await saveLinks(data.links);
      if (data.socialLinks) await saveSocialLinks(data.socialLinks);
      if (data.products) await saveProducts(data.products);
      if (data.campaigns) await saveCampaigns(data.campaigns);
      if (data.heroReels) await saveHeroReels(data.heroReels);
      if (data.testimonials) await saveTestimonials(data.testimonials);
      await refetch();
      toast.success("Template resetado para as configurações originais!");
    } catch {
      toast.error("Erro ao resetar template");
    } finally {
      setResetting(false);
      setShowResetConfirm(false);
      setResetConfirmInput("");
    }
  };

  const activeTemplate = templates.find(t => t.id === activeTemplateId);
  const currentLabel = usingDefault ? "⭐ Meu Padrão" : activeGalleryTemplateName ? `✨ ${activeGalleryTemplateName}` : activeTemplate ? activeTemplate.name : "⭐ Meu Padrão";
  const totalSavedTemplateCount = ownTemplates.length + savedGalleryTemplates.length;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link to="/app/creators" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Creators
          </Link>
        </div>
        <h1 className="font-display text-lg sm:text-2xl text-foreground">
          {profile.name || "Editar Creator"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          As alterações aparecerão na página pública após salvar.
        </p>
      </div>

      {/* Toolbar — scrollable on mobile */}
      <div className="flex items-center gap-2 mb-4 sm:mb-6 overflow-x-auto overflow-y-visible pb-2 -mx-1 px-1 scrollbar-none">
          {/* Template selector */}
          <div className="relative flex-shrink-0">
          <div className="flex items-center gap-1">
            <button
              ref={templateButtonRef}
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="px-2.5 sm:px-3 py-2 text-[0.68rem] sm:text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 whitespace-nowrap bg-primary/15 border-primary/40 text-primary-readable"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{currentLabel}</span>
              <span className="sm:hidden">{usingDefault ? "⭐" : activeTemplate ? "📋" : activeGalleryTemplateName ? "✨" : "⭐"}</span>
              {isTemplateEdited && (
                <span className="text-[0.55rem] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-md font-bold animate-pulse">EM EDIÇÃO</span>
              )}
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

            {showTemplateDropdown && (
              templateDropdownStyle && createPortal(<>
                <div className="fixed inset-0 z-40" onClick={() => setShowTemplateDropdown(false)} />
                 <div
                   className="fixed z-[70] max-h-[min(70vh,32rem)] overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-2xl"
                   style={{
                     top: templateDropdownStyle.top,
                     left: templateDropdownStyle.left,
                     width: templateDropdownStyle.width,
                   }}
                 >
                  {/* Meu Padrão — agency default */}
                  <div className={`flex items-center gap-1 px-3 py-2.5 transition-colors ${usingDefault ? "bg-primary/10" : "hover:bg-muted"}`}>
                    <button
                      onClick={() => {
                        if (defaultTemplate) {
                          handleSwitchTemplate(null, true);
                        } else {
                          handleSaveAsDefault();
                        }
                        setShowTemplateDropdown(false);
                      }}
                      className="flex-1 text-left text-sm text-foreground flex items-center gap-2"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                      <span className="font-semibold">Meu Padrão</span>
                    </button>
                    {usingDefault && <span className="text-[0.6rem] bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-bold flex-shrink-0">ATIVO</span>}
                    <div className="relative group flex-shrink-0">
                      <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                      <div className="absolute bottom-full right-0 mb-1.5 w-[200px] bg-popover border border-border rounded-lg p-2 text-[0.65rem] text-muted-foreground shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                        Template padrão da agência. Não conta no limite do plano. Usado como base na criação em lote de creators.
                      </div>
                    </div>
                    {defaultTemplate && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSaveAsDefault(); }}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                        title="Atualizar Meu Padrão com dados atuais"
                      >
                        <Save className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="border-t border-border my-1" />

                  {/* Section label: Templates próprios */}
                  <p className="px-3 pt-2 pb-1 text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Save className="w-3 h-3" /> Templates próprios
                    <span className="ml-auto text-[0.55rem] font-normal">{ownTemplates.length}</span>
                  </p>

                  {/* Saved templates */}
                  {ownTemplates.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-muted-foreground">Nenhum template próprio salvo ainda</p>
                  ) : (
                    ownTemplates.map((tpl) => (
                      <div key={tpl.id} className={`flex items-center gap-1 px-3 py-2 transition-colors ${
                        activeTemplateId === tpl.id ? "bg-primary/10" : "hover:bg-muted"
                      }`}>
                        {renamingId === tpl.id ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => handleRename(tpl.id)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleRename(tpl.id); if (e.key === "Escape") setRenamingId(null); }}
                            className="flex-1 bg-transparent text-sm text-foreground outline-none border-b border-primary/40"
                          />
                        ) : (
                          <button
                            onClick={() => { handleSwitchTemplate(tpl.id); setShowTemplateDropdown(false); }}
                            className="flex-1 text-left text-sm text-foreground truncate"
                          >
                            {tpl.name}
                          </button>
                        )}
                        {activeTemplateId === tpl.id && (
                          <span className="text-[0.6rem] bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-bold flex-shrink-0">ATIVO</span>
                        )}
                        {/* Update template with current data */}
                        {activeTemplateId === tpl.id && isTemplateEdited && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await updateTemplate(tpl.id, getCurrentData());
                              setOriginalTemplateSnapshot(JSON.parse(JSON.stringify(getCurrentData())));
                              toast.success(`Template "${tpl.name}" atualizado com as alterações atuais`);
                            }}
                            className="p-1 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                            title="Atualizar template com dados atuais"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setRenamingId(tpl.id); setRenameValue(tpl.name); }}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                          title="Renomear"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(tpl.id); setShowTemplateDropdown(false); }}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                          title="Excluir"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}

                  <div className="border-t border-border my-1" />

                  {/* Section label: Favoritos da galeria */}
                  <p className="px-3 pt-2 pb-1 text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3 h-3" /> Favoritos da galeria
                    <span className="ml-auto text-[0.55rem] font-normal">{savedGalleryTemplates.length}</span>
                  </p>
                  {savedGalleryTemplates.length > 0 ? (
                    <>
                      {savedGalleryTemplates.map((gt) => (
                        <button
                          key={gt.id}
                          disabled={applyingGallery}
                          onClick={() => {
                            setShowTemplateDropdown(false);
                            handleApplyGalleryTemplate(gt);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-primary-readable flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="truncate block">{gt.name}</span>
                            <span className="text-[0.6rem] text-muted-foreground">{gt.objective}</span>
                          </div>
                          {galleryTemplateOverrides.has(gt.id) && (
                            <span className="text-[0.6rem] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-md font-bold flex-shrink-0">EDITADO</span>
                          )}
                          {activeGalleryTemplateId === gt.id && (
                            <span className="text-[0.6rem] bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-bold flex-shrink-0">ATIVO</span>
                          )}
                        </button>
                      ))}
                    </>
                  ) : (
                    <button
                      onClick={() => { setShowTemplateDropdown(false); navigate("/app/templates"); }}
                      className="w-full text-left px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      Nenhum favorito. Ir para Templates →
                    </button>
                  )}
                  <div className="border-t border-border my-1" />

                  {/* Save current as new template */}
                  <button
                    onClick={() => {
                      setShowTemplateDropdown(false);
                      if (totalSavedTemplateCount >= maxTemplates) {
                        toast.error(`Limite de ${maxTemplates} template(s) atingido. ${currentPlan === "free" ? "Faça upgrade para o Pro!" : ""}`);
                        return;
                      }
                      setTemplateNameInput("");
                      setShowNewTemplateDialog(true);
                    }}
                    disabled={totalSavedTemplateCount >= maxTemplates}
                    className="w-full text-left px-3 py-2.5 text-sm text-primary-readable font-semibold hover:bg-primary/10 transition-colors flex items-center gap-2 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar como template
                    <span className="ml-auto text-[0.6rem] text-muted-foreground font-normal">{totalSavedTemplateCount}/{maxTemplates}</span>
                  </button>
                </div>
               </>, document.body)
            )}
          </div>

          {/* Layout toggle */}
          <div className="flex bg-card border border-border rounded-xl overflow-hidden flex-shrink-0">
            {layoutOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => void handleSetPublicLayout(opt.id)}
                className={`px-2.5 sm:px-3 py-2 text-[0.68rem] sm:text-xs font-semibold transition-all whitespace-nowrap ${
                  profile.layout_type === opt.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Template picker */}
          <button
            onClick={() => navigate("/app/templates")}
            className="px-2.5 sm:px-3 py-2 text-[0.68rem] sm:text-xs font-semibold bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-readable" />
            Templates
          </button>
          {/* Preview */}
          <button
            onClick={() => {
              const handle = profile.slug?.replace(/^@+/, "");
              if (handle) window.open(`/c/${handle}`, "_blank");
            }}
            className="px-3 sm:px-4 py-2 bg-card border border-border text-muted-foreground font-medium text-[0.68rem] sm:text-sm rounded-xl transition-all hover:border-primary/30 hover:text-foreground flex-shrink-0 whitespace-nowrap"
          >
            👁 <span className="hidden sm:inline">Ver página</span><span className="sm:hidden">Ver</span>
          </button>
          {/* Reset template */}
          {originalTemplateSnapshot && (
            <button
              onClick={() => { setResetConfirmInput(""); setShowResetConfirm(true); }}
              className="px-3 sm:px-4 py-2 bg-card border border-border text-muted-foreground font-medium text-[0.68rem] sm:text-sm rounded-xl transition-all hover:border-destructive/40 hover:text-destructive flex-shrink-0 whitespace-nowrap flex items-center gap-1.5"
              title="Resetar para configurações originais do template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resetar</span>
            </button>
          )}
          {/* Save */}
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-4 sm:px-5 py-2 bg-primary text-primary-foreground font-semibold text-[0.68rem] sm:text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-60 flex-shrink-0 whitespace-nowrap ml-auto"
          >
            {saving ? "Salvando..." : <><span className="hidden sm:inline">Salvar alterações</span><span className="sm:hidden">Salvar</span></>}
          </button>
        </div>

      {/* Editor */}
      <CreatorEditPanel
        ref={editorRef}
        profile={profile}
        links={links}
        socialLinks={socialLinks}
        products={products}
        campaigns={campaigns}
        heroReels={heroReels}
        testimonials={testimonials}
        activeLayout={profile.layout_type}
        onSaveProfile={saveProfile}
        onSaveLinks={saveLinks}
        onSaveSocialLinks={saveSocialLinks}
        onSaveProducts={saveProducts}
        onSaveCampaigns={saveCampaigns}
        onSaveHeroReels={saveHeroReels}
        onSaveTestimonials={saveTestimonials}
        onUploadImage={uploadImage}
        onUploadContentImage={uploadContentImage}
        onDone={() => void refetch()}
      />

      {/* First-time save suggestion */}
      <ConfirmDialog
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        title="Salvar como template?"
        description="Deseja salvar esta configuração como um template? Assim você pode reutilizá-la rapidamente no futuro."
        confirmLabel="Salvar template"
        cancelLabel="Não, obrigado"
        onConfirm={() => {
          setShowSaveConfirm(false);
          setTemplateNameInput("");
          setShowNewTemplateDialog(true);
        }}
      />

      {/* Switch confirmation */}
      <ConfirmDialog
        open={!!showSwitchConfirm}
        onOpenChange={(open) => !open && setShowSwitchConfirm(null)}
        title="Trocar de template?"
        description={
          showSwitchConfirm?.isDefault
            ? "Os dados atuais serão substituídos pelo Meu Padrão da agência. Deseja continuar?"
            : showSwitchConfirm?.templateId
            ? "Os dados atuais serão substituídos pelos dados do template selecionado. Deseja continuar?"
            : "Deseja voltar ao modo personalizado? Os dados atuais serão mantidos."
        }
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={confirmSwitch}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
        title="Excluir template?"
        description="Esta ação não pode ser desfeita. O template será removido permanentemente."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleDeleteTemplate}
      />

      {/* New template name dialog */}
      <ConfirmDialog
        open={showNewTemplateDialog}
        onOpenChange={setShowNewTemplateDialog}
        title="Nome do template"
        description={
          <div className="mt-2">
            <input
              autoFocus
              value={templateNameInput}
              onChange={(e) => setTemplateNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveAsTemplate(); }}
              placeholder="Ex: Meu estilo dark, Layout minimalista..."
              className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground text-sm outline-none focus:border-primary transition-all"
            />
          </div>
        }
        confirmLabel="Salvar"
        cancelLabel="Cancelar"
        onConfirm={handleSaveAsTemplate}
      />

      {/* Reset template confirmation — requires typing CONFIRMO */}
      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={(open) => { if (!open) { setShowResetConfirm(false); setResetConfirmInput(""); } }}
        title="Resetar template?"
        description={
          <div className="space-y-3 mt-1">
            <p className="text-sm text-muted-foreground">
              Ao resetar, você <strong className="text-destructive">perderá toda a personalização</strong> feita no template. Os dados não serão salvos e o template voltará às configurações originais.
            </p>
            <p className="text-sm text-muted-foreground">
              Para confirmar, digite <strong className="text-foreground">CONFIRMO</strong> abaixo:
            </p>
            <input
              autoFocus
              value={resetConfirmInput}
              onChange={(e) => setResetConfirmInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && resetConfirmInput === "CONFIRMO") handleResetTemplate(); }}
              placeholder="Digite CONFIRMO"
              className="w-full px-3 py-2 bg-card border border-border rounded-xl text-foreground text-sm outline-none focus:border-destructive transition-all"
            />
          </div>
        }
        confirmLabel={resetting ? "Resetando..." : "Resetar template"}
        cancelLabel="Cancelar"
        variant="destructive"
        loading={resetting}
        onConfirm={() => {
          if (resetConfirmInput !== "CONFIRMO") {
            toast.error("Digite CONFIRMO para confirmar o reset");
            return;
          }
          handleResetTemplate();
        }}
      />
    </div>
  );
}
