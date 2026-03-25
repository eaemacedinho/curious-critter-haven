import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { usePermissions } from "@/hooks/usePermissions";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Member {
  id: string;
  full_name: string;
  email: string;
  role: AppRole;
  created_at: string;
  avatar_url: string | null;
}

const ROLE_LABELS: Record<AppRole, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const ROLE_COLORS: Record<AppRole, string> = {
  owner: "bg-primary/20 text-primary-readable",
  admin: "bg-blue-500/20 text-blue-400",
  editor: "bg-emerald-500/20 text-emerald-400",
  viewer: "bg-muted text-muted-foreground",
};

const ASSIGNABLE_ROLES: AppRole[] = ["admin", "editor", "viewer"];

export default function Members() {
  const { agency } = useTenant();
  const { isOwner, canManageAgency } = usePermissions();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("editor");
  const [inviting, setInviting] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const fetchMembers = async () => {
    if (!agency?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at, avatar_url")
      .eq("agency_id", agency.id)
      .order("created_at");

    if (error) {
      toast.error("Erro ao carregar membros");
    } else {
      setMembers((data as Member[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [agency?.id]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/invite-member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            email: inviteEmail.trim(),
            role: inviteRole,
            agency_id: agency?.id,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Erro ao convidar");
      }

      toast.success(`Convite enviado para ${inviteEmail}`);
      setInviteEmail("");
      setShowInvite(false);
      await fetchMembers();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar convite");
    } finally {
      setInviting(false);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: AppRole) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", memberId);

    if (error) {
      toast.error("Erro ao alterar papel");
    } else {
      toast.success("Papel atualizado");
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    }
  };

  const handleRemove = async (member: Member) => {
    if (!confirm(`Remover ${member.full_name || member.email || "este membro"} da agência?`)) return;

    const { error } = await supabase.from("profiles").delete().eq("id", member.id);

    if (error) {
      toast.error("Erro ao remover membro");
    } else {
      toast.success("Membro removido");
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    }
  };

  if (!canManageAgency) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <span className="text-4xl mb-4 block">🔒</span>
          <h2 className="text-lg font-bold text-foreground mb-1">Acesso restrito</h2>
          <p className="text-sm text-muted-foreground">
            Apenas owners e admins podem gerenciar membros.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="font-display text-2xl text-foreground">Membros</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie os membros da sua agência e seus papéis de acesso.
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.97]"
          >
            + Convidar membro
          </button>
        )}
      </div>

      {/* Invite form */}
      {showInvite && isOwner && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 animate-fade-in">
          <h3 className="text-sm font-bold text-foreground mb-3">Convidar novo membro</h3>
          <p className="text-xs text-muted-foreground mb-4">
            O membro receberá um e-mail para criar sua conta e será automaticamente vinculado à agência.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="flex-1 px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as AppRole)}
              className="px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
            >
              {inviting ? "Enviando..." : "Enviar convite"}
            </button>
          </div>
        </div>
      )}

      {/* Members list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-4xl mb-4 block">👥</span>
          <p className="text-muted-foreground text-sm">Nenhum membro encontrado.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {members.map((member, idx) => {
            const isCurrentUser = member.role === "owner";
            return (
              <div
                key={member.id}
                className={`flex items-center gap-4 p-4 ${
                  idx < members.length - 1 ? "border-b border-border" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-readable flex-shrink-0">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (member.full_name?.[0] || member.email?.[0] || "?").toUpperCase()
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {member.full_name || "Sem nome"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{member.email || "Sem e-mail"}</div>
                </div>

                {/* Role badge */}
                <span className={`px-2.5 py-1 text-[0.68rem] font-bold rounded-lg ${ROLE_COLORS[member.role]}`}>
                  {ROLE_LABELS[member.role]}
                </span>

                {/* Actions */}
                {isOwner && !isCurrentUser && (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={member.role}
                      onChange={(e) => handleChangeRole(member.id, e.target.value as AppRole)}
                      className="px-2 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none"
                    >
                      {ASSIGNABLE_ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRemove(member)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors text-xs"
                      title="Remover membro"
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Role descriptions */}
      <div className="mt-8 bg-card/50 border border-border rounded-2xl p-5">
        <h3 className="text-sm font-bold text-foreground mb-3">Papéis e permissões</h3>
        <div className="grid gap-2.5">
          {([
            { role: "Owner", desc: "Acesso total. Gerencia membros, configurações e faturamento." },
            { role: "Admin", desc: "Gerencia creators, campanhas e analytics. Sem acesso a faturamento." },
            { role: "Editor", desc: "Edita creators e campanhas. Não pode excluir ou alterar configurações." },
            { role: "Viewer", desc: "Somente leitura. Visualiza dados sem poder alterar." },
          ] as const).map(({ role, desc }) => (
            <div key={role} className="flex items-start gap-3">
              <span className="text-xs font-bold text-foreground w-14 flex-shrink-0 mt-0.5">{role}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
