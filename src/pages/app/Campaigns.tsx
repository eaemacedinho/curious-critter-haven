import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import CampaignAnalytics from "@/components/kreatorz/CampaignAnalytics";

export default function Campaigns() {
  const { agency } = useTenant();
  const [hasCampaigns, setHasCampaigns] = useState<boolean | null>(null);
  const [hasCreators, setHasCreators] = useState<boolean | null>(null);

  useEffect(() => {
    if (!agency) return;
    (async () => {
      const { data: creators } = await supabase
        .from("creators")
        .select("id")
        .eq("agency_id", agency.id);

      const creatorsExist = (creators?.length || 0) > 0;
      setHasCreators(creatorsExist);

      if (!creatorsExist) {
        setHasCampaigns(false);
        return;
      }

      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id")
        .in("creator_id", creators!.map((c) => c.id))
        .limit(1);

      setHasCampaigns((campaigns?.length || 0) > 0);
    })();
  }, [agency]);

  if (hasCampaigns === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-normal text-foreground">Campanhas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie suas campanhas spotlight e acompanhe o desempenho.
          </p>
        </div>
      </div>

      {!hasCampaigns ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full bg-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center">
              <div className="text-4xl animate-k-float">📢</div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center text-xs animate-k-pulse">🔥</div>
          </div>

          <h2 className="font-display text-xl text-foreground text-center mb-2">
            Nenhuma campanha ainda
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
            {!hasCreators
              ? "Crie um creator primeiro, depois adicione campanhas Spotlight para destacar promoções e parcerias no topo da página."
              : "Campanhas Spotlight aparecem no topo da página do creator com destaque visual. Crie sua primeira campanha no editor do creator."
            }
          </p>

          <Link
            to="/app/creators"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.97] min-h-[48px]"
          >
            {hasCreators ? "📝 Editar Creator e criar campanha" : "👤 Criar primeiro Creator"}
          </Link>

          <div className="bg-card border border-border rounded-2xl p-6 mt-10 w-full max-w-lg">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              💡 Como funcionam as Campanhas Spotlight
            </h3>
            <div className="space-y-3">
              {[
                { icon: "1️⃣", text: "Acesse o editor de um creator e vá na seção \"Campanhas\"" },
                { icon: "2️⃣", text: "Adicione título, imagem e link da campanha" },
                { icon: "3️⃣", text: "Marque como \"Ao vivo\" para ativar o Spotlight" },
                { icon: "4️⃣", text: "Defina a duração (1 a 30 dias) e salve" },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-sm flex-shrink-0">{step.icon}</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">💡</span>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">Como funcionam as campanhas</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Campanhas Spotlight aparecem automaticamente no topo da página do creator quando marcadas como "Ao vivo".
                  Configure duração, prioridade e imagem no editor do creator.
                </p>
              </div>
            </div>
          </div>

          <CampaignAnalytics agencyId={agency?.id} />
        </>
      )}
    </div>
  );
}
