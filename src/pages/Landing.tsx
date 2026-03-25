import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronRight, Check, X } from "lucide-react";
import in1Logo from "@/assets/in1-logo.png";
import in1Icon from "@/assets/in1-icon.png";
import heroCreator from "@/assets/landing-hero-creator.jpg";
import teamImg from "@/assets/landing-team.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const cardFade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const PROBLEMS = [
  { num: "01", title: "Bio limitada a 1 link", desc: "Redes sociais permitem apenas um link. Você é forçado a escolher o que mostrar — e sempre perde algo." },
  { num: "02", title: "Links bagunçados", desc: "Uma lista genérica de links sem hierarquia, sem destaque, sem estratégia. O visitante se perde." },
  { num: "03", title: "Apresentação amadora", desc: "Profissionais e creators usando templates gratuitos que não comunicam o valor do trabalho deles." },
  { num: "04", title: "Zero conversão", desc: "Sem campanhas destacadas, sem analytics, sem call-to-action. Tráfego desperdiçado todo dia." },
];

const FEATURES = [
  { emoji: "🔗", title: "Links inteligentes", desc: "Organize, destaque e ative/desative links com um clique. Drag & drop para reordenar." },
  { emoji: "📢", title: "Campanhas Spotlight", desc: "Destaque parcerias e lançamentos com cards visuais no topo da página. Com tracking de cliques." },
  { emoji: "🎬", title: "Preview de vídeo", desc: "Integre vídeos do YouTube, TikTok e Reels direto na sua página. Sem sair." },
  { emoji: "🎨", title: "Layout premium", desc: "Múltiplos layouts, efeitos visuais, fontes e cores customizáveis. Sua página, sua identidade." },
  { emoji: "📊", title: "Analytics real", desc: "Views, cliques, CTR, origem do tráfego. Saiba o que funciona e otimize." },
  { emoji: "⚡", title: "Carregamento instantâneo", desc: "Páginas ultra-rápidas que abrem em milissegundos. Sem perder nenhum visitante." },
];

const AUDIENCE = [
  { emoji: "🎬", label: "Creators" },
  { emoji: "📸", label: "Fotógrafos" },
  { emoji: "🎥", label: "Videomakers" },
  { emoji: "💻", label: "Freelancers" },
  { emoji: "🏢", label: "Agências" },
  { emoji: "🚀", label: "Autônomos" },
];

const DIFF_OLD = [
  "Apenas uma lista de links",
  "Template que todo mundo usa",
  "Sem destaque para campanhas",
  "Analytics básico e limitado",
  "Zero personalização real",
  "Parece amador para marcas",
];

const DIFF_NEW = [
  "Página completa com links, vídeos e campanhas",
  "Layouts premium e identidade própria",
  "Campanhas spotlight com tracking",
  "Analytics de verdade (CTR, geo, device)",
  "Cores, fontes, efeitos e marcas parceiras",
  "Impressiona marcas e abre portas",
];

export default function Landing() {
  const [claimUser, setClaimUser] = useState("");
  const navigate = useNavigate();

  const handleClaim = () => {
    if (!claimUser.trim()) return;
    const clean = claimUser.trim().replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
    navigate(`/login?claim=${encodeURIComponent(clean)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ───── NAV ───── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-background/65 backdrop-blur-xl border-b border-border/30" />
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-16 px-6 relative z-[1]">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              in1<span className="text-primary">.bio</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 mr-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Features</a>
            <a href="#for-who" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Para quem</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Planos</a>
            <Link to="/templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Templates</Link>
          </div>
          <Link
            to="/login"
            className="px-5 py-2.5 bg-foreground text-background font-bold text-sm rounded-full transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]"
          >
            Criar minha página
          </Link>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 px-6 overflow-hidden text-center">
        {/* Glows */}
        <div className="absolute w-[800px] h-[800px] -top-[20%] left-1/2 -translate-x-1/2 rounded-full bg-primary/8 blur-[60px] animate-pulse" />
        <div className="absolute w-[500px] h-[500px] -bottom-[15%] -right-[10%] rounded-full bg-[hsl(190_80%_50%/0.06)] blur-[80px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.015)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.015)_1px,transparent_1px)] bg-[size:80px_80px]"
          style={{ maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%,#000,transparent)" }}
        />

        <div className="relative z-[1] max-w-[800px]">
          <motion.div
            initial="hidden" animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/20 rounded-full text-[0.72rem] font-bold text-primary tracking-widest uppercase bg-primary/5 mb-8">
              <span className="w-[7px] h-[7px] rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))] animate-pulse" />
              Novo jeito de usar sua bio
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="font-display text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[1.04] tracking-tight mb-6">
              Sua bio pode fazer
              <br />
              <span className="text-primary drop-shadow-[0_0_40px_hsl(var(--primary)/0.3)]">muito mais.</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground leading-relaxed max-w-[540px] mb-10">
              Crie uma página onde seus links, vídeos e campanhas trabalham juntos para você. Tudo em um. Do jeito que realmente funciona.
            </motion.p>

            {/* Input CTA */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center gap-0 max-w-[480px] w-full bg-card border border-border rounded-3xl p-1.5 pl-5 transition-all focus-within:border-primary focus-within:shadow-[0_0_0_4px_hsl(var(--primary)/0.12),0_0_40px_hsl(var(--primary)/0.08)]">
              <span className="text-sm font-bold text-muted-foreground whitespace-nowrap hidden sm:inline">
                <span className="text-foreground">in1.bio</span>/
              </span>
              <input
                type="text"
                value={claimUser}
                onChange={(e) => setClaimUser(e.target.value.replace(/\s/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                placeholder="seunome"
                maxLength={30}
                className="bg-transparent border-none outline-none text-foreground text-sm font-medium px-2 py-3.5 flex-1 min-w-0 placeholder:text-muted-foreground/30"
              />
              <button
                onClick={handleClaim}
                disabled={!claimUser.trim()}
                className="px-6 py-3 bg-primary text-primary-foreground font-extrabold text-sm rounded-[20px] transition-all hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] hover:scale-[1.03] active:scale-[0.98] disabled:opacity-40 whitespace-nowrap sm:w-auto w-full"
              >
                Criar minha página grátis
              </button>
            </motion.div>

            <motion.p variants={fadeUp} custom={4} className="text-xs text-muted-foreground mt-5">
              <span className="text-foreground/70 font-semibold">Grátis para começar</span> — sem cartão de crédito
            </motion.p>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            className="mt-16 flex justify-center"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: "1000px" }}
          >
            <div className="w-[300px] sm:w-[320px] bg-card rounded-[48px] border border-border/60 p-2 shadow-[0_40px_100px_rgba(0,0,0,0.6),0_0_140px_hsl(var(--primary)/0.04)] transition-transform duration-700 hover:rotate-0" style={{ transform: "rotateX(4deg)" }}>
              <div className="bg-background rounded-[42px] overflow-hidden">
                <div className="w-20 h-[26px] bg-background rounded-b-2xl mx-auto" />
                <div className="px-5 pb-6 text-center">
                  <div className="w-20 h-20 rounded-full border-[2.5px] border-primary mx-auto mb-3 overflow-hidden shadow-[0_0_24px_hsl(var(--primary)/0.15)]">
                    <img src="https://i.pravatar.cc/200?img=32" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="font-bold text-sm text-foreground flex items-center justify-center gap-1">
                    Marina Costa
                    <span className="w-3.5 h-3.5 rounded-full bg-primary inline-flex items-center justify-center">
                      <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="3"><path d="M9 12l2 2 4-4" /></svg>
                    </span>
                  </div>
                  <div className="text-[0.7rem] text-muted-foreground mb-2">@marinacosta</div>
                  <div className="flex justify-center gap-5 py-2.5 mb-2 border-t border-b border-border/30">
                    {[
                      { v: "2.4M", l: "Seguidores" },
                      { v: "480K", l: "YouTube" },
                      { v: "12.8%", l: "Engajamento" },
                    ].map((s, i) => (
                      <div key={i} className="text-center">
                        <div className="text-xs font-extrabold text-foreground">{s.v}</div>
                        <div className="text-[0.5rem] text-muted-foreground uppercase tracking-widest font-semibold">{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[0.66rem] text-muted-foreground mb-3 leading-relaxed">Creator de lifestyle & beauty. Conectando marcas premium com autenticidade.</div>
                  <div className="flex justify-center gap-1.5 mb-3">
                    {["📸", "🎵", "▶️", "🐦"].map((e, i) => (
                      <div key={i} className="w-[30px] h-[30px] rounded-lg bg-card border border-border flex items-center justify-center text-xs">{e}</div>
                    ))}
                  </div>
                  {[
                    { title: "Meu novo projeto — GLOW", sub: "Lançamento exclusivo", icon: "✦", featured: true },
                    { title: "Canal no YouTube", sub: "+480k inscritos", icon: "▶", featured: false },
                    { title: "Playlist do momento", sub: "Spotify", icon: "♫", featured: false },
                    { title: "Media Kit 2026", sub: "Download PDF", icon: "📋", featured: false },
                  ].map((lk, i) => (
                    <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-xl mb-1.5 text-left transition-colors ${lk.featured ? "bg-primary/15 border border-primary/25" : "bg-card border border-border"}`}>
                      <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${lk.featured ? "bg-primary/15" : "bg-background/50"}`}>{lk.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[0.7rem] font-semibold text-foreground">{lk.title}</h4>
                        <span className="text-[0.56rem] text-muted-foreground">{lk.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── PROBLEM ───── */}
      <motion.section
        className="py-24 px-6 max-w-[1200px] mx-auto"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div variants={fadeUp} custom={0}>
          <span className="inline-flex items-center gap-2 text-[0.66rem] font-bold text-primary tracking-[0.14em] uppercase mb-5">
            <span className="w-4 h-px bg-primary" />
            O problema
          </span>
          <h2 className="font-display text-[clamp(1.9rem,3.5vw,3rem)] font-extrabold leading-[1.1] tracking-tight mb-4">
            Um link na bio
            <br />
            não deveria <span className="text-primary">limitar você.</span>
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-[560px] mb-12">
            Hoje sua bio é um gargalo. Você produz conteúdo, fecha parcerias, cria projetos — e tudo depende de um único link genérico que não faz jus ao seu trabalho.
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5" variants={stagger}>
          {PROBLEMS.map((p, i) => (
            <motion.div key={i} variants={cardFade} className="group relative bg-card/80 border border-border rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:border-border/80 hover:-translate-y-1">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />
              <span className="absolute top-4 right-5 text-5xl font-black text-foreground/[0.04] leading-none select-none">{p.num}</span>
              <h3 className="text-base font-bold text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ───── FEATURES ───── */}
      <motion.section
        id="features"
        className="py-24 px-6 max-w-[1200px] mx-auto text-center"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div variants={fadeUp} custom={0}>
          <span className="inline-flex items-center gap-2 text-[0.66rem] font-bold text-primary tracking-[0.14em] uppercase mb-5">
            <span className="w-4 h-px bg-primary" />
            A solução
          </span>
          <h2 className="font-display text-[clamp(1.9rem,3.5vw,3rem)] font-extrabold leading-[1.1] tracking-tight mb-4">
            Não é só um link.
            <br />
            É uma <span className="text-primary">experiência.</span>
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-[560px] mx-auto mb-12">
            O in1.bio transforma sua bio em uma página inteligente que centraliza, destaca e converte.
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} variants={cardFade} className="group relative bg-card/80 border border-border rounded-3xl p-8 text-left overflow-hidden transition-all duration-300 hover:border-primary/20 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-[hsl(190_80%_50%)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 text-xl">{f.emoji}</div>
              <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ───── CREATOR IMAGE SECTION ───── */}
      <motion.section
        className="py-24 px-6 max-w-[1200px] mx-auto"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={fadeUp} custom={0}>
            <img src={heroCreator} alt="Creator usando in1.bio" className="rounded-3xl w-full object-cover aspect-[4/5] shadow-[0_30px_80px_rgba(0,0,0,0.5)]" />
          </motion.div>
          <motion.div variants={fadeUp} custom={1}>
            <span className="inline-flex items-center gap-2 text-[0.66rem] font-bold text-primary tracking-[0.14em] uppercase mb-5">
              <span className="w-4 h-px bg-primary" />
              Feito para creators
            </span>
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.6rem)] font-extrabold leading-[1.08] tracking-tight mb-5">
              Sua presença digital merece ser <span className="text-primary">profissional.</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              Chega de páginas genéricas que não representam quem você é. Com o in1.bio, cada detalhe da sua página comunica autoridade e profissionalismo.
            </p>
            <div className="space-y-3">
              {[
                "Layouts que refletem sua identidade",
                "Campanhas com destaque visual e tracking",
                "Analytics para tomar decisões melhores",
                "Compartilhamento otimizado para redes sociais",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </span>
                  <span className="text-sm text-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ───── AUDIENCE ───── */}
      <motion.section
        id="for-who"
        className="py-24 px-6 max-w-[1200px] mx-auto text-center"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div variants={fadeUp} custom={0}>
          <span className="inline-flex items-center gap-2 text-[0.66rem] font-bold text-primary tracking-[0.14em] uppercase mb-5">
            <span className="w-4 h-px bg-primary" />
            Para quem
          </span>
          <h2 className="font-display text-[clamp(1.9rem,3.5vw,3rem)] font-extrabold leading-[1.1] tracking-tight mb-4">
            Feito para quem leva
            <br />
            <span className="text-primary">presença digital</span> a sério.
          </h2>
          <p className="text-base text-muted-foreground max-w-[560px] mx-auto mb-12">
            Se você cria, produz, vende ou se apresenta online — o in1.bio foi feito para você.
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" variants={stagger}>
          {AUDIENCE.map((a, i) => (
            <motion.div key={i} variants={cardFade} className="bg-card/80 border border-border rounded-2xl py-6 px-4 text-center transition-all duration-300 hover:border-primary/20 hover:-translate-y-1">
              <div className="text-3xl mb-2.5">{a.emoji}</div>
              <h4 className="text-sm font-bold text-foreground">{a.label}</h4>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ───── DIFF ───── */}
      <motion.section
        className="py-24 px-6 max-w-[1200px] mx-auto text-center"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div variants={fadeUp} custom={0}>
          <span className="inline-flex items-center gap-2 text-[0.66rem] font-bold text-primary tracking-[0.14em] uppercase mb-5">
            <span className="w-4 h-px bg-primary" />
            Diferencial
          </span>
          <h2 className="font-display text-[clamp(1.9rem,3.5vw,3rem)] font-extrabold leading-[1.1] tracking-tight mb-4">
            Por que <span className="text-primary">in1.bio</span> é diferente?
          </h2>
          <p className="text-base text-muted-foreground max-w-[560px] mx-auto mb-12">
            Não é mais um Linktree. É uma nova categoria.
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px] mx-auto" variants={stagger}>
          <motion.div variants={cardFade} className="bg-card/30 border border-border rounded-3xl p-8 text-left">
            <h3 className="text-base font-bold text-muted-foreground mb-5 flex items-center gap-2">
              <span className="text-xl">😐</span> Link-in-bio genérico
            </h3>
            <div className="space-y-0">
              {DIFF_OLD.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-border/30 last:border-b-0 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={cardFade} className="bg-primary/5 border border-primary/20 rounded-3xl p-8 text-left">
            <h3 className="text-base font-bold text-primary mb-5 flex items-center gap-2">
              <span className="text-xl">⚡</span> in1.bio
            </h3>
            <div className="space-y-0">
              {DIFF_NEW.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-border/20 last:border-b-0 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ───── SOCIAL PROOF QUOTE ───── */}
      <motion.section
        className="py-20 px-6 text-center"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div variants={fadeUp} custom={0}>
          <div className="text-4xl mb-6 opacity-30">✦</div>
          <p className="text-xl font-medium text-muted-foreground italic max-w-[600px] mx-auto leading-relaxed mb-4">
            "Criadores estão migrando para uma nova forma de usar a bio. Quem se apresenta melhor, <span className="text-primary font-bold not-italic">fecha mais.</span>"
          </p>
          <p className="text-sm text-muted-foreground/60">Feito para quem leva presença digital a sério.</p>
        </motion.div>
      </motion.section>

      {/* ───── AGENCY SECTION WITH IMAGE ───── */}
      <motion.section
        className="py-24 px-6 max-w-[1200px] mx-auto"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 text-[0.66rem] font-bold text-primary tracking-[0.14em] uppercase mb-5">
              <span className="w-4 h-px bg-primary" />
              Para agências
            </span>
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.6rem)] font-extrabold leading-[1.08] tracking-tight mb-5">
              Gerencie todos os seus creators em <span className="text-primary">um painel.</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              Painel white-label completo com gestão de membros, permissões por role, analytics detalhado e campanhas automatizadas. Tudo com a marca da sua agência.
            </p>
            <div className="space-y-3 mb-8">
              {[
                "Dashboard com métricas em tempo real",
                "Controle de permissões (Owner, Admin, Editor, Viewer)",
                "Campanhas com spotlight e contagem regressiva",
                "Domínio e branding customizados",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </span>
                  <span className="text-sm text-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div variants={fadeUp} custom={1}>
            <img src={teamImg} alt="Time de agência" className="rounded-3xl w-full object-cover aspect-[3/2] shadow-[0_30px_80px_rgba(0,0,0,0.5)]" />
          </motion.div>
        </div>
      </motion.section>

      {/* ───── PRICING ───── */}
      <motion.section
        id="pricing"
        className="py-24 px-6 max-w-[1200px] mx-auto text-center"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div variants={fadeUp} custom={0}>
          <span className="inline-flex items-center gap-2 text-[0.66rem] font-bold text-primary tracking-[0.14em] uppercase mb-5">
            <span className="w-4 h-px bg-primary" />
            Planos
          </span>
          <h2 className="font-display text-[clamp(1.9rem,3.5vw,3rem)] font-extrabold leading-[1.1] tracking-tight mb-4">
            Simples, transparente,
            <br />
            <span className="text-primary">sem surpresas.</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-[560px] mx-auto mb-12">
            Comece grátis. Evolua quando quiser.
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1000px] mx-auto" variants={stagger}>
          {/* Free */}
          <motion.div variants={cardFade} className="bg-card/80 border border-border rounded-3xl p-8 text-left transition-all duration-300 hover:border-border/80 hover:-translate-y-1">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Free</div>
            <div className="text-4xl font-extrabold text-foreground tracking-tight mb-1">R$0 <span className="text-base font-medium text-muted-foreground">/mês</span></div>
            <p className="text-sm text-muted-foreground mb-6">Para começar e sentir o poder.</p>
            <ul className="space-y-0 mb-7">
              {[
                { ok: true, text: "1 perfil de creator" },
                { ok: true, text: "Até 5 links" },
                { ok: true, text: "Até 3 produtos" },
                { ok: true, text: "1 layout básico" },
                { ok: true, text: "Redes sociais" },
                { ok: false, text: "Analytics" },
                { ok: false, text: "Campanhas Spotlight" },
                { ok: false, text: "Layout Imersivo" },
                { ok: false, text: "Cores e efeitos personalizados" },
                { ok: false, text: "Hero Reels" },
                { ok: false, text: "Selo verificado" },
                { ok: false, text: "Remover branding" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 py-2 border-b border-border/30 last:border-b-0 text-sm text-muted-foreground">
                  {item.ok ? <Check className="w-4 h-4 text-primary flex-shrink-0" /> : <span className="text-muted-foreground/30 flex-shrink-0">—</span>}
                  <span className={item.ok ? "" : "text-muted-foreground/40"}>{item.text}</span>
                </li>
              ))}
            </ul>
            <Link to="/login" className="block w-full py-3.5 text-center rounded-2xl bg-card border border-border text-foreground font-bold text-sm transition-all hover:bg-secondary">
              Começar grátis
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div variants={cardFade} className="relative bg-primary/5 border border-primary/20 rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[0.62rem] font-extrabold px-4 py-1 rounded-full tracking-widest uppercase">
              Mais popular
            </div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Pro</div>
            <div className="text-4xl font-extrabold text-foreground tracking-tight mb-1">R$17,90 <span className="text-base font-medium text-muted-foreground">/mês</span></div>
            <p className="text-sm text-muted-foreground mb-6">Para creators que querem se destacar.</p>
            <ul className="space-y-0 mb-7">
              {[
                "Até 2 perfis de creator",
                "Links & produtos ilimitados",
                "Todos os layouts (incl. Imersivo)",
                "Campanhas Spotlight",
                "Hero Reels",
                "Analytics completo",
                "Cores e efeitos personalizados",
                "Selo verificado",
                "Remover branding in1.bio",
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-2.5 py-2 border-b border-border/20 last:border-b-0 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
            <Link to="/login" className="block w-full py-3.5 text-center rounded-2xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)]">
              Assinar Pro
            </Link>
          </motion.div>

          {/* Enterprise */}
          <motion.div variants={cardFade} className="bg-card/80 border border-border rounded-3xl p-8 text-left transition-all duration-300 hover:border-border/80 hover:-translate-y-1">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Enterprise</div>
            <div className="text-4xl font-extrabold text-foreground tracking-tight mb-1">R$87,90 <span className="text-base font-medium text-muted-foreground">/mês</span></div>
            <p className="text-sm text-muted-foreground mb-6">Para agências e equipes maiores.</p>
            <ul className="space-y-0 mb-7">
              {[
                "Até 10 perfis de creator",
                "Tudo do plano Pro",
                "Criação em lote de perfis",
                "Dashboard multi-creator",
                "Membros de equipe ilimitados",
                "Templates salvos ilimitados",
                "Domínio customizado",
                "Suporte prioritário",
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-2.5 py-2 border-b border-border/30 last:border-b-0 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
            <Link to="/login" className="block w-full py-3.5 text-center rounded-2xl bg-card border border-border text-foreground font-bold text-sm transition-all hover:bg-secondary">
              Assinar Enterprise
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ───── FINAL CTA ───── */}
      <motion.section
        className="relative py-32 px-6 text-center overflow-hidden"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_60%,hsl(var(--primary)/0.06),transparent)]" />
        <div className="relative z-[1] max-w-[600px] mx-auto">
          <motion.h2 variants={fadeUp} custom={0} className="font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.06] tracking-tight mb-5">
            Pronto para uma bio que
            <br />
            <span className="text-primary">realmente funciona?</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-base text-muted-foreground max-w-[440px] mx-auto mb-10">
            Crie sua página em menos de 2 minutos. Grátis.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-9 py-4 bg-primary text-primary-foreground font-extrabold text-base rounded-2xl transition-all hover:shadow-[0_0_40px_hsl(var(--primary)/0.3)] hover:scale-[1.03] active:scale-[0.98]"
            >
              Criar minha página grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-base font-extrabold text-muted-foreground">
            <span className="text-foreground">in1</span>.bio
          </span>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            <Link to="/privacidade" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacidade</Link>
            <Link to="/termos" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Termos de Uso</Link>
            <Link to="/cookies" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cookies</Link>
            <a href="mailto:contato@in1.bio" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contato</a>
          </div>
          <span className="text-[0.72rem] text-muted-foreground/50">
            © {new Date().getFullYear()} in1.bio — Todos os direitos reservados.
          </span>
        </div>
      </footer>
    </div>
  );
}
