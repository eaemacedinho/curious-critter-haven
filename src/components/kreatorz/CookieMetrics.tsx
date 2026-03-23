import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Metrics {
  total: number;
  acceptAll: number;
  custom: number;
  analyticsOn: number;
  marketingOn: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted))"];

export default function CookieMetrics() {
  const { agency } = useTenant();
  const [metrics, setMetrics] = useState<Metrics>({ total: 0, acceptAll: 0, custom: 0, analyticsOn: 0, marketingOn: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agency) return;
    (async () => {
      const { data } = await supabase
        .from("analytics_events")
        .select("metadata")
        .eq("event_type", "cookie_consent")
        .eq("agency_id", agency.id);

      // Also fetch events without agency_id (public visitors)
      const { data: publicData } = await supabase
        .from("analytics_events")
        .select("metadata")
        .eq("event_type", "cookie_consent")
        .is("agency_id", null);

      const all = [...(data || []), ...(publicData || [])];
      const m: Metrics = { total: all.length, acceptAll: 0, custom: 0, analyticsOn: 0, marketingOn: 0 };
      all.forEach((ev: any) => {
        const meta = ev.metadata;
        if (meta?.action === "accept_all") m.acceptAll++;
        else m.custom++;
        if (meta?.prefs?.analytics) m.analyticsOn++;
        if (meta?.prefs?.marketing) m.marketingOn++;
      });
      setMetrics(m);
      setLoading(false);
    })();
  }, [agency]);

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Carregando métricas de cookies...</div>;

  const pieData = [
    { name: "Aceitar todos", value: metrics.acceptAll },
    { name: "Configurado", value: metrics.custom },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-foreground">🍪 Consentimento de Cookies</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: metrics.total, icon: "📊" },
          { label: "Aceitar todos", value: metrics.acceptAll, icon: "✅" },
          { label: "Configurado", value: metrics.custom, icon: "⚙️" },
          { label: "Marketing ativo", value: metrics.marketingOn, icon: "📢" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <div className="text-lg">{s.icon}</div>
            <div className="text-xl font-bold text-foreground">{s.value}</div>
            <div className="text-[0.65rem] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {pieData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Distribuição</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
