import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

interface CreatorRow {
  id: string;
  name: string;
  handle: string;
  avatar_url: string;
  bio: string;
  public_layout: string;
  verified: boolean;
}

export default function Creators() {
  const { user } = useAuth();
  const { agency } = useTenant();
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("creators")
        .select("id, name, handle, avatar_url, bio, public_layout, verified")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setCreators(data as CreatorRow[]);
      setLoading(false);
    })();
  }, [user]);

  const filtered = creators.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.handle?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyUrl = (handle: string) => {
    const cleanHandle = handle.replace(/^@+/, "");
    navigator.clipboard.writeText(`${window.location.origin}/c/${cleanHandle}`);
    toast.success("URL copiada!");
  };

  const handleCreateCreator = async () => {
    if (!user || !agency) return;
    setCreating(true);
    const count = creators.length + 1;
    const { data, error } = await supabase
      .from("creators")
      .insert({
        user_id: user.id,
        agency_id: agency.id,
        name: `Creator ${count}`,
        handle: `creator-${count}-${Date.now().toString(36)}`,
      })
      .select("id, name, handle, avatar_url, bio, public_layout, verified")
      .single();

    if (error) {
      if (error.code === "23505") {
        toast.error("Já existe um creator com esses dados. Tente um nome diferente.");
      } else {
        toast.error("Não foi possível criar o creator. Tente novamente.");
      }
      console.error("Creator creation error:", error);
      setCreating(false);
      return;
    }

    setCreators([data as CreatorRow, ...creators]);
    setCreating(false);
    toast.success("Creator criado! Edite os dados agora.");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return;

    // Delete related data first, then creator
    await Promise.all([
      supabase.from("creator_links").delete().eq("creator_id", id),
      supabase.from("creator_social_links").delete().eq("creator_id", id),
      supabase.from("creator_products").delete().eq("creator_id", id),
      supabase.from("creator_campaigns").delete().eq("creator_id", id),
    ]);

    // Note: creator DELETE requires RLS policy — if it fails, inform user
    const { error } = await supabase.from("creators").delete().eq("id", id);
    if (error) {
      toast.error("Não foi possível excluir. Verifique permissões.");
      return;
    }

    setCreators(creators.filter((c) => c.id !== id));
    toast.success("Creator excluído.");
  };

  if (loading) {
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
          <h1 className="font-display text-2xl font-normal text-foreground">Creators</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{creators.length} creator(s) cadastrado(s)</p>
        </div>
        <button
          onClick={handleCreateCreator}
          disabled={creating}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
        >
          {creating ? "Criando..." : "+ Novo Creator"}
        </button>
      </div>

      {/* Search */}
      {creators.length > 0 && (
        <div className="flex items-center gap-2 px-3.5 py-3 bg-card border border-border rounded-xl mb-6 focus-within:border-primary/30 transition-all max-w-sm">
          <span className="text-muted-foreground text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar creator..."
            className="bg-transparent border-none outline-none text-foreground text-sm w-full placeholder:text-muted-foreground"
          />
        </div>
      )}

      {/* Empty state */}
      {creators.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">👤</div>
          <h3 className="text-lg font-bold text-foreground mb-2">Nenhum creator ainda</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Comece adicionando seu primeiro creator para criar páginas personalizadas.
          </p>
          <button
            onClick={handleCreateCreator}
            disabled={creating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl disabled:opacity-60"
          >
            + Criar primeiro creator
          </button>
        </div>
      )}

      {/* Creator cards */}
      {filtered.length > 0 && (
        <div className="grid gap-3">
          {filtered.map((cr) => (
            <div
              key={cr.id}
              className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:border-primary/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-border">
                {cr.avatar_url ? (
                  <img src={cr.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-lg text-muted-foreground">
                    {cr.name?.[0] || "?"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  {cr.name || "Sem nome"}
                  {cr.verified && (
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="hsl(var(--primary))" /><path d="M9 12l2 2 4-4" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" fill="none" /></svg>
                  )}
                </div>
                <div className="text-[0.75rem] text-muted-foreground">
                  @{cr.handle?.replace(/^@+/, "") || "—"}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[0.68rem] font-semibold bg-primary/10 text-muted-foreground">
                  {cr.public_layout === "layout2" ? "Layout 2" : "Layout 1"}
                </span>
                <button
                  onClick={() => handleCopyUrl(cr.handle)}
                  className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                  title="Copiar URL"
                >
                  📋
                </button>
                <button
                  onClick={() => {
                    const handle = cr.handle?.replace(/^@+/, "");
                    if (handle) window.open(`/c/${handle}`, "_blank");
                  }}
                  className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                  title="Ver página"
                >
                  👁
                </button>
                <Link
                  to={`/app/creators/${cr.id}/edit`}
                  className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                  title="Editar"
                >
                  ✏
                </Link>
                <button
                  onClick={() => handleDelete(cr.id, cr.name)}
                  className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all"
                  title="Excluir"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && creators.length > 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          Nenhum creator encontrado para "{search}"
        </div>
      )}
    </div>
  );
}
