import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line,
} from "recharts";

const monthlyData = [
  { name: "Jan", views: 2400, clicks: 1200, conversao: 8.2 },
  { name: "Fev", views: 3100, clicks: 1680, conversao: 9.1 },
  { name: "Mar", views: 4200, clicks: 2100, conversao: 10.5 },
  { name: "Abr", views: 3800, clicks: 1900, conversao: 9.8 },
  { name: "Mai", views: 5100, clicks: 2800, conversao: 12.3 },
  { name: "Jun", views: 6200, clicks: 3400, conversao: 14.1 },
  { name: "Jul", views: 7800, clicks: 4200, conversao: 15.8 },
  { name: "Ago", views: 8900, clicks: 4800, conversao: 16.2 },
  { name: "Set", views: 9500, clicks: 5100, conversao: 17.4 },
  { name: "Out", views: 11200, clicks: 6200, conversao: 18.9 },
  { name: "Nov", views: 14800, clicks: 7600, conversao: 21.2 },
  { name: "Dez", views: 18400, clicks: 9200, conversao: 24.3 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-k-850 border border-primary/20 rounded-xl px-4 py-3 shadow-k text-xs">
      <p className="font-semibold text-primary-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-k-2">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }} />
          {p.dataKey === "views" ? "Views" : p.dataKey === "clicks" ? "Cliques" : "Conversão"}: <span className="font-bold text-primary-foreground">{p.dataKey === "conversao" ? `${p.value}%` : p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
      {/* Views & Clicks Area */}
      <div className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-k-300 rounded-sm opacity-40" />
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-primary-foreground">Views & Cliques</h3>
            <p className="text-[0.68rem] text-k-3 mt-0.5">Últimos 12 meses</p>
          </div>
          <div className="flex gap-3 text-[0.65rem]">
            <span className="flex items-center gap-1.5 text-k-2"><span className="w-2 h-2 rounded-full bg-primary" /> Views</span>
            <span className="flex items-center gap-1.5 text-k-2"><span className="w-2 h-2 rounded-full bg-k-300" /> Cliques</span>
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(268,69%,50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(268,69%,50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(280,80%,65%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(280,80%,65%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(268,30%,18%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(268,15%,48%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(268,15%,48%)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="views" stroke="hsl(268,69%,50%)" strokeWidth={2} fill="url(#gViews)" />
              <Area type="monotone" dataKey="clicks" stroke="hsl(280,80%,65%)" strokeWidth={2} fill="url(#gClicks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-k-300 to-primary rounded-sm opacity-40" />
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-primary-foreground">Taxa de Conversão</h3>
            <p className="text-[0.68rem] text-k-3 mt-0.5">Evolução mensal</p>
          </div>
          <span className="text-[0.68rem] text-k-ok font-bold bg-[hsl(var(--k-ok))]/10 px-2.5 py-1 rounded-full">↑ +196%</span>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(268,30%,18%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(268,15%,48%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(268,15%,48%)" }} axisLine={false} tickLine={false} width={35} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="conversao" stroke="hsl(150,60%,50%)" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(150,60%,50%)" }} activeDot={{ r: 5, stroke: "hsl(150,60%,50%)", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clicks by month bar */}
      <div className="bg-card/65 backdrop-blur-xl border border-primary/10 rounded-2xl p-5 relative overflow-hidden lg:col-span-2">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-k-300 to-primary rounded-sm opacity-40" />
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-primary-foreground">Cliques por Mês</h3>
            <p className="text-[0.68rem] text-k-3 mt-0.5">Performance de engajamento</p>
          </div>
          <span className="text-[0.68rem] text-k-300 font-bold">Total: 50.2k cliques</span>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <defs>
                <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(268,69%,50%)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(268,69%,50%)" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(268,30%,18%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(268,15%,48%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(268,15%,48%)" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="clicks" fill="url(#gBar)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
