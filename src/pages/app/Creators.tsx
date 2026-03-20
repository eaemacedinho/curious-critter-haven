import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  const navigate = useNavigate();
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
        <Link
          to="/app/creators/edit"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.97]"
        >
          + Novo Creator
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-card border border-border rounded-xl mb-6 focus-within:border-primary/30 transition-all max-w-sm">
        <span className="text-muted-foreground text-sm">🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar creator..."
          className="bg-transparent border-none outline-none text-foreground text-sm w-full placeholder:text-muted-foreground"
        />
      </div>

      {/* Empty state */}
      {creators.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">👤</div>
          <h3 className="text-lg font-bold text-foreground mb-2">Nenhum creator ainda</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Comece adicionando seu primeiro creator para criar páginas personalizadas.
          </p>
          <Link
            to="/app/creators/edit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl"
          >
            + Criar primeiro creator
          </Link>
        </div>
      )}

      {/* Creator cards */}
      {filtered.length > 0 && (
        <div className="grid gap-3">
          {filtered.map((cr) => (
            <div
              key={cr.id}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-border">
                {cr.avatar_url ? (
                  <img src={cr.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent/10 flex items-center justify-center text-lg text-muted-foreground">
                    {cr.name?.[0] || "?"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  {cr.name || "Sem nome"}
                  {cr.verified && (
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="hsl(268,69%,50%)" /><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" /></svg>
                  )}
                </div>
                <div className="text-[0.75rem] text-muted-foreground">
                  @{cr.handle?.replace(/^@+/, "") || "—"}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[0.68rem] font-semibold bg-accent/10 text-muted-foreground">
                  {cr.public_layout === "layout2" ? "Layout 2" : "Layout 1"}
                </span>
                <button
                  onClick={() => handleCopyUrl(cr.handle)}
                  className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                  title="Copiar URL"
                >
                  📋
                </button>
                <button
                  onClick={() => {
                    const handle = cr.handle?.replace(/^@+/, "");
                    if (handle) window.open(`/c/${handle}`, "_blank");
                  }}
                  className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                  title="Ver página"
                >
                  👁
                </button>
                <Link
                  to="/app/creators/edit"
                  className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                  title="Editar"
                >
                  ✏
                </Link>
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
