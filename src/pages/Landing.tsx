import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Zap, BarChart3, Palette, Users, Globe, Shield, Sparkles, ChevronRight } from "lucide-react";
import in1Logo from "@/assets/in1-logo.png";
import in1Icon from "@/assets/in1-icon.png";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardFade = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const FEATURES = [
  { icon: Palette, title: "White-Label Total", desc: "Sua marca, cores e domínio. Ninguém sabe que somos nós por trás." },
  { icon: Users, title: "Gestão de Creators", desc: "Gerencie perfis, links e campanhas de todos os seus talentos em um painel." },
  { icon: Zap, title: "Spotlight Campaigns", desc: "Destaque campanhas com contagem regressiva, CTA e analytics integrados." },
  { icon: BarChart3, title: "Analytics em Tempo Real", desc: "Cliques, visualizações, engajamento e CTR por creator e campanha." },
  { icon: Globe, title: "Página Pública Premium", desc: "Layouts modernos, tipografia customizada, efeitos visuais e Hero Reels." },
  { icon: Shield, title: "Multi-Tenancy Seguro", desc: "Isolamento completo por agência com RLS e controle de permissões." },
];

const STATS = [
  { value: "2M+", label: "Links clicados" },
  { value: "500+", label: "Creators ativos" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 200ms", label: "Tempo de carga" },
];

const TESTIMONIALS = [
  { name: "Lucas Ferreira", role: "CEO, Influence Hub", avatar: "https://i.pravatar.cc/80?img=12", text: "Transformou completamente como gerenciamos nossos creators. O white-label é impecável." },
  { name: "Camila Santos", role: "Gerente, TalentFlow", avatar: "https://i.pravatar.cc/80?img=5", text: "O analytics em tempo real mudou nosso jogo. Agora temos dados para cada decisão." },
  { name: "Rafael Costa", role: "Founder, DigitalPulse", avatar: "https://i.pravatar.cc/80?img=68", text: "Nossos creators adoram as páginas. O spotlight de campanhas gera um engajamento absurdo." },
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
    <div className="min-h-screen bg-background text-foreground">
      {/* ───── Navbar ───── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={in1Logo} alt="in1.bio" className="h-7 object-contain invert dark:invert-0" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-flex">
              Login
            </Link>
            <Link to="/login" className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.97]">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      <section className="relative min-h-[100vh] flex items-center pt-16 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute w-[700px] h-[700px] -top-[25%] -right-[15%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute w-[500px] h-[500px] -bottom-[15%] -left-[10%] rounded-full bg-primary/10 blur-[100px] animate-pulse" style={{ animationDelay: "3s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" style={{ maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%,#000,transparent)" }} />

        <div className="max-w-[1200px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-[1]">
          <motion.div className="lg:text-left text-center" initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/20 rounded-full text-[0.7rem] font-bold text-primary tracking-widest uppercase bg-primary/5 mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Gratuito para sempre
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="font-display text-[clamp(2.4rem,5.5vw,4.2rem)] font-extrabold leading-[1.04] tracking-tight mb-6">
              Um link para
              <br />
              <span className="text-primary">tudo que você cria.</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground leading-relaxed max-w-[500px] mb-10 lg:mx-0 mx-auto">
              Compartilhe seus links, vídeos, produtos e projetos em uma única página bonita e profissional. Grátis, para sempre.
            </motion.p>

            {/* Claim username CTA */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 max-w-[460px] lg:mx-0 mx-auto">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground/60 pointer-events-none select-none">
                  in1.bio/
                </span>
                <input
                  type="text"
                  value={claimUser}
                  onChange={(e) => setClaimUser(e.target.value.replace(/\s/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                  placeholder="seuusuario"
                  maxLength={30}
                  className="w-full h-14 pl-[4.5rem] pr-4 rounded-2xl bg-card border-2 border-border text-foreground text-sm font-medium placeholder:text-muted-foreground/40 outline-none focus:border-primary transition-colors"
                />
              </div>
              <button
                onClick={handleClaim}
                disabled={!claimUser.trim()}
                className="h-14 px-7 bg-primary text-primary-foreground font-bold text-sm rounded-2xl transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 justify-center whitespace-nowrap"
              >
                Criar minha página
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="flex items-center gap-3.5 mt-8 lg:justify-start justify-center">
              <div className="flex -space-x-2.5">
                {[1, 5, 9, 16, 32].map((n) => (
                  <img key={n} src={`https://i.pravatar.cc/80?img=${n}`} alt="" className="w-8 h-8 rounded-full border-2 border-background object-cover" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-bold">+10.000</span> páginas criadas
              </p>
            </motion.div>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 60, rotateY: -12 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: "1200px" }}
          >
            <div className="transition-transform duration-700 hover:rotate-0" style={{ transform: "rotateY(-6deg) rotateX(2deg)" }}>
              <div className="w-[280px] sm:w-[310px] bg-card rounded-[48px] border border-border p-2 shadow-[0_40px_100px_-20px_hsl(var(--primary)/0.2)]">
                <div className="bg-background rounded-[42px] overflow-hidden">
                  <div className="w-[86px] h-[26px] bg-background rounded-b-2xl mx-auto relative z-[2]" />
                  <div className="px-4 pb-6 text-center">
                    <div className="w-20 h-20 rounded-full border-[2.5px] border-primary mx-auto mb-3 overflow-hidden shadow-[0_0_28px] shadow-primary/25">
                      <img src="https://i.pravatar.cc/200?img=32" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="font-bold text-sm text-foreground flex items-center justify-center gap-1">
                      Marina Costa
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="hsl(var(--primary))" /><path d="M9 12l2 2 4-4" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" fill="none" /></svg>
                    </div>
                    <div className="text-[0.68rem] text-muted-foreground mb-4">@marinacosta</div>

                    {/* Social icons */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {["📸", "▶️", "🎵", "🐦"].map((e, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-xs">{e}</div>
                      ))}
                    </div>

                    {[
                      { title: "🔥 Meu novo projeto — GLOW", featured: true },
                      { title: "▶ Canal no YouTube", featured: false },
                      { title: "🎵 Playlist do momento", featured: false },
                      { title: "🛍 Minha loja", featured: false },
                    ].map((link, i) => (
                      <div key={i} className={`flex items-center gap-2.5 p-3 rounded-xl mb-2 text-left transition-all ${link.featured ? "bg-primary/15 border border-primary/30" : "bg-card border border-border"}`}>
                        <h4 className="text-[0.7rem] font-semibold flex-1 text-foreground">{link.title}</h4>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── Stats bar ───── */}
      <motion.section
        className="py-16 px-6 border-y border-border/50 bg-card/30"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div key={i} variants={fadeUp} custom={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ───── Features ───── */}
      <motion.section
        className="py-24 px-6 max-w-[1200px] mx-auto"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/20 rounded-full text-[0.7rem] font-bold text-primary tracking-widest uppercase bg-primary/5 mb-6">
            Funcionalidades
          </span>
          <h2 className="font-display text-[clamp(1.8rem,3.5vw,3rem)] font-extrabold leading-[1.08] tracking-tight max-w-[700px] mx-auto mb-4">
            Tudo que sua agência precisa, em <span className="text-primary">um só lugar</span>.
          </h2>
          <p className="text-base text-muted-foreground max-w-[540px] mx-auto">
            Gerencie creators, campanhas e métricas com a marca da sua agência.
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" variants={stagger}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} variants={cardFade} className="group bg-card border border-border rounded-2xl p-7 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.15)]">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 transition-colors group-hover:bg-primary/20">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ───── How it works ───── */}
      <motion.section
        className="py-24 px-6 bg-card/30 border-y border-border/50"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
      >
        <div className="max-w-[900px] mx-auto">
          <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/20 rounded-full text-[0.7rem] font-bold text-primary tracking-widest uppercase bg-primary/5 mb-6">
              Como funciona
            </span>
            <h2 className="font-display text-[clamp(1.8rem,3.5vw,3rem)] font-extrabold leading-[1.08] tracking-tight mb-4">
              3 passos para começar
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Crie sua conta", desc: "Registre-se gratuitamente e escolha seu username único." },
              { step: "02", title: "Personalize sua página", desc: "Adicione seus links, vídeos, produtos e customize o visual." },
              { step: "03", title: "Compartilhe", desc: "Use seu link in1.bio/ em todas as suas redes sociais." },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i + 1} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                  <span className="text-lg font-extrabold text-primary">{s.step}</span>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ───── Testimonials ───── */}
      <motion.section
        className="py-24 px-6 max-w-[1200px] mx-auto"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/20 rounded-full text-[0.7rem] font-bold text-primary tracking-widest uppercase bg-primary/5 mb-6">
            Depoimentos
          </span>
          <h2 className="font-display text-[clamp(1.8rem,3.5vw,3rem)] font-extrabold leading-[1.08] tracking-tight mb-4">
            Quem usa, <span className="text-primary">recomenda</span>.
          </h2>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5" variants={stagger}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} variants={cardFade} className="bg-card border border-border rounded-2xl p-7">
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-bold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ───── For agencies section ───── */}
      <motion.section
        className="py-24 px-6 bg-card/30 border-y border-border/50"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/20 rounded-full text-[0.7rem] font-bold text-primary tracking-widest uppercase bg-primary/5 mb-6">
              Para agências
            </span>
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.6rem)] font-extrabold leading-[1.08] tracking-tight mb-5">
              Gerencie todos os seus creators em <span className="text-primary">um painel</span>.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              Painel white-label completo com gestão de membros, permissões por role, analytics detalhado e campanhas automatizadas. Tudo com a marca da sua agência.
            </p>
            <div className="space-y-4">
              {[
                "Dashboard com métricas em tempo real",
                "Controle de permissões (Owner, Admin, Editor, Viewer)",
                "Campanhas com spotlight e contagem regressiva",
                "Domínio e branding customizados",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>
                  </div>
                  <span className="text-sm text-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="relative">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.1)]">
              {/* Fake dashboard preview */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <img src={in1Icon} alt="" className="w-4 h-4 object-contain invert dark:invert-0" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Minha Agência</div>
                  <div className="text-[0.6rem] text-muted-foreground">3 creators · 12 campanhas</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Views", value: "24.5K" },
                  { label: "Cliques", value: "8.2K" },
                  { label: "CTR", value: "33.4%" },
                ].map((s, i) => (
                  <div key={i} className="bg-background border border-border/50 rounded-xl p-3 text-center">
                    <div className="text-lg font-extrabold text-primary">{s.value}</div>
                    <div className="text-[0.6rem] text-muted-foreground font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { name: "Marina Costa", views: "12.3K" },
                  { name: "João Silva", views: "8.1K" },
                  { name: "Ana Beatriz", views: "4.1K" },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border/50">
                    <img src={`https://i.pravatar.cc/40?img=${[32, 12, 5][i]}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">{c.name}</div>
                      <div className="text-[0.6rem] text-muted-foreground">{c.views} views</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ───── Final CTA ───── */}
      <motion.section
        className="relative py-32 px-6 text-center overflow-hidden"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="relative z-[1] max-w-[600px] mx-auto">
          <motion.div variants={fadeUp} custom={0}>
            <img src={in1Icon} alt="" className="w-12 h-12 mx-auto mb-8 object-contain invert dark:invert-0" />
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.06] tracking-tight mb-5">
            Crie sua página agora.
            <br />
            <span className="text-primary">É grátis.</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-base text-muted-foreground max-w-[440px] mx-auto mb-10">
            Junte-se a milhares de creators e agências que já usam o in1.bio para compartilhar tudo em um só link.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 max-w-[420px] mx-auto">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground/60 pointer-events-none select-none">
                in1.bio/
              </span>
              <input
                type="text"
                value={claimUser}
                onChange={(e) => setClaimUser(e.target.value.replace(/\s/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                placeholder="seuusuario"
                maxLength={30}
                className="w-full h-14 pl-[4.5rem] pr-4 rounded-2xl bg-card border-2 border-border text-foreground text-sm font-medium placeholder:text-muted-foreground/40 outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              onClick={handleClaim}
              disabled={!claimUser.trim()}
              className="h-14 px-7 bg-primary text-primary-foreground font-bold text-sm rounded-2xl transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-40 flex items-center gap-2 justify-center whitespace-nowrap"
            >
              Começar
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={in1Logo} alt="in1.bio" className="h-5 object-contain invert dark:invert-0" />
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            <a href="mailto:contato@in1.bio" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contato</a>
          </div>
          <span className="text-[0.7rem] text-muted-foreground">
            © {new Date().getFullYear()} All in 1 · in1.bio
          </span>
        </div>
      </footer>
    </div>
  );
}
