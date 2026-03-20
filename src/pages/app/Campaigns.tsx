import { useAuth } from "@/hooks/useAuth";
import CampaignAnalytics from "@/components/kreatorz/CampaignAnalytics";
import { Link } from "react-router-dom";

export default function Campaigns() {
  const { user } = useAuth();

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-normal text-foreground">Campanhas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie suas campanhas spotlight e acompanhe o desempenho.
          </p>
        </div>
        <Link
          to="/app/creators/edit"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.97]"
        >
          + Nova Campanha
        </Link>
      </div>

      {/* Info card */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1">Como funcionam as campanhas</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Campanhas Spotlight aparecem automaticamente no topo da página do creator quando marcadas como "Ao vivo". 
              Configure duração, prioridade e imagem no <Link to="/app/creators/edit" className="text-primary hover:underline">editor do creator</Link>.
            </p>
          </div>
        </div>
      </div>

      {/* Campaign Analytics */}
      <CampaignAnalytics userId={user?.id} />
    </div>
  );
}
