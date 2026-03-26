import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CreditCard, Shield, ArrowLeft, CheckCircle2, Loader2, Sparkles, Rocket, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

const PLAN_INFO: Record<string, { label: string; price: string; priceValue: number; features: string[] }> = {
  pro: {
    label: "Pro",
    price: "R$17,90/mês",
    priceValue: 1790,
    features: [
      "Até 2 perfis",
      "Layout Imersivo",
      "Links & produtos ilimitados",
      "Analytics completo",
      "Campanhas Spotlight",
      "Hero Reels",
      "Cores e efeitos personalizados",
      "Selo verificado",
    ],
  },
  scale: {
    label: "Scale",
    price: "R$87,90/mês",
    priceValue: 8790,
    features: [
      "Até 10 perfis",
      "Tudo do Pro incluído",
      "Criação em lote",
      "Membros de equipe",
      "Selo verificado",
      "Remover branding",
      "Suporte prioritário",
    ],
  },
};

const PLAN_PRICES: Record<string, number> = { free: 0, pro: 1790, scale: 8790 };

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetPlan = (searchParams.get("plan") as string) || "pro";
  const plan = PLAN_INFO[targetPlan] || PLAN_INFO.pro;
  const planKey = PLAN_INFO[targetPlan] ? targetPlan : "pro";

  const { currentPlan, subscription, refetch } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);

  const [card, setCard] = useState({
    number: "",
    holder_name: "",
    exp_month: "",
    exp_year: "",
    cvv: "",
  });

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    document: "",
    phone_area: "",
    phone_number: "",
    zip_code: "",
  });

  // Calculate prorated price for upgrades + coupon
  const { isUpgrade, finalPrice, finalPriceLabel, upgradeDiscount } = useMemo(() => {
    const targetPrice = PLAN_PRICES[planKey] || 0;
    const currentPrice = PLAN_PRICES[currentPlan] || 0;

    let price = targetPrice;
    let upgrade = false;
    let upDiscount = 0;

    // Prorated upgrade
    if (currentPlan !== "free" && targetPrice > currentPrice) {
      price = targetPrice - currentPrice;
      upgrade = true;
      upDiscount = currentPrice;
    }

    // Apply coupon on top
    if (appliedCoupon) {
      price = Math.round(price * (1 - appliedCoupon.discount_percent / 100));
    }

    const label = `R$${(price / 100).toFixed(2).replace(".", ",")}/mês`;

    return {
      isUpgrade: upgrade,
      finalPrice: price,
      finalPriceLabel: label,
      upgradeDiscount: upDiscount,
    };
  }, [planKey, currentPlan, appliedCoupon]);

  const planOrder: Record<string, number> = { free: 0, pro: 1, scale: 2 };
  const alreadyOnPlan = (planOrder[currentPlan] || 0) >= (planOrder[planKey] || 0);

  if (alreadyOnPlan && currentPlan !== "free") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-primary-readable mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Você já é {currentPlan === "scale" ? "Scale" : "Pro"}!</h2>
          <p className="text-muted-foreground">Aproveite todos os recursos premium.</p>
          <Button onClick={() => navigate("/app")} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Voltar ao painel</Button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-primary-readable mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Pagamento confirmado!</h2>
          <p className="text-muted-foreground">
            {isUpgrade ? `Upgrade para ${plan.label} realizado!` : `Bem-vindo ao plano ${plan.label}.`} Aproveite todos os recursos.
          </p>
          <Button onClick={() => navigate("/app")}>Ir para o painel</Button>
        </motion.div>
      </div>
    );
  }

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})/g, "$1 ").trim();
  };

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponValidating(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/validate-coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), plan: planKey }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({ code: data.code, discount_percent: data.discount_percent });
        toast.success(`Cupom ${data.code} aplicado! ${data.discount_percent}% de desconto 🎉`);
      } else {
        toast.error(data.error || "Cupom inválido");
        setAppliedCoupon(null);
      }
    } catch {
      toast.error("Erro ao validar cupom");
    } finally {
      setCouponValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        toast.error("Sessão expirada. Faça login novamente.");
        setLoading(false);
        return;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/pagarme-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            card,
            customer,
            plan: planKey,
            coupon_code: appliedCoupon?.code || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || "Erro no pagamento");
      }

      await refetch();
      setSuccess(true);
      toast.success(isUpgrade ? `Upgrade para ${plan.label} realizado!` : `Assinatura ${plan.label} ativada com sucesso!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />Voltar
      </Button>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            {planKey === "scale" ? <Rocket className="w-7 h-7 text-primary-readable" /> : <Sparkles className="w-7 h-7 text-primary-readable" />}
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Upgrade para o {plan.label}</h1>
          <p className="text-muted-foreground">
            {isUpgrade ? (
              <>Pague apenas a diferença: <span className="text-foreground font-bold">{finalPriceLabel}</span></>
            ) : appliedCoupon ? (
              <>Por apenas <span className="text-foreground font-bold">{finalPriceLabel}</span><span className="ml-2 text-xs line-through text-muted-foreground">{plan.price}</span></>
            ) : (
              <>Desbloqueie todos os recursos por <span className="text-foreground font-bold">{plan.price}</span></>
            )}
          </p>
        </div>

        {/* Upgrade discount banner */}
        {isUpgrade && (
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">Desconto do plano {currentPlan === "pro" ? "Pro" : "Scale"} atual</div>
            <div className="text-lg font-extrabold text-primary-readable">
              -R${(upgradeDiscount / 100).toFixed(2).replace(".", ",")}
              <span className="text-xs font-normal text-muted-foreground ml-2">aplicado automaticamente</span>
            </div>
          </div>
        )}

        {/* Applied coupon banner */}
        {appliedCoupon && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-sm font-bold text-foreground">Cupom <span className="font-mono">{appliedCoupon.code}</span> aplicado</div>
                <div className="text-xs text-muted-foreground">{appliedCoupon.discount_percent}% de desconto</div>
              </div>
            </div>
            <button onClick={removeCoupon} className="text-xs text-destructive hover:underline font-semibold">Remover</button>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 p-4 bg-muted/30 rounded-2xl border border-border">
          {plan.features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary-readable flex-shrink-0" />{f}
            </div>
          ))}
        </div>

        {/* Plan switcher for free users */}
        {currentPlan === "free" && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => { navigate("/app/checkout?plan=pro"); setAppliedCoupon(null); setCouponCode(""); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${planKey === "pro" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              Pro — R$17,90
            </button>
            <button onClick={() => { navigate("/app/checkout?plan=scale"); setAppliedCoupon(null); setCouponCode(""); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${planKey === "scale" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              Scale — R$87,90
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Coupon */}
          {!appliedCoupon && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary-readable" />Cupom de desconto
              </h3>
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Digite o código do cupom"
                  className="font-mono uppercase"
                  maxLength={20}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={validateCoupon}
                  disabled={couponValidating || !couponCode.trim()}
                  className="px-5 flex-shrink-0"
                >
                  {couponValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                </Button>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-readable" />Dados pessoais
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" required value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="João da Silva" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" required value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="joao@email.com" />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" required value={customer.document} onChange={(e) => setCustomer({ ...customer, document: formatCPF(e.target.value) })} placeholder="000.000.000-00" maxLength={14} />
              </div>
              <div>
                <Label htmlFor="zip">CEP</Label>
                <Input id="zip" value={customer.zip_code} onChange={(e) => setCustomer({ ...customer, zip_code: e.target.value.replace(/\D/g, "").slice(0, 8) })} placeholder="01001000" maxLength={8} />
              </div>
            </div>
          </div>

          {/* Card Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-readable" />Dados do cartão
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="card_number">Número do cartão</Label>
                <Input id="card_number" required value={card.number} onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })} placeholder="0000 0000 0000 0000" maxLength={19} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="holder">Nome no cartão</Label>
                <Input id="holder" required value={card.holder_name} onChange={(e) => setCard({ ...card, holder_name: e.target.value.toUpperCase() })} placeholder="JOÃO DA SILVA" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="exp_month">Mês</Label>
                  <Input id="exp_month" required value={card.exp_month} onChange={(e) => setCard({ ...card, exp_month: e.target.value.replace(/\D/g, "").slice(0, 2) })} placeholder="MM" maxLength={2} />
                </div>
                <div className="flex-1">
                  <Label htmlFor="exp_year">Ano</Label>
                  <Input id="exp_year" required value={card.exp_year} onChange={(e) => setCard({ ...card, exp_year: e.target.value.replace(/\D/g, "").slice(0, 2) })} placeholder="AA" maxLength={2} />
                </div>
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" required value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="123" maxLength={4} />
              </div>
            </div>
          </div>

          {/* Price summary */}
          {(isUpgrade || appliedCoupon) && (
            <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Resumo</div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plano {plan.label}</span>
                <span className="text-foreground">R${(PLAN_PRICES[planKey] / 100).toFixed(2).replace(".", ",")}</span>
              </div>
              {isUpgrade && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Desconto plano {currentPlan === "pro" ? "Pro" : "Scale"}</span>
                  <span className="text-emerald-500">-R${(upgradeDiscount / 100).toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              {appliedCoupon && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cupom {appliedCoupon.code} ({appliedCoupon.discount_percent}%)</span>
                  <span className="text-emerald-500">
                    -R${(((isUpgrade ? PLAN_PRICES[planKey] - upgradeDiscount : PLAN_PRICES[planKey]) * appliedCoupon.discount_percent / 100) / 100).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
                <span className="text-foreground">Total mensal</span>
                <span className="text-primary-readable">{finalPriceLabel}</span>
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full py-6 text-base font-bold rounded-2xl">
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processando...</>
            ) : (
              `${isUpgrade ? "Fazer upgrade" : "Assinar"} ${plan.label} — ${finalPriceLabel}`
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            <Shield className="w-3 h-3 inline mr-1" />Pagamento seguro via Pagar.me. Cancele quando quiser.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
