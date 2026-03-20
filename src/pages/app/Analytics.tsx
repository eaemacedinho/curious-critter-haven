import { useAuth } from "@/hooks/useAuth";
import AnalyticsCharts from "@/components/kreatorz/AnalyticsCharts";
import CampaignAnalytics from "@/components/kreatorz/CampaignAnalytics";

export default function Analytics() {
  const { user } = useAuth();

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-normal text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Acompanhe o desempenho de todos os seus creators e campanhas.
        </p>
      </div>

      <AnalyticsCharts />

      <div className="mt-4">
        <h2 className="font-display text-lg font-normal text-foreground mb-4">📢 Campanhas Spotlight</h2>
        <CampaignAnalytics userId={user?.id} />
      </div>
    </div>
  );
}
