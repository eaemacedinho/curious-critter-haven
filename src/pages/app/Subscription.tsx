import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

export default function Subscription() {
  const navigate = useNavigate();
  const { subscription, currentPlan, loading, refetch } = useSubscription();
  const [canceling, setCanceling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const isCanceled = subscription?.status === "canceled";
  const canceledButActive = isCanceled && subscription?.expires_at && new Date(subscription.expires_at) > new Date();

  const executeCancelSubscription = async () => {
    setCanceling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/pagarme-cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao cancelar");

      toast.success("Assinatura cancelada. Seu plano continua ativo até o fim do período.");
      setShowCancelModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cancelar assinatura");
    } finally {
      setCanceling(false);
    }
  };

  const executeReactivateSubscription = async () => {
    setReactivating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/pagarme-reactivate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao reativar");

      toast.success("Assinatura reativada com sucesso! 🎉");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao reativar assinatura");
    } finally {
      setReactivating(false);
    }
  };

  const getNextRenewalDate = () => {
    if (!subscription?.started_at) return null;
    const started = new Date(subscription.started_at);
    const now = new Date();
    const next = new Date(started);

    while (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }

    return next.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  };

  const getExpiresDate = () => {
    if (!subscription?.expires_at) return null;
    return new Date(subscription.expires_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  };

  const getPlanPrice = (plan: string) => {
    if (plan === "pro") return "R$17,90";
    if (plan === "scale") return "R$87,90";
    return "R$0";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-normal text-foreground">Assinatura</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Gerencie seu plano e pagamento em um lugar próprio.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="mb-1 text-[0.66rem] font-bold uppercase tracking-wider text-muted-foreground">Plano atual</div>
            <div className="text-lg font-bold capitalize text-foreground">{currentPlan}</div>
            {currentPlan !== "free" && (
              <div className="mt-1 text-xs text-muted-foreground">{getPlanPrice(currentPlan)}/mês</div>
            )}
          </div>
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            canceledButActive
              ? "bg-destructive/10 text-destructive"
              : currentPlan !== "free"
                ? "bg-primary/10 text-primary-readable"
                : "bg-muted text-muted-foreground"
          }`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {canceledButActive ? "Cancelado" : currentPlan !== "free" ? "Ativo" : "Free"}
          </span>
        </div>

        {canceledButActive && getExpiresDate() && (
          <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-xs text-foreground font-medium">
              ⚠️ Seu plano foi cancelado mas continua ativo até <strong>{getExpiresDate()}</strong>.
            </p>
            <p className="text-[0.65rem] text-muted-foreground mt-1">
              Após essa data, seu plano será revertido para Free automaticamente.
            </p>
          </div>
        )}

        {!canceledButActive && currentPlan !== "free" && getNextRenewalDate() && (
          <p className="mt-3 text-[0.7rem] text-muted-foreground">Próxima renovação: {getNextRenewalDate()}</p>
        )}
      </div>

      {/* Reactivation card for canceled-but-active subscriptions */}
      {canceledButActive && (
        <div className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <div className="text-sm font-bold text-foreground">Mudou de ideia? 🎉</div>
          <p className="text-xs text-muted-foreground">
            Reative sua assinatura e continue com todos os recursos do plano <strong className="text-foreground capitalize">{currentPlan}</strong> sem interrupção.
          </p>
          <button
            onClick={executeReactivateSubscription}
            disabled={reactivating}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
          >
            {reactivating ? "Reativando..." : `Reativar plano ${currentPlan === "pro" ? "Pro" : "Scale"}`}
          </button>
        </div>
      )}

      {/* Upgrade from free */}
      {currentPlan === "free" && (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <div className="text-sm font-bold text-foreground">Fazer upgrade</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => navigate("/app/checkout?plan=pro")}
              className="flex flex-col items-center gap-1 rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all hover:bg-primary/10"
            >
              <span className="text-sm font-bold text-foreground">Pro</span>
              <span className="text-lg font-extrabold text-primary-readable">R$17,90<span className="text-xs font-normal text-muted-foreground">/mês</span></span>
              <span className="text-[0.65rem] text-muted-foreground">Até 2 perfis · Analytics · Reels</span>
            </button>
            <button
              onClick={() => navigate("/app/checkout?plan=scale")}
              className="flex flex-col items-center gap-1 rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all hover:bg-primary/10"
            >
              <span className="text-sm font-bold text-foreground">Scale</span>
              <span className="text-lg font-extrabold text-primary-readable">R$87,90<span className="text-xs font-normal text-muted-foreground">/mês</span></span>
              <span className="text-[0.65rem] text-muted-foreground">Até 10 perfis · Equipe · Lote</span>
            </button>
          </div>
          <p className="text-center text-[0.6rem] text-muted-foreground/60">
            Precisa de mais? <a href="mailto:contato@in1.bio?subject=Plano%20Enterprise" className="underline hover:text-foreground">Fale conosco sobre o Enterprise</a>.
          </p>
        </div>
      )}

      {/* Upgrade from Pro to Scale */}
      {currentPlan === "pro" && !canceledButActive && (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <div className="text-sm font-bold text-foreground">Precisa de mais?</div>
          <button
            onClick={() => navigate("/app/checkout?plan=scale")}
            className="flex w-full items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all hover:bg-primary/10"
          >
            <div className="text-left">
              <span className="text-sm font-bold text-foreground">Upgrade para Scale</span>
              <p className="text-[0.65rem] text-muted-foreground">10 perfis · membros de equipe · criação em lote</p>
              <p className="text-[0.6rem] text-primary-readable font-medium mt-0.5">
                Desconto de R$17,90 do seu plano Pro atual — pague só R$70,00 no 1º mês
              </p>
              <p className="text-[0.55rem] text-muted-foreground/60 mt-0.5">
                *Desconto válido apenas para o primeiro mês. A partir do 2º mês, o valor volta para R$87,90/mês.
              </p>
            </div>
            <span className="text-sm font-bold text-primary-readable">R$70,00<span className="text-[0.5rem] font-normal text-muted-foreground">/1º mês</span></span>
          </button>
          <p className="text-center text-[0.6rem] text-muted-foreground/60">
            Ou conheça o <a href="mailto:contato@in1.bio?subject=Plano%20Enterprise" className="underline hover:text-foreground">Enterprise</a> com white-label completo.
          </p>
        </div>
      )}

      {/* Cancel section */}
      {currentPlan !== "free" && subscription?.status === "active" && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-foreground">Cancelar assinatura</div>
              <div className="text-[0.66rem] text-muted-foreground">Seu plano continuará ativo até o fim do período atual</div>
            </div>
            <button
              onClick={() => setShowCancelModal(true)}
              className="rounded-xl bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
            >
              Cancelar plano
            </button>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowCancelModal(false)} />
          <div className="relative w-full max-w-md space-y-5 rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="text-center">
              <div className="mb-2 text-3xl">😢</div>
              <h3 className="text-lg font-extrabold text-foreground">Que pena que quer sair!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Antes de cancelar, que tal <span className="font-bold text-primary-readable">30% de desconto</span> no próximo mês?
              </p>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-center">
              <div className="mb-1 text-xs text-muted-foreground">Sua próxima fatura com desconto:</div>
              <div className="text-2xl font-extrabold text-primary-readable">
                {currentPlan === "pro" ? "R$12,53" : "R$61,53"}
                <span className="ml-2 text-xs font-normal text-muted-foreground line-through">{getPlanPrice(currentPlan)}</span>
              </div>
              <div className="mt-1 text-[0.6rem] text-muted-foreground">Válido para o próximo mês de cobrança</div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  setShowCancelModal(false);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error("Não autenticado");

                    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
                    const res = await fetch(`https://${projectId}.supabase.co/functions/v1/pagarme-apply-discount`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify({ discount_percent: 30 }),
                    });

                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Erro ao aplicar desconto");

                    toast.success("Desconto de 30% aplicado na próxima fatura! 🎉");
                    refetch();
                  } catch (err: any) {
                    toast.error(err.message || "Erro ao aplicar desconto");
                  }
                }}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90"
              >
                Aceitar desconto e continuar 🎉
              </button>
              <button
                onClick={executeCancelSubscription}
                disabled={canceling}
                className="w-full rounded-xl border border-border bg-secondary py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary/80 disabled:opacity-60"
              >
                {canceling ? "Cancelando..." : "Cancelar mesmo assim"}
              </button>
            </div>

            <p className="text-center text-[0.6rem] text-muted-foreground/50">
              Ao cancelar, seu plano continuará ativo até {getNextRenewalDate() || "o fim do período"}. Após essa data, será revertido para Free.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
