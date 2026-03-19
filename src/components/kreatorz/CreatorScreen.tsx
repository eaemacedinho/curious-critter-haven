import { useState } from "react";
import { toast } from "sonner";

export default function CreatorScreen() {
  const [contactOpen, setContactOpen] = useState(false);
  const [clickedLink, setClickedLink] = useState<number | null>(null);

  const handleLinkClick = (i: number, url: string) => {
    setClickedLink(i);
    toast.success("Redirecionando...", { description: url });
    setTimeout(() => setClickedLink(null), 400);
  };

  const socialLinks = [
    { label: "📸", name: "Instagram", url: "https://instagram.com/marinacosta" },
    { label: "🎵", name: "TikTok", url: "https://tiktok.com/@marinacosta" },
    { label: "▶", name: "YouTube", url: "https://youtube.com/@marinacosta" },
    { label: "𝕏", name: "Twitter", url: "https://x.com/marinacosta" },
    { label: "🎧", name: "Spotify", url: "https://open.spotify.com/user/marinacosta" },
  ];

  const mainLinks = [
    { title: "Meu novo projeto — GLOW", subtitle: "🔥 Lançamento exclusivo", featured: true, icon: "⭐", url: "https://glow.marinacosta.com" },
    { title: "Canal no YouTube", subtitle: "+480k inscritos", icon: "▶", url: "https://youtube.com/@marinacosta" },
    { title: "Minha playlist do momento", subtitle: "Spotify", icon: "🎵", url: "https://open.spotify.com/playlist/example" },
    { title: "Media Kit 2026", subtitle: "Para marcas e parceiros", icon: "📄", url: "https://drive.google.com/file/example" },
    { title: "Loja — Meus favoritos", subtitle: "Produtos que eu uso", icon: "🛍", url: "https://amazon.com.br/shop/marina" },
  ];

  return (
    <div className="min-h-screen flex items-start justify-center px-6 py-20 pt-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[420px] bg-[radial-gradient(ellipse,hsl(268_69%_50%_/_0.4),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-[460px] relative z-[1]">
        {/* Cover */}
        <div className="w-full h-[200px] rounded-3xl overflow-hidden relative mb-[-56px]">
          <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=400&fit=crop" alt="cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[k-shimmer_8s_ease-in-out_infinite]" style={{ backgroundSize: "200% 100%" }} />
        </div>

        {/* Profile Header */}
        <div className="text-center mb-2 animate-k-fade-up">
          <div className="relative inline-block">
            <div className="w-[112px] h-[112px] rounded-full border-4 border-background overflow-hidden relative z-[2] shadow-[0_8px_36px] shadow-primary/30 mx-auto" style={{ animation: "k-glow-pulse 4s ease-in-out infinite" }}>
              <img src="https://i.pravatar.cc/300?img=32" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-1 right-1 z-[3] w-7 h-7 bg-primary rounded-full border-[3px] border-background flex items-center justify-center shadow-lg">
              <svg className="w-3.5 h-3.5 fill-primary-foreground" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
            </div>
          </div>

          <h1 className="font-display text-[1.85rem] font-normal mt-4 text-primary-foreground tracking-tight">Marina Costa</h1>
          <p className="text-sm text-k-3 mt-1">@marinacosta</p>

          <div className="flex justify-center gap-2 mt-3">
            <span className="px-3 py-1 rounded-full text-[0.68rem] font-semibold bg-primary/10 text-k-300 border border-primary/20">
              ✨ Lifestyle & Beauty
            </span>
            <span className="px-3 py-1 rounded-full text-[0.68rem] font-semibold bg-k-ok/10 text-k-ok border border-k-ok/20">
              Top Creator
            </span>
          </div>

          <div className="flex justify-center gap-7 mt-5 py-4 border-t border-b border-primary-foreground/5">
            {[
              { value: "2.4M", label: "Seguidores" },
              { value: "480K", label: "Inscritos" },
              { value: "12.8%", label: "Engajamento" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <strong className="block text-lg font-extrabold text-primary-foreground tracking-tight">{stat.value}</strong>
                <span className="text-[0.64rem] text-k-3 uppercase tracking-widest font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-3 mt-4 flex-wrap">
            <span className="text-[0.62rem] text-k-4 uppercase tracking-widest font-bold">Trabalhou com:</span>
            {["Nike", "Natura", "Zara", "Samsung"].map((brand) => (
              <span key={brand} className="text-[0.65rem] text-k-3 font-semibold px-2 py-0.5 bg-card/80 rounded-md border border-primary/5 cursor-default hover:border-k-glow hover:text-k-200 transition-all">{brand}</span>
            ))}
          </div>

          <p className="text-sm text-k-2 leading-relaxed mt-5 max-w-[380px] mx-auto">
            Creator de lifestyle, beauty & bem-estar. Conectando marcas premium à geração que consome com intenção. São Paulo, BR 🇧🇷
          </p>

          {/* Social Icons */}
          <div className="flex justify-center gap-2.5 mt-5 mb-7">
            {socialLinks.map((soc) => (
              <a
                key={soc.name}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { e.preventDefault(); toast.info(`Abrindo ${soc.name}`, { description: soc.url }); }}
                className="w-11 h-11 rounded-xl bg-k-800 border border-primary/10 flex items-center justify-center transition-all duration-250 hover:border-k-400 hover:bg-k-glow hover:-translate-y-0.5 hover:scale-105 text-sm active:scale-95"
                title={soc.name}
              >
                {soc.label}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2.5 mb-8 animate-k-fade-up" style={{ animationDelay: ".15s" }}>
          {mainLinks.map((link, i) => (
            <div
              key={i}
              onClick={() => handleLinkClick(i, link.url)}
              className={`flex items-center gap-3.5 p-4 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group
                ${clickedLink === i ? "scale-[0.97]" : ""}
                ${link.featured
                  ? "gradient-primary border-transparent shadow-k-purple-lg hover:-translate-y-1 hover:shadow-[0_16px_60px_hsl(268_69%_50%_/_0.35)]"
                  : "bg-card/65 backdrop-blur-2xl border border-primary/10 hover:border-k-glow hover:-translate-y-1 hover:shadow-k-purple"
                }
                before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100
                active:scale-[0.97]
              `}
            >
              <div className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center flex-shrink-0 text-lg transition-transform duration-300 group-hover:scale-110 ${link.featured ? "bg-primary-foreground/15" : "bg-primary-foreground/5"}`}>
                {link.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold leading-snug">{link.title}</h4>
                <span className="text-[0.72rem] opacity-55">{link.subtitle}</span>
              </div>
              <div className="opacity-30 transition-all duration-200 group-hover:opacity-60 group-hover:translate-x-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
            </div>
          ))}
        </div>

        {/* Monetization Blocks */}
        <div className="animate-k-fade-up" style={{ animationDelay: ".25s" }}>
          <div className="text-[0.66rem] font-bold text-k-4 tracking-[0.14em] uppercase mb-3.5 flex items-center gap-2.5">
            Trabalhos & Parcerias
            <span className="flex-1 h-px bg-primary/10" />
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-8">
            {[
              { img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop", title: "Natura × Marina", sub: "Collab exclusiva", url: "https://natura.com.br/marina" },
              { img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop", title: "ZARA Summer", sub: "Lookbook 2026", url: "https://zara.com/lookbook" },
            ].map((camp, i) => (
              <div key={i} onClick={() => toast.info(`Abrindo ${camp.title}`, { description: camp.url })} className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group hover:border-k-glow hover:-translate-y-1 hover:shadow-k-purple active:scale-[0.97]">
                <div className="w-full h-[120px] relative overflow-hidden">
                  <img src={camp.img} alt="" className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/75" />
                </div>
                <div className="p-3">
                  <h5 className="text-[0.82rem] font-semibold text-primary-foreground mb-0.5">{camp.title}</h5>
                  <span className="text-[0.68rem] text-k-3">{camp.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[0.66rem] font-bold text-k-4 tracking-[0.14em] uppercase mb-3.5 flex items-center gap-2.5">
            Meus Produtos
            <span className="flex-1 h-px bg-primary/10" />
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-8">
            {[
              { title: "E-book: Rotina Creator", price: "R$ 47,90", icon: "📚" },
              { title: "Preset Pack Lightroom", price: "R$ 29,90", icon: "🎨" },
            ].map((prod, i) => (
              <div key={i} onClick={() => toast.success(`Comprando "${prod.title}"`, { description: prod.price })} className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl p-4 transition-all duration-300 cursor-pointer group hover:border-k-glow hover:-translate-y-1 hover:shadow-k-purple active:scale-[0.97]">
                <div className="text-2xl mb-2 transition-transform group-hover:scale-110">{prod.icon}</div>
                <h5 className="text-[0.82rem] font-semibold text-primary-foreground mb-1">{prod.title}</h5>
                <span className="text-[0.72rem] text-k-300 font-bold">{prod.price}</span>
              </div>
            ))}
          </div>

          <div className="text-[0.66rem] font-bold text-k-4 tracking-[0.14em] uppercase mb-3.5 flex items-center gap-2.5">
            Campanhas Ativas
            <span className="flex-1 h-px bg-primary/10" />
          </div>
          <div className="flex gap-2.5 mb-8">
            <div onClick={() => toast.info("Campanha Samsung Galaxy S26", { description: "Até 30/Abr" })} className="flex-1 bg-gradient-to-br from-primary/20 to-k-600/10 border border-primary/20 rounded-2xl p-4 transition-all duration-300 hover:border-k-400 group cursor-pointer active:scale-[0.98]">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-k-ok animate-k-pulse" />
                <span className="text-[0.65rem] text-k-ok font-bold uppercase tracking-wider">Ao vivo</span>
              </div>
              <h5 className="text-[0.82rem] font-semibold text-primary-foreground mb-1">Samsung Galaxy S26</h5>
              <span className="text-[0.68rem] text-k-3">Campanha de lançamento — até 30/Abr</span>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <button
          onClick={() => setContactOpen(!contactOpen)}
          className="w-full p-4 bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:border-k-400 hover:bg-k-glow hover:shadow-k-purple mb-2 animate-k-fade-up active:scale-[0.98]"
          style={{ animationDelay: ".3s" }}
        >
          ✉️ Contato comercial
        </button>

        {contactOpen && (
          <div className="bg-card/80 backdrop-blur-xl border border-primary/10 rounded-2xl p-5 mb-8 animate-k-fade-up space-y-3">
            <h4 className="text-sm font-bold text-primary-foreground">Entre em contato</h4>
            <input placeholder="Seu nome" className="w-full px-3.5 py-2.5 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 transition-all placeholder:text-k-4" />
            <input placeholder="seu@email.com" className="w-full px-3.5 py-2.5 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 transition-all placeholder:text-k-4" />
            <textarea placeholder="Mensagem..." className="w-full px-3.5 py-2.5 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 transition-all resize-none min-h-[80px] placeholder:text-k-4" />
            <button onClick={() => { toast.success("Mensagem enviada! ✉️"); setContactOpen(false); }} className="w-full py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:bg-k-400 hover:shadow-k-purple active:scale-[0.97]">
              Enviar mensagem
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-[0.7rem] text-k-4 opacity-50 hover:opacity-90 transition-opacity py-2 mt-4">
          <span className="font-extrabold text-k-300">K</span>
          managed by Kreatorz
        </div>
      </div>
    </div>
  );
}
