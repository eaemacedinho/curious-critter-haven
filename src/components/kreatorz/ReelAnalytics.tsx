import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ReelStat {
  reelId: string;
  title: string;
  plays: number;
  watchTimeSeconds: number;
  ctaClicks: number;
}

interface Props {
  agencyId: string | undefined;
}

export default function ReelAnalytics({ agencyId }: Props) {
  const [stats, setStats] = useState<ReelStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agencyId) return;
    (async () => {
      setLoading(true);

      const { data: creators } = await supabase
        .from("creators")
        .select("id")
        .eq("agency_id", agencyId);

      if (!creators?.length) { setLoading(false); return; }
      const creatorIds = creators.map((c) => c.id);

      // Fetch reels and analytics events in parallel
      const [reelsRes, eventsRes] = await Promise.all([
        supabase
          .from("creator_hero_reels")
          .select("id, title, creator_id")
          .in("creator_id", creatorIds)
          .order("sort_order"),
        supabase
          .from("analytics_events")
          .select("event_type, metadata")
          .in("creator_id", creatorIds)
          .in("event_type", ["reel_play", "reel_watch_time", "reel_cta_click"]),
      ]);

      const reels = reelsRes.data || [];
      const events = eventsRes.data || [];

      if (!reels.length) { setLoading(false); return; }

      // Aggregate per reel
      const map: Record<string, { plays: number; watchTime: number; ctaClicks: number }> = {};
      reels.forEach((r) => { map[r.id] = { plays: 0, watchTime: 0, ctaClicks: 0 }; });

      events.forEach((ev: any) => {
        const reelId = (ev.metadata as any)?.reel_id;
        if (!reelId || !map[reelId]) return;
        if (ev.event_type === "reel_play") map[reelId].plays++;
        if (ev.event_type === "reel_watch_time") map[reelId].watchTime += Number((ev.metadata as any)?.seconds || 0);
        if (ev.event_type === "reel_cta_click") map[reelId].ctaClicks++;
      });

      setStats(
        reels.map((r) => ({
          reelId: r.id,
          title: r.title || "Sem título",
          plays: map[r.id]?.plays || 0,
          watchTimeSeconds: map[r.id]?.watchTime || 0,
          ctaClicks: map[r.id]?.ctaClicks || 0,
        }))
      );
      setLoading(false);
    })();
  }, [agencyId]);

  const totals = useMemo(() => {
    const totalPlays = stats.reduce((a, s) => a + s.plays, 0);
    const totalWatch = stats.reduce((a, s) => a + s.watchTimeSeconds, 0);
    const totalCta = stats.reduce((a, s) => a + s.ctaClicks, 0);
    const avgCtr = totalPlays > 0 ? ((totalCta / totalPlays) * 100).toFixed(1) : "0";
    return { totalPlays, totalWatch, totalCta, avgCtr };
  }, [stats]);

  function formatTime(seconds: number) {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }

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

  if (!stats.length) return null;

  const chartData = stats.map((s) => ({
    name: s.title.length > 15 ? s.title.slice(0, 15) + "…" : s.title,
    plays: s.plays,
    cta: s.ctaClicks,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">🎬</span>
        <h3 className="text-sm font-bold text-foreground">Hero Reels</h3>
        <span className="text-[0.65rem] text-muted-foreground ml-auto">{stats.length} vídeo{stats.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard label="Total Plays" value={totals.totalPlays.toLocaleString()} icon="▶️" />
        <StatCard label="Watch Time" value={formatTime(totals.totalWatch)} icon="⏱" />
        <StatCard label="CTA Clicks" value={totals.totalCta.toLocaleString()} icon="🖱" />
        <StatCard label="CTR Médio" value={`${totals.avgCtr}%`} icon="📊" highlight />
      </div>

      {chartData.length > 0 && (
        <div className="bg-card/65 backdrop-blur-xl border border-border rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary/50 rounded-sm opacity-40" />
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Plays & CTA por Vídeo</h3>
              <p className="text-[0.68rem] text-muted-foreground mt-0.5">Engajamento dos Hero Reels</p>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="gPlays" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gCta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
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
                        {payload.map((p: any) => (
                          <p key={p.dataKey} className="text-muted-foreground">
                            {p.dataKey === "plays" ? "Plays" : "CTA"}: <span className="font-bold text-foreground">{p.value}</span>
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="plays" fill="url(#gPlays)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="cta" fill="url(#gCta)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-card/65 backdrop-blur-xl border border-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2fr_0.8fr_1fr_0.8fr_0.8fr] items-center px-5 py-3 border-b border-border text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider">
          <div>Vídeo</div>
          <div>Plays</div>
          <div>Watch Time</div>
          <div>CTA</div>
          <div>CTR</div>
        </div>
        {stats.map((s) => {
          const ctr = s.plays > 0 ? ((s.ctaClicks / s.plays) * 100).toFixed(1) : "0";
          return (
            <div key={s.reelId} className="grid grid-cols-[2fr_0.8fr_1fr_0.8fr_0.8fr] items-center px-5 py-3 border-b border-border last:border-b-0 hover:bg-accent/5 transition-colors text-sm">
              <div className="font-semibold text-foreground truncate">{s.title}</div>
              <div className="text-foreground font-bold">{s.plays}</div>
              <div className="text-muted-foreground text-[0.75rem]">{formatTime(s.watchTimeSeconds)}</div>
              <div className="text-foreground font-bold">{s.ctaClicks}</div>
              <div className="text-primary font-bold">{ctr}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div className={`backdrop-blur-xl border rounded-2xl p-5 relative overflow-hidden group hover:border-primary/30 transition-all duration-300 ${
      highlight ? "bg-primary/10 border-primary/25" : "bg-card/65 border-border"
    }`}>
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-accent rounded-sm opacity-40" />
      <div className="flex items-center justify-between mb-2">
        <div className="text-[0.68rem] text-muted-foreground font-semibold uppercase tracking-wider">{label}</div>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-2xl font-extrabold text-foreground tracking-tight">{value}</div>
    </div>
  );
}
