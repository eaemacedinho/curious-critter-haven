import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import AnalyticsCharts from "@/components/kreatorz/AnalyticsCharts";
import CampaignAnalytics from "@/components/kreatorz/CampaignAnalytics";

export default function Dashboard() {
  const { user } = useAuth();
  const { agency } = useTenant();

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-normal text-foreground">
          Bem-vindo, {agency?.name || ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral da sua plataforma</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Creators ativos", value: "—", change: "Configure seus creators", up: true },
          { label: "Views totais", value: "—", change: "Dados em tempo real", up: true },
          { label: "Cliques em links", value: "—", change: "Após publicar creators", up: true },
          { label: "CTR médio", value: "—", change: "Analytics disponível", up: true },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-primary/50 rounded-sm opacity-40" />
            <div className="text-[0.68rem] text-muted-foreground font-semibold uppercase tracking-wider mb-2">{stat.label}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{stat.value}</div>
            <div className="text-[0.7rem] mt-1.5 text-muted-foreground">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <AnalyticsCharts />

      {/* Campaign Analytics */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-normal text-foreground mb-4">📢 Spotlight Campaigns</h2>
        <CampaignAnalytics userId={user?.id} />
      </div>
    </div>
  );
}
