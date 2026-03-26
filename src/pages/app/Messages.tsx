import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Mail, MailOpen, Trash2, User, Clock } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ContactMessage {
  id: string;
  creator_id: string;
  agency_id: string;
  sender_name: string;
  sender_email: string;
  message: string;
  is_read: boolean;
  created_at: string;
  creator_name?: string;
}

export default function Messages() {
  const { agency } = useTenant();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!agency?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("agency_id", agency.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
      return;
    }

    // Fetch creator names
    const creatorIds = [...new Set((data || []).map((m: any) => m.creator_id))];
    let creatorMap: Record<string, string> = {};
    if (creatorIds.length > 0) {
      const { data: creators } = await supabase
        .from("creators")
        .select("id, name")
        .in("id", creatorIds);
      creatorMap = Object.fromEntries((creators || []).map((c: any) => [c.id, c.name]));
    }

    setMessages((data || []).map((m: any) => ({
      ...m,
      creator_name: creatorMap[m.creator_id] || "—",
    })));
    setLoading(false);
  }, [agency?.id]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const markAsRead = async (msg: ContactMessage) => {
    if (msg.is_read) return;
    await supabase
      .from("contact_messages")
      .update({ is_read: true } as any)
      .eq("id", msg.id);
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    if (selected?.id === msg.id) setSelected({ ...msg, is_read: true });
  };

  const deleteMessage = async (msgId: string) => {
    await supabase.from("contact_messages").delete().eq("id", msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    if (selected?.id === msgId) setSelected(null);
  };

  const handleSelect = (msg: ContactMessage) => {
    setSelected(msg);
    void markAsRead(msg);
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-foreground">Mensagens</h1>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 bg-primary/15 text-primary text-xs font-bold rounded-full">
            {unreadCount} nova{unreadCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-20">
          <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Nenhuma mensagem recebida ainda.</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Quando visitantes enviarem mensagens pelo botão "Contato comercial", elas aparecerão aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
          {/* Message list */}
          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
                  selected?.id === msg.id
                    ? "bg-primary/5 border-primary/20"
                    : msg.is_read
                    ? "bg-card border-border hover:border-primary/10"
                    : "bg-card border-primary/20 hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                    msg.is_read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
                  }`}>
                    {msg.sender_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate ${msg.is_read ? "font-medium text-foreground" : "font-bold text-foreground"}`}>
                        {msg.sender_name || "Sem nome"}
                      </span>
                      {!msg.is_read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{msg.sender_email}</p>
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{msg.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[0.6rem] text-muted-foreground/50">
                        {format(new Date(msg.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                      </span>
                      <span className="text-[0.6rem] text-muted-foreground/40">•</span>
                      <span className="text-[0.6rem] text-muted-foreground/50">{msg.creator_name}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Message detail */}
          <div className="bg-card border border-border rounded-2xl p-6 min-h-[400px]">
            {selected ? (
              <div>
                <div className="flex items-start gap-3 mb-6 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {selected.sender_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-foreground">{selected.sender_name || "Sem nome"}</h3>
                    <a href={`mailto:${selected.sender_email}`} className="text-xs text-primary hover:underline">
                      {selected.sender_email}
                    </a>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(new Date(selected.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </span>
                      <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
                        <User className="w-3 h-3" />
                        {selected.creator_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteMessage(selected.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Excluir mensagem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {selected.is_read ? (
                      <MailOpen className="w-4 h-4 text-muted-foreground/40" />
                    ) : (
                      <Mail className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </div>
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </div>
                <div className="mt-6">
                  <a
                    href={`mailto:${selected.sender_email}?subject=Re: Contato comercial`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Mail className="w-4 h-4" />
                    Responder por e-mail
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground/40">
                <div className="text-center">
                  <MailOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Selecione uma mensagem</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
