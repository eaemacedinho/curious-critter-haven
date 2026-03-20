import { forwardRef, useImperativeHandle, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign } from "@/hooks/useCreatorData";
import ImageCropper from "./ImageCropper";

const iconOptions = ["⭐", "▶", "🎵", "📄", "🛍", "📸", "🎮", "💼", "🎨", "📚", "🔗", "💰", "🎧", "📦", "🎬", "💎"];

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
  onSaveProfile: (updates: Partial<CreatorProfile>) => Promise<void>;
  onSaveLinks: (links: CreatorLink[]) => Promise<void>;
  onSaveSocialLinks: (links: SocialLink[]) => Promise<void>;
  onSaveProducts: (products: CreatorProduct[]) => Promise<void>;
  onSaveCampaigns: (campaigns: CreatorCampaign[]) => Promise<void>;
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
    onSaveProfile,
    onSaveLinks,
    onSaveSocialLinks,
    onSaveProducts,
    onSaveCampaigns,
    onUploadImage,
    onUploadContentImage,
    onDone,
  }: Props,
  ref
) {
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio || "");
  const [tags, setTags] = useState(profile.tags || []);
  const [stats, setStats] = useState(profile.stats || []);
  const [brands, setBrands] = useState(profile.brands || []);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [coverUrl, setCoverUrl] = useState(profile.cover_url || "");
  const [avatarUrlL2, setAvatarUrlL2] = useState(profile.avatar_url_layout2 || "");
  const [coverUrlL2, setCoverUrlL2] = useState(profile.cover_url_layout2 || "");
  const [links, setLinks] = useState(initialLinks);
  const [social, setSocial] = useState(initialSocial);
  const [prods, setProds] = useState(initialProducts);
  const [camps, setCamps] = useState(initialCampaigns);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<"avatar" | "cover" | null>(null);
  const [uploadingContent, setUploadingContent] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [cropImage, setCropImage] = useState<{ src: string; type: "avatar" | "cover"; file: File } | null>(null);
  const [contentCrop, setContentCrop] = useState<ContentCropState>(null);

  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (file: File, type: "avatar" | "cover") => {
    const reader = new FileReader();
    reader.onload = () => setCropImage({ src: reader.result as string, type, file });
    reader.readAsDataURL(file);
  };

  const handleCropDone = async (blob: Blob, type: "avatar" | "cover") => {
    try {
      setUploadingImage(type);
      const file = new File([blob], `${type}.jpg`, { type: "image/jpeg" });
      const url = await onUploadImage(file, type);
      if (!url) return;
      if (type === "avatar") setAvatarUrl(url);
      else setCoverUrl(url);
      setCropImage(null);
      toast.success(type === "avatar" ? "Foto atualizada!" : "Capa atualizada!");
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

    try {
      setSaving(true);

      if (cropImage) {
        const { file, type } = cropImage;
        const url = await onUploadImage(file, type);
        if (url) {
          if (type === "avatar") setAvatarUrl(url);
          else setCoverUrl(url);
          if (type === "avatar") {
            await onSaveProfile({ name, handle, bio, avatar_url: url, cover_url: coverUrl, tags, stats, brands });
          } else {
            await onSaveProfile({ name, handle, bio, avatar_url: avatarUrl, cover_url: url, tags, stats, brands });
          }
        } else {
          toast.error("Falha ao salvar imagem pendente.");
          return false;
        }
        setCropImage(null);
      } else {
        await onSaveProfile({ name, handle, bio, avatar_url: avatarUrl, cover_url: coverUrl, tags, stats, brands });
      }

      await onSaveLinks(links);
      await onSaveSocialLinks(social);
      await onSaveProducts(prods);
      await onSaveCampaigns(camps);
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

  return (
    <div className="max-w-[560px] mx-auto px-6 py-8 pt-20 animate-k-fade-up">
      <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0], "avatar")} />
      <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0], "cover")} />

      <div className="mb-6">
        <div className={sectionTitle}>🖼 Foto de Capa</div>
        <div className="relative w-full h-[160px] rounded-2xl overflow-hidden border border-primary/10 group cursor-pointer" onClick={() => coverRef.current?.click()}>
          {coverUrl ? (
            <img src={coverUrl} alt="cover" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-k-800 flex items-center justify-center text-k-4 text-sm">Clique para adicionar capa</div>
          )}
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-sm text-primary-foreground font-semibold bg-primary/80 backdrop-blur-sm px-4 py-2 rounded-xl">
              {uploadingImage === "cover" ? "Enviando capa..." : "📷 Alterar capa"}
            </span>
          </div>
        </div>
        <p className={sizeHint}>📐 Tamanho ideal: <strong>1600×500px</strong> (proporção 16:5)</p>
      </div>

      <div className="mb-8">
        <div className={sectionTitle}>👤 Perfil</div>
        <div className="flex items-center gap-4 mb-4">
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
        <div className="space-y-3">
          <div><label className={labelClass}>Nome</label><input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Seu nome ou nome artístico" /></div>
          <div>
            <label className={labelClass}>Handle</label>
            <input value={handle} onChange={(e) => setHandle(e.target.value)} className={inputClass} placeholder="seunome" />
            <p className="text-[0.68rem] text-k-4 mt-1">Identificador único, sem espaços. Ex: joaosilva, ana.creator</p>
          </div>
          <div>
            <label className={labelClass}>Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} className={`${inputClass} resize-none min-h-[72px]`} placeholder="Conte um pouco sobre você, o que faz e o que inspira seu conteúdo..." />
            <div className="text-[0.68rem] text-k-4 text-right mt-1">{bio.length}/300</div>
          </div>
        </div>
      </div>

      <div className="mb-8">
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

      <div className="mb-8">
        <div className={sectionTitle}>📊 Estatísticas</div>
        <p className="text-[0.68rem] text-k-4 mb-2">Números que impressionam. Primeiro o valor, depois o rótulo.</p>
        {stats.map((stat, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input value={stat.value} onChange={(e) => { const s = [...stats]; s[i] = { ...s[i], value: e.target.value }; setStats(s); }} placeholder="Ex: 2.4M" className={`${inputClass} w-1/3`} />
            <input value={stat.label} onChange={(e) => { const s = [...stats]; s[i] = { ...s[i], label: e.target.value }; setStats(s); }} placeholder="Ex: Seguidores" className={`${inputClass} flex-1`} />
            <button onClick={() => setStats(stats.filter((_, j) => j !== i))} className="text-k-4 hover:text-k-err px-2">×</button>
          </div>
        ))}
        <button onClick={() => setStats([...stats, { value: "", label: "" }])} className="text-sm text-k-300 font-medium hover:text-k-200 transition-colors">+ Adicionar estatística</button>
      </div>

      <div className="mb-8">
        <div className={sectionTitle}>🤝 Marcas parceiras</div>
        <p className="text-[0.68rem] text-k-4 mb-2">Marcas com quem você já trabalhou. Adicione o logo!</p>
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
        {social.map((s, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <div className="relative">
              <button
                onClick={() => setShowIconPicker(showIconPicker === `social-${i}` ? null : `social-${i}`)}
                className="w-10 h-10 bg-k-800 border border-primary/10 rounded-xl flex items-center justify-center text-lg hover:border-k-400 hover:scale-110 transition-all"
                title="Escolher ícone"
              >
                {s.label || "➕"}
              </button>
              {showIconPicker === `social-${i}` && (
                <div className="absolute top-11 left-0 z-50 bg-k-850 border border-primary/10 rounded-xl p-2.5 shadow-k w-[220px] max-h-[240px] overflow-y-auto">
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
                        className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-k-glow transition-colors"
                        title={opt.label}
                      >
                        <span className="text-lg">{opt.emoji}</span>
                        <span className="text-[0.58rem] text-k-4 leading-tight">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input value={s.platform} onChange={(e) => { const arr = [...social]; arr[i] = { ...arr[i], platform: e.target.value }; setSocial(arr); }} placeholder="Ex: Instagram" className={`${inputClass} w-28`} />
            <div className="flex-1 relative">
              {getSocialOption(s.platform)?.baseUrl && s.url && !s.url.startsWith("http") && !s.url.startsWith("mailto:") ? (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-k-4 text-[0.72rem] pointer-events-none select-none">
                  {getSocialOption(s.platform)!.baseUrl}
                </span>
              ) : null}
              <input
                value={extractHandle(s.platform, s.url)}
                onChange={(e) => {
                  const arr = [...social];
                  const raw = e.target.value;
                  arr[i] = { ...arr[i], url: raw };
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
                placeholder={getSocialOption(s.platform)?.placeholder || "https://..."}
                className={inputClass}
              />
            </div>
            <button onClick={() => setSocial(social.filter((_, j) => j !== i))} className="text-k-4 hover:text-k-err px-2">×</button>
          </div>
        ))}
        <button onClick={() => setSocial([...social, { id: crypto.randomUUID(), creator_id: profile.id, platform: "", label: "", url: "", sort_order: social.length }])} className="text-sm text-k-300 font-medium hover:text-k-200 transition-colors">+ Adicionar rede social</button>
      </div>

      <div className="mb-8">
        <div className={sectionTitle}>🔗 Links <span className="text-k-3 normal-case tracking-normal font-normal">({links.length})</span></div>
        {links.map((link, i) => (
          <div key={i} className="bg-k-800 border border-primary/10 rounded-xl p-3.5 mb-2 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <button onClick={() => setShowIconPicker(showIconPicker === link.id ? null : link.id)} className="text-lg hover:scale-125 transition-transform">{link.icon}</button>
                {showIconPicker === link.id && (
                  <div className="absolute top-8 left-0 z-50 bg-k-850 border border-primary/10 rounded-xl p-2 shadow-k grid grid-cols-4 gap-1 w-[160px]">
                    {iconOptions.map((ic) => (
                      <button key={ic} onClick={() => { const arr = [...links]; arr[i] = { ...arr[i], icon: ic }; setLinks(arr); setShowIconPicker(null); }} className="w-8 h-8 rounded-lg hover:bg-k-glow flex items-center justify-center text-sm transition-colors">{ic}</button>
                    ))}
                  </div>
                )}
              </div>
              <input value={link.title} onChange={(e) => { const arr = [...links]; arr[i] = { ...arr[i], title: e.target.value }; setLinks(arr); }} placeholder="Título" className={`${inputClass} flex-1`} />
              <button onClick={() => { const arr = [...links]; arr[i] = { ...arr[i], featured: !arr[i].featured }; setLinks(arr); }}
                className={`text-xs px-2 py-1 rounded-md transition-all ${link.featured ? "bg-primary/20 text-k-300" : "text-k-4 hover:text-k-3"}`}>⭐</button>
              <button onClick={() => { const arr = [...links]; arr[i] = { ...arr[i], active: !arr[i].active }; setLinks(arr); }}
                className={`w-9 h-5 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0 ${link.active ? "bg-primary" : "bg-k-900 border border-primary/10"}`}>
                <span className={`absolute w-3.5 h-3.5 rounded-full bg-primary-foreground top-[3px] transition-all duration-300 shadow-sm ${link.active ? "left-[18px]" : "left-[3px]"}`} />
              </button>
              <button onClick={() => setLinks(links.filter((_, j) => j !== i))} className="text-k-4 hover:text-k-err text-xs">✕</button>
            </div>
            <input value={link.url} onChange={(e) => { const arr = [...links]; arr[i] = { ...arr[i], url: e.target.value }; setLinks(arr); }} placeholder="https://..." className={inputClass} />
            <input value={link.subtitle || ""} onChange={(e) => { const arr = [...links]; arr[i] = { ...arr[i], subtitle: e.target.value }; setLinks(arr); }} placeholder="Descrição (opcional)" className={inputClass} />
          </div>
        ))}
        <button onClick={() => setLinks([...links, { id: crypto.randomUUID(), creator_id: profile.id, title: "", url: "", subtitle: "", icon: "🔗", featured: false, active: true, sort_order: links.length }])}
          className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-k-glow rounded-xl text-k-4 text-sm font-medium mt-2 transition-all hover:border-k-400 hover:text-k-300 hover:bg-k-glow active:scale-[0.98]">
          + Adicionar link
        </button>
      </div>

      <div className="mb-8">
        <div className={sectionTitle}>🛍 Produtos</div>
        {prods.map((prod, i) => (
          <div key={i} className="bg-k-800 border border-primary/10 rounded-xl p-3.5 mb-2 space-y-2">
            <div className="flex gap-2 items-center">
              <div className="relative">
                <button onClick={() => setShowIconPicker(showIconPicker === `prod-${i}` ? null : `prod-${i}`)} className="text-lg hover:scale-125 transition-transform">{prod.icon}</button>
                {showIconPicker === `prod-${i}` && (
                  <div className="absolute top-8 left-0 z-50 bg-k-850 border border-primary/10 rounded-xl p-2 shadow-k grid grid-cols-4 gap-1 w-[160px]">
                    {iconOptions.map((ic) => (
                      <button key={ic} onClick={() => { const arr = [...prods]; arr[i] = { ...arr[i], icon: ic }; setProds(arr); setShowIconPicker(null); }} className="w-8 h-8 rounded-lg hover:bg-k-glow flex items-center justify-center text-sm transition-colors">{ic}</button>
                    ))}
                  </div>
                )}
              </div>
              <input value={prod.title} onChange={(e) => { const arr = [...prods]; arr[i] = { ...arr[i], title: e.target.value }; setProds(arr); }} placeholder="Nome do produto" className={`${inputClass} flex-1`} />
              <button onClick={() => setProds(prods.filter((_, j) => j !== i))} className="text-k-4 hover:text-k-err text-xs">✕</button>
            </div>
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
                <input value={prod.url || ""} onChange={(e) => { const arr = [...prods]; arr[i] = { ...arr[i], url: e.target.value }; setProds(arr); }} placeholder="Link de compra" className={`${inputClass} flex-1`} />
              </div>
            </div>
          </div>
        ))}
        <p className={sizeHint}>📐 Imagem ideal: <strong>400×400px</strong> (1:1, quadrada)</p>
        <button onClick={() => setProds([...prods, { id: crypto.randomUUID(), creator_id: profile.id, title: "", price: "", icon: "📦", url: "", image_url: "", sort_order: prods.length }])}
          className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-k-glow rounded-xl text-k-4 text-sm font-medium mt-2 transition-all hover:border-k-400 hover:text-k-300 hover:bg-k-glow active:scale-[0.98]">
          + Adicionar produto
        </button>
      </div>

      <div className="mb-8">
        <div className={sectionTitle}>📢 Campanhas</div>
        {camps.map((camp, i) => (
          <div key={i} className="bg-k-800 border border-primary/10 rounded-xl p-3.5 mb-2 space-y-2">
            <div className="flex gap-2 items-center">
              <input value={camp.title} onChange={(e) => { const arr = [...camps]; arr[i] = { ...arr[i], title: e.target.value }; setCamps(arr); }} placeholder="Título da campanha" className={`${inputClass} flex-1`} />
              <label className="flex items-center gap-1.5 text-[0.72rem] text-k-3 cursor-pointer">
                <input type="checkbox" checked={camp.live} onChange={(e) => { const arr = [...camps]; arr[i] = { ...arr[i], live: e.target.checked }; setCamps(arr); }} className="accent-primary" />
                Ao vivo
              </label>
              <button onClick={() => setCamps(camps.filter((_, j) => j !== i))} className="text-k-4 hover:text-k-err text-xs">✕</button>
            </div>
            <input value={camp.description || ""} onChange={(e) => { const arr = [...camps]; arr[i] = { ...arr[i], description: e.target.value }; setCamps(arr); }} placeholder="Descrição" className={inputClass} />
            <input value={camp.url || ""} onChange={(e) => { const arr = [...camps]; arr[i] = { ...arr[i], url: e.target.value }; setCamps(arr); }} placeholder="URL da campanha" className={inputClass} />
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
                  <span className="text-sm text-primary-foreground font-semibold bg-primary/80 backdrop-blur-sm px-4 py-2 rounded-xl">📷 Trocar imagem</span>
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
        <button onClick={() => setCamps([...camps, { id: crypto.randomUUID(), creator_id: profile.id, title: "", description: "", image_url: "", url: "", live: false, sort_order: camps.length }])}
          className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-k-glow rounded-xl text-k-4 text-sm font-medium mt-2 transition-all hover:border-k-400 hover:text-k-300 hover:bg-k-glow active:scale-[0.98]">
          + Adicionar campanha
        </button>
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
          aspect={cropImage.type === "avatar" ? 1 : 16 / 5}
          cropShape={cropImage.type === "avatar" ? "round" : "rect"}
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
    </div>
  );
});

export default CreatorEditPanel;
