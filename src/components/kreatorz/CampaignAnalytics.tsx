import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CampaignStat {
  id: string;
  title: string;
  live: boolean;
  clicks: number;
  expires_at: string | null;
}

interface Props {
  agencyId: string | undefined;
}

export default function CampaignAnalytics({ agencyId }: Props) {
  const [stats, setStats] = useState<CampaignStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalClicks, setTotalClicks] = useState(0);

  useEffect(() => {
    if (!agencyId) return;
    (async () => {
      setLoading(true);

      // Get all creators for agency
      const { data: creators } = await supabase
        .from("creators")
        .select("id")
        .eq("agency_id", agencyId);

      if (!creators || creators.length === 0) { setLoading(false); return; }

      // Get all campaigns for these creators
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("*")
        .in("creator_id", creators.map(c => c.id))
        .order("sort_order");

      if (!campaigns || campaigns.length === 0) { setLoading(false); return; }

      // Get click counts per campaign
      const { data: clicks } = await supabase
        .from("campaign_clicks")
        .select("campaign_id")
        .in("campaign_id", campaigns.map(c => c.id));

      const clickCounts: Record<string, number> = {};
      let total = 0;
      (clicks || []).forEach((click: any) => {
        clickCounts[click.campaign_id] = (clickCounts[click.campaign_id] || 0) + 1;
        total++;
      });

      setTotalClicks(total);
      setStats(
        campaigns.map(c => ({
          id: c.id,
          title: c.title || "Sem título",
          live: c.live ?? false,
          clicks: clickCounts[c.id] || 0,
          expires_at: (c as any).expires_at || null,
        }))
      );
      setLoading(false);
    })();
  }, [agencyId]);

  if (loading) {
    return (
      <div className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl p-5">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/20" />
          <div className="h-4 w-40 rounded bg-primary/10" />
        </div>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 text-center">
        <p className="text-muted-foreground text-sm">Nenhuma campanha encontrada. Crie uma campanha no editor para ver analytics aqui.</p>
      </div>
    );
  }

  const liveCount = stats.filter(s => s.live).length;
  const chartData = stats.filter(s => s.title.trim()).map(s => ({
    name: s.title.length > 18 ? s.title.slice(0, 18) + "…" : s.title,
    cliques: s.clicks,
    live: s.live,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard label="Total de Cliques" value={totalClicks.toLocaleString()} icon="🖱" />
        <StatCard label="Campanhas Ativas" value={String(liveCount)} icon="🔥" highlight />
        <StatCard label="Campanhas Total" value={String(stats.length)} icon="📢" />
        <StatCard
          label="CTR Spotlight"
          value={liveCount > 0 ? `${Math.round(stats.filter(s => s.live).reduce((a, s) => a + s.clicks, 0) / Math.max(liveCount, 1))} cliques/campanha` : "—"}
          icon="📊"
        />
      </div>

      {chartData.length > 0 && (
        <div className="bg-card/65 backdrop-blur-xl border border-border rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-destructive via-primary to-primary/50 rounded-sm opacity-40" />
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Cliques por Campanha</h3>
              <p className="text-[0.68rem] text-muted-foreground mt-0.5">Performance do Spotlight</p>
            </div>
            <span className="text-[0.68rem] text-muted-foreground font-bold">Total: {totalClicks} cliques</span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="gSpotlight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={35} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg text-xs">
                        <p className="font-semibold text-foreground mb-1">{label}</p>
                        <p className="text-muted-foreground">Cliques: <span className="font-bold text-foreground">{payload[0].value}</span></p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="cliques" fill="url(#gSpotlight)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-card/65 backdrop-blur-xl border border-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2fr_0.8fr_0.8fr_1fr] items-center px-5 py-3 border-b border-border text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider">
          <div>Campanha</div>
          <div>Status</div>
          <div>Cliques</div>
          <div>Expiração</div>
        </div>
        {stats.map((s) => (
          <div key={s.id} className="grid grid-cols-[2fr_0.8fr_0.8fr_1fr] items-center px-5 py-3 border-b border-border last:border-b-0 hover:bg-accent/5 transition-colors text-sm">
            <div className="font-semibold text-foreground truncate">{s.title}</div>
            <div>
              {s.live ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-destructive/10 text-destructive">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  Spotlight
                </span>
              ) : (
                <span className="text-[0.68rem] text-muted-foreground">Inativa</span>
              )}
            </div>
            <div className="text-foreground font-bold">{s.clicks}</div>
            <div className="text-[0.72rem] text-muted-foreground">
              {s.expires_at
                ? new Date(s.expires_at) > new Date()
                  ? `Expira ${new Date(s.expires_at).toLocaleDateString("pt-BR")}`
                  : "Expirada"
                : "Sem limite"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div className={`backdrop-blur-xl border rounded-2xl p-5 relative overflow-hidden group hover:border-primary/30 transition-all duration-300 ${
      highlight ? "bg-primary/10 border-primary/25" : "bg-card/65 border-border"
    }`}>
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-destructive to-primary rounded-sm opacity-40" />
      <div className="flex items-center justify-between mb-2">
        <div className="text-[0.68rem] text-muted-foreground font-semibold uppercase tracking-wider">{label}</div>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-2xl font-extrabold text-foreground tracking-tight">{value}</div>
    </div>
  );
}
