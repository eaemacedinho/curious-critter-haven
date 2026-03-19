import { useState } from "react";
import { toast } from "sonner";

interface SettingsScreenProps {
  onNavigate: (tab: string) => void;
}

const plans = [
  { id: "starter", name: "Starter", price: "R$ 0", period: "/mês", features: ["Até 3 creators", "Página básica", "Analytics simples", "Suporte por email"], current: false },
  { id: "pro", name: "Pro", price: "R$ 97", period: "/mês", features: ["Até 25 creators", "Páginas premium", "Analytics avançado", "Domínio personalizado", "Suporte prioritário", "Branding customizado"], current: true, popular: true },
  { id: "enterprise", name: "Enterprise", price: "R$ 297", period: "/mês", features: ["Creators ilimitados", "White label completo", "API access", "Manager dedicado", "SLA garantido", "Relatórios personalizados"], current: false },
];

const invoices = [
  { date: "01/Mar/2026", description: "Plano Pro — Março 2026", amount: "R$ 97,00", status: "Pago" },
  { date: "01/Fev/2026", description: "Plano Pro — Fevereiro 2026", amount: "R$ 97,00", status: "Pago" },
  { date: "01/Jan/2026", description: "Plano Pro — Janeiro 2026", amount: "R$ 97,00", status: "Pago" },
  { date: "01/Dez/2025", description: "Plano Pro — Dezembro 2025", amount: "R$ 97,00", status: "Pago" },
];

export default function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const [activeSection, setActiveSection] = useState("branding");
  const [agencyName, setAgencyName] = useState("Kreatorz Agency");
  const [agencySlug, setAgencySlug] = useState("kreatorz");
  const [primaryColor, setPrimaryColor] = useState("#6B2BD4");
  const [accentColor, setAccentColor] = useState("#A855F7");
  const [domain, setDomain] = useState("kreatorz.ai");
  const [customDomain, setCustomDomain] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const sections = [
    { id: "branding", icon: "🎨", label: "Branding" },
    { id: "domain", icon: "🌐", label: "Domínios" },
    { id: "plan", icon: "💎", label: "Plano" },
    { id: "billing", icon: "💳", label: "Faturamento" },
    { id: "account", icon: "⚙", label: "Conta" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-56px)] pt-14 max-md:flex-col">
      {/* Sidebar */}
      <aside className="w-[264px] max-md:w-full bg-k-850 border-r max-md:border-r-0 max-md:border-b border-primary/10 p-6 pt-6 flex flex-col flex-shrink-0">
        <button onClick={() => onNavigate("dash")} className="flex items-center gap-2 text-sm text-k-3 hover:text-primary-foreground transition-colors mb-6">
          ← Voltar ao Dashboard
        </button>
        <h2 className="font-display text-xl font-normal text-primary-foreground mb-6">Configurações</h2>
        <div className="flex max-md:flex-row max-md:overflow-x-auto max-md:gap-1 flex-col gap-0.5 scrollbar-none">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 whitespace-nowrap text-left ${
                activeSection === sec.id ? "bg-k-glow text-k-300 font-semibold" : "text-k-3 hover:bg-k-700/50 hover:text-k-1"
              }`}
            >
              <span className="text-xs">{sec.icon}</span>
              {sec.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-7 max-md:p-5 overflow-y-auto">
        {/* BRANDING */}
        {activeSection === "branding" && (
          <div className="max-w-[640px]">
            <h1 className="font-display text-2xl font-normal text-primary-foreground mb-1">Branding</h1>
            <p className="text-sm text-k-3 mb-8">Personalize a identidade visual da sua agência em todas as páginas.</p>

            {/* Logo */}
            <div className="mb-8">
              <label className="block text-[0.72rem] font-semibold text-k-2 uppercase tracking-wider mb-3">Logo da agência</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-k-800 border-2 border-dashed border-primary/20 flex items-center justify-center overflow-hidden cursor-pointer hover:border-k-400 transition-all group"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoUrl(URL.createObjectURL(file));
                        toast.success("Logo atualizado!");
                      }
                    };
                    input.click();
                  }}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-2xl group-hover:scale-110 transition-transform">📷</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-k-2">Faça upload do logo</p>
                  <p className="text-[0.68rem] text-k-4">PNG ou SVG · recomendado 512×512px</p>
                </div>
              </div>
            </div>

            {/* Agency Name */}
            <div className="mb-5">
              <label className="block text-[0.72rem] font-semibold text-k-2 uppercase tracking-wider mb-1.5">Nome da agência</label>
              <input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} className="w-full px-4 py-3 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 focus:shadow-[0_0_0_3px_hsl(268_69%_50%_/_0.12)] transition-all" />
            </div>

            {/* Slug */}
            <div className="mb-5">
              <label className="block text-[0.72rem] font-semibold text-k-2 uppercase tracking-wider mb-1.5">Slug da agência</label>
              <div className="flex items-center bg-k-800 border border-primary/10 rounded-xl overflow-hidden focus-within:border-k-400 focus-within:shadow-[0_0_0_3px_hsl(268_69%_50%_/_0.12)] transition-all">
                <span className="px-3 text-k-4 text-sm border-r border-primary/10">kreatorz.ai/</span>
                <input value={agencySlug} onChange={(e) => setAgencySlug(e.target.value)} className="flex-1 px-3 py-3 bg-transparent text-k-1 text-sm outline-none" />
              </div>
            </div>

            {/* Colors */}
            <div className="mb-5">
              <label className="block text-[0.72rem] font-semibold text-k-2 uppercase tracking-wider mb-3">Cores da marca</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[0.68rem] text-k-3 mb-1.5">Cor primária</label>
                  <div className="flex items-center gap-2.5 bg-k-800 border border-primary/10 rounded-xl px-3 py-2.5">
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent" />
                    <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="bg-transparent text-k-1 text-sm outline-none flex-1 font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.68rem] text-k-3 mb-1.5">Cor de destaque</label>
                  <div className="flex items-center gap-2.5 bg-k-800 border border-primary/10 rounded-xl px-3 py-2.5">
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent" />
                    <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="bg-transparent text-k-1 text-sm outline-none flex-1 font-mono" />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mb-6">
              <label className="block text-[0.72rem] font-semibold text-k-2 uppercase tracking-wider mb-3">Pré-visualização</label>
              <div className="bg-k-800 border border-primary/10 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground font-extrabold text-lg" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
                  {agencyName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-primary-foreground">{agencyName}</div>
                  <div className="text-[0.7rem] text-k-4">kreatorz.ai/{agencySlug}</div>
                </div>
              </div>
            </div>

            <button onClick={() => toast.success("Branding salvo com sucesso!")} className="px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:bg-k-400 hover:shadow-k-purple active:scale-[0.97]">
              Salvar alterações
            </button>
          </div>
        )}

        {/* DOMAINS */}
        {activeSection === "domain" && (
          <div className="max-w-[640px]">
            <h1 className="font-display text-2xl font-normal text-primary-foreground mb-1">Domínios</h1>
            <p className="text-sm text-k-3 mb-8">Configure domínios personalizados para suas páginas de creators.</p>

            {/* Current domain */}
            <div className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl p-5 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[0.66rem] text-k-4 uppercase tracking-wider font-bold mb-1">Domínio padrão</div>
                  <div className="text-sm text-primary-foreground font-semibold font-mono">{agencySlug}.kreatorz.ai</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[0.68rem] font-semibold bg-[hsl(var(--k-ok))]/10 text-k-ok flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" /> Ativo
                </span>
              </div>
            </div>

            {/* Custom domain */}
            <div className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl p-5 mb-5">
              <div className="text-[0.66rem] text-k-4 uppercase tracking-wider font-bold mb-3">Domínio personalizado</div>
              <div className="flex gap-2.5 mb-3">
                <input
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="ex: links.suaagencia.com"
                  className="flex-1 px-4 py-3 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 focus:shadow-[0_0_0_3px_hsl(268_69%_50%_/_0.12)] transition-all placeholder:text-k-4"
                />
                <button
                  onClick={() => {
                    if (customDomain) {
                      toast.success(`Domínio "${customDomain}" adicionado!`, { description: "Configure o DNS conforme instruções abaixo." });
                    } else {
                      toast.error("Digite um domínio válido");
                    }
                  }}
                  className="px-5 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:bg-k-400 hover:shadow-k-purple active:scale-[0.97] whitespace-nowrap"
                >
                  Conectar
                </button>
              </div>
              {customDomain && (
                <div className="bg-k-800/50 border border-primary/5 rounded-xl p-4 space-y-2">
                  <p className="text-[0.72rem] font-bold text-k-2">Configuração DNS necessária:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 text-[0.7rem]">
                      <span className="px-2 py-0.5 bg-primary/10 text-k-300 rounded font-mono font-bold">A</span>
                      <span className="text-k-3">@</span>
                      <span className="text-k-4">→</span>
                      <span className="text-k-1 font-mono">185.158.133.1</span>
                    </div>
                    <div className="flex items-center gap-3 text-[0.7rem]">
                      <span className="px-2 py-0.5 bg-primary/10 text-k-300 rounded font-mono font-bold">A</span>
                      <span className="text-k-3">www</span>
                      <span className="text-k-4">→</span>
                      <span className="text-k-1 font-mono">185.158.133.1</span>
                    </div>
                    <div className="flex items-center gap-3 text-[0.7rem]">
                      <span className="px-2 py-0.5 bg-k-warn/10 text-k-warn rounded font-mono font-bold">TXT</span>
                      <span className="text-k-3">_lovable</span>
                      <span className="text-k-4">→</span>
                      <span className="text-k-1 font-mono text-[0.65rem]">lovable_verify=kr_{agencySlug}</span>
                    </div>
                  </div>
                  <p className="text-[0.65rem] text-k-4 mt-2">A propagação DNS pode levar até 72h. SSL será provisionado automaticamente.</p>
                </div>
              )}
            </div>

            {/* Existing domain */}
            {domain && (
              <div className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[0.66rem] text-k-4 uppercase tracking-wider font-bold mb-1">Domínio conectado</div>
                    <div className="text-sm text-primary-foreground font-semibold font-mono">{domain}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[0.68rem] font-semibold bg-[hsl(var(--k-ok))]/10 text-k-ok flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" /> SSL Ativo
                    </span>
                    <button onClick={() => { setDomain(""); toast.info("Domínio removido"); }} className="text-k-4 hover:text-k-err text-xs transition-colors">✕</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PLAN */}
        {activeSection === "plan" && (
          <div className="max-w-[900px]">
            <h1 className="font-display text-2xl font-normal text-primary-foreground mb-1">Plano</h1>
            <p className="text-sm text-k-3 mb-8">Escolha o plano ideal para sua agência.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div key={plan.id} className={`bg-card/65 backdrop-blur-xl border rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  plan.current ? "border-k-400 shadow-k-purple" : "border-primary/10 hover:border-k-glow"
                }`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-k-300" />
                  )}
                  {plan.popular && (
                    <span className="absolute top-3 right-3 text-[0.6rem] font-bold text-k-300 bg-primary/15 px-2.5 py-1 rounded-full uppercase tracking-wider">Popular</span>
                  )}
                  <h3 className="text-lg font-bold text-primary-foreground mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-0.5 mb-5">
                    <span className="text-3xl font-extrabold text-primary-foreground">{plan.price}</span>
                    <span className="text-sm text-k-3">{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-k-2">
                        <span className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <svg className="w-2.5 h-2.5 text-k-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      if (plan.current) {
                        toast.info("Este é seu plano atual");
                      } else {
                        toast.success(`Plano ${plan.name} selecionado!`, { description: "Alteração será aplicada no próximo ciclo." });
                      }
                    }}
                    className={`w-full py-3 font-semibold text-sm rounded-xl transition-all active:scale-[0.97] ${
                      plan.current
                        ? "bg-k-800 border border-primary/10 text-k-3 cursor-default"
                        : "bg-primary text-primary-foreground hover:bg-k-400 hover:shadow-k-purple"
                    }`}
                  >
                    {plan.current ? "Plano atual" : plan.price === "R$ 0" ? "Fazer downgrade" : "Fazer upgrade"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BILLING */}
        {activeSection === "billing" && (
          <div className="max-w-[640px]">
            <h1 className="font-display text-2xl font-normal text-primary-foreground mb-1">Faturamento</h1>
            <p className="text-sm text-k-3 mb-8">Gerencie seu método de pagamento e veja seu histórico.</p>

            {/* Payment method */}
            <div className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl p-5 mb-5">
              <div className="text-[0.66rem] text-k-4 uppercase tracking-wider font-bold mb-3">Método de pagamento</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg flex items-center justify-center text-primary-foreground text-[0.6rem] font-bold">VISA</div>
                  <div>
                    <div className="text-sm text-primary-foreground font-medium">•••• •••• •••• 4242</div>
                    <div className="text-[0.68rem] text-k-4">Expira 12/2028</div>
                  </div>
                </div>
                <button onClick={() => toast.info("Editar cartão — em breve!")} className="text-sm text-k-300 font-medium hover:text-k-200 transition-colors">Alterar</button>
              </div>
            </div>

            {/* Next billing */}
            <div className="bg-gradient-to-r from-primary/15 to-k-600/5 border border-primary/20 rounded-2xl p-5 mb-5 flex items-center justify-between">
              <div>
                <div className="text-[0.66rem] text-k-4 uppercase tracking-wider font-bold mb-1">Próxima cobrança</div>
                <div className="text-xl font-extrabold text-primary-foreground">R$ 97,00</div>
                <div className="text-[0.7rem] text-k-3 mt-0.5">em 01/Abr/2026</div>
              </div>
              <div className="text-3xl opacity-20">📅</div>
            </div>

            {/* Invoices */}
            <div className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-primary-foreground/5">
                <div className="text-[0.66rem] text-k-4 uppercase tracking-wider font-bold">Histórico de faturas</div>
              </div>
              {invoices.map((inv, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-primary-foreground/5 last:border-b-0 hover:bg-k-700/30 transition-colors">
                  <div className="flex-1">
                    <div className="text-sm text-primary-foreground font-medium">{inv.description}</div>
                    <div className="text-[0.68rem] text-k-4">{inv.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-k-2">{inv.amount}</span>
                    <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-semibold bg-[hsl(var(--k-ok))]/10 text-k-ok">{inv.status}</span>
                    <button onClick={() => toast.info("Download da fatura")} className="text-k-4 hover:text-k-300 transition-colors text-xs">📥</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACCOUNT */}
        {activeSection === "account" && (
          <div className="max-w-[640px]">
            <h1 className="font-display text-2xl font-normal text-primary-foreground mb-1">Conta</h1>
            <p className="text-sm text-k-3 mb-8">Gerencie as informações da sua conta.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-[0.72rem] font-semibold text-k-2 uppercase tracking-wider mb-1.5">Email</label>
                <input value="admin@kreatorz.ai" readOnly className="w-full px-4 py-3 bg-k-800 border border-primary/10 rounded-xl text-k-3 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[0.72rem] font-semibold text-k-2 uppercase tracking-wider mb-1.5">Senha</label>
                <div className="flex gap-2.5">
                  <input type="password" value="••••••••••" readOnly className="flex-1 px-4 py-3 bg-k-800 border border-primary/10 rounded-xl text-k-3 text-sm outline-none" />
                  <button onClick={() => toast.info("Alterar senha — em breve!")} className="px-4 py-3 bg-k-800 border border-primary/10 rounded-xl text-k-3 text-sm hover:border-k-400 hover:text-primary-foreground transition-all">
                    Alterar
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[0.72rem] font-semibold text-k-2 uppercase tracking-wider mb-1.5">Fuso horário</label>
                <select className="w-full px-4 py-3 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 transition-all appearance-none cursor-pointer">
                  <option>América/São_Paulo (UTC-3)</option>
                  <option>América/New_York (UTC-5)</option>
                  <option>Europa/Lisboa (UTC+0)</option>
                </select>
              </div>
              <div>
                <label className="block text-[0.72rem] font-semibold text-k-2 uppercase tracking-wider mb-1.5">Idioma</label>
                <select className="w-full px-4 py-3 bg-k-800 border border-primary/10 rounded-xl text-k-1 text-sm outline-none focus:border-k-400 transition-all appearance-none cursor-pointer">
                  <option>Português (Brasil)</option>
                  <option>English</option>
                  <option>Español</option>
                </select>
              </div>

              <button onClick={() => toast.success("Configurações salvas!")} className="px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:bg-k-400 hover:shadow-k-purple active:scale-[0.97]">
                Salvar alterações
              </button>

              <div className="pt-6 border-t border-primary/10">
                <h3 className="text-sm font-bold text-k-err mb-2">Zona de perigo</h3>
                <p className="text-[0.72rem] text-k-4 mb-3">Ações irreversíveis. Tenha cuidado.</p>
                <div className="flex gap-2.5">
                  <button onClick={() => toast.error("Todos os dados seriam exportados")} className="px-4 py-2.5 bg-k-800 border border-primary/10 rounded-xl text-k-3 text-sm hover:border-k-3 transition-all">
                    Exportar dados
                  </button>
                  <button onClick={() => toast.error("Esta ação não pode ser desfeita", { description: "Conta NÃO deletada (mockup)" })} className="px-4 py-2.5 bg-k-err/10 border border-k-err/20 rounded-xl text-k-err text-sm hover:bg-k-err/20 transition-all">
                    Deletar conta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
