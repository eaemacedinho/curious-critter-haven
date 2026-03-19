import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { toast } from "sonner";
import type { CreatorProfile, CreatorLink, SocialLink, CreatorProduct, CreatorCampaign } from "@/hooks/useCreatorData";
import ImageCropper from "./ImageCropper";

const iconOptions = ["⭐", "▶", "🎵", "📄", "🛍", "📸", "🎮", "💼", "🎨", "📚", "🔗", "💰", "🎧", "📦", "🎬", "💎"];

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
  onUploadImage: (file: File, type: "avatar" | "cover") => Promise<string | null>;
  onDone: () => void;
}

export interface CreatorEditPanelHandle {
  saveAll: () => Promise<boolean>;
}

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
  const [links, setLinks] = useState(initialLinks);
  const [social, setSocial] = useState(initialSocial);
  const [prods, setProds] = useState(initialProducts);
  const [camps, setCamps] = useState(initialCampaigns);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<"avatar" | "cover" | null>(null);
  const [showIconPicker, setShowIconPicker] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [cropImage, setCropImage] = useState<{ src: string; type: "avatar" | "cover"; file: File } | null>(null);

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

  const handleSaveAll = async ({ closeAfterSave = true }: { closeAfterSave?: boolean } = {}): Promise<boolean> => {
    if (saving) return false;

    if (uploadingImage) {
      toast.info("Aguarde o upload da imagem terminar antes de salvar.");
      return false;
    }

    try {
      setSaving(true);

      // Auto-apply pending crop image (use original file as-is)
      if (cropImage) {
        const { file, type } = cropImage;
        const url = await onUploadImage(file, type);
        if (url) {
          if (type === "avatar") setAvatarUrl(url);
          else setCoverUrl(url);
          // Use updated url directly in the profile save below
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
            <br /><span className="text-[0.7rem] text-k-4">JPG ou PNG · máx 2MB</span>
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
        <div className="flex flex-wrap gap-2 mb-2">
          {brands.map((brand, i) => (
            <span key={i} className="px-2.5 py-1 rounded-md text-[0.72rem] font-semibold bg-card/80 text-k-3 border border-primary/10 flex items-center gap-1.5">
              {brand}
              <button onClick={() => setBrands(brands.filter((_, j) => j !== i))} className="text-k-4 hover:text-k-err">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder="Nome da marca..." className={inputClass} onKeyDown={(e) => { if (e.key === "Enter" && newBrand.trim()) { setBrands([...brands, newBrand.trim()]); setNewBrand(""); }}} />
          <button onClick={() => { if (newBrand.trim()) { setBrands([...brands, newBrand.trim()]); setNewBrand(""); }}} className="px-4 py-2 bg-primary/20 text-k-300 rounded-xl text-sm font-medium hover:bg-primary/30 transition-colors flex-shrink-0">+</button>
        </div>
      </div>

      <div className="mb-8">
        <div className={sectionTitle}>📱 Redes Sociais</div>
        {social.map((s, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <input value={s.label} onChange={(e) => { const arr = [...social]; arr[i] = { ...arr[i], label: e.target.value }; setSocial(arr); }} placeholder="📸" className={`${inputClass} w-12 text-center`} />
            <input value={s.platform} onChange={(e) => { const arr = [...social]; arr[i] = { ...arr[i], platform: e.target.value }; setSocial(arr); }} placeholder="Instagram" className={`${inputClass} w-28`} />
            <input value={s.url} onChange={(e) => { const arr = [...social]; arr[i] = { ...arr[i], url: e.target.value }; setSocial(arr); }} placeholder="https://..." className={`${inputClass} flex-1`} />
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
            <div className="flex gap-2">
              <input value={prod.price} onChange={(e) => { const arr = [...prods]; arr[i] = { ...arr[i], price: e.target.value }; setProds(arr); }} placeholder="R$ 0,00" className={`${inputClass} w-28`} />
              <input value={prod.url || ""} onChange={(e) => { const arr = [...prods]; arr[i] = { ...arr[i], url: e.target.value }; setProds(arr); }} placeholder="Link de compra" className={`${inputClass} flex-1`} />
            </div>
          </div>
        ))}
        <button onClick={() => setProds([...prods, { id: crypto.randomUUID(), creator_id: profile.id, title: "", price: "", icon: "📦", url: "", sort_order: prods.length }])}
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
            <div className="flex gap-2">
              <input value={camp.url || ""} onChange={(e) => { const arr = [...camps]; arr[i] = { ...arr[i], url: e.target.value }; setCamps(arr); }} placeholder="URL" className={`${inputClass} flex-1`} />
              <input value={camp.image_url || ""} onChange={(e) => { const arr = [...camps]; arr[i] = { ...arr[i], image_url: e.target.value }; setCamps(arr); }} placeholder="URL da imagem" className={`${inputClass} flex-1`} />
            </div>
          </div>
        ))}
        <button onClick={() => setCamps([...camps, { id: crypto.randomUUID(), creator_id: profile.id, title: "", description: "", image_url: "", url: "", live: false, sort_order: camps.length }])}
          className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-k-glow rounded-xl text-k-4 text-sm font-medium mt-2 transition-all hover:border-k-400 hover:text-k-300 hover:bg-k-glow active:scale-[0.98]">
          + Adicionar campanha
        </button>
      </div>

      <div className="sticky bottom-4 z-10">
        <button onClick={() => void handleSaveAll()} disabled={saving || Boolean(uploadingImage)}
          className="w-full py-4 gradient-primary text-primary-foreground font-bold text-sm rounded-2xl transition-all duration-300 hover:shadow-k-purple-lg active:scale-[0.98] disabled:opacity-50 shadow-k-purple">
          {uploadingImage ? "Enviando imagem..." : saving ? "Salvando..." : "💾 Salvar tudo"}
        </button>
      </div>
      {cropImage && (
        <ImageCropper
          imageSrc={cropImage.src}
          aspect={cropImage.type === "avatar" ? 1 : 16 / 5}
          cropShape={cropImage.type === "avatar" ? "round" : "rect"}
          onCropDone={(blob) => handleCropDone(blob, cropImage.type)}
          onCancel={() => setCropImage(null)}
        />
      )}
    </div>
  );
});

export default CreatorEditPanel;
