import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  valid_plans: string[];
  is_active: boolean;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  created_at: string;
}

const ADMIN_EMAIL = "gamacedo01@gmail.com";

export default function AdminCoupons() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState(10);
  const [newMaxUses, setNewMaxUses] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [newPlans, setNewPlans] = useState<string[]>(["pro", "scale"]);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const fetchCoupons = useCallback(async () => {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setCoupons(data as unknown as Coupon[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) fetchCoupons();
    else setLoading(false);
  }, [isAdmin, fetchCoupons]);

  if (!isAdmin) {
    return (
      <div className="max-w-[900px] mx-auto py-10 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h1 className="text-xl font-bold text-foreground">Acesso restrito</h1>
        <p className="text-sm text-muted-foreground mt-1">Apenas administradores podem gerenciar cupons.</p>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newCode.trim()) return toast.error("Digite um código para o cupom.");
    if (newDiscount < 1 || newDiscount > 100) return toast.error("Desconto deve ser entre 1% e 100%.");
    if (newPlans.length === 0) return toast.error("Selecione ao menos um plano.");

    setSaving(true);
    const payload: Record<string, unknown> = {
      code: newCode.trim().toUpperCase(),
      discount_percent: newDiscount,
      valid_plans: newPlans,
      is_active: true,
      current_uses: 0,
    };
    if (newMaxUses) payload.max_uses = parseInt(newMaxUses);
    if (newExpiresAt) payload.expires_at = new Date(newExpiresAt).toISOString();

    const { error } = await supabase.from("coupons").insert(payload as any);

    if (error) {
      toast.error(error.message.includes("duplicate") ? "Esse código já existe." : error.message);
    } else {
      toast.success("Cupom criado!");
      setShowForm(false);
      setNewCode("");
      setNewDiscount(10);
      setNewMaxUses("");
      setNewExpiresAt("");
      setNewPlans(["pro", "scale"]);
      fetchCoupons();
    }
    setSaving(false);
  };

  const toggleActive = async (coupon: Coupon) => {
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: !coupon.is_active, updated_at: new Date().toISOString() } as any)
      .eq("id", coupon.id);

    if (error) toast.error("Erro ao atualizar");
    else {
      toast.success(coupon.is_active ? "Cupom desativado" : "Cupom ativado");
      fetchCoupons();
    }
  };

  const deleteCoupon = async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Cupom excluído");
      fetchCoupons();
    }
  };

  const togglePlan = (plan: string) => {
    setNewPlans((prev) =>
      prev.includes(plan) ? prev.filter((p) => p !== plan) : [...prev, plan]
    );
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-normal text-foreground">Cupons de desconto</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Crie e gerencie cupons para seus clientes.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90"
        >
          {showForm ? "Cancelar" : "+ Novo cupom"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Código do cupom</label>
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                placeholder="EX: PROMO30"
                maxLength={20}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary transition-all font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Desconto (%)</label>
              <input
                type="number"
                value={newDiscount}
                onChange={(e) => setNewDiscount(Math.min(100, Math.max(1, parseInt(e.target.value) || 0)))}
                min={1}
                max={100}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Limite de usos (opcional)</label>
              <input
                type="number"
                value={newMaxUses}
                onChange={(e) => setNewMaxUses(e.target.value)}
                placeholder="Ilimitado"
                min={1}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Expira em (opcional)</label>
              <input
                type="datetime-local"
                value={newExpiresAt}
                onChange={(e) => setNewExpiresAt(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Válido para planos</label>
            <div className="flex gap-2">
              {["pro", "scale"].map((plan) => (
                <button
                  key={plan}
                  onClick={() => togglePlan(plan)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    newPlans.includes(plan)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {plan === "pro" ? "Pro" : "Scale"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Criando..." : "Criar cupom"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-3xl mb-2">🎟️</div>
          <p className="text-sm text-muted-foreground">Nenhum cupom criado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`rounded-2xl border bg-card p-4 transition-all ${
                coupon.is_active ? "border-border" : "border-border opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-lg">🎟️</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground text-sm">{coupon.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${
                        coupon.is_active
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {coupon.is_active ? "ATIVO" : "INATIVO"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[0.66rem] text-muted-foreground mt-0.5">
                      <span className="font-semibold text-primary-readable">{coupon.discount_percent}% OFF</span>
                      <span>Planos: {coupon.valid_plans.map((p) => p === "pro" ? "Pro" : "Scale").join(", ")}</span>
                      <span>Usos: {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ""}</span>
                      {coupon.expires_at && (
                        <span>
                          Expira: {new Date(coupon.expires_at).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(coupon)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      coupon.is_active
                        ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                        : "bg-primary/10 text-primary-readable hover:bg-primary/20"
                    }`}
                  >
                    {coupon.is_active ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    onClick={() => deleteCoupon(coupon.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
