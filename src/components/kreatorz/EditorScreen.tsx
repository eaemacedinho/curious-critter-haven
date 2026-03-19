import { useState, useRef } from "react";
import { toast } from "sonner";

interface EditorScreenProps {
  onNavigate: (tab: string) => void;
}

const iconOptions = ["⭐", "▶", "🎵", "📄", "🛍", "📸", "🎮", "💼", "🎨", "📚", "🔗", "💰"];

const initialLinks = [
  { id: 1, title: "Meu novo projeto — GLOW", url: "https://glow.marinacosta.com", active: true, featured: true, icon: "⭐", desc: "Lançamento exclusivo" },
  { id: 2, title: "Canal no YouTube", url: "https://youtube.com/@marinacosta", active: true, featured: false, icon: "▶", desc: "+480k inscritos" },
  { id: 3, title: "Minha playlist do momento", url: "https://open.spotify.com/playlist/example", active: true, featured: false, icon: "🎵", desc: "" },
  { id: 4, title: "Media Kit 2026", url: "https://drive.google.com/file/example", active: true, featured: false, icon: "📄", desc: "Para marcas e parceiros" },
  { id: 5, title: "Loja — Favoritos", url: "https://amazon.com.br/shop/marina", active: false, featured: false, icon: "🛍", desc: "" },
];

export default function EditorScreen({ onNavigate }: EditorScreenProps) {
  const [name, setName] = useState("Marina Costa");
  const [handle, setHandle] = useState("@marinacosta");
  const [bio, setBio] = useState("Creator de lifestyle, beauty & bem-estar. Conectando marcas premium à geração que consome com intenção.");
  const [links, setLinks] = useState(initialLinks);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [dragId, setDragId] = useState<number | null>(null);
  const [editingLink, setEditingLink] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("https://i.pravatar.cc/200?img=32");
  const [coverUrl, setCoverUrl] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=400&fit=crop");
  const [showIconPicker, setShowIconPicker] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  let nextId = links.length > 0 ? Math.max(...links.map(l => l.id)) + 1 : 1;

  const toggleLink = (id: number) => {
    setLinks(links.map((l) => (l.id === id ? { ...l, active: !l.active } : l)));
  };

  const toggleFeatured = (id: number) => {
    setLinks(links.map((l) => (l.id === id ? { ...l, featured: !l.featured } : l)));
  };

  const deleteLink = (id: number) => {
    setLinks(links.filter((l) => l.id !== id));
    toast.success("Link removido");
  };

  const addLink = () => {
    const newLink = { id: Date.now(), title: "Novo link", url: "https://", active: true, featured: false, icon: "🔗", desc: "" };
    setLinks([...links, newLink]);
    setEditingLink(newLink.id);
    toast.success("Link adicionado");
  };

  const updateLink = (id: number, field: string, value: string) => {
    setLinks(links.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const handleDragStart = (id: number) => setDragId(id);
  const handleDragOver = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (dragId === null || dragId === targetId) return;
    const newLinks = [...links];
    const dragIndex = newLinks.findIndex((l) => l.id === dragId);
    const targetIndex = newLinks.findIndex((l) => l.id === targetId);
    const [moved] = newLinks.splice(dragIndex, 1);
    newLinks.splice(targetIndex, 0, moved);
    setLinks(newLinks);
  };
  const handleDragEnd = () => setDragId(null);

  const handleImageUpload = (type: "avatar" | "cover") => {
    const input = type === "avatar" ? avatarInputRef.current : coverInputRef.current;
    if (input) input.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 2MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    if (type === "avatar") {
      setAvatarUrl(url);
      toast.success("Foto de perfil atualizada!");
    } else {
      setCoverUrl(url);
      toast.success("Foto de capa atualizada!");
    }
  };

  const handleSaveDraft = () => {
    setSaved(true);
    toast.success("Rascunho salvo com sucesso!");
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePublish = () => {
    toast.success("Página publicada com sucesso! 🎉", { description: `kreatorz.ai/${handle}` });
  };

  const activeLinks = links.filter((l) => l.active);

  return (
    <div className="flex min-h-[calc(100vh-56px)] pt-14 max-md:flex-col">
      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleFileChange(e, "avatar")} />
      <input ref={coverInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleFileChange(e, "cover")} />

      {/* Editor Panel */}
      <div className="w-[480px] max-md:w-full bg-k-850 border-r border-primary/10 flex flex-col flex-shrink-0 overflow-y-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-primary/10 flex-shrink-0">
          <button onClick={() => onNavigate("dash")} className="flex items-center gap-2 text-sm text-k-3 hover:text-primary-foreground transition-colors">
            ← Voltar
          </button>
          <div className="flex gap-2">
            <button onClick={handleSaveDraft} className={`px-4 py-2 border rounded-xl text-[0.78rem] font-medium transition-all ${saved ? "bg-k-ok/20 border-k-ok/30 text-k-ok" : "bg-k-800 border-primary/10 text-k-3 hover:border-k-3 hover:text-primary-foreground"}`}>
              {saved ? "✓ Salvo" : "Salvar rascunho"}
            </button>
            <button onClick={handlePublish} className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-[0.78rem] rounded-xl transition-all duration-300 hover:bg-k-400 hover:shadow-k-purple flex items-center gap-1.5 active:scale-[0.97]">
              📤 Publicar
            </button>
          </div>
        </div>

        <div className="p-5 flex-1">
          {/* Cover Photo */}
          <div className="mb-6">
            <div className="text-[0.66rem] font-bold text-k-4 tracking-[0.12em] uppercase mb-3 flex items-center gap-2">
              🖼 Foto de Capa
            </div>
            <div className="relative w-full h-[140px] rounded-2xl overflow-hidden border border-primary/10 group cursor-pointer" onClick={() => handleImageUpload("cover")}>
              <img src={coverUrl} alt="cover" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <span className="text-sm text-primary-foreground font-semibold bg-primary/80 backdrop-blur-sm px-4 py-2 rounded-xl">📷 Alterar capa</span>
              </div>
            </div>
            <p className="text-[0.65rem] text-k-4 mt-1.5">Recomendado: 1200×400px · JPG ou PNG</p>
          </div>

          {/* Profile Section */}
          <div className="mb-8">
            <div className="text-[0.66rem] font-bold text-k-4 tracking-[0.12em] uppercase mb-3.5 flex items-center gap-2">
              👤 Perfil
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-[2.5px] border-primary flex-shrink-0 shadow-[0_4px_18px] shadow-primary/20 relative group cursor-pointer" onClick={() => handleImageUpload("avatar")}>
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <span className="text-lg">📷</span>
                </div>
              </div>
              <div>
                <button onClick={() => handleImageUpload("avatar")} className="text-sm text-k-300 font-medium hover:text-k-200 transition-colors">Alterar foto</button>
                <br />
                <span className="text-[0.7rem] text-k-4">JPG ou PNG · máx 2MB</span>
              </div>
            </div>
            <div className="mb-3.5">
              <label className="block text-[0.76rem] font-medium text-k-2 mb-1.5">Nome artístico</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 focus:shadow-[0_0_0_3px_hsl(268_69%_50%_/_0.12)] transition-all" />
            </div>
            <div className="mb-3.5">
              <label className="block text-[0.76rem] font-medium text-k-2 mb-1.5">Arroba</label>
              <input value={handle} onChange={(e) => setHandle(e.target.value)} className="w-full px-3.5 py-2.5 bg-k-800 border border-primary/10 rounded-xl text-k-2 text-sm outline-none focus:border-k-400 focus:shadow-[0_0_0_3px_hsl(268_69%_50%_/_0.12)] transition-all" />
            </div>
            <div className="mb-3.5">
              <label className="block text-[0.76rem] font-medium text-k-2 mb-1.5">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} className="w-full px-3.5 py-2.5 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 focus:shadow-[0_0_0_3px_hsl(268_69%_50%_/_0.12)] transition-all resize-none min-h-[72px] leading-relaxed" />
              <div className="text-[0.68rem] text-k-4 text-right mt-1">{bio.length} / 160</div>
            </div>
          </div>

          {/* Links Section */}
          <div className="mb-8">
            <div className="text-[0.66rem] font-bold text-k-4 tracking-[0.12em] uppercase mb-3.5 flex items-center gap-2">
              🔗 Links <span className="text-k-3 normal-case tracking-normal font-normal">({links.length})</span>
            </div>
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <div key={link.id}>
                  <div
                    draggable
                    onDragStart={() => handleDragStart(link.id)}
                    onDragOver={(e) => handleDragOver(e, link.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2.5 p-3 bg-k-800 border rounded-xl transition-all duration-200 ${
                      dragId === link.id ? "border-k-400 shadow-k-purple opacity-70 scale-[0.98]" : "border-primary/10 hover:border-primary/[0.18]"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 cursor-grab flex-shrink-0 active:cursor-grabbing">
                      <span className="block w-3 h-0.5 bg-k-4 rounded-sm" />
                      <span className="block w-3 h-0.5 bg-k-4 rounded-sm" />
                      <span className="block w-3 h-0.5 bg-k-4 rounded-sm" />
                    </div>
                    {/* Icon with picker */}
                    <div className="relative">
                      <button onClick={() => setShowIconPicker(showIconPicker === link.id ? null : link.id)} className="text-sm flex-shrink-0 hover:scale-125 transition-transform">{link.icon}</button>
                      {showIconPicker === link.id && (
                        <div className="absolute top-8 left-0 z-50 bg-k-850 border border-primary/10 rounded-xl p-2 shadow-k grid grid-cols-4 gap-1 w-[160px]">
                          {iconOptions.map((ic) => (
                            <button key={ic} onClick={() => { updateLink(link.id, "icon", ic); setShowIconPicker(null); }} className="w-8 h-8 rounded-lg hover:bg-k-glow flex items-center justify-center text-sm transition-colors">
                              {ic}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold text-primary-foreground truncate">{link.title}</h5>
                      <span className="text-[0.7rem] text-k-4 truncate block">{link.url}</span>
                    </div>
                    <button
                      onClick={() => toggleFeatured(link.id)}
                      className={`text-xs flex-shrink-0 px-2 py-1 rounded-md transition-all ${link.featured ? "bg-primary/20 text-k-300 shadow-sm" : "text-k-4 hover:text-k-3"}`}
                      title="Destacar"
                    >
                      ⭐
                    </button>
                    <button
                      onClick={() => toggleLink(link.id)}
                      className={`w-9 h-5 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0 ${link.active ? "bg-primary" : "bg-k-900 border border-primary/10"}`}
                    >
                      <span className={`absolute w-3.5 h-3.5 rounded-full bg-primary-foreground top-[3px] transition-all duration-300 shadow-sm ${link.active ? "left-[18px]" : "left-[3px]"}`} />
                    </button>
                    <button onClick={() => setEditingLink(editingLink === link.id ? null : link.id)} className={`flex-shrink-0 transition-colors text-xs ${editingLink === link.id ? "text-k-300" : "text-k-4 hover:text-k-300"}`}>✏</button>
                    <button onClick={() => deleteLink(link.id)} className="flex-shrink-0 text-k-4 hover:text-k-err transition-colors text-xs" title="Remover">✕</button>
                  </div>
                  {/* Edit panel */}
                  {editingLink === link.id && (
                    <div className="bg-k-800/50 border border-primary/5 rounded-xl p-3.5 mt-1 space-y-2.5 animate-k-fade-up">
                      <div>
                        <label className="block text-[0.68rem] font-medium text-k-3 mb-1">Título</label>
                        <input value={link.title} onChange={(e) => updateLink(link.id, "title", e.target.value)} className="w-full px-3 py-2 bg-k-800 border border-primary/10 rounded-lg text-k-1 text-sm outline-none focus:border-k-400 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[0.68rem] font-medium text-k-3 mb-1">URL</label>
                        <input value={link.url} onChange={(e) => updateLink(link.id, "url", e.target.value)} className="w-full px-3 py-2 bg-k-800 border border-primary/10 rounded-lg text-k-1 text-sm outline-none focus:border-k-400 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[0.68rem] font-medium text-k-3 mb-1">Descrição (opcional)</label>
                        <input value={link.desc} onChange={(e) => updateLink(link.id, "desc", e.target.value)} placeholder="Breve descrição do link" className="w-full px-3 py-2 bg-k-800 border border-primary/10 rounded-lg text-k-1 text-sm outline-none focus:border-k-400 transition-all placeholder:text-k-4" />
                      </div>
                      <button onClick={() => setEditingLink(null)} className="text-[0.72rem] text-k-300 font-medium hover:text-k-200 transition-colors">
                        ✓ Fechar edição
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addLink} className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-k-glow rounded-xl text-k-4 text-sm font-medium mt-3 transition-all hover:border-k-400 hover:text-k-300 hover:bg-k-glow active:scale-[0.98]">
              + Adicionar link
            </button>
          </div>

          {/* Theme Section */}
          <div>
            <div className="text-[0.66rem] font-bold text-k-4 tracking-[0.12em] uppercase mb-3.5 flex items-center gap-2">
              🎨 Tema
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { bg: "linear-gradient(135deg, #08020F, #1F1339)", name: "Escuro" },
                { bg: "linear-gradient(135deg, #F4EEFF, #DDD0F0)", name: "Claro" },
                { bg: "linear-gradient(135deg, #160C28, #331E5C)", name: "Púrpura" },
                { bg: "linear-gradient(135deg, #0A0A10, #151528)", name: "Midnight" },
              ].map((theme, i) => (
                <div key={i} className="text-center">
                  <div
                    onClick={() => { setSelectedTheme(i); toast.info(`Tema "${theme.name}" selecionado`); }}
                    className={`aspect-square rounded-xl border-2 cursor-pointer transition-all relative hover:scale-105 ${
                      selectedTheme === i ? "border-k-400 shadow-[0_0_0_3px_hsl(268_69%_50%_/_0.12)]" : "border-primary/10 hover:border-primary/20"
                    }`}
                    style={{ background: theme.bg }}
                  >
                    {selectedTheme === i && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[0.55rem] text-primary-foreground">✓</span>
                    )}
                  </div>
                  <span className="text-[0.6rem] text-k-4 mt-1 block">{theme.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 bg-background flex items-center justify-center relative overflow-hidden min-h-[660px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_42%,hsl(268_69%_50%_/_0.05),transparent_50%),radial-gradient(circle_at_62%_58%,hsl(268_69%_50%_/_0.04),transparent_50%)]" />
        <div className="relative z-[1]">
          <div className="text-center text-[0.66rem] text-k-4 tracking-[0.12em] uppercase mb-4 font-semibold">Preview — Mobile</div>
          {/* Phone frame */}
          <div className="w-[296px] bg-k-850 rounded-[48px] border border-primary/[0.14] p-2 shadow-k" style={{ boxShadow: "var(--k-shadow), 0 0 100px hsl(268 69% 50% / 0.05), inset 0 1px 0 rgba(255,255,255,.03)" }}>
            <div className="bg-background rounded-[42px] overflow-hidden">
              <div className="w-[86px] h-[26px] bg-background rounded-b-2xl mx-auto relative z-[2]" />
              <div className="px-4 pb-5 text-center max-h-[520px] overflow-y-auto scrollbar-none">
                {/* Cover in preview */}
                <div className="w-full h-[80px] rounded-xl overflow-hidden -mt-2 mb-[-28px] relative">
                  <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
                </div>
                <div className="w-20 h-20 rounded-full border-[2.5px] border-primary mx-auto mb-2.5 overflow-hidden shadow-[0_0_28px] shadow-primary/25 relative z-[1]">
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="font-bold text-[0.98rem] text-primary-foreground flex items-center justify-center gap-1">
                  {name}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="hsl(268,69%,50%)" /><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" /></svg>
                </div>
                <div className="text-[0.68rem] text-k-3 mb-2">{handle}</div>
                <div className="flex justify-center gap-4 mb-3 py-2 border-t border-b border-primary-foreground/5">
                  {[{ v: "2.4M", l: "Seguidores" }, { v: "480K", l: "YouTube" }, { v: "12.8%", l: "Engaj." }].map((s) => (
                    <div key={s.l} className="text-center">
                      <strong className="block text-[0.82rem] font-bold text-primary-foreground">{s.v}</strong>
                      <span className="text-[0.58rem] text-k-3 uppercase tracking-wider">{s.l}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[0.66rem] text-k-2 leading-snug mb-3 px-1.5">{bio}</div>
                <div className="flex justify-center gap-1.5 mb-3">
                  {["📸", "🎵", "▶"].map((icon, i) => (
                    <span key={i} className="w-8 h-8 rounded-[10px] bg-k-800 border border-primary/10 flex items-center justify-center text-xs">{icon}</span>
                  ))}
                </div>
                {activeLinks.map((link) => (
                  <div key={link.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl mb-1.5 text-left transition-all ${link.featured ? "gradient-primary" : "bg-k-800 border border-primary/10"}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${link.featured ? "bg-primary-foreground/15" : "bg-primary-foreground/[0.06]"}`}>
                      {link.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[0.7rem] font-semibold truncate">{link.title}</h4>
                      {link.desc && <span className="text-[0.58rem] text-k-3 truncate block">{link.desc}</span>}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-center gap-1.5 text-[0.6rem] text-k-4 opacity-50 mt-4 pb-2">
                  <span className="font-extrabold text-k-300">K</span> managed by Kreatorz
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
