import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import CampaignAnalytics from "@/components/kreatorz/CampaignAnalytics";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist";
import { useOnboarding } from "@/hooks/useOnboarding";

interface DashboardStats {
  creatorsCount: number;
  campaignsCount: number;
  liveCampaigns: number;
  totalClicks: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { agency } = useTenant();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const onboarding = useOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const onboardingTriggered = useRef(false);

  useEffect(() => {
    if (!onboarding.loading && onboarding.needsOnboarding && !onboardingTriggered.current) {
      onboardingTriggered.current = true;
      setShowOnboarding(true);
    }
  }, [onboarding.loading, onboarding.needsOnboarding]);

  useEffect(() => {
    if (!agency) return;
    (async () => {
      setLoading(true);
      const { data: creators } = await supabase
        .from("creators")
        .select("id")
        .eq("agency_id", agency.id);

      const creatorsCount = creators?.length || 0;

      if (creatorsCount === 0) {
        setStats({ creatorsCount: 0, campaignsCount: 0, liveCampaigns: 0, totalClicks: 0 });
        setLoading(false);
        return;
      }

      const creatorIds = creators!.map((c) => c.id);
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id, live")
        .in("creator_id", creatorIds);

      const campaignsCount = campaigns?.length || 0;
      const liveCampaigns = campaigns?.filter((c) => c.live).length || 0;

      let totalClicks = 0;
      if (campaignsCount > 0) {
        const { data: clicks } = await supabase
          .from("campaign_clicks")
          .select("id")
          .in("campaign_id", campaigns!.map((c) => c.id));
        totalClicks = clicks?.length || 0;
      }

      setStats({ creatorsCount, campaignsCount, liveCampaigns, totalClicks });
      setLoading(false);
    })();
  }, [agency]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isEmpty = !stats || stats.creatorsCount === 0;

  return (
    <>
      {showOnboarding && (
        <OnboardingFlow onComplete={() => { setShowOnboarding(false); onboarding.refreshChecklist(); onboarding.markFresh(); }} />
      )}
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-normal text-foreground">
            Bem-vindo, {agency?.name || ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral da sua plataforma</p>
        </div>

        {!showOnboarding && onboarding.completed && onboarding.checklistProgress < 4 && (
          <OnboardingChecklist state={onboarding} />
        )}

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-full bg-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center">
                <div className="text-5xl animate-k-float">🚀</div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm animate-k-pulse">✨</div>
            </div>

            <h2 className="font-display text-xl sm:text-2xl text-foreground text-center mb-2">
              Sua plataforma está pronta!
            </h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
              Comece criando seu primeiro creator para publicar páginas personalizadas, lançar campanhas spotlight e acompanhar métricas de engajamento.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/app/creators"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.97] min-h-[48px]"
              >
                👥 Criar primeiro Creator
              </Link>
              <Link
                to="/app/settings"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border text-foreground font-medium text-sm rounded-xl transition-all hover:border-primary/30 min-h-[48px]"
              >
                ⚙ Personalizar agência
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full max-w-2xl">
              {[
                { step: "1", icon: "👤", title: "Crie um Creator", desc: "Nome, bio, foto e links." },
                { step: "2", icon: "📢", title: "Lance Campanhas", desc: "Spotlight para destacar." },
                { step: "3", icon: "📊", title: "Veja Métricas", desc: "Cliques, CTR e engajamento." },
              ].map((item) => (
                <div key={item.step} className="bg-card border border-border rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden group hover:border-primary/20 transition-all min-w-0">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary-readable font-bold text-xs sm:text-sm flex items-center justify-center mx-auto mb-2">
                    {item.step}
                  </div>
                  <div className="text-lg sm:text-xl mb-1.5">{item.icon}</div>
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-0.5 truncate">{item.title}</h4>
                  <p className="text-[0.65rem] sm:text-[0.72rem] text-muted-foreground leading-relaxed line-clamp-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Creators", value: String(stats!.creatorsCount), icon: "👥" },
                { label: "Campanhas", value: String(stats!.campaignsCount), icon: "📢" },
                { label: "Ao vivo", value: String(stats!.liveCampaigns), icon: "🔥" },
                { label: "Cliques", value: stats!.totalClicks.toLocaleString(), icon: "🖱" },
              ].map((stat, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-3 sm:p-5 relative overflow-hidden min-w-0">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-primary/50 rounded-sm opacity-40" />
                  <div className="flex items-center justify-between mb-1.5 gap-1">
                    <div className="text-[0.62rem] sm:text-[0.68rem] text-muted-foreground font-semibold uppercase tracking-wider truncate">{stat.label}</div>
                    <span className="text-base sm:text-lg shrink-0">{stat.icon}</span>
                  </div>
                  <div className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight truncate">{stat.value}</div>
                </div>
              ))}
            </div>

            {stats!.campaignsCount > 0 && (
              <div className="mb-8">
                <h2 className="font-display text-lg font-normal text-foreground mb-4">📢 Spotlight Campaigns</h2>
                <CampaignAnalytics agencyId={agency?.id} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
