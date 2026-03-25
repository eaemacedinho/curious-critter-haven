import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback, useMemo, type CSSProperties } from "react";
import { toast } from "sonner";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign } from "@/hooks/useCreatorData";
import type { Testimonial } from "./TestimonialsSection";
import type { HeroReelData } from "./HeroReel";
import ImageCropper from "./ImageCropper";
import HeroReelEditor from "./HeroReelEditor";
import VerifiedBadge from "./VerifiedBadge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import CreatorLivePreview from "./CreatorLivePreview";
import { LinkIcon, detectPlatform } from "./SocialIcon";
import { EFFECT_OPTIONS, DEFAULT_EMOJIS, EMOJI_PALETTE, type PageEffect } from "./PageEffects";
import { Slider } from "@/components/ui/slider";

const emojiIcons = ["⭐", "▶", "🎵", "📄", "🛍", "📸", "🎮", "💼", "🎨", "📚", "🔗", "💰", "🎧", "📦", "🎬", "💎"];

/** Grouped icon options for the link picker — each group is a platform with style variants */
const linkIconGroups = [
  { label: "Instagram", keys: ["instagram", "instagram-dark", "instagram-pink"] },
  { label: "YouTube", keys: ["youtube", "youtube-dark", "youtube-white"] },
  { label: "TikTok", keys: ["tiktok", "tiktok-color"] },
  { label: "Twitter / X", keys: ["twitter", "twitter-white"] },
  { label: "Facebook", keys: ["facebook", "facebook-dark"] },
  { label: "LinkedIn", keys: ["linkedin", "linkedin-dark"] },
  { label: "Spotify", keys: ["spotify", "spotify-dark"] },
  { label: "Website", keys: ["website", "website-dark", "website-blue"] },
  { label: "WhatsApp", keys: ["whatsapp"] },
  { label: "Telegram", keys: ["telegram"] },
  { label: "Threads", keys: ["threads"] },
  { label: "Discord", keys: ["discord"] },
  { label: "Twitch", keys: ["twitch"] },
  { label: "Snapchat", keys: ["snapchat"] },
  { label: "Pinterest", keys: ["pinterest"] },
  { label: "GitHub", keys: ["github"] },
  { label: "Apple Music", keys: ["apple"] },
  { label: "E-mail", keys: ["email"] },
];

const detectIconFromUrl = (url: string): string | null => {
  if (!url) return null;
  const key = detectPlatform("", url);
  return key || null;
};

const socialEmojiOptions = [
  { emoji: "📸", label: "Instagram", baseUrl: "https://instagram.com/", placeholder: "@seu_perfil" },
  { emoji: "▶️", label: "YouTube", baseUrl: "https://youtube.com/@", placeholder: "@seu_canal" },
  { emoji: "🎵", label: "TikTok", baseUrl: "https://tiktok.com/@", placeholder: "@seu_perfil" },
  { emoji: "🐦", label: "Twitter/X", baseUrl: "https://x.com/", placeholder: "@seu_perfil" },
  { emoji: "👤", label: "Facebook", baseUrl: "https://facebook.com/", placeholder: "@sua_pagina" },
  { emoji: "💼", label: "LinkedIn", baseUrl: "https://linkedin.com/in/", placeholder: "seu_perfil" },
  { emoji: "🎮", label: "Twitch", baseUrl: "https://twitch.tv/", placeholder: "@seu_canal" },
  { emoji: "💬", label: "Discord", baseUrl: "https://discord.gg/", placeholder: "código_convite" },
  { emoji: "📌", label: "Pinterest", baseUrl: "https://pinterest.com/", placeholder: "@seu_perfil" },
  { emoji: "👻", label: "Snapchat", baseUrl: "https://snapchat.com/add/", placeholder: "seu_perfil" },
  { emoji: "🎧", label: "Spotify", baseUrl: "https://open.spotify.com/artist/", placeholder: "cole o link completo" },
  { emoji: "🍎", label: "Apple", baseUrl: "https://music.apple.com/artist/", placeholder: "cole o link completo" },
  { emoji: "📧", label: "E-mail", baseUrl: "mailto:", placeholder: "seu@email.com" },
  { emoji: "🌐", label: "Website", baseUrl: "", placeholder: "https://seusite.com" },
  { emoji: "🛒", label: "Loja", baseUrl: "", placeholder: "https://sua-loja.com" },
  { emoji: "📱", label: "WhatsApp", baseUrl: "https://wa.me/", placeholder: "5511999999999" },
  { emoji: "✈️", label: "Telegram", baseUrl: "https://t.me/", placeholder: "@seu_perfil" },
  { emoji: "🧵", label: "Threads", baseUrl: "https://threads.net/@", placeholder: "@seu_perfil" },
  { emoji: "💡", label: "Outro", baseUrl: "", placeholder: "https://..." },
];

const getSocialOption = (platform: string) =>
  socialEmojiOptions.find(o => o.label.toLowerCase() === platform.toLowerCase());

const buildSocialUrl = (platform: string, input: string): string => {
  if (!input) return "";
  if (input.startsWith("http://") || input.startsWith("https://") || input.startsWith("mailto:")) return input;
  const opt = getSocialOption(platform);
  if (!opt || !opt.baseUrl) return input;
  const handle = input.replace(/^@/, "");
  return `${opt.baseUrl}${handle}`;
};

const extractHandle = (platform: string, url: string): string => {
  if (!url) return "";
  const opt = getSocialOption(platform);
  if (!opt || !opt.baseUrl) return url;
  if (url.startsWith(opt.baseUrl)) {
    return "@" + url.slice(opt.baseUrl.length).replace(/^@/, "");
  }
  if (url.includes(opt.label.toLowerCase().replace("/x", "").replace("twitter", "x"))) {
    const parts = url.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && !last.includes(".")) return "@" + last.replace(/^@/, "");
  }
  return url;
};

interface Props {
  profile: CreatorProfile;
  links: CreatorLink[];
  socialLinks: SocialLink[];
  products: CreatorProduct[];
  campaigns: CreatorCampaign[];
  heroReels: HeroReelData[];
  testimonials: Testimonial[];
  activeLayout?: string;
  onSaveProfile: (updates: Partial<CreatorProfile>) => Promise<void>;
  onSaveLinks: (links: CreatorLink[]) => Promise<void>;
  onSaveSocialLinks: (links: SocialLink[]) => Promise<void>;
  onSaveProducts: (products: CreatorProduct[]) => Promise<void>;
  onSaveCampaigns: (campaigns: CreatorCampaign[]) => Promise<void>;
  onSaveHeroReels: (reels: HeroReelData[]) => Promise<void>;
  onSaveTestimonials: (testimonials: Testimonial[]) => Promise<void>;
  onUploadImage: (file: File, type: "avatar" | "cover" | "avatar_layout2" | "cover_layout2") => Promise<string | null>;
  onUploadContentImage: (file: File, folder: string) => Promise<string | null>;
  onDone: () => void;
}

export interface CreatorEditPanelHandle {
  saveAll: () => Promise<boolean>;
}

// Generic crop state for content images (products, campaigns, brands)
type ContentCropState = {
  src: string;
  aspect: number;
  cropShape: "rect" | "round";
  onDone: (blob: Blob) => void;
} | null;

const CreatorEditPanel = forwardRef<CreatorEditPanelHandle, Props>(function CreatorEditPanel(
  {
    profile,
    links: initialLinks,
    socialLinks: initialSocial,
    products: initialProducts,
    campaigns: initialCampaigns,
    heroReels: initialHeroReels,
    testimonials: initialTestimonials,
    activeLayout,
    onSaveProfile,
    onSaveLinks,
    onSaveSocialLinks,
    onSaveProducts,
    onSaveCampaigns,
    onSaveHeroReels,
    onSaveTestimonials,
    onUploadImage,
    onUploadContentImage,
    onDone,
  }: Props,
  ref
) {
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.slug);
  const [bio, setBio] = useState(profile.bio || "");
  const [tags, setTags] = useState(profile.tags || []);
  const [stats, setStats] = useState(profile.stats || []);
  const [brands, setBrands] = useState(profile.brands || []);
  const [brandsDisplayMode, setBrandsDisplayMode] = useState<"static" | "marquee">(profile.brands_display_mode || "static");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [coverUrl, setCoverUrl] = useState(profile.cover_url || "");
  const [avatarUrlL2, setAvatarUrlL2] = useState(profile.avatar_url_layout2 || "");
  const [coverUrlL2, setCoverUrlL2] = useState(profile.cover_url_layout2 || "");
  const [verified, setVerified] = useState(profile.verified ?? false);
  const [shapeProducts, setShapeProducts] = useState<"rounded" | "circular" | "pill" | "shadow" | "polaroid">(profile.image_shape_products || "rounded");
  const [shapeCampaigns, setShapeCampaigns] = useState<"rounded" | "circular" | "pill" | "shadow" | "polaroid">(profile.image_shape_campaigns || "rounded");
  const [shapeLinks, setShapeLinks] = useState<"rounded" | "circular" | "pill" | "shadow" | "polaroid">(profile.image_shape_links || "rounded");
  const [pageEffects, setPageEffects] = useState<PageEffect[]>((profile.page_effects?.effects || []) as PageEffect[]);
  const [effectColor, setEffectColor] = useState<string>(profile.page_effects?.color || "#8B5CF6");
  const [effectEmojis, setEffectEmojis] = useState<string[]>(profile.page_effects?.emojis || [...DEFAULT_EMOJIS]);
  const [effectIntensity, setEffectIntensity] = useState<Record<string, number>>(profile.page_effects?.intensity || {});
  const [fontFamily, setFontFamily] = useState(profile.font_family || "default");
  const [fontSize, setFontSize] = useState(profile.font_size || "medium");
  const [colorName, setColorName] = useState(profile.color_name || "");
  const [colorBio, setColorBio] = useState(profile.color_bio || "");
  const [colorSectionTitles, setColorSectionTitles] = useState(profile.color_section_titles || "");
  const [links, setLinks] = useState(initialLinks);
  const [social, setSocial] = useState(() =>
    initialSocial.map((s) => {
      if (s.label && s.label.trim()) return s;
      const opt = getSocialOption(s.platform);
      return opt ? { ...s, label: opt.emoji } : s;
    })
  );
  const [prods, setProds] = useState(initialProducts);
  const [camps, setCamps] = useState(initialCampaigns);
  const [heroReels, setHeroReels] = useState(initialHeroReels);
  const [sectionOrder, setSectionOrder] = useState<string[]>(profile.section_order || ["spotlight", "links", "products", "past_campaigns", "hero_reel", "testimonials"]);
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>(initialTestimonials || []);
  const [spotifyUrl, setSpotifyUrl] = useState(profile.spotify_url || "");
  const [displayModes, setDisplayModes] = useState<{ links: "list" | "carousel"; products: "list" | "carousel"; campaigns: "list" | "carousel" }>({
    links: profile.page_effects?.display_modes?.links || "list",
    products: profile.page_effects?.display_modes?.products || "list",
    campaigns: profile.page_effects?.display_modes?.campaigns || "list",
  });
  const [dragSectionIdx, setDragSectionIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<"avatar" | "cover" | null>(null);
  const [uploadingContent, setUploadingContent] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [cropImage, setCropImage] = useState<{ src: string; type: "avatar" | "cover" | "avatar_layout2" | "cover_layout2"; file: File } | null>(null);
  const [contentCrop, setContentCrop] = useState<ContentCropState>(null);
  const [deleteCampTarget, setDeleteCampTarget] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const previewToggleRef = useRef<HTMLDivElement>(null);
  const [previewTopOffset, setPreviewTopOffset] = useState(72);
  const [dragLinkIdx, setDragLinkIdx] = useState<number | null>(null);
  const [dragProdIdx, setDragProdIdx] = useState<number | null>(null);
  const [dragCampIdx, setDragCampIdx] = useState<number | null>(null);
  const [dragTestimonialIdx, setDragTestimonialIdx] = useState<number | null>(null);
  const [focusSection, setFocusSection] = useState<string | null>(null);

  // IntersectionObserver to detect which editor section is most visible
  useEffect(() => {
    if (!showPreview) return;
    const editorRoot = document.querySelector('[data-editor-root]');
    if (!editorRoot) return;
    const sections = editorRoot.querySelectorAll('[data-editor-section]');
    if (!sections.length) return;

    const visibleMap = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const sectionId = (entry.target as HTMLElement).dataset.editorSection!;
          visibleMap.set(sectionId, entry.intersectionRatio);
        }
        // Pick the section with the highest visibility ratio
        let best: string | null = null;
        let bestRatio = 0;
        visibleMap.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        });
        if (best) setFocusSection(best);
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [showPreview]);

  // Build a live preview profile from current editor state
  const liveProfile = useMemo<CreatorProfile>(() => ({
    ...profile,
    name,
    slug: handle,
    bio,
    avatar_url: avatarUrl,
    cover_url: coverUrl,
    avatar_url_layout2: avatarUrlL2,
    cover_url_layout2: coverUrlL2,
    verified,
    tags,
    stats,
    brands,
    brands_display_mode: brandsDisplayMode,
    image_shape: shapeProducts,
    image_shape_products: shapeProducts,
    image_shape_campaigns: shapeCampaigns,
    image_shape_links: shapeLinks,
    page_effects: { effects: pageEffects, color: effectColor, emojis: effectEmojis, intensity: effectIntensity, display_modes: displayModes },
    font_family: fontFamily,
    font_size: fontSize,
    color_name: colorName || null,
    color_bio: colorBio || null,
    color_section_titles: colorSectionTitles || null,
    section_order: sectionOrder,
    spotify_url: spotifyUrl,
  }), [profile, name, handle, bio, avatarUrl, coverUrl, avatarUrlL2, coverUrlL2, verified, tags, stats, brands, brandsDisplayMode, shapeProducts, shapeCampaigns, shapeLinks, pageEffects, effectColor, effectEmojis, effectIntensity, displayModes, fontFamily, fontSize, colorName, colorBio, colorSectionTitles, sectionOrder, spotifyUrl]);

  const isValidUrl = (url: string) => {
    if (!url) return true;
    try { new URL(url); return true; } catch { return false; }
  };

  const normalizeExternalUrl = (url?: string | null) => {
    const trimmed = (url || "").trim();
    if (!trimmed) return "";
    if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
    return `https://${trimmed.replace(/^\/+/, "")}`;
  };

  const isEmptyLinkEntry = (link: CreatorLink) => !link.title.trim() && !link.url.trim();
  const isEmptyProductEntry = (prod: CreatorProduct) => !prod.title.trim() && !prod.url?.trim() && !prod.image_url?.trim();
  const isEmptyCampaignEntry = (camp: CreatorCampaign) => !camp.title.trim() && !camp.url?.trim() && !camp.image_url?.trim();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Nome é obrigatório";
    if (!handle.trim()) errors.slug = "Handle é obrigatório";
    else if (/\s/.test(handle)) errors.slug = "Handle não pode conter espaços";
    else if (!/^[a-zA-Z0-9._-]+$/.test(handle.replace(/^@/, ""))) errors.slug = "Handle contém caracteres inválidos";

    links.forEach((link, i) => {
      const normalizedUrl = normalizeExternalUrl(link.url);
      // Skip completely empty links (no title AND no url)
      if (!link.title.trim() && !link.url.trim()) return;
      if (link.is_active && !link.title.trim()) errors[`link-title-${i}`] = "Título obrigatório";
      if (link.is_active && normalizedUrl && !isValidUrl(normalizedUrl)) errors[`link-url-${i}`] = "URL inválida";
    });

    prods.forEach((prod, i) => {
      const normalizedUrl = normalizeExternalUrl(prod.url);
      if (!prod.title.trim() && !prod.url?.trim() && !prod.image_url?.trim()) return;
      if (!prod.title.trim()) errors[`prod-title-${i}`] = "Nome obrigatório";
      if (normalizedUrl && !isValidUrl(normalizedUrl)) errors[`prod-url-${i}`] = "URL inválida";
    });

    camps.forEach((camp, i) => {
      const normalizedUrl = normalizeExternalUrl(camp.url);
      if (!camp.title.trim() && !camp.url?.trim() && !camp.image_url?.trim()) return;
      if (!camp.title.trim()) errors[`camp-title-${i}`] = "Título obrigatório";
      if (normalizedUrl && !isValidUrl(normalizedUrl)) errors[`camp-url-${i}`] = "URL inválida";
    });

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Corrija os campos destacados antes de salvar.");
      return false;
    }
    return true;
  };

  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (file: File, type: "avatar" | "cover" | "avatar_layout2" | "cover_layout2") => {
    const reader = new FileReader();
    reader.onload = () => setCropImage({ src: reader.result as string, type, file });
    reader.readAsDataURL(file);
  };

  const handleCropDone = async (blob: Blob, type: "avatar" | "cover" | "avatar_layout2" | "cover_layout2") => {
    try {
      setUploadingImage(type as any);
      const file = new File([blob], `${type}.jpg`, { type: "image/jpeg" });
      const url = await onUploadImage(file, type);
      if (!url) return;
      if (type === "avatar") setAvatarUrl(url);
      else if (type === "cover") setCoverUrl(url);
      else if (type === "avatar_layout2") setAvatarUrlL2(url);
      else if (type === "cover_layout2") setCoverUrlL2(url);
      setCropImage(null);
      toast.success("Imagem atualizada!");
    } finally {
      setUploadingImage(null);
    }
  };

  // Open cropper for content images (products, campaigns, brands)
  const openContentCrop = useCallback((file: File, aspect: number, onDone: (blob: Blob) => void) => {
    const reader = new FileReader();
    reader.onload = () => setContentCrop({ src: reader.result as string, aspect, cropShape: "rect", onDone });
    reader.readAsDataURL(file);
  }, []);

  const handleSaveAll = async ({ closeAfterSave = true }: { closeAfterSave?: boolean } = {}): Promise<boolean> => {
    if (saving) return false;

    if (uploadingImage) {
      toast.info("Aguarde o upload da imagem terminar antes de salvar.");
      return false;
    }

    if (!validate()) return false;

    try {
      setSaving(true);

        const sanitizedLinks = links
          .map((link) => ({
            ...link,
            title: link.title.trim(),
            url: normalizeExternalUrl(link.url),
            subtitle: (link.subtitle || "").trim(),
          }))
          .filter((link) => !isEmptyLinkEntry(link));

        const sanitizedProducts = prods
          .map((prod) => ({
            ...prod,
            title: prod.title.trim(),
            price: (prod.price || "").trim(),
            url: normalizeExternalUrl(prod.url),
            image_url: (prod.image_url || "").trim(),
          }))
          .filter((prod) => !isEmptyProductEntry(prod));

        const sanitizedCampaigns = camps
          .map((camp) => ({
            ...camp,
            title: camp.title.trim(),
            description: (camp.description || "").trim(),
            url: normalizeExternalUrl(camp.url),
            image_url: (camp.image_url || "").trim(),
          }))
          .filter((camp) => !isEmptyCampaignEntry(camp));

      const baseProfile = { name, slug: handle, bio, avatar_url: avatarUrl, cover_url: coverUrl, avatar_url_layout2: avatarUrlL2, cover_url_layout2: coverUrlL2, verified, tags, stats, brands, brands_display_mode: brandsDisplayMode, image_shape: shapeProducts, image_shape_products: shapeProducts, image_shape_campaigns: shapeCampaigns, image_shape_links: shapeLinks, page_effects: { effects: pageEffects, color: effectColor, emojis: effectEmojis, intensity: effectIntensity, display_modes: displayModes }, font_family: fontFamily, font_size: fontSize, color_name: colorName || null, color_bio: colorBio || null, color_section_titles: colorSectionTitles || null, section_order: sectionOrder, spotify_url: spotifyUrl };

      if (cropImage) {
        const { file, type } = cropImage;
        const url = await onUploadImage(file, type);
        if (url) {
          if (type === "avatar") baseProfile.avatar_url = url;
          else if (type === "cover") baseProfile.cover_url = url;
          else if (type === "avatar_layout2") baseProfile.avatar_url_layout2 = url;
          else if (type === "cover_layout2") baseProfile.cover_url_layout2 = url;
        } else {
          toast.error("Falha ao salvar imagem pendente.");
          return false;
        }
        setCropImage(null);
      }

      await onSaveProfile(baseProfile);

        await onSaveLinks(sanitizedLinks);
      await onSaveSocialLinks(social);
        await onSaveProducts(sanitizedProducts);
        await onSaveCampaigns(sanitizedCampaigns);
      await onSaveHeroReels(heroReels.filter(r => r.video_url?.trim()));
      await onSaveTestimonials(testimonialsList.filter(t => t.content?.trim()));
      toast.success("Tudo salvo! 🎉");
      if (closeAfterSave) onDone();
      return true;
    } catch (error) {
      console.error("Save all error:", error);
      toast.error("Não foi possível salvar as alterações.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({
    saveAll: () => handleSaveAll({ closeAfterSave: false }),
  }));

  const inputClass = "w-full px-3.5 py-2.5 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 focus:shadow-[0_0_0_3px_hsl(268_69%_50%_/_0.12)] transition-all";
  const labelClass = "block text-[0.72rem] font-semibold text-k-2 mb-1.5";
  const sectionTitle = "text-[0.66rem] font-bold text-k-4 tracking-[0.12em] uppercase mb-3.5 flex items-center gap-2";
  const sizeHint = "text-[0.62rem] text-k-4 mt-1";

  // Keep preview top offset in sync with the toggle button position
  useEffect(() => {
    if (!showPreview) return;
    const update = () => {
      if (previewToggleRef.current) {
        const rect = previewToggleRef.current.getBoundingClientRect();
        // When toggle is visible, preview starts below it.
        // When toggle scrolls above navbar (56px), lock preview at 56px.
        const toggleBottom = rect.bottom + 8;
        setPreviewTopOffset(toggleBottom > 56 ? toggleBottom : 56);
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    const scrollParent = previewToggleRef.current?.closest("[class*='overflow']");
    scrollParent?.addEventListener("scroll", update, { passive: true } as any);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      scrollParent?.removeEventListener("scroll", update);
    };
  }, [showPreview]);

  return (
    <div className="relative">
      {/* Preview toggle */}
      <div className="mb-4" ref={previewToggleRef}>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 ${
            showPreview
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
          }`}
        >
          {showPreview ? "✕ Fechar pré-visualização" : "👁 Pré-visualização em tempo real"}
        </button>
      </div>

      <div className={showPreview ? "md:mr-[440px]" : ""}>
        {/* Editor column */}
        <div>
    <div data-editor-root className={`${showPreview ? "" : "max-w-[560px]"} mx-auto px-6 py-8 pt-4 animate-k-fade-up`}>
      <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0], "avatar")} />
      <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0], "cover")} />

      {/* Layout 1 images — only when editing layout1 or no layout specified */}
      {(!activeLayout || activeLayout === "layout1") && (
        <div data-editor-section="cover">
          <div className="mb-6" >
            <div className={sectionTitle}>🖼 Foto de Capa</div>
            <div className="relative w-full h-[160px] rounded-2xl overflow-hidden border border-primary/10 group cursor-pointer" onClick={() => coverRef.current?.click()}>
              {coverUrl ? (
                <img src={coverUrl} alt="cover" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-k-800 flex items-center justify-center text-k-4 text-sm">Clique para adicionar capa</div>
              )}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-sm text-background font-semibold bg-primary px-4 py-2 rounded-xl shadow-lg">
                  {uploadingImage === "cover" ? "Enviando capa..." : "📷 Alterar capa"}
                </span>
              </div>
            </div>
            <p className={sizeHint}>📐 Tamanho ideal: <strong>1600×500px</strong> (proporção 16:5)</p>
          </div>

          <div className="mb-6" data-editor-section="profile">
            <div className={sectionTitle}>👤 Foto de Perfil</div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-[2.5px] border-primary flex-shrink-0 shadow-[0_4px_18px] shadow-primary/20 relative group cursor-pointer" onClick={() => avatarRef.current?.click()}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-k-800 flex items-center justify-center text-2xl text-k-3">{name?.[0] || "?"}</div>
                )}
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <span className="text-lg">{uploadingImage === "avatar" ? "⏳" : "📷"}</span>
                </div>
              </div>
              <div>
                <button onClick={() => avatarRef.current?.click()} className="text-sm text-k-300 font-medium hover:text-k-200 transition-colors">Alterar foto</button>
                <br /><span className="text-[0.62rem] text-k-4">📐 Ideal: <strong>500×500px</strong> (1:1) · JPG/PNG · máx 2MB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout 2 images — only when editing layout2 */}
      {activeLayout === "layout2" && (
        <div className="mb-6 bg-card/40 border border-primary/10 rounded-2xl p-4" data-editor-section="cover">
          <div className={sectionTitle}>🎨 Imagens — Layout 2 (Linkme)</div>
          <p className="text-[0.68rem] text-k-4 mb-3">Use uma foto em retrato/vertical para melhor resultado.</p>

          <div className="mb-4">
            <label className={labelClass}>Foto Hero / Capa</label>
            <div className="relative w-full h-[200px] rounded-2xl overflow-hidden border border-primary/10 group cursor-pointer" onClick={() => {
              const input = document.createElement("input");
              input.type = "file"; input.accept = "image/*";
              input.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleFileSelected(f, "cover_layout2"); };
              input.click();
            }}>
              {coverUrlL2 ? (
                <img src={coverUrlL2} alt="cover layout 2" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-k-800 flex items-center justify-center text-k-4 text-sm">Clique para adicionar foto hero</div>
              )}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-sm text-background font-semibold bg-primary px-4 py-2 rounded-xl shadow-lg">📷 Alterar hero</span>
              </div>
            </div>
            <p className={sizeHint}>📐 Tamanho ideal: <strong>1080×1350px</strong> (proporção 4:5, retrato)</p>
          </div>

          <div>
            <label className={labelClass}>Foto de Perfil (header sticky)</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-[2.5px] border-primary flex-shrink-0 shadow-[0_4px_18px] shadow-primary/20 relative group cursor-pointer" onClick={() => {
                const input = document.createElement("input");
                input.type = "file"; input.accept = "image/*";
                input.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleFileSelected(f, "avatar_layout2"); };
                input.click();
              }}>
                {avatarUrlL2 ? (
                  <img src={avatarUrlL2} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-k-800 flex items-center justify-center text-2xl text-k-3">{name?.[0] || "?"}</div>
                )}
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <span className="text-lg">📷</span>
                </div>
              </div>
              <div>
                <span className="text-sm text-k-300 font-medium">Foto do header sticky</span>
                <br /><span className="text-[0.62rem] text-k-4">📐 Ideal: <strong>500×500px</strong> (1:1) · aparece no topo ao rolar</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8" data-editor-section="profile">
        <div className={sectionTitle}>👤 Dados do Perfil</div>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Nome <span className="text-destructive">*</span></label>
            <input value={name} onChange={(e) => { setName(e.target.value); setValidationErrors((v) => { const n = { ...v }; delete n.name; return n; }); }} className={`${inputClass} ${validationErrors.name ? "border-destructive/50 focus:border-destructive" : ""}`} placeholder="Seu nome ou nome artístico" />
            {validationErrors.name && <p className="text-[0.68rem] text-destructive mt-1">{validationErrors.name}</p>}
          </div>
          <div>
            <label className={labelClass}>Handle <span className="text-destructive">*</span></label>
            <input value={handle} onChange={(e) => { setHandle(e.target.value); setValidationErrors((v) => { const n = { ...v }; delete n.slug; return n; }); }} className={`${inputClass} ${validationErrors.slug ? "border-destructive/50 focus:border-destructive" : ""}`} placeholder="seunome" />
            {validationErrors.slug ? <p className="text-[0.68rem] text-destructive mt-1">{validationErrors.slug}</p> : <p className="text-[0.68rem] text-k-4 mt-1">Identificador único, sem espaços. Ex: in1.bio/{handle.replace(/^@/, "") || "seunome"}</p>}
          </div>
          <div>
            <label className={labelClass}>Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} className={`${inputClass} resize-none min-h-[72px]`} placeholder="Conte um pouco sobre você, o que faz e o que inspira seu conteúdo..." />
            <div className="text-[0.68rem] text-k-4 text-right mt-1">{bio.length}/300</div>
          </div>
          {/* Verified badge toggle */}
          <div className="flex items-center justify-between mt-4 p-3 bg-k-800/50 border border-primary/10 rounded-xl">
            <div>
              <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <VerifiedBadge size={18} />
                Badge de Verificado
              </span>
              <p className="text-[0.65rem] text-k-4 mt-0.5">Exibir selo de verificação ao lado do nome</p>
            </div>
            <button
              onClick={() => setVerified(!verified)}
              className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${verified ? "bg-primary" : "bg-k-800 border border-primary/20"}`}
            >
              <span className={`block w-4.5 h-4.5 rounded-full bg-primary-foreground shadow-sm absolute top-[3px] transition-transform duration-200 ${verified ? "translate-x-[22px]" : "translate-x-[3px]"}`} />
            </button>
          </div>

          {/* Per-section image shape selectors with live preview */}
          <div className="mt-4 p-3 bg-k-800/50 border border-primary/10 rounded-xl space-y-4">
            <span className="text-sm font-semibold text-primary-foreground flex items-center gap-1.5">
              🖼 Formato das imagens
            </span>
            <p className="text-[0.65rem] text-k-4 -mt-2">Escolha o formato das imagens para cada seção. Veja a pré-visualização ao lado.</p>

            {([
              { label: "🔗 Links", value: shapeLinks, setter: setShapeLinks, previewType: "link" as const },
              { label: "📦 Produtos", value: shapeProducts, setter: setShapeProducts, previewType: "product" as const },
              { label: "📢 Campanhas", value: shapeCampaigns, setter: setShapeCampaigns, previewType: "campaign" as const },
            ] as const).map((section) => {
              const previewShapeClass = (() => {
                switch (section.value) {
                  case "circular": return "rounded-full";
                  case "pill": return "rounded-[2rem]";
                  case "shadow": return "rounded-2xl shadow-[0_6px_24px_-4px_hsl(var(--primary)/0.25)]";
                  case "polaroid": return "rounded-sm bg-card p-1 pb-2.5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.25)] border border-border/40";
                  default: return "rounded-2xl";
                }
              })();

              return (
                <div key={section.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[0.7rem] font-semibold text-k-3">{section.label}</span>
                    {section.value !== "rounded" && (
                      <button
                        onClick={() => section.setter("rounded" as any)}
                        className="px-2 py-0.5 rounded-lg bg-destructive/10 text-destructive text-[0.58rem] font-semibold hover:bg-destructive/20 transition-colors"
                        title="Resetar para formato padrão (Arredondado)"
                      >
                        ↺ Padrão
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {/* Shape options */}
                    <div className="grid grid-cols-5 gap-1.5 flex-1">
                      {([
                        { value: "rounded" as const, label: "Arredondado", cls: "rounded-2xl border border-primary/30" },
                        { value: "circular" as const, label: "Circular", cls: "rounded-full border border-primary/30" },
                        { value: "pill" as const, label: "Cápsula", cls: "rounded-[2rem] border border-primary/30" },
                        { value: "shadow" as const, label: "Sombra", cls: "rounded-2xl shadow-[0_4px_16px_-2px_hsl(268_69%_50%_/_0.4)]" },
                        { value: "polaroid" as const, label: "Polaroid", cls: "rounded-sm bg-card p-0.5 pb-1.5 shadow-[0_3px_12px_-2px_rgba(0,0,0,0.3)] border border-border/40" },
                      ]).map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => section.setter(opt.value)}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-200 active:scale-[0.97] ${
                            section.value === opt.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-primary/10 bg-k-800 text-k-3 hover:border-primary/30"
                          }`}
                        >
                          <div className={`w-7 h-7 bg-primary/20 ${opt.cls}`} />
                          <span className="text-[0.58rem] font-semibold leading-tight text-center">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                    {/* Live preview */}
                    <div className="w-[100px] flex-shrink-0 flex items-center justify-center">
                      <div className={`transition-all duration-500 ease-out ${previewShapeClass} overflow-hidden`}
                        style={{ width: section.previewType === "campaign" ? 96 : 72, height: section.previewType === "campaign" ? 56 : 72 }}>
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/15 to-primary/5 flex items-center justify-center">
                          <span className="text-[0.55rem] font-bold text-primary/60 text-center leading-tight px-1">
                            {section.value === "rounded" && "Arredondado"}
                            {section.value === "circular" && "Circular"}
                            {section.value === "pill" && "Cápsula"}
                            {section.value === "shadow" && "Sombra"}
                            {section.value === "polaroid" && "Polaroid"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🔤 Tipografia */}
      <div className="mb-8" data-editor-section="typography">
        <div className={sectionTitle}>🔤 Tipografia</div>
        <p className="text-[0.68rem] text-k-4 mb-3">Personalize a fonte e o tamanho do texto da sua página.</p>
        
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Fonte</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: "default", label: "Padrão", sample: "Instrument Serif" },
                { id: "inter", label: "Inter", sample: "Inter" },
                { id: "playfair", label: "Playfair", sample: "Playfair Display" },
                { id: "space-grotesk", label: "Space Grotesk", sample: "Space Grotesk" },
                { id: "dm-serif", label: "DM Serif", sample: "DM Serif Display" },
                { id: "outfit", label: "Outfit", sample: "Outfit" },
                { id: "crimson", label: "Crimson Pro", sample: "Crimson Pro" },
                { id: "sora", label: "Sora", sample: "Sora" },
                { id: "bebas", label: "Bebas Neue", sample: "Bebas Neue" },
              ].map((font) => (
                <button
                  key={font.id}
                  onClick={() => setFontFamily(font.id)}
                  className={`px-3 py-3 rounded-xl text-left transition-all border ${
                    fontFamily === font.id
                      ? "bg-primary/15 border-primary/40 text-k-1 shadow-sm"
                      : "bg-k-800 border-primary/10 text-k-2 hover:border-primary/20"
                  }`}
                >
                  <span className="block text-[0.68rem] font-semibold mb-0.5">{font.label}</span>
                  <span className="block text-[0.82rem] opacity-70" style={{ fontFamily: font.sample + ", serif" }}>Aa Bb Cc</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Tamanho do texto</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "small", label: "Pequeno", icon: "A", sizeClass: "text-xs" },
                { id: "medium", label: "Médio", icon: "A", sizeClass: "text-sm" },
                { id: "large", label: "Grande", icon: "A", sizeClass: "text-base" },
                { id: "xlarge", label: "Extra", icon: "A", sizeClass: "text-lg" },
              ].map((size) => (
                <button
                  key={size.id}
                  onClick={() => setFontSize(size.id)}
                  className={`px-3 py-3 rounded-xl text-center transition-all border ${
                    fontSize === size.id
                      ? "bg-primary/15 border-primary/40 text-k-1 shadow-sm"
                      : "bg-k-800 border-primary/10 text-k-2 hover:border-primary/20"
                  }`}
                >
                  <span className={`block font-bold mb-0.5 ${size.sizeClass}`}>{size.icon}</span>
                  <span className="block text-[0.62rem]">{size.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Cores do texto</label>
            <div className="space-y-2.5">
              {[
                { label: "Nome", value: colorName, setter: setColorName },
                { label: "Bio", value: colorBio, setter: setColorBio },
                { label: "Títulos de seção", value: colorSectionTitles, setter: setColorSectionTitles },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 bg-k-800 border border-primary/10 rounded-xl px-3 py-2.5">
                  <input
                    type="color"
                    value={item.value || "#ffffff"}
                    onChange={(e) => item.setter(e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[0.72rem] font-semibold text-k-2">{item.label}</span>
                  </div>
                  <input
                    value={item.value || ""}
                    onChange={(e) => item.setter(e.target.value)}
                    placeholder="Automático"
                    className="w-[90px] text-right bg-transparent text-k-2 text-[0.72rem] font-mono outline-none placeholder:text-k-4"
                  />
                  {item.value && (
                    <button
                      onClick={() => item.setter("")}
                      className="text-[0.62rem] text-k-4 hover:text-k-2 transition-colors"
                      title="Resetar"
                    >✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8" data-editor-section="effects">
        <div className={sectionTitle}>✨ Efeitos Visuais</div>
        <p className="text-[0.68rem] text-k-4 mb-3">Adicione efeitos animados à sua página pública. Selecione quantos quiser.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EFFECT_OPTIONS.map((effect) => {
            const isActive = pageEffects.includes(effect.id);
            return (
              <button
                key={effect.id}
                onClick={() => {
                  setPageEffects((prev) =>
                    prev.includes(effect.id)
                      ? prev.filter((e) => e !== effect.id)
                      : [...prev, effect.id]
                  );
                }}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 text-left active:scale-[0.97] ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-[0_0_12px_hsl(268_69%_50%_/_0.15)]"
                    : "border-primary/10 bg-k-800 hover:border-primary/30"
                }`}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{effect.emoji}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[0.78rem] font-semibold ${isActive ? "text-primary" : "text-k-2"}`}>
                      {effect.label}
                    </span>
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded-md bg-primary/20 text-primary text-[0.58rem] font-bold">ATIVO</span>
                    )}
                  </div>
                  <p className="text-[0.62rem] text-k-4 mt-0.5 leading-relaxed">{effect.description}</p>
                </div>
              </button>
            );
          })}
        </div>
        {pageEffects.length > 0 && (
          <div className="mt-3 space-y-3">
            {/* Intensity sliders per active effect */}
            <div className="space-y-2">
              <span className="text-[0.72rem] font-semibold text-k-2">⚡ Intensidade / Velocidade</span>
              {pageEffects.map((eid) => {
                const opt = EFFECT_OPTIONS.find((o) => o.id === eid);
                if (!opt) return null;
                const val = effectIntensity[eid] ?? 50;
                return (
                  <div key={eid} className="flex items-center gap-3 p-2 bg-k-800/50 border border-primary/10 rounded-lg">
                    <span className="text-sm flex-shrink-0">{opt.emoji}</span>
                    <span className="text-[0.65rem] text-k-3 w-20 truncate">{opt.label}</span>
                    <Slider
                      value={[val]}
                      min={5}
                      max={100}
                      step={5}
                      onValueChange={([v]) => setEffectIntensity((prev) => ({ ...prev, [eid]: v }))}
                      className="flex-1"
                    />
                    <span className="text-[0.6rem] text-k-4 w-8 text-right font-mono">{val}%</span>
                  </div>
                );
              })}
            </div>

            {/* Emoji picker for floating-emojis */}
            {pageEffects.includes("floating-emojis") && (
              <div className="p-3 bg-k-800/50 border border-primary/10 rounded-xl space-y-2">
                <span className="text-[0.72rem] font-semibold text-k-2">🎈 Emojis do efeito flutuante</span>
                <p className="text-[0.58rem] text-k-4">Toque para adicionar/remover. Escolha até 12.</p>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_PALETTE.map((em) => {
                    const isSelected = effectEmojis.includes(em);
                    return (
                      <button
                        key={em}
                        onClick={() => {
                          setEffectEmojis((prev) => {
                            if (prev.includes(em)) return prev.filter((e) => e !== em);
                            if (prev.length >= 12) return prev;
                            return [...prev, em];
                          });
                        }}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all active:scale-90 ${
                          isSelected
                            ? "bg-primary/20 ring-2 ring-primary/40 scale-110"
                            : "bg-k-800 hover:bg-k-700"
                        }`}
                      >
                        {em}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[0.58rem] text-k-4">Selecionados:</span>
                  <div className="flex gap-1">
                    {effectEmojis.map((em, i) => (
                      <span key={i} className="text-sm">{em}</span>
                    ))}
                  </div>
                  {effectEmojis.length > 0 && (
                    <button
                      onClick={() => setEffectEmojis([...DEFAULT_EMOJIS])}
                      className="ml-auto text-[0.58rem] text-k-4 hover:text-primary underline"
                    >
                      Restaurar padrão
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Color picker */}
            <div className="flex items-center gap-3 p-3 bg-k-800/50 border border-primary/10 rounded-xl">
              <label
                className="w-9 h-9 rounded-xl border-2 border-primary/20 cursor-pointer overflow-hidden flex-shrink-0 transition-all hover:border-primary/50 shadow-lg"
                style={{ backgroundColor: effectColor }}
                title="Cor dos efeitos"
              >
                <input
                  type="color"
                  value={effectColor}
                  onChange={(e) => setEffectColor(e.target.value)}
                  className="opacity-0 w-full h-full cursor-pointer"
                />
              </label>
              <div>
                <span className="text-[0.72rem] font-semibold text-k-2">Cor dos efeitos</span>
                <p className="text-[0.58rem] text-k-4">Personalize a cor para combinar com sua marca</p>
              </div>
              <span className="ml-auto font-mono-k text-[0.62rem] text-k-4 bg-k-800 px-2 py-1 rounded-lg">{effectColor}</span>
            </div>
            {/* Presets */}
            <div className="flex gap-1.5 flex-wrap px-1">
              {["#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444", "#06B6D4", "#F97316", "#A855F7", "#6366F1"].map((c) => (
                <button
                  key={c}
                  onClick={() => setEffectColor(c)}
                  className={`w-6 h-6 rounded-full transition-all hover:scale-110 active:scale-95 ${effectColor === c ? "ring-2 ring-offset-2 ring-offset-background ring-primary" : ""}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            {/* Remove all */}
            <button
              onClick={() => setPageEffects([])}
              className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-[0.68rem] font-semibold hover:bg-destructive/20 transition-colors"
            >
              ✕ Remover todos os efeitos
            </button>
          </div>
        )}
      </div>
      <div className="mb-8" data-editor-section="profile">
        <div className={sectionTitle}>🏷 Tags</div>
        <p className="text-[0.68rem] text-k-4 mb-2">Palavras-chave que descrevem seu nicho. Ex: lifestyle, tech, fitness</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-[0.72rem] font-semibold bg-primary/10 text-k-300 border border-primary/20 flex items-center gap-1.5">
              {tag.label}
              <button onClick={() => setTags(tags.filter((_, j) => j !== i))} className="text-k-4 hover:text-k-err ml-1">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Ex: criador de conteúdo" className={inputClass} onKeyDown={(e) => { if (e.key === "Enter" && newTag.trim()) { setTags([...tags, { label: newTag.trim() }]); setNewTag(""); }}} />
          <button onClick={() => { if (newTag.trim()) { setTags([...tags, { label: newTag.trim() }]); setNewTag(""); }}} className="px-4 py-2 bg-primary/20 text-k-300 rounded-xl text-sm font-medium hover:bg-primary/30 transition-colors flex-shrink-0">+</button>
        </div>
      </div>

      <div className="mb-8" data-editor-section="profile">
        <div className={sectionTitle}>📊 Estatísticas</div>
        <p className="text-[0.68rem] text-k-4 mb-2">Números que impressionam. Primeiro o valor, depois o rótulo.</p>
        {stats.map((stat, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <div className="w-[120px] flex-shrink-0">
              <input value={stat.value} onChange={(e) => { const s = [...stats]; s[i] = { ...s[i], value: e.target.value }; setStats(s); }} placeholder="Valor (ex: 2.4M)" className={inputClass} />
            </div>
            <div className="flex-1">
              <input value={stat.label} onChange={(e) => { const s = [...stats]; s[i] = { ...s[i], label: e.target.value }; setStats(s); }} placeholder="Rótulo (ex: Seguidores)" className={inputClass} />
            </div>
            <button onClick={() => setStats(stats.filter((_, j) => j !== i))} className="text-k-4 hover:text-k-err px-2 flex-shrink-0">×</button>
          </div>
        ))}
        <button onClick={() => setStats([...stats, { value: "", label: "" }])} className="text-sm text-k-300 font-medium hover:text-k-200 transition-colors">+ Adicionar estatística</button>
      </div>

      <div className="mb-8">
        <div className={sectionTitle}>🤝 Marcas parceiras</div>
        <p className="text-[0.68rem] text-k-4 mb-2">Marcas com quem você já trabalhou. Adicione o logo!</p>

        {/* Display mode toggle */}
        <div className="flex items-center gap-2 mb-3 bg-k-800 border border-primary/10 rounded-xl p-2.5">
          <span className="text-[0.68rem] text-k-4 font-medium mr-1">Exibição:</span>
          <button
            onClick={() => setBrandsDisplayMode("static")}
            className={`px-3 py-1.5 text-[0.68rem] font-semibold rounded-lg transition-all ${
              brandsDisplayMode === "static"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            }`}
          >
            Estático
          </button>
          <button
            onClick={() => setBrandsDisplayMode("marquee")}
            className={`px-3 py-1.5 text-[0.68rem] font-semibold rounded-lg transition-all ${
              brandsDisplayMode === "marquee"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60"
            }`}
          >
            🎞 Esteira (loop infinito)
          </button>
        </div>
        <div className="flex flex-col gap-2 mb-3">
          {brands.map((brand, i) => (
            <div key={i} className="bg-k-800 border border-primary/10 rounded-xl p-3 flex items-center gap-3">
              {brand.logo_url ? (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-primary/10 group flex-shrink-0">
                  <img src={brand.logo_url} alt="" className="w-full h-full object-contain bg-white/5" />
                  <label className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      openContentCrop(file, 1, async (blob) => {
                        setUploadingContent(`brand-${i}`);
                        const croppedFile = new File([blob], "brand.jpg", { type: "image/jpeg" });
                        const url = await onUploadContentImage(croppedFile, "brand");
                        setUploadingContent(null);
                        setContentCrop(null);
                        if (url) { const arr = [...brands]; arr[i] = { ...arr[i], logo_url: url }; setBrands(arr); toast.success("Logo atualizado!"); }
                      });
                    }} />
                    <span className="text-xs">📷</span>
                  </label>
                </div>
              ) : (
                <label className="w-12 h-12 rounded-xl border border-dashed border-primary/20 flex items-center justify-center cursor-pointer hover:border-k-400 hover:bg-k-glow transition-all flex-shrink-0">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    openContentCrop(file, 1, async (blob) => {
                      setUploadingContent(`brand-${i}`);
                      const croppedFile = new File([blob], "brand.jpg", { type: "image/jpeg" });
                      const url = await onUploadContentImage(croppedFile, "brand");
                      setUploadingContent(null);
                      setContentCrop(null);
                      if (url) { const arr = [...brands]; arr[i] = { ...arr[i], logo_url: url }; setBrands(arr); toast.success("Logo da marca enviado!"); }
                    });
                  }} />
                  {uploadingContent === `brand-${i}` ? <span className="text-xs text-k-4 animate-pulse">⏳</span> : <span className="text-k-4 text-sm">📷</span>}
                </label>
              )}
              <input
                value={brand.name}
                onChange={(e) => { const arr = [...brands]; arr[i] = { ...arr[i], name: e.target.value }; setBrands(arr); }}
                placeholder="Nome da marca"
                className={`${inputClass} flex-1`}
              />
              <button onClick={() => setBrands(brands.filter((_, j) => j !== i))} className="text-k-4 hover:text-k-err px-1">✕</button>
            </div>
          ))}
        </div>
        <p className={sizeHint}>📐 Logo ideal: <strong>200×200px</strong> (1:1, fundo transparente)</p>
        <div className="flex gap-2 mt-2">
          <input value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder="Ex: Nike, Samsung..." className={inputClass} onKeyDown={(e) => { if (e.key === "Enter" && newBrand.trim()) { setBrands([...brands, { name: newBrand.trim() }]); setNewBrand(""); }}} />
          <button onClick={() => { if (newBrand.trim()) { setBrands([...brands, { name: newBrand.trim() }]); setNewBrand(""); }}} className="px-4 py-2 bg-primary/20 text-k-300 rounded-xl text-sm font-medium hover:bg-primary/30 transition-colors flex-shrink-0">+</button>
        </div>
      </div>

      <div className="mb-8">
        <div className={sectionTitle}>📱 Redes Sociais</div>
        <p className="text-[0.68rem] text-k-4 mb-2">Escolha um ícone, nome da rede e link do seu perfil.</p>
        {social.map((s, i) => {
          const displayEmoji = (() => {
            if (s.label && /^\p{Emoji}/u.test(s.label) && s.label.length <= 4) return s.label;
            const opt = getSocialOption(s.platform);
            if (opt) return opt.emoji;
            return "➕";
          })();
          return (
          <div key={i} className="bg-card/60 border border-border rounded-xl p-3 mb-2.5 space-y-2">
            <div className="flex gap-2 items-center">
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowIconPicker(showIconPicker === `social-${i}` ? null : `social-${i}`)}
                  className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center text-lg hover:border-primary/40 hover:scale-110 transition-all"
                  title="Escolher ícone"
                >
                  {displayEmoji}
                </button>
                {showIconPicker === `social-${i}` && (
                  <div className="absolute top-11 left-0 z-50 bg-popover border border-border rounded-xl p-2.5 shadow-lg w-[220px] max-h-[240px] overflow-y-auto">
                    <div className="grid grid-cols-4 gap-1">
                      {socialEmojiOptions.map((opt) => (
                        <button
                          key={opt.emoji}
                          onClick={() => {
                            const arr = [...social];
                            arr[i] = {
                              ...arr[i],
                              label: opt.emoji,
                              platform: opt.label,
                              url: arr[i].url?.trim() ? arr[i].url : opt.baseUrl || "",
                            };
                            setSocial(arr);
                            setShowIconPicker(null);
                          }}
                          className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-accent/20 transition-colors"
                          title={opt.label}
                        >
                          <span className="text-lg">{opt.emoji}</span>
                          <span className="text-[0.58rem] text-muted-foreground leading-tight">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground truncate">{s.platform || "Rede social"}</span>
                  <span className="text-xs text-muted-foreground">{s.platform?.toLowerCase() || ""}</span>
                </div>
              </div>
              <button onClick={() => setSocial(social.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive px-2 text-lg flex-shrink-0">×</button>
            </div>
            <div>
              <label className="block text-[0.65rem] text-muted-foreground mb-1">Link do perfil</label>
              <input
                value={s.url}
                onChange={(e) => {
                  const arr = [...social];
                  arr[i] = { ...arr[i], url: e.target.value };
                  setSocial(arr);
                }}
                onBlur={() => {
                  const arr = [...social];
                  const built = buildSocialUrl(arr[i].platform, arr[i].url);
                  if (built !== arr[i].url) {
                    arr[i] = { ...arr[i], url: built };
                    setSocial(arr);
                  }
                }}
                placeholder={getSocialOption(s.platform)?.placeholder || "Cole o link completo do perfil aqui"}
                className={`${inputClass} w-full`}
              />
            </div>
          </div>
          );
        })}
        <button onClick={() => setSocial([...social, { id: crypto.randomUUID(), creator_id: profile.id, platform: "", label: "", url: "", sort_order: social.length }])} className="text-sm text-foreground/70 font-medium hover:text-foreground transition-colors">+ Adicionar rede social</button>
      </div>

      {/* Section order */}
      <div className="mb-8">
        <div className={sectionTitle}>📐 Ordem das seções</div>
        <p className="text-[0.68rem] text-k-4 mb-3">Arraste para reorganizar a ordem das seções abaixo da bio na página pública.</p>
        <div className="space-y-1.5">
          {sectionOrder.map((sec, i) => {
            const meta: Record<string, { icon: string; label: string }> = {
              spotlight: { icon: "🔥", label: "Campanhas Spotlight" },
              links: { icon: "🔗", label: "Links" },
              products: { icon: "🛍", label: "Produtos" },
              past_campaigns: { icon: "📢", label: "Campanhas Anteriores" },
              hero_reel: { icon: "🎬", label: "Hero Reel" },
            };
            const m = meta[sec] || { icon: "❓", label: sec };
            return (
              <div
                key={sec}
                draggable
                onDragStart={() => setDragSectionIdx(i)}
                onDragEnd={() => setDragSectionIdx(null)}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragSectionIdx === null || dragSectionIdx === i) return;
                  const arr = [...sectionOrder];
                  const [moved] = arr.splice(dragSectionIdx, 1);
                  arr.splice(i, 0, moved);
                  setSectionOrder(arr);
                  setDragSectionIdx(null);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                  dragSectionIdx === i ? "border-primary/50 opacity-50 scale-[0.97]" : "border-primary/10 bg-k-800 hover:border-primary/20"
                }`}
              >
                <div className="text-k-4 hover:text-k-3 transition-colors flex-shrink-0 select-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
                </div>
                <span className="text-lg">{m.icon}</span>
                <span className="text-sm font-semibold text-k-2 flex-1">{m.label}</span>
                <span className="text-[0.6rem] text-k-4 font-mono">{i + 1}º</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8" data-editor-section="links">
        <div className="flex items-center justify-between mb-2">
          <div className={sectionTitle + " mb-0"}>🔗 Links <span className="text-k-3 normal-case tracking-normal font-normal">({links.length})</span></div>
          {links.length > 1 && (
            <div className="flex bg-card border border-border rounded-lg overflow-hidden">
              <button onClick={() => setDisplayModes(d => ({ ...d, links: "list" }))} className={`px-2 py-1 text-[0.6rem] font-semibold transition-all ${displayModes.links === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Lista</button>
              <button onClick={() => setDisplayModes(d => ({ ...d, links: "carousel" }))} className={`px-2 py-1 text-[0.6rem] font-semibold transition-all ${displayModes.links === "carousel" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Carrossel</button>
            </div>
          )}
        </div>
        {links.map((link, i) => (
          <div
            key={link.id}
            draggable
            onDragStart={() => setDragLinkIdx(i)}
            onDragEnd={() => setDragLinkIdx(null)}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragLinkIdx === null || dragLinkIdx === i) return;
              const arr = [...links];
              const [moved] = arr.splice(dragLinkIdx, 1);
              arr.splice(i, 0, moved);
              setLinks(arr);
              setDragLinkIdx(null);
            }}
            className={`bg-k-800 border rounded-xl p-3.5 mb-2 space-y-2 transition-all ${dragLinkIdx === i ? "border-primary/50 opacity-50 scale-[0.97]" : "border-primary/10"}`}
          >
            <div className="flex items-center gap-2">
              {/* Drag handle */}
              <div className="cursor-grab active:cursor-grabbing text-k-4 hover:text-k-3 transition-colors flex-shrink-0 select-none" title="Arrastar para reordenar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
              </div>
              <div className="relative">
                <button onClick={() => setShowIconPicker(showIconPicker === link.id ? null : link.id)} className="w-8 h-8 flex items-center justify-center hover:scale-125 transition-transform">
                  <LinkIcon icon={link.icon} url={link.url} size={16} />
                </button>
                {showIconPicker === link.id && (
                  <div className="absolute top-8 left-0 z-50 bg-k-850 border border-primary/10 rounded-xl p-2.5 shadow-k w-[280px] max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                    <p className="text-[0.58rem] text-k-4 font-bold uppercase tracking-wider mb-2 px-1">Redes Sociais & Sites</p>
                    {linkIconGroups.map((group) => (
                      <div key={group.label} className="mb-2">
                        <p className="text-[0.52rem] text-k-4 font-semibold mb-1 px-1">{group.label}</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {group.keys.map((key) => (
                            <button
                              key={key}
                              onClick={() => { const arr = [...links]; arr[i] = { ...arr[i], icon: key }; setLinks(arr); setShowIconPicker(null); }}
                              className={`p-1.5 rounded-lg transition-all hover:bg-k-glow active:scale-95 ${link.icon === key ? "ring-2 ring-primary bg-k-glow" : ""}`}
                              title={key}
                            >
                              <LinkIcon icon={key} size={12} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <p className="text-[0.58rem] text-k-4 font-bold uppercase tracking-wider mb-1.5 mt-3 px-1">Emojis</p>
                    <div className="grid grid-cols-8 gap-1">
                      {emojiIcons.map((ic) => (
                        <button key={ic} onClick={() => { const arr = [...links]; arr[i] = { ...arr[i], icon: ic }; setLinks(arr); setShowIconPicker(null); }} className={`w-7 h-7 rounded-lg hover:bg-k-glow flex items-center justify-center text-sm transition-colors ${link.icon === ic ? "ring-2 ring-primary bg-k-glow" : ""}`}>{ic}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <input value={link.title} onChange={(e) => { const arr = [...links]; arr[i] = { ...arr[i], title: e.target.value }; setLinks(arr); setValidationErrors((v) => { const n = { ...v }; delete n[`link-title-${i}`]; return n; }); }} placeholder="Título" className={`${inputClass} flex-1 ${validationErrors[`link-title-${i}`] ? "border-destructive/50 focus:border-destructive" : ""}`} />
              <button onClick={() => { const arr = [...links]; arr[i] = { ...arr[i], is_featured: !arr[i].is_featured }; setLinks(arr); }}
                className={`text-xs px-2 py-1 rounded-md transition-all ${link.is_featured ? "bg-primary/20 text-k-300" : "text-k-4 hover:text-k-3"}`}>⭐</button>
              <button onClick={() => { const arr = [...links]; arr[i] = { ...arr[i], is_active: !arr[i].is_active }; setLinks(arr); }}
                className={`w-9 h-5 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0 ${link.is_active ? "bg-emerald-500" : "bg-k-900 border border-primary/10"}`}
                title={link.is_active ? "Visível na página" : "Oculto da página"}>
                <span className={`absolute w-3.5 h-3.5 rounded-full bg-white top-[3px] transition-all duration-300 shadow-sm ${link.is_active ? "left-[18px]" : "left-[3px]"}`} />
              </button>
              <span className={`text-[0.6rem] font-semibold px-1.5 py-0.5 rounded ${link.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                {link.is_active ? "ativo" : "inativo"}
              </span>
              <button onClick={() => setLinks(links.filter((_, j) => j !== i))} className="text-k-4 hover:text-k-err text-xs">✕</button>
            </div>
            {validationErrors[`link-title-${i}`] && <p className="text-[0.68rem] text-destructive -mt-1">{validationErrors[`link-title-${i}`]}</p>}
            <input
              value={link.url}
              onChange={(e) => { const arr = [...links]; arr[i] = { ...arr[i], url: e.target.value }; setLinks(arr); setValidationErrors((v) => { const n = { ...v }; delete n[`link-url-${i}`]; return n; }); }}
              onBlur={() => {
                const detected = detectIconFromUrl(link.url);
                if (detected && (link.icon === "🔗" || !link.icon)) {
                  const arr = [...links]; arr[i] = { ...arr[i], icon: detected }; setLinks(arr);
                }
              }}
              placeholder="https://..."
              className={`${inputClass} ${validationErrors[`link-url-${i}`] ? "border-destructive/50 focus:border-destructive" : ""}`}
            />
            {validationErrors[`link-url-${i}`] && <p className="text-[0.68rem] text-destructive -mt-1">{validationErrors[`link-url-${i}`]}</p>}
            <input value={link.subtitle || ""} onChange={(e) => { const arr = [...links]; arr[i] = { ...arr[i], subtitle: e.target.value }; setLinks(arr); }} placeholder="Descrição (opcional)" className={inputClass} />

            {/* Image upload for link */}
            <div className="flex gap-2 items-center">
              {link.image_url ? (
                <div className="relative w-full h-24 rounded-xl overflow-hidden border border-primary/10 group">
                  <img src={link.image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer text-xs text-k-300 hover:text-k-1 bg-card/80 px-2 py-1 rounded-lg">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        openContentCrop(file, 16 / 9, async (blob) => {
                          setUploadingContent(`link-${i}`);
                          const croppedFile = new File([blob], "link.jpg", { type: "image/jpeg" });
                          const url = await onUploadContentImage(croppedFile, "link");
                          setUploadingContent(null);
                          setContentCrop(null);
                          if (url) { const arr = [...links]; arr[i] = { ...arr[i], image_url: url }; setLinks(arr); }
                        });
                      }} />
                      📷 Trocar
                    </label>
                    <button onClick={() => { const arr = [...links]; arr[i] = { ...arr[i], image_url: null }; setLinks(arr); }} className="text-k-err text-xs font-bold bg-card/80 px-2 py-1 rounded-lg">✕ Remover</button>
                  </div>
                </div>
              ) : (
                <label className="w-full h-16 rounded-xl border border-dashed border-primary/20 flex items-center justify-center gap-2 cursor-pointer hover:border-k-400 hover:bg-k-glow transition-all">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    openContentCrop(file, 16 / 9, async (blob) => {
                      setUploadingContent(`link-${i}`);
                      const croppedFile = new File([blob], "link.jpg", { type: "image/jpeg" });
                      const url = await onUploadContentImage(croppedFile, "link");
                      setUploadingContent(null);
                      setContentCrop(null);
                      if (url) { const arr = [...links]; arr[i] = { ...arr[i], image_url: url }; setLinks(arr); toast.success("Imagem do link enviada!"); }
                    });
                  }} />
                  {uploadingContent === `link-${i}` ? <span className="text-xs text-k-4 animate-pulse">⏳ Enviando...</span> : <><span className="text-k-4 text-sm">🖼</span><span className="text-k-4 text-[0.72rem]">Adicionar imagem (opcional)</span></>}
                </label>
              )}
            </div>

            {/* Display mode toggle */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[0.62rem] text-k-4 font-semibold">Exibição:</span>
              <button
                onClick={() => { const arr = [...links]; arr[i] = { ...arr[i], display_mode: "full" }; setLinks(arr); }}
                className={`px-2.5 py-1 rounded-lg text-[0.62rem] font-semibold transition-all ${link.display_mode === "full" || !link.display_mode ? "bg-primary/20 text-k-300 border border-primary/30" : "text-k-4 border border-primary/10 hover:border-primary/20"}`}
              >
                ▬ Inteiro
              </button>
              <button
                onClick={() => { const arr = [...links]; arr[i] = { ...arr[i], display_mode: "half" }; setLinks(arr); }}
                className={`px-2.5 py-1 rounded-lg text-[0.62rem] font-semibold transition-all ${link.display_mode === "half" ? "bg-primary/20 text-k-300 border border-primary/30" : "text-k-4 border border-primary/10 hover:border-primary/20"}`}
              >
                ◫ Metade
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[0.62rem] text-k-4 font-semibold">Cores:</span>
              <label className="flex items-center gap-1 text-[0.6rem] text-k-4" title="Fundo">
                🎨 <input type="color" value={link.bg_color || "#1a1a2e"} onChange={(e) => { const arr = [...links]; arr[i] = { ...arr[i], bg_color: e.target.value }; setLinks(arr); }} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" />
              </label>
              <label className="flex items-center gap-1 text-[0.6rem] text-k-4" title="Texto">
                Aa <input type="color" value={link.text_color || "#ffffff"} onChange={(e) => { const arr = [...links]; arr[i] = { ...arr[i], text_color: e.target.value }; setLinks(arr); }} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" />
              </label>
              <label className="flex items-center gap-1 text-[0.6rem] text-k-4" title="Borda">
                ▢ <input type="color" value={link.border_color || "#333355"} onChange={(e) => { const arr = [...links]; arr[i] = { ...arr[i], border_color: e.target.value }; setLinks(arr); }} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" />
              </label>
              {(link.bg_color || link.text_color || link.border_color) && (
                <button
                  onClick={() => { const arr = [...links]; arr[i] = { ...arr[i], bg_color: null, text_color: null, border_color: null }; setLinks(arr); }}
                  className="ml-1 px-2 py-0.5 rounded-lg bg-destructive/10 text-destructive text-[0.58rem] font-semibold hover:bg-destructive/20 transition-colors"
                  title="Resetar todas as cores para o padrão"
                >
                  ↺ Resetar
                </button>
              )}
            </div>
          </div>
        ))}
        <p className={sizeHint}>🖼 Imagem ideal: <strong>1280×720px</strong> (16:9, paisagem)</p>
        <button onClick={() => setLinks([...links, { id: crypto.randomUUID(), creator_id: profile.id, title: "", url: "", subtitle: "", icon: "🔗", is_featured: false, is_active: true, sort_order: links.length, bg_color: null, text_color: null, border_color: null, image_url: null, display_mode: "full" as const }])}
          className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-k-glow rounded-xl text-k-4 text-sm font-medium mt-2 transition-all hover:border-k-400 hover:text-k-300 hover:bg-k-glow active:scale-[0.98]">
          + Adicionar link
        </button>
      </div>

      <div className="mb-8" data-editor-section="products">
        <div className="flex items-center justify-between mb-2">
          <div className={sectionTitle + " mb-0"}>🛍 Produtos</div>
          {prods.length > 1 && (
            <div className="flex bg-card border border-border rounded-lg overflow-hidden">
              <button onClick={() => setDisplayModes(d => ({ ...d, products: "list" }))} className={`px-2 py-1 text-[0.6rem] font-semibold transition-all ${displayModes.products === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Grade</button>
              <button onClick={() => setDisplayModes(d => ({ ...d, products: "carousel" }))} className={`px-2 py-1 text-[0.6rem] font-semibold transition-all ${displayModes.products === "carousel" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Carrossel</button>
            </div>
          )}
        </div>
        {prods.map((prod, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => setDragProdIdx(i)}
            onDragEnd={() => setDragProdIdx(null)}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragProdIdx === null || dragProdIdx === i) return;
              const arr = [...prods];
              const [moved] = arr.splice(dragProdIdx, 1);
              arr.splice(i, 0, moved);
              setProds(arr);
              setDragProdIdx(null);
            }}
            className={`bg-k-800 border rounded-xl p-3.5 mb-2 space-y-2 transition-all ${dragProdIdx === i ? "border-primary/50 opacity-50 scale-[0.97]" : "border-primary/10"}`}
          >
            <div className="flex gap-2 items-center">
              {/* Drag handle */}
              <div className="cursor-grab active:cursor-grabbing text-k-4 hover:text-k-3 transition-colors flex-shrink-0 select-none" title="Arrastar para reordenar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
              </div>
              <div className="relative">
                <button onClick={() => setShowIconPicker(showIconPicker === `prod-${i}` ? null : `prod-${i}`)} className="text-lg hover:scale-125 transition-transform">{prod.icon}</button>
                {showIconPicker === `prod-${i}` && (
                  <div className="absolute top-8 left-0 z-50 bg-k-850 border border-primary/10 rounded-xl p-2 shadow-k grid grid-cols-4 gap-1 w-[160px]">
                    {emojiIcons.map((ic) => (
                      <button key={ic} onClick={() => { const arr = [...prods]; arr[i] = { ...arr[i], icon: ic }; setProds(arr); setShowIconPicker(null); }} className="w-8 h-8 rounded-lg hover:bg-k-glow flex items-center justify-center text-sm transition-colors">{ic}</button>
                    ))}
                  </div>
                )}
              </div>
              <input value={prod.title} onChange={(e) => { const arr = [...prods]; arr[i] = { ...arr[i], title: e.target.value }; setProds(arr); setValidationErrors((v) => { const n = { ...v }; delete n[`prod-title-${i}`]; return n; }); }} placeholder="Nome do produto" className={`${inputClass} flex-1 ${validationErrors[`prod-title-${i}`] ? "border-destructive/50 focus:border-destructive" : ""}`} />
              <button onClick={() => { const arr = [...prods]; arr[i] = { ...arr[i], is_active: !(arr[i].is_active ?? true) }; setProds(arr); }}
                className={`w-9 h-5 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0 ${(prod.is_active ?? true) ? "bg-emerald-500" : "bg-k-900 border border-primary/10"}`}
                title={(prod.is_active ?? true) ? "Visível na página" : "Oculto da página"}>
                <span className={`absolute w-3.5 h-3.5 rounded-full bg-white top-[3px] transition-all duration-300 shadow-sm ${(prod.is_active ?? true) ? "left-[18px]" : "left-[3px]"}`} />
              </button>
              <span className={`text-[0.6rem] font-semibold px-1.5 py-0.5 rounded ${(prod.is_active ?? true) ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                {(prod.is_active ?? true) ? "ativo" : "inativo"}
              </span>
              <button onClick={() => setProds(prods.filter((_, j) => j !== i))} className="text-k-4 hover:text-k-err text-xs">✕</button>
            </div>
            {validationErrors[`prod-title-${i}`] && <p className="text-[0.68rem] text-destructive -mt-1">{validationErrors[`prod-title-${i}`]}</p>}
            {/* Product image upload with crop */}
            <div className="flex gap-2 items-center">
              {prod.image_url ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-primary/10 group flex-shrink-0">
                  <img src={prod.image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <label className="cursor-pointer text-xs text-k-300 hover:text-k-1">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        openContentCrop(file, 1, async (blob) => {
                          setUploadingContent(`prod-${i}`);
                          const croppedFile = new File([blob], "product.jpg", { type: "image/jpeg" });
                          const url = await onUploadContentImage(croppedFile, "product");
                          setUploadingContent(null);
                          setContentCrop(null);
                          if (url) { const arr = [...prods]; arr[i] = { ...arr[i], image_url: url }; setProds(arr); }
                        });
                      }} />
                      📷
                    </label>
                    <button onClick={() => { const arr = [...prods]; arr[i] = { ...arr[i], image_url: "" }; setProds(arr); }} className="text-k-err text-xs font-bold">✕</button>
                  </div>
                </div>
              ) : (
                <label className="w-16 h-16 rounded-xl border border-dashed border-primary/20 flex items-center justify-center cursor-pointer hover:border-k-400 hover:bg-k-glow transition-all flex-shrink-0">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    openContentCrop(file, 1, async (blob) => {
                      setUploadingContent(`prod-${i}`);
                      const croppedFile = new File([blob], "product.jpg", { type: "image/jpeg" });
                      const url = await onUploadContentImage(croppedFile, "product");
                      setUploadingContent(null);
                      setContentCrop(null);
                      if (url) { const arr = [...prods]; arr[i] = { ...arr[i], image_url: url }; setProds(arr); toast.success("Imagem do produto enviada!"); }
                    });
                  }} />
                  {uploadingContent === `prod-${i}` ? <span className="text-xs text-k-4 animate-pulse">⏳</span> : <span className="text-k-4 text-lg">📷</span>}
                </label>
              )}
              <div className="flex-1 flex gap-2">
                <input value={prod.price} onChange={(e) => { const arr = [...prods]; arr[i] = { ...arr[i], price: e.target.value }; setProds(arr); }} placeholder="R$ 0,00" className={`${inputClass} w-28`} />
                <input value={prod.url || ""} onChange={(e) => { const arr = [...prods]; arr[i] = { ...arr[i], url: e.target.value }; setProds(arr); setValidationErrors((v) => { const n = { ...v }; delete n[`prod-url-${i}`]; return n; }); }} placeholder="Link de compra" className={`${inputClass} flex-1 ${validationErrors[`prod-url-${i}`] ? "border-destructive/50 focus:border-destructive" : ""}`} />
              </div>
            </div>
            {validationErrors[`prod-url-${i}`] && <p className="text-[0.68rem] text-destructive -mt-1">{validationErrors[`prod-url-${i}`]}</p>}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[0.62rem] text-k-4 font-semibold">Cores:</span>
              <label className="flex items-center gap-1 text-[0.6rem] text-k-4" title="Fundo">
                🎨 <input type="color" value={prod.bg_color || "#1a1a2e"} onChange={(e) => { const arr = [...prods]; arr[i] = { ...arr[i], bg_color: e.target.value }; setProds(arr); }} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" />
              </label>
              <label className="flex items-center gap-1 text-[0.6rem] text-k-4" title="Texto">
                Aa <input type="color" value={prod.text_color || "#ffffff"} onChange={(e) => { const arr = [...prods]; arr[i] = { ...arr[i], text_color: e.target.value }; setProds(arr); }} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" />
              </label>
              <label className="flex items-center gap-1 text-[0.6rem] text-k-4" title="Borda">
                ▢ <input type="color" value={prod.border_color || "#333355"} onChange={(e) => { const arr = [...prods]; arr[i] = { ...arr[i], border_color: e.target.value }; setProds(arr); }} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" />
              </label>
              {(prod.bg_color || prod.text_color || prod.border_color) && (
                <button
                  onClick={() => { const arr = [...prods]; arr[i] = { ...arr[i], bg_color: null, text_color: null, border_color: null }; setProds(arr); }}
                  className="ml-1 px-2 py-0.5 rounded-lg bg-destructive/10 text-destructive text-[0.58rem] font-semibold hover:bg-destructive/20 transition-colors"
                  title="Resetar todas as cores para o padrão"
                >
                  ↺ Resetar
                </button>
              )}
            </div>
          </div>
        ))}
        <p className={sizeHint}>📐 Imagem ideal: <strong>400×400px</strong> (1:1, quadrada)</p>
        <button onClick={() => setProds([...prods, { id: crypto.randomUUID(), creator_id: profile.id, title: "", price: "", icon: "📦", url: "", image_url: "", sort_order: prods.length, is_active: true, bg_color: null, text_color: null, border_color: null }])}
          className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-k-glow rounded-xl text-k-4 text-sm font-medium mt-2 transition-all hover:border-k-400 hover:text-k-300 hover:bg-k-glow active:scale-[0.98]">
          + Adicionar produto
        </button>
      </div>

      <div className="mb-8" data-editor-section="past_campaigns">
        <div className="flex items-center justify-between mb-2">
          <div className={sectionTitle + " mb-0"}>📢 Campanhas / Spotlight</div>
          {camps.length > 1 && (
            <div className="flex bg-card border border-border rounded-lg overflow-hidden">
              <button onClick={() => setDisplayModes(d => ({ ...d, campaigns: "list" }))} className={`px-2 py-1 text-[0.6rem] font-semibold transition-all ${displayModes.campaigns === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Lista</button>
              <button onClick={() => setDisplayModes(d => ({ ...d, campaigns: "carousel" }))} className={`px-2 py-1 text-[0.6rem] font-semibold transition-all ${displayModes.campaigns === "carousel" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Carrossel</button>
            </div>
          )}
        </div>
        <p className="text-[0.68rem] text-k-4 mb-3">Campanhas marcadas como <strong>"Ao vivo"</strong> aparecem automaticamente no <strong>topo da página</strong> com destaque visual (Spotlight).</p>
        {camps.map((camp, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => setDragCampIdx(i)}
            onDragEnd={() => setDragCampIdx(null)}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragCampIdx === null || dragCampIdx === i) return;
              const arr = [...camps];
              const [moved] = arr.splice(dragCampIdx, 1);
              arr.splice(i, 0, moved);
              setCamps(arr);
              setDragCampIdx(null);
            }}
            className={`border rounded-xl p-3.5 mb-2 space-y-2 transition-all ${dragCampIdx === i ? "border-primary/50 opacity-50 scale-[0.97]" : camp.live ? "bg-primary/5 border-primary/25 shadow-k-purple" : "bg-k-800 border-primary/10"}`}
          >
            <div className="flex gap-2 items-center">
              {/* Drag handle */}
              <div className="cursor-grab active:cursor-grabbing text-k-4 hover:text-k-3 transition-colors flex-shrink-0 select-none" title="Arrastar para reordenar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
              </div>
              <input value={camp.title} onChange={(e) => { const arr = [...camps]; arr[i] = { ...arr[i], title: e.target.value }; setCamps(arr); setValidationErrors((v) => { const n = { ...v }; delete n[`camp-title-${i}`]; return n; }); }} placeholder="Título da campanha" className={`${inputClass} flex-1 ${validationErrors[`camp-title-${i}`] ? "border-destructive/50 focus:border-destructive" : ""}`} />
              <label className={`flex items-center gap-1.5 text-[0.72rem] cursor-pointer px-2 py-1 rounded-lg transition-all ${camp.live ? "text-k-err font-bold bg-k-err/10" : "text-k-3"}`}>
                <input type="checkbox" checked={camp.live} onChange={(e) => { const arr = [...camps]; arr[i] = { ...arr[i], live: e.target.checked }; setCamps(arr); }} className="accent-primary" />
                {camp.live ? "🔥 Spotlight" : "Ao vivo"}
              </label>
              <button onClick={() => { const arr = [...camps]; arr[i] = { ...arr[i], is_active: !(arr[i].is_active ?? true) }; setCamps(arr); }}
                className={`w-9 h-5 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0 ${(camp.is_active ?? true) ? "bg-emerald-500" : "bg-k-900 border border-primary/10"}`}
                title={(camp.is_active ?? true) ? "Visível na página" : "Oculto da página"}>
                <span className={`absolute w-3.5 h-3.5 rounded-full bg-white top-[3px] transition-all duration-300 shadow-sm ${(camp.is_active ?? true) ? "left-[18px]" : "left-[3px]"}`} />
              </button>
              <span className={`text-[0.6rem] font-semibold px-1.5 py-0.5 rounded ${(camp.is_active ?? true) ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                {(camp.is_active ?? true) ? "ativo" : "inativo"}
              </span>
              <button onClick={() => setDeleteCampTarget(i)} className="text-k-4 hover:text-k-err text-xs">✕</button>
            </div>
            {validationErrors[`camp-title-${i}`] && <p className="text-[0.68rem] text-destructive -mt-1">{validationErrors[`camp-title-${i}`]}</p>}
            {camp.live && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2 py-1.5 bg-primary/10 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-k-err animate-k-live-dot" />
                  <span className="text-[0.65rem] text-k-300 font-semibold">Esta campanha aparecerá em destaque no topo da página</span>
                </div>
                <div>
                  <label className={labelClass}>⏱ Duração do Spotlight (dias)</label>
                  <div className="flex gap-2 items-center">
                    <select
                      value={(() => {
                        if (!camp.expires_at) return "indefinido";
                        const diff = Math.round((new Date(camp.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        if (diff <= 1) return "1";
                        if (diff <= 3) return "3";
                        if (diff <= 7) return "7";
                        if (diff <= 14) return "14";
                        return "30";
                      })()}
                      onChange={(e) => {
                        const arr = [...camps];
                        if (e.target.value === "indefinido") {
                          arr[i] = { ...arr[i], expires_at: null };
                        } else {
                          const days = parseInt(e.target.value);
                          const exp = new Date();
                          exp.setDate(exp.getDate() + days);
                          arr[i] = { ...arr[i], expires_at: exp.toISOString() };
                        }
                        setCamps(arr);
                      }}
                      className={`${inputClass} w-40`}
                    >
                      <option value="indefinido">♾ Sem limite</option>
                      <option value="1">1 dia</option>
                      <option value="3">3 dias</option>
                      <option value="7">7 dias</option>
                      <option value="14">14 dias</option>
                      <option value="30">30 dias</option>
                    </select>
                    {camp.expires_at && (
                      <span className="text-[0.65rem] text-k-warn font-semibold">
                        Expira em: {new Date(camp.expires_at).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            <input value={camp.description || ""} onChange={(e) => { const arr = [...camps]; arr[i] = { ...arr[i], description: e.target.value }; setCamps(arr); }} placeholder="Descrição" className={inputClass} />
            <input value={camp.url || ""} onChange={(e) => { const arr = [...camps]; arr[i] = { ...arr[i], url: e.target.value }; setCamps(arr); setValidationErrors((v) => { const n = { ...v }; delete n[`camp-url-${i}`]; return n; }); }} placeholder="URL da campanha" className={`${inputClass} ${validationErrors[`camp-url-${i}`] ? "border-destructive/50 focus:border-destructive" : ""}`} />
            {validationErrors[`camp-url-${i}`] && <p className="text-[0.68rem] text-destructive -mt-1">{validationErrors[`camp-url-${i}`]}</p>}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[0.62rem] text-k-4 font-semibold">Cores:</span>
              <label className="flex items-center gap-1 text-[0.6rem] text-k-4" title="Fundo">
                🎨 <input type="color" value={camp.bg_color || "#1a1a2e"} onChange={(e) => { const arr = [...camps]; arr[i] = { ...arr[i], bg_color: e.target.value }; setCamps(arr); }} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" />
              </label>
              <label className="flex items-center gap-1 text-[0.6rem] text-k-4" title="Texto">
                Aa <input type="color" value={camp.text_color || "#ffffff"} onChange={(e) => { const arr = [...camps]; arr[i] = { ...arr[i], text_color: e.target.value }; setCamps(arr); }} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" />
              </label>
              <label className="flex items-center gap-1 text-[0.6rem] text-k-4" title="Borda">
                ▢ <input type="color" value={camp.border_color || "#333355"} onChange={(e) => { const arr = [...camps]; arr[i] = { ...arr[i], border_color: e.target.value }; setCamps(arr); }} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent" />
              </label>
              {(camp.bg_color || camp.text_color || camp.border_color) && (
                <button
                  onClick={() => { const arr = [...camps]; arr[i] = { ...arr[i], bg_color: null, text_color: null, border_color: null }; setCamps(arr); }}
                  className="ml-1 px-2 py-0.5 rounded-lg bg-destructive/10 text-destructive text-[0.58rem] font-semibold hover:bg-destructive/20 transition-colors"
                  title="Resetar todas as cores para o padrão"
                >
                  ↺ Resetar
                </button>
              )}
            </div>
            {/* Campaign image upload with crop */}
            {camp.image_url ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-primary/10 group">
                <img src={camp.image_url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => { const arr = [...camps]; arr[i] = { ...arr[i], image_url: "" }; setCamps(arr); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center text-k-err text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity border border-primary/10"
                >✕</button>
                <label className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    openContentCrop(file, 16 / 9, async (blob) => {
                      setUploadingContent(`camp-${i}`);
                      const croppedFile = new File([blob], "campaign.jpg", { type: "image/jpeg" });
                      const url = await onUploadContentImage(croppedFile, "campaign");
                      setUploadingContent(null);
                      setContentCrop(null);
                      if (url) { const arr = [...camps]; arr[i] = { ...arr[i], image_url: url }; setCamps(arr); toast.success("Imagem da campanha atualizada!"); }
                    });
                  }} />
                  <span className="text-sm text-background font-semibold bg-primary px-4 py-2 rounded-xl shadow-lg">📷 Trocar imagem</span>
                </label>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full h-24 border border-dashed border-primary/20 rounded-xl cursor-pointer hover:border-k-400 hover:bg-k-glow transition-all">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  openContentCrop(file, 16 / 9, async (blob) => {
                    setUploadingContent(`camp-${i}`);
                    const croppedFile = new File([blob], "campaign.jpg", { type: "image/jpeg" });
                    const url = await onUploadContentImage(croppedFile, "campaign");
                    setUploadingContent(null);
                    setContentCrop(null);
                    if (url) { const arr = [...camps]; arr[i] = { ...arr[i], image_url: url }; setCamps(arr); toast.success("Imagem da campanha enviada!"); }
                  });
                }} />
                {uploadingContent === `camp-${i}` ? (
                  <span className="text-sm text-k-4 animate-pulse">Enviando imagem...</span>
                ) : (
                  <span className="text-sm text-k-4">📷 Adicionar imagem da campanha</span>
                )}
              </label>
            )}
          </div>
        ))}
        <p className={sizeHint}>📐 Imagem ideal: <strong>1280×720px</strong> (16:9, paisagem)</p>
        <button onClick={() => setCamps([...camps, { id: crypto.randomUUID(), creator_id: profile.id, title: "", description: "", image_url: "", url: "", live: false, is_active: true, sort_order: camps.length, expires_at: null, bg_color: null, text_color: null, border_color: null }])}
          className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-k-glow rounded-xl text-k-4 text-sm font-medium mt-2 transition-all hover:border-k-400 hover:text-k-300 hover:bg-k-glow active:scale-[0.98]">
          + Adicionar campanha
        </button>
      </div>

      {/* 🎙 Spotify Embed */}
      <div className="mb-8" data-editor-section="spotify">
        <div className={sectionTitle}>🎙 Spotify / Podcast</div>
        <p className="text-[0.68rem] text-k-4 mb-3">Cole o link do seu podcast ou perfil no Spotify para exibir o player embutido.</p>
        <input
          value={spotifyUrl}
          onChange={e => setSpotifyUrl(e.target.value)}
          placeholder="https://open.spotify.com/show/..."
          className={inputClass}
        />
      </div>

      {/* ⭐ Depoimentos */}
      <div className="mb-8" data-editor-section="testimonials">
        <div className={sectionTitle}>⭐ Depoimentos <span className="text-k-3 normal-case tracking-normal font-normal">({testimonialsList.length})</span></div>
        <p className="text-[0.68rem] text-k-4 mb-3">Adicione depoimentos de clientes para aumentar sua credibilidade.</p>
        {testimonialsList.map((t, i) => (
          <div key={t.id}
            draggable
            onDragStart={() => setDragTestimonialIdx(i)}
            onDragEnd={() => setDragTestimonialIdx(null)}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragTestimonialIdx === null || dragTestimonialIdx === i) return;
              const arr = [...testimonialsList];
              const [moved] = arr.splice(dragTestimonialIdx, 1);
              arr.splice(i, 0, moved);
              setTestimonialsList(arr);
              setDragTestimonialIdx(null);
            }}
            className={`bg-k-800 border rounded-2xl p-4 mb-3 space-y-2 transition-all cursor-grab active:cursor-grabbing ${dragTestimonialIdx === i ? "border-primary/50 opacity-50 scale-[0.97]" : "border-primary/10"}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-k-2 flex items-center gap-1.5">
                <span className="text-muted-foreground cursor-grab">⠿</span>
                Depoimento {i + 1}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setTestimonialsList(testimonialsList.map((x, j) => j === i ? { ...x, is_active: !x.is_active } : x))}
                  className={`w-9 h-5 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0 ${t.is_active ? "bg-emerald-500" : "bg-k-900 border border-primary/10"}`}
                  title={t.is_active ? "Visível na página" : "Oculto da página"}>
                  <span className={`absolute w-3.5 h-3.5 rounded-full bg-white top-[3px] transition-all duration-300 shadow-sm ${t.is_active ? "left-[18px]" : "left-[3px]"}`} />
                </button>
                <span className={`text-[0.6rem] font-semibold px-1.5 py-0.5 rounded ${t.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                  {t.is_active ? "ativo" : "inativo"}
                </span>
                <button onClick={() => setTestimonialsList(testimonialsList.filter((_, j) => j !== i))} className="text-k-4 hover:text-red-400 text-xs">✕</button>
              </div>
            </div>
            {/* Avatar upload */}
            <div className="flex items-start gap-3">
              <div className="relative group flex-shrink-0">
                {t.author_avatar_url ? (
                  <img src={t.author_avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary border border-border">
                    {t.author_name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await onUploadContentImage(file, "testimonials");
                    if (url) setTestimonialsList(testimonialsList.map((x, j) => j === i ? { ...x, author_avatar_url: url } : x));
                  }} />
                  <span className="text-xs font-semibold text-foreground">📷</span>
                </label>
              </div>
              <div className="flex-1 space-y-2">
                <textarea value={t.content} onChange={e => setTestimonialsList(testimonialsList.map((x, j) => j === i ? { ...x, content: e.target.value } : x))}
                  placeholder="O que o cliente disse..." className={`${inputClass} min-h-[60px] resize-none`} />
                <div className="grid grid-cols-2 gap-2">
                  <input value={t.author_name} onChange={e => setTestimonialsList(testimonialsList.map((x, j) => j === i ? { ...x, author_name: e.target.value } : x))}
                    placeholder="Nome do autor" className={inputClass} />
                  <input value={t.author_role} onChange={e => setTestimonialsList(testimonialsList.map((x, j) => j === i ? { ...x, author_role: e.target.value } : x))}
                    placeholder="Cargo / Empresa" className={inputClass} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Nota:</span>
                  {[1,2,3,4,5].map(star => (
                    <button key={star} type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTestimonialsList(prev => prev.map((x, j) => j === i ? { ...x, rating: star } : x)); }}
                      className={`text-lg cursor-pointer transition-transform hover:scale-125 ${star <= (t.rating || 0) ? "text-yellow-400" : "text-muted-foreground/30"}`}>★</button>
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">{t.rating || 0}/5</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => setTestimonialsList([...testimonialsList, { id: crypto.randomUUID(), creator_id: profile.id, author_name: "", author_role: "", author_avatar_url: "", content: "", rating: 5, is_active: true, sort_order: testimonialsList.length }])}
          className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-k-glow rounded-xl text-k-4 text-sm font-medium mt-2 transition-all hover:border-k-400 hover:text-k-300 hover:bg-k-glow active:scale-[0.98]">
          + Adicionar depoimento
        </button>
      </div>

      {/* Hero Reel Editor */}
      <div data-editor-section="hero_reel">
      <HeroReelEditor
        reels={heroReels}
        onChange={setHeroReels}
        creatorId={profile.id}
        agencyId={profile.agency_id || ""}
        onUploadContentImage={onUploadContentImage}
      />
      </div>

      <div className="sticky bottom-4 z-10">
        <button onClick={() => void handleSaveAll()} disabled={saving || Boolean(uploadingImage) || Boolean(uploadingContent)}
          className="w-full py-4 gradient-primary text-primary-foreground font-bold text-sm rounded-2xl transition-all duration-300 hover:shadow-k-purple-lg active:scale-[0.98] disabled:opacity-50 shadow-k-purple">
          {uploadingImage || uploadingContent ? "Enviando imagem..." : saving ? "Salvando..." : "💾 Salvar tudo"}
        </button>
      </div>

      {/* Avatar/Cover cropper */}
      {cropImage && (
        <ImageCropper
          imageSrc={cropImage.src}
          aspect={
            cropImage.type === "avatar" || cropImage.type === "avatar_layout2" ? 1
            : cropImage.type === "cover_layout2" ? 4 / 5
            : 16 / 5
          }
          cropShape={cropImage.type === "avatar" || cropImage.type === "avatar_layout2" ? "round" : "rect"}
          onCropDone={(blob) => handleCropDone(blob, cropImage.type)}
          onCancel={() => setCropImage(null)}
        />
      )}

      {/* Content image cropper (products, campaigns, brands) */}
      {contentCrop && (
        <ImageCropper
          imageSrc={contentCrop.src}
          aspect={contentCrop.aspect}
          cropShape={contentCrop.cropShape}
          onCropDone={(blob) => contentCrop.onDone(blob)}
          onCancel={() => setContentCrop(null)}
        />
      )}

      {/* Campaign delete confirmation */}
      <ConfirmDialog
        open={deleteCampTarget !== null}
        onOpenChange={(open) => !open && setDeleteCampTarget(null)}
        title="Excluir Campanha"
        description={`Tem certeza que deseja excluir a campanha "${deleteCampTarget !== null ? camps[deleteCampTarget]?.title || "Sem título" : ""}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir campanha"
        variant="destructive"
        onConfirm={() => {
          if (deleteCampTarget !== null) {
            setCamps(camps.filter((_, j) => j !== deleteCampTarget));
            setDeleteCampTarget(null);
            toast.success("Campanha removida. Salve para confirmar.");
          }
        }}
      />
    </div>
        </div>

        {/* Preview column — fixed phone mockup on the right */}
        {showPreview && (
          <div className="hidden md:block fixed right-0 w-[440px] bottom-0 p-4 overflow-hidden z-30" style={{ top: previewTopOffset }}>
            <CreatorLivePreview
              profile={liveProfile}
              links={links}
              socialLinks={social}
              products={prods}
              campaigns={camps}
              heroReels={heroReels}
              testimonials={testimonialsList}
              activeLayout={activeLayout}
              focusSection={focusSection}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default CreatorEditPanel;
