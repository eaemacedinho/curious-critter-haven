import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import CampaignAnalytics from "@/components/kreatorz/CampaignAnalytics";

export default function Analytics() {
  const { agency } = useTenant();
  const [hasData, setHasData] = useState<boolean | null>(null);

  useEffect(() => {
    if (!agency) return;
    (async () => {
      const { data: creators } = await supabase
        .from("creators")
        .select("id")
        .eq("agency_id", agency.id);

      if (!creators?.length) {
        setHasData(false);
        return;
      }

      const { data: campaigns } = await supabase
        .from("creator_campaigns")
        .select("id")
        .in("creator_id", creators.map((c) => c.id))
        .limit(1);

      setHasData((campaigns?.length || 0) > 0);
    })();
  }, [agency]);

  if (hasData === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-normal text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Acompanhe o desempenho de todos os seus creators e campanhas.
        </p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full bg-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center">
              <div className="text-4xl animate-k-float">📊</div>
            </div>
            <div className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs animate-k-pulse">📈</div>
          </div>

          <h2 className="font-display text-xl text-foreground text-center mb-2">
            Nenhum dado de analytics ainda
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
            Os dados de analytics aparecem automaticamente quando seus creators recebem visitas e cliques nas campanhas Spotlight.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/app/creators"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.97] min-h-[48px]"
            >
              👥 Gerenciar Creators
            </Link>
            <Link
              to="/app/campaigns"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border text-foreground font-medium text-sm rounded-xl transition-all hover:border-primary/30 min-h-[48px]"
            >
              📢 Ver Campanhas
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full max-w-2xl">
            {[
              { icon: "🖱", title: "Cliques", desc: "Total de cliques em campanhas e links dos seus creators." },
              { icon: "📈", title: "CTR", desc: "Taxa de conversão das campanhas Spotlight ativas." },
              { icon: "🔥", title: "Performance", desc: "Ranking de campanhas por engajamento e cliques." },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 text-center group hover:border-primary/20 transition-all">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h4 className="text-sm font-semibold text-foreground mb-1">{item.title}</h4>
                <p className="text-[0.72rem] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <CampaignAnalytics agencyId={agency?.id} />
      )}
    </div>
  );
}
