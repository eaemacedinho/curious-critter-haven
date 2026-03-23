import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  agencyId: string | undefined;
  agencyName: string | undefined;
}

export default function AnalyticsPdfExport({ agencyId, agencyName }: Props) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!agencyId) return;
    setLoading(true);

    try {
      // Fetch all data in parallel
      const [creatorsRes, campaignsRes, eventsRes, cookieRes] = await Promise.all([
        supabase.from("creators").select("id, name, slug").eq("agency_id", agencyId),
        supabase.from("campaigns").select("id, title, live, creator_id"),
        supabase.from("analytics_events").select("event_type, metadata, created_at, creator_id").eq("agency_id", agencyId),
        supabase.from("analytics_events").select("metadata").eq("event_type", "cookie_consent"),
      ]);

      const creators = creatorsRes.data || [];
      const campaigns = campaignsRes.data?.filter(c => creators.some(cr => cr.id === c.creator_id)) || [];
      const events = eventsRes.data || [];
      const cookieEvents = cookieRes.data || [];

      // Aggregate campaign clicks
      const clickEvents = events.filter(e => e.event_type === "campaign_click");
      const campaignStats = campaigns.map(c => ({
        title: c.title || "Sem título",
        live: c.live ? "Spotlight" : "Inativa",
        clicks: clickEvents.filter((e: any) => e.metadata?.campaign_id === c.id).length,
      }));

      // Aggregate reel stats
      const reelPlays = events.filter(e => e.event_type === "reel_play");
      const reelCta = events.filter(e => e.event_type === "reel_cta_click");
      const reelWatch = events.filter(e => e.event_type === "reel_watch_time");
      const totalPlays = reelPlays.length;
      const totalCta = reelCta.length;
      const totalWatchSec = reelWatch.reduce((a, e: any) => a + Number(e.metadata?.seconds || 0), 0);

      // Cookie stats
      const cookieAcceptAll = cookieEvents.filter((e: any) => e.metadata?.action === "accept_all").length;
      const cookieCustom = cookieEvents.filter((e: any) => e.metadata?.action === "custom").length;

      // Build HTML for PDF
      const now = new Date().toLocaleDateString("pt-BR");
      const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; padding: 40px; font-size: 13px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  h2 { font-size: 16px; margin: 28px 0 12px; color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 6px; }
  .subtitle { color: #666; font-size: 12px; margin-bottom: 24px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .stat-card { background: #f8f8f8; border: 1px solid #e8e8e8; border-radius: 10px; padding: 14px; text-align: center; }
  .stat-value { font-size: 24px; font-weight: 800; color: #1a1a2e; }
  .stat-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; padding: 8px 12px; border-bottom: 2px solid #e0e0e0; }
  td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
  tr:hover { background: #fafafa; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; }
  .badge-live { background: #fee2e2; color: #dc2626; }
  .badge-off { background: #f3f4f6; color: #9ca3af; }
  .footer { margin-top: 30px; padding-top: 16px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 10px; color: #aaa; }
</style>
</head><body>
  <h1>📊 Relatório de Analytics</h1>
  <div class="subtitle">${agencyName || "Minha Agência"} — Gerado em ${now}</div>

  <h2>📢 Campanhas</h2>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-value">${campaigns.length}</div><div class="stat-label">Total Campanhas</div></div>
    <div class="stat-card"><div class="stat-value">${campaigns.filter(c => c.live).length}</div><div class="stat-label">Spotlight Ativas</div></div>
    <div class="stat-card"><div class="stat-value">${clickEvents.length}</div><div class="stat-label">Total Cliques</div></div>
    <div class="stat-card"><div class="stat-value">${campaigns.filter(c => c.live).length > 0 ? Math.round(clickEvents.length / campaigns.filter(c => c.live).length) : 0}</div><div class="stat-label">Cliques/Campanha</div></div>
  </div>
  ${campaignStats.length > 0 ? `
  <table>
    <thead><tr><th>Campanha</th><th>Status</th><th>Cliques</th></tr></thead>
    <tbody>${campaignStats.map(s => `<tr><td>${s.title}</td><td><span class="badge ${s.live === "Spotlight" ? "badge-live" : "badge-off"}">${s.live}</span></td><td><strong>${s.clicks}</strong></td></tr>`).join("")}</tbody>
  </table>` : "<p style='color:#888'>Nenhuma campanha encontrada.</p>"}

  <h2>🎬 Hero Reels</h2>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-value">${totalPlays}</div><div class="stat-label">Total Plays</div></div>
    <div class="stat-card"><div class="stat-value">${totalWatchSec < 60 ? totalWatchSec + "s" : Math.floor(totalWatchSec / 60) + "m"}</div><div class="stat-label">Watch Time</div></div>
    <div class="stat-card"><div class="stat-value">${totalCta}</div><div class="stat-label">CTA Clicks</div></div>
    <div class="stat-card"><div class="stat-value">${totalPlays > 0 ? ((totalCta / totalPlays) * 100).toFixed(1) + "%" : "0%"}</div><div class="stat-label">CTR</div></div>
  </div>

  <h2>🍪 Consentimento de Cookies</h2>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-value">${cookieEvents.length}</div><div class="stat-label">Total Respostas</div></div>
    <div class="stat-card"><div class="stat-value">${cookieAcceptAll}</div><div class="stat-label">Aceitar Todos</div></div>
    <div class="stat-card"><div class="stat-value">${cookieCustom}</div><div class="stat-label">Configurado</div></div>
    <div class="stat-card"><div class="stat-value">${cookieEvents.length > 0 ? Math.round((cookieAcceptAll / cookieEvents.length) * 100) + "%" : "0%"}</div><div class="stat-label">Taxa Aceitar</div></div>
  </div>

  <div class="footer">All in 1 — in1.bio — Relatório gerado automaticamente</div>
</body></html>`;

      // Use browser print to generate PDF
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Permita pop-ups para exportar o PDF");
        setLoading(false);
        return;
      }
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        setLoading(false);
      }, 500);
    } catch (err) {
      toast.error("Erro ao gerar relatório");
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      Exportar PDF
    </Button>
  );
}
