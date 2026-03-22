import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import in1Logo from "@/assets/in1-logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardFade = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2 font-extrabold text-lg tracking-tight text-foreground">
            <span className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-xs text-primary-foreground font-extrabold">
              1
            </span>
            All in<span className="text-primary"> 1</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.97]"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex items-center px-6 sm:px-8 pt-14 relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] -top-[20%] -right-[12%] rounded-full bg-primary/30 blur-[90px] animate-k-orb" />
        <div className="absolute w-[380px] h-[380px] -bottom-[10%] -left-[6%] rounded-full bg-primary/15 blur-[90px] animate-k-orb" style={{ animationDelay: "-6s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(107,43,212,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(107,43,212,.03)_1px,transparent_1px)] bg-[size:64px_64px]" style={{ maskImage: "radial-gradient(ellipse 65% 55% at 50% 40%, #000, transparent)" }} />

        <div className="max-w-[1200px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-[1]">
          <motion.div className="lg:text-left text-center" initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 pl-2 border border-border rounded-full text-[0.7rem] font-bold text-muted-foreground tracking-widest uppercase bg-accent/10 mb-7">
              <span className="w-[7px] h-[7px] rounded-full bg-primary shadow-[0_0_8px] shadow-primary animate-k-pulse" />
              Plataforma White-Label
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="font-display text-[clamp(2.2rem,5vw,4rem)] font-normal leading-[1.06] tracking-tight text-foreground mb-6">
              O link-in-bio que seus <em className="italic text-primary">creators</em> merecem.
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-[490px] mb-9 lg:mx-0 mx-auto">
              Pare de usar links genéricos. Crie páginas exclusivas com a marca da sua agência, gerencie creators e acompanhe resultados em um só lugar.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex gap-3.5 flex-wrap lg:justify-start justify-center">
              <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-2xl transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.97]">
                Começar agora
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} custom={4} className="flex items-center gap-3.5 mt-9 lg:justify-start justify-center">
              <div className="flex -space-x-2">
                {[1, 5, 9, 16].map((n) => (
                  <img key={n} src={`https://i.pravatar.cc/80?img=${n}`} alt="" className="w-8 h-8 rounded-full border-2 border-background object-cover" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground"><span className="text-foreground font-bold">+200 agências</span> já usam a plataforma</p>
            </motion.div>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 50, rotateY: -12 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: "1000px" }}
          >
            <div className="transition-transform duration-700 hover:rotate-0" style={{ transform: "rotateY(-6deg) rotateX(2deg)" }}>
              <div className="w-[280px] sm:w-[310px] bg-card rounded-[48px] border border-border p-2 shadow-k">
                <div className="bg-background rounded-[42px] overflow-hidden">
                  <div className="w-[86px] h-[26px] bg-background rounded-b-2xl mx-auto relative z-[2]" />
                  <div className="px-4 pb-5 text-center">
                    <div className="w-20 h-20 rounded-full border-[2.5px] border-primary mx-auto mb-2.5 overflow-hidden shadow-[0_0_28px] shadow-primary/25">
                      <img src="https://i.pravatar.cc/200?img=32" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="font-bold text-sm text-foreground flex items-center justify-center gap-1">
                      Marina Costa
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="hsl(268,69%,50%)" /><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" /></svg>
                    </div>
                    <div className="text-[0.68rem] text-muted-foreground mb-3">@marinacosta</div>
                    {[
                      { title: "Meu novo projeto — GLOW", is_featured: true },
                      { title: "Canal no YouTube" },
                      { title: "Playlist do momento" },
                    ].map((link, i) => (
                      <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-xl mb-1.5 text-left ${link.is_featured ? "gradient-primary" : "bg-card border border-border"}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${link.is_featured ? "bg-primary-foreground/15" : "bg-accent/10"}`}>
                          {link.is_featured ? "⭐" : i === 1 ? "▶" : "🎵"}
                        </div>
                        <h4 className="text-[0.7rem] font-semibold flex-1 text-foreground">{link.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <motion.section className="py-20 px-6 sm:px-8 max-w-[1200px] mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
        <motion.h2 variants={fadeUp} custom={0} className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-normal leading-[1.1] tracking-tight text-foreground max-w-[700px] mb-4">
          Tudo que sua agência precisa, em <em className="italic text-primary">um só lugar</em>.
        </motion.h2>
        <motion.p variants={fadeUp} custom={1} className="text-base text-muted-foreground leading-relaxed max-w-[540px] mb-12">
          Gerencie creators, campanhas e métricas. Com a marca da sua agência.
        </motion.p>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
          {[
            { icon: "🎨", title: "White-Label", desc: "Sua marca, suas cores, seu domínio. Totalmente personalizado." },
            { icon: "👥", title: "Gestão de Creators", desc: "Gerencie perfis, links e campanhas de todos os seus talentos." },
            { icon: "📢", title: "Spotlight Campaigns", desc: "Destaque campanhas automaticamente com analytics integrado." },
            { icon: "📊", title: "Analytics em Tempo Real", desc: "Acompanhe cliques, views e CTR de cada creator e campanha." },
          ].map((card, i) => (
            <motion.div key={i} variants={cardFade} className="bg-card border border-border rounded-2xl p-7 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 text-xl">{card.icon}</div>
              <h3 className="text-sm font-bold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* CTA */}
      <motion.section className="text-center py-24 px-6 sm:px-8 relative" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,hsl(268_69%_50%_/_0.15),transparent)]" />
        <div className="relative z-[1]">
          <motion.h2 variants={fadeUp} custom={0} className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-normal leading-[1.1] tracking-tight text-foreground max-w-[620px] mx-auto mb-4">
            Pronto para transformar sua agência?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-base text-muted-foreground max-w-[440px] mx-auto mb-8">
            Comece gratuitamente e veja a diferença em minutos.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-2xl transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.97]">
              Criar minha conta
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 text-center">
        <span className="text-[0.7rem] text-muted-foreground">
          © {new Date().getFullYear()} All in 1 · in1.bio
        </span>
      </footer>
    </div>
  );
}
