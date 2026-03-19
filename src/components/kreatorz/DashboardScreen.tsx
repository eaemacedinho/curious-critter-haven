import { useState } from "react";
import { toast } from "sonner";
import AnalyticsCharts from "./AnalyticsCharts";

interface DashboardScreenProps {
  onNavigate: (tab: string) => void;
}

const creatorsData = [
  { name: "Marina Costa", handle: "@marinacosta", url: "kreatorz.ai/@marinacosta", status: "ok", statusLabel: "Ativo", views: "4.823", perf: "98%", growth: "+24%", rank: "#1", img: 32 },
  { name: "Rafael Mendes", handle: "@rafaelmendes", url: "kreatorz.ai/@rafaelmendes", status: "ok", statusLabel: "Ativo", views: "3.217", perf: "87%", growth: "+18%", rank: "#2", img: 11 },
  { name: "Julia Fernandes", handle: "@juliafernandes", url: "kreatorz.ai/@juliafernandes", status: "dr", statusLabel: "Rascunho", views: "—", perf: "—", growth: "—", rank: "—", img: 5 },
  { name: "Thiago Oliveira", handle: "@thiago.oli", url: "kreatorz.ai/@thiago.oli", status: "ok", statusLabel: "Ativo", views: "2.891", perf: "82%", growth: "+12%", rank: "#3", img: 53 },
  { name: "Camila Santos", handle: "@camilasantos", url: "kreatorz.ai/@camilasantos", status: "off", statusLabel: "Inativo", views: "510", perf: "41%", growth: "-5%", rank: "#5", img: 9 },
];

const statusColors: Record<string, string> = {
  ok: "bg-[hsl(var(--k-ok))]/10 text-k-ok",
  dr: "bg-[hsl(var(--k-warn))]/10 text-k-warn",
  off: "bg-[hsl(var(--k-err))]/10 text-k-err",
};

export default function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const filteredCreators = creatorsData.filter((cr) =>
    cr.name.toLowerCase().includes(search.toLowerCase()) || cr.handle.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(`https://${url}`);
    toast.success("URL copiada!");
    setMenuOpen(null);
  };

  const handleViewCreator = () => {
    onNavigate("creator");
    setMenuOpen(null);
  };

  const sidebarItems = [
    { icon: "▦", label: "Dashboard", id: "dashboard" },
    { icon: "👥", label: "Creators", id: "creators", badge: String(creatorsData.length) },
    { icon: "📊", label: "Analytics", id: "analytics" },
    { icon: "📢", label: "Campanhas", id: "campanhas" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-56px)] pt-14">
      {/* Sidebar */}
      <aside className="w-[264px] bg-k-850 border-r border-primary/10 p-6 pt-6 flex flex-col flex-shrink-0 max-lg:hidden">
        <div className="flex items-center gap-2 px-2.5 pb-6 border-b border-primary/10 mb-6 font-extrabold text-[1.1rem] text-primary-foreground">
          <span className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center text-[0.7rem] text-primary-foreground font-extrabold">K</span>
          Kreator<span className="text-k-300">z</span>
        </div>
        <div className="mb-6">
          <div className="text-[0.6rem] font-bold text-k-4 tracking-[0.14em] uppercase px-3 mb-2">Principal</div>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm mb-0.5 transition-all duration-200 cursor-pointer text-left ${
                activeSection === item.id ? "bg-k-glow text-k-300 font-semibold" : "text-k-3 hover:bg-k-700/50 hover:text-k-1"
              }`}
            >
              <span className="text-xs w-4 text-center">{item.icon}</span>
              {item.label}
              {item.badge && <span className="ml-auto bg-primary text-primary-foreground text-[0.6rem] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </div>
        <div className="mb-6">
          <div className="text-[0.6rem] font-bold text-k-4 tracking-[0.14em] uppercase px-3 mb-2">Configurações</div>
          {[
            { icon: "⚙", label: "Conta" },
            { icon: "🎨", label: "Branding" },
            { icon: "🌐", label: "Domínios" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate("settings")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-k-3 hover:bg-k-700/50 hover:text-k-1 transition-all duration-200 cursor-pointer mb-0.5 text-left"
            >
              <span className="text-xs w-4 text-center">{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2.5 p-3 border-t border-primary/10">
          <div className="w-[34px] h-[34px] rounded-full overflow-hidden flex-shrink-0 border-2 border-primary">
            <img src="https://i.pravatar.cc/80?img=60" alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-sm font-semibold text-primary-foreground">Kreatorz Agency</div>
            <div className="text-[0.68rem] text-k-4">Admin · Pro Plan</div>
          </div>
          <button onClick={() => onNavigate("login")} className="ml-auto text-k-4 hover:text-k-err transition-colors text-xs" title="Sair">🚪</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-7 overflow-y-auto">
        <div className="flex items-center justify-between mb-7 flex-wrap gap-3.5">
          <h1 className="font-display text-2xl font-normal text-primary-foreground capitalize">{activeSection}</h1>
          <div className="flex gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-k-800 border border-primary/10 rounded-xl focus-within:border-k-400 focus-within:shadow-[0_0_0_3px_hsl(268_69%_50%_/_0.12)] transition-all min-w-[220px]">
              <span className="text-k-4 text-sm">🔍</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar creator..." className="bg-transparent border-none outline-none text-k-1 text-sm w-full placeholder:text-k-4" />
            </div>
            <button onClick={() => onNavigate("editor")} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all duration-300 hover:bg-k-400 hover:shadow-k-purple active:scale-[0.97]">
              + Novo Creator
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
          {[
            { label: "Creators ativos", value: "24", change: "↑ +12% este mês", up: true },
            { label: "Views totais", value: "18.4k", change: "↑ +28% este mês", up: true },
            { label: "Cliques em links", value: "6.2k", change: "↑ +15% este mês", up: true },
            { label: "CTR médio", value: "33.7%", change: "↓ -2% este mês", up: false },
          ].map((stat, i) => (
            <div key={i} className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl p-5 relative overflow-hidden group hover:border-k-glow transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-k-300 rounded-sm opacity-40" />
              <div className="text-[0.68rem] text-k-3 font-semibold uppercase tracking-wider mb-2">{stat.label}</div>
              <div className="text-3xl font-extrabold text-primary-foreground tracking-tight">{stat.value}</div>
              <div className={`text-[0.7rem] mt-1.5 font-semibold ${stat.up ? "text-k-ok" : "text-k-err"}`}>{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-r from-primary/15 to-k-600/5 border border-primary/20 rounded-2xl p-5 mb-8 flex items-center justify-between">
          <div>
            <div className="text-[0.68rem] text-k-3 font-semibold uppercase tracking-wider mb-1">Receita estimada (mês)</div>
            <div className="text-3xl font-extrabold text-primary-foreground tracking-tight">R$ 12.840</div>
            <div className="text-[0.7rem] text-k-ok font-semibold mt-1">↑ +34% vs mês anterior</div>
          </div>
          <div className="text-5xl opacity-20">💰</div>
        </div>

        {/* Analytics Charts */}
        {(activeSection === "dashboard" || activeSection === "analytics") && <AnalyticsCharts />}

        {/* Creators Table */}
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-display text-lg font-normal text-primary-foreground">Creators</h2>
          <span className="text-[0.68rem] text-k-4">{filteredCreators.length} resultado(s)</span>
        </div>
        <div className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2.2fr_1.2fr_0.7fr_0.7fr_0.7fr_0.6fr_0.5fr_80px] items-center px-5 py-3 border-b border-primary-foreground/5 text-[0.65rem] font-bold text-k-4 uppercase tracking-wider max-lg:hidden">
            <div>Creator</div>
            <div>URL</div>
            <div>Status</div>
            <div>Views (30d)</div>
            <div>Performance</div>
            <div>Crescimento</div>
            <div>Ranking</div>
            <div></div>
          </div>
          {/* Rows */}
          {filteredCreators.length === 0 && (
            <div className="px-5 py-10 text-center text-k-4 text-sm">Nenhum creator encontrado para "{search}"</div>
          )}
          {filteredCreators.map((cr, i) => (
            <div key={i} className="grid grid-cols-[2.2fr_1.2fr_0.7fr_0.7fr_0.7fr_0.6fr_0.5fr_80px] max-lg:grid-cols-[2fr_1fr_80px] items-center px-5 py-3.5 border-b border-primary-foreground/5 last:border-b-0 hover:bg-k-700/30 transition-colors text-sm">
              <div className="flex items-center gap-3 cursor-pointer" onClick={handleViewCreator}>
                <div className="w-[38px] h-[38px] rounded-full overflow-hidden flex-shrink-0 border-2 border-k-glow">
                  <img src={`https://i.pravatar.cc/80?img=${cr.img}`} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-semibold text-primary-foreground hover:text-k-300 transition-colors">{cr.name}</div>
                  <div className="text-[0.7rem] text-k-4">{cr.handle}</div>
                </div>
              </div>
              <div className="font-mono text-[0.72rem] text-k-3 max-lg:hidden cursor-pointer hover:text-k-200 transition-colors" onClick={() => handleCopyUrl(cr.url)} title="Clique para copiar">{cr.url}</div>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.68rem] font-semibold ${statusColors[cr.status]}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {cr.statusLabel}
                </span>
              </div>
              <div className="text-k-2 max-lg:hidden">{cr.views}</div>
              <div className="max-lg:hidden">
                <span className={`text-[0.75rem] font-bold ${cr.perf !== "—" ? "text-k-300" : "text-k-4"}`}>{cr.perf}</span>
              </div>
              <div className="max-lg:hidden">
                <span className={`text-[0.75rem] font-semibold ${cr.growth?.startsWith("+") ? "text-k-ok" : cr.growth?.startsWith("-") ? "text-k-err" : "text-k-4"}`}>{cr.growth}</span>
              </div>
              <div className="max-lg:hidden">
                <span className="text-[0.75rem] font-extrabold text-k-400">{cr.rank}</span>
              </div>
              <div className="flex gap-1.5 justify-end relative">
                <button onClick={() => onNavigate("editor")} className="w-[30px] h-[30px] rounded-lg bg-k-800 border border-primary/10 flex items-center justify-center transition-all duration-200 hover:border-k-400 hover:bg-k-glow text-k-3 hover:text-k-300 text-xs" title="Editar">✏</button>
                <div className="relative">
                  <button onClick={() => setMenuOpen(menuOpen === i ? null : i)} className="w-[30px] h-[30px] rounded-lg bg-k-800 border border-primary/10 flex items-center justify-center transition-all duration-200 hover:border-k-400 hover:bg-k-glow text-k-3 hover:text-k-300 text-xs">⋮</button>
                  {menuOpen === i && (
                    <div className="absolute right-0 top-9 z-50 w-44 bg-k-850 border border-primary/10 rounded-xl shadow-k overflow-hidden">
                      <button onClick={handleViewCreator} className="w-full px-4 py-2.5 text-left text-sm text-k-2 hover:bg-k-glow hover:text-primary-foreground transition-colors flex items-center gap-2">
                        👁 Ver página
                      </button>
                      <button onClick={() => handleCopyUrl(cr.url)} className="w-full px-4 py-2.5 text-left text-sm text-k-2 hover:bg-k-glow hover:text-primary-foreground transition-colors flex items-center gap-2">
                        📋 Copiar URL
                      </button>
                      <button onClick={() => { onNavigate("editor"); setMenuOpen(null); }} className="w-full px-4 py-2.5 text-left text-sm text-k-2 hover:bg-k-glow hover:text-primary-foreground transition-colors flex items-center gap-2">
                        ✏ Editar
                      </button>
                      <button onClick={() => { toast.info(`Analytics de ${cr.name}`); setMenuOpen(null); }} className="w-full px-4 py-2.5 text-left text-sm text-k-2 hover:bg-k-glow hover:text-primary-foreground transition-colors flex items-center gap-2">
                        📊 Analytics
                      </button>
                      <div className="border-t border-primary/10" />
                      <button onClick={() => { toast.error(`${cr.name} desativado`); setMenuOpen(null); }} className="w-full px-4 py-2.5 text-left text-sm text-k-err hover:bg-k-err/10 transition-colors flex items-center gap-2">
                        🗑 Desativar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      {/* Click outside to close menu */}
      {menuOpen !== null && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />}
    </div>
  );
}
