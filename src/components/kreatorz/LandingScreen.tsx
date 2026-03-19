import { motion } from "framer-motion";

interface LandingScreenProps {
  onNavigate: (tab: string) => void;
}

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

export default function LandingScreen({ onNavigate }: LandingScreenProps) {
  return (
    <div className="min-h-screen pt-14">
      {/* HERO */}
      <section className="min-h-[calc(100vh-56px)] flex items-center px-8 py-16 relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] -top-[20%] -right-[12%] rounded-full bg-primary/30 blur-[90px] animate-k-orb" />
        <div className="absolute w-[380px] h-[380px] -bottom-[10%] -left-[6%] rounded-full bg-k-400/15 blur-[90px] animate-k-orb" style={{ animationDelay: "-6s" }} />
        <div className="absolute w-[180px] h-[180px] top-[45%] left-[38%] rounded-full bg-k-300/8 blur-[90px] animate-k-orb" style={{ animationDelay: "-3s" }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(107,43,212,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(107,43,212,.03)_1px,transparent_1px)] bg-[size:64px_64px]" style={{ maskImage: "radial-gradient(ellipse 65% 55% at 50% 40%, #000, transparent)" }} />

        <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-[1]">
          <motion.div className="lg:text-left text-center" initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 pl-2 border border-k-glow rounded-full text-[0.7rem] font-bold text-k-200 tracking-widest uppercase bg-k-glow mb-7">
              <span className="w-[7px] h-[7px] rounded-full bg-k-400 shadow-[0_0_8px] shadow-k-400 animate-k-pulse" />
              Creator Economy Platform
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="font-display text-[clamp(2.4rem,5.2vw,4.4rem)] font-normal leading-[1.06] tracking-tight text-primary-foreground mb-6">
              O link-in-bio que seus <em className="italic text-k-300">creators</em> merecem.
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-[1.05rem] text-k-2 leading-relaxed max-w-[490px] mb-9 lg:mx-0 mx-auto">
              Pare de usar links genéricos que desvalorizam seus talentos. A Kreatorz cria páginas exclusivas, estratégicas e com a marca da sua agência.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex gap-3.5 flex-wrap lg:justify-start justify-center">
              <button onClick={() => onNavigate("login")} className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-2xl transition-all duration-300 hover:bg-k-400 hover:shadow-k-purple hover:-translate-y-0.5 active:scale-[0.97]">
                Solicitar acesso
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
              </button>
              <button onClick={() => onNavigate("creator")} className="inline-flex items-center gap-2 px-6 py-3.5 border border-k-glow text-k-2 font-medium text-sm rounded-2xl transition-all duration-300 hover:border-k-400 hover:text-primary-foreground hover:bg-k-glow hover:-translate-y-0.5">
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Ver demo
              </button>
            </motion.div>
            <motion.div variants={fadeUp} custom={4} className="flex items-center gap-3.5 mt-9 lg:justify-start justify-center">
              <div className="flex -space-x-2">
                {[1, 5, 9, 16].map((n) => (
                  <img key={n} src={`https://i.pravatar.cc/80?img=${n}`} alt="" className="w-[34px] h-[34px] rounded-full border-2 border-background object-cover" />
                ))}
              </div>
              <p className="text-sm text-k-3"><span className="text-k-1 font-bold">+200 creators</span> já usam Kreatorz Pages</p>
            </motion.div>
          </motion.div>

          {/* PHONE MOCKUP */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 50, rotateY: -12 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: "1000px" }}
          >
            <div className="transition-transform duration-700 hover:rotate-0" style={{ transform: "rotateY(-6deg) rotateX(2deg)" }}>
              <div className="w-[310px] bg-k-850 rounded-[48px] border border-primary/[0.14] p-2 shadow-k" style={{ boxShadow: "var(--k-shadow), 0 0 140px hsl(268 69% 50% / 0.06), inset 0 1px 0 rgba(255,255,255,.03)" }}>
                <div className="bg-background rounded-[42px] overflow-hidden">
                  <div className="w-[86px] h-[26px] bg-background rounded-b-2xl mx-auto relative z-[2]" />
                  <div className="px-4 pb-5 text-center">
                    <div className="w-20 h-20 rounded-full border-[2.5px] border-primary mx-auto mb-2.5 overflow-hidden shadow-[0_0_28px] shadow-primary/25">
                      <img src="https://i.pravatar.cc/200?img=32" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="font-bold text-[0.98rem] text-primary-foreground flex items-center justify-center gap-1">
                      Marina Costa
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="hsl(268,69%,50%)" /><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" /></svg>
                    </div>
                    <div className="text-[0.68rem] text-k-3 mb-2">@marinacosta</div>
                    <div className="flex justify-center gap-4 mb-3 py-2 border-t border-b border-primary-foreground/5">
                      {[{ v: "2.4M", l: "Seguidores" }, { v: "480K", l: "YouTube" }, { v: "12.8%", l: "Engajamento" }].map((s) => (
                        <div key={s.l} className="text-center">
                          <strong className="block text-[0.82rem] font-bold text-primary-foreground">{s.v}</strong>
                          <span className="text-[0.58rem] text-k-3 uppercase tracking-wider">{s.l}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center gap-1.5 mb-3">
                      {["ig", "tt", "yt", "tw"].map((icon) => (
                        <span key={icon} className="w-8 h-8 rounded-[10px] bg-k-800 border border-primary/10 flex items-center justify-center text-k-2 text-xs">
                          {icon === "ig" ? "📸" : icon === "tt" ? "🎵" : icon === "yt" ? "▶" : "𝕏"}
                        </span>
                      ))}
                    </div>
                    {[
                      { title: "Meu novo projeto — GLOW", featured: true },
                      { title: "Canal no YouTube" },
                      { title: "Playlist do momento" },
                    ].map((link, i) => (
                      <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-xl mb-1.5 text-left transition-all duration-200 ${link.featured ? "gradient-primary border-transparent" : "bg-k-800 border border-primary/10"}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${link.featured ? "bg-primary-foreground/15" : "bg-primary-foreground/[0.06]"}`}>
                          {link.featured ? "⭐" : i === 1 ? "▶" : "🎵"}
                        </div>
                        <h4 className="text-[0.7rem] font-semibold flex-1">{link.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM */}
      <motion.section
        className="py-24 px-8 max-w-[1200px] mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 text-[0.66rem] font-bold text-k-300 tracking-[0.15em] uppercase mb-5">
          <span className="text-sm">⚡</span> O Problema
        </motion.div>
        <motion.h2 variants={fadeUp} custom={1} className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-normal leading-[1.1] tracking-tight text-primary-foreground max-w-[700px] mb-4">
          Links genéricos <em className="italic text-k-300">desvalorizam</em> seus creators.
        </motion.h2>
        <motion.p variants={fadeUp} custom={2} className="text-base text-k-2 leading-relaxed max-w-[540px] mb-14">
          Linktree e similares tratam todos iguais. Seu creator merece uma página com a identidade da sua agência.
        </motion.p>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
          {[
            { icon: "👁", title: "Sem identidade", desc: "Plataformas genéricas não permitem branding. Sua agência fica invisível." },
            { icon: "📊", title: "Sem controle", desc: "Sem gestão centralizada, sem métricas, sem otimização." },
            { icon: "🎯", title: "Sem estratégia", desc: "Links soltos sem lógica de campanha ou CTA direcionado." },
            { icon: "🛡", title: "Sem premium", desc: "Visual free não combina com creators de alto valor." },
          ].map((card, i) => (
            <motion.div
              key={i}
              variants={cardFade}
              className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-3xl p-8 transition-all duration-300 relative overflow-hidden group hover:border-k-glow hover:-translate-y-1.5 hover:shadow-k-purple before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100"
            >
              <div className="w-12 h-12 rounded-xl bg-k-glow border border-k-glow flex items-center justify-center mb-5 text-xl">{card.icon}</div>
              <h3 className="text-base font-bold text-primary-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-k-2 leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* HOW IT WORKS */}
      <motion.section
        className="py-24 px-8 max-w-[1200px] mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 text-[0.66rem] font-bold text-k-300 tracking-[0.15em] uppercase mb-5">
          <span className="text-sm">⚡</span> Como Funciona
        </motion.div>
        <motion.h2 variants={fadeUp} custom={1} className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-normal leading-[1.1] tracking-tight text-primary-foreground max-w-[700px] mb-4">
          Crie páginas <em className="italic text-k-300">incríveis</em> em minutos.
        </motion.h2>
        <motion.p variants={fadeUp} custom={2} className="text-base text-k-2 leading-relaxed max-w-[540px] mb-14">
          Um fluxo simples para gerenciar todos os creators em um só lugar.
        </motion.p>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
          {[
            { title: "Crie o perfil", desc: "Adicione creator, configure nome, bio, avatar e links." },
            { title: "Personalize", desc: "Escolha tema, destaque campanhas, organize com drag & drop." },
            { title: "Publique", desc: "Um clique e a página fica live em kreatorz.ai/@creator." },
            { title: "Acompanhe", desc: "Monitore cliques, views e performance no dashboard." },
          ].map((step, i) => (
            <motion.div
              key={i}
              variants={cardFade}
              className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-3xl p-9 pb-7 relative overflow-hidden group hover:border-k-glow transition-all duration-300"
            >
              <div className="absolute top-3 right-4 text-[2.8rem] font-extrabold leading-none bg-gradient-to-br from-k-600 to-k-800 bg-clip-text text-transparent">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="w-9 h-[3px] rounded-sm bg-primary mb-5" />
              <h3 className="text-base font-bold text-primary-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-k-2 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* AUDIENCE */}
      <motion.section
        className="py-24 px-8 max-w-[1200px] mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 text-[0.66rem] font-bold text-k-300 tracking-[0.15em] uppercase mb-5">
          👥 Para Quem
        </motion.div>
        <motion.h2 variants={fadeUp} custom={1} className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-normal leading-[1.1] tracking-tight text-primary-foreground max-w-[700px] mb-4">
          Feito para quem leva <em className="italic text-k-300">creators</em> a sério.
        </motion.h2>
        <motion.p variants={fadeUp} custom={2} className="text-base text-k-2 leading-relaxed max-w-[540px] mb-14">
          A plataforma ideal para agências, managers e creators profissionais.
        </motion.p>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
          {[
            { emoji: "🏢", title: "Agências", desc: "Gerencie dezenas de creators em um painel único." },
            { emoji: "🎬", title: "Managers", desc: "Upgrade profissional no portfólio dos seus talentos." },
            { emoji: "⭐", title: "Creators", desc: "Uma página premium à altura da sua audiência." },
            { emoji: "📢", title: "Marcas", desc: "Destaque campanhas e links patrocinados." },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={cardFade}
              className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-3xl p-7 text-center transition-all duration-300 hover:border-k-glow hover:-translate-y-1"
            >
              <div className="text-4xl mb-3.5">{item.emoji}</div>
              <h4 className="text-sm font-bold text-primary-foreground mb-1.5">{item.title}</h4>
              <p className="text-sm text-k-2">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="text-center py-28 px-8 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,hsl(268_69%_50%_/_0.22),transparent)]" />
        <div className="relative z-[1]">
          <motion.h2 variants={fadeUp} custom={0} className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-normal leading-[1.1] tracking-tight text-primary-foreground max-w-[620px] mx-auto mb-4">
            Pronto para criar páginas que <em className="italic text-k-300">impressionam</em>?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-base text-k-2 leading-relaxed max-w-[440px] mx-auto mb-8">
            Solicite acesso antecipado e transforme como seus creators se apresentam.
          </motion.p>
          <motion.button
            variants={fadeUp}
            custom={2}
            onClick={() => onNavigate("login")}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-2xl transition-all duration-300 hover:bg-k-400 hover:shadow-k-purple hover:-translate-y-0.5 active:scale-[0.97]"
          >
            Solicitar acesso antecipado
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}
