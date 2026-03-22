import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { extractColorsFromImage } from "@/lib/extractColors";
import { useTenant } from "@/hooks/useTenant";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { resetOnboarding } from "@/hooks/useOnboarding";

export default function Settings() {
  const { user } = useAuth();
  const { agency, updateAgency } = useTenant();
  const { canManageAgency, isViewer, role } = usePermissions();

  const [activeSection, setActiveSection] = useState("branding");
  const [agencyName, setAgencyName] = useState(agency?.name || "");
  const [agencySlug, setAgencySlug] = useState(agency?.slug || "");
  const [primaryColor, setPrimaryColor] = useState(agency?.primary_color || "#6B2BD4");
  const [accentColor, setAccentColor] = useState(agency?.accent_color || "#A855F7");
  const [logoUrl, setLogoUrl] = useState(agency?.logo_url || "");
  const [customDomain, setCustomDomain] = useState(agency?.domain || "");
  const [footerText, setFooterText] = useState(agency?.footer_text || "Powered by");
  const [footerVisible, setFooterVisible] = useState(agency?.footer_visible ?? true);
  const [footerLink, setFooterLink] = useState(agency?.footer_link || "");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const handleExtractColors = async () => {
    if (!logoUrl) {
      toast.error("Envie uma logo primeiro para extrair as cores.");
      return;
    }
    setExtracting(true);
    try {
      const colors = await extractColorsFromImage(logoUrl, 2);
      setPrimaryColor(colors[0]);
      setAccentColor(colors[1]);
      toast.success("Cores extraídas da logo! Confira e salve.");
    } catch {
      toast.error("Não foi possível extrair as cores da logo.");
    } finally {
      setExtracting(false);
    }
  };

  const sections = [
    { id: "branding", icon: "🎨", label: "Branding" },
    { id: "domain", icon: "🌐", label: "Domínios" },
    { id: "account", icon: "⚙", label: "Conta" },
  ];

  const handleSaveBranding = async () => {
    if (!canManageAgency) {
      toast.error("Você não tem permissão para alterar configurações.");
      return;
    }
    setSaving(true);
    try {
      await updateAgency({
        name: agencyName,
        slug: agencySlug,
        primary_color: primaryColor,
        accent_color: accentColor,
        logo_url: logoUrl,
        footer_text: footerText,
        footer_visible: footerVisible,
        footer_link: footerLink,
      });
      toast.success("Branding salvo com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao salvar: " + (err.message || "tente novamente"));
    }
    setSaving(false);
  };

  const handleUploadLogo = async () => {
    if (uploadingLogo || !user || !agency || !canManageAgency) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingLogo(true);
      try {
        const ext = file.name.split(".").pop() || "png";
        const path = `${agency.id}/agency-logo-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("agency-assets")
          .upload(path, file, { cacheControl: "3600", upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage.from("agency-assets").getPublicUrl(path);
        setLogoUrl(publicData.publicUrl);
        toast.success("Logo atualizado!");
      } catch (err: any) {
        toast.error("Erro ao enviar logo");
      } finally {
        setUploadingLogo(false);
      }
    };
    input.click();
  };

  return (
    <div className="max-w-[900px] mx-auto">
      <h1 className="font-display text-2xl font-normal text-foreground mb-6">Configurações</h1>

      {/* Permission banner */}
      {!canManageAgency && (
        <div className="mb-6 p-3 bg-muted/50 border border-border rounded-xl text-center">
          <p className="text-sm text-muted-foreground">
            👁 Seu papel ({role}) não permite editar configurações da agência.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Section nav */}
        <div className="flex md:flex-col gap-1 md:w-[200px] flex-shrink-0 overflow-x-auto md:overflow-visible">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap text-left ${
                activeSection === sec.id
                  ? "bg-accent/20 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              }`}
            >
              <span className="text-xs">{sec.icon}</span>
              {sec.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === "branding" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">Branding</h2>
                <p className="text-sm text-muted-foreground mb-6">Personalize a identidade visual da sua agência.</p>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Logo da agência</label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={canManageAgency ? handleUploadLogo : undefined}
                    className={`w-20 h-20 rounded-2xl bg-card border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all ${canManageAgency ? "cursor-pointer hover:border-primary/30" : "opacity-60"}`}
                  >
                    {uploadingLogo ? (
                      <span className="text-xs text-muted-foreground animate-pulse">⏳</span>
                    ) : logoUrl ? (
                      <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-2xl">📷</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{canManageAgency ? "Clique para enviar" : "Logo atual"}</p>
                    <p className="text-[0.68rem] text-muted-foreground">PNG ou SVG · 512×512px</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Nome da agência</label>
                <input
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  disabled={!canManageAgency}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary transition-all disabled:opacity-60"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Slug</label>
                <div className="flex items-center bg-background border border-border rounded-xl overflow-hidden focus-within:border-primary transition-all">
                  <span className="px-3 text-muted-foreground text-sm border-r border-border">in1.bio/</span>
                  <input
                    value={agencySlug}
                    onChange={(e) => setAgencySlug(e.target.value)}
                    disabled={!canManageAgency}
                    className="flex-1 px-3 py-3 bg-transparent text-foreground text-sm outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cores da marca</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.68rem] text-muted-foreground mb-1.5">Primária</label>
                    <div className="flex items-center gap-2.5 bg-background border border-border rounded-xl px-3 py-2.5">
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} disabled={!canManageAgency} className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent disabled:opacity-60" />
                      <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} disabled={!canManageAgency} className="bg-transparent text-foreground text-sm outline-none flex-1 font-mono disabled:opacity-60" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[0.68rem] text-muted-foreground mb-1.5">Destaque</label>
                    <div className="flex items-center gap-2.5 bg-background border border-border rounded-xl px-3 py-2.5">
                      <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} disabled={!canManageAgency} className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent disabled:opacity-60" />
                      <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} disabled={!canManageAgency} className="bg-transparent text-foreground text-sm outline-none flex-1 font-mono disabled:opacity-60" />
                </div>
                {logoUrl && canManageAgency && (
                  <button
                    onClick={handleExtractColors}
                    disabled={extracting}
                    className="mt-2 flex items-center gap-2 px-4 py-2.5 bg-accent/15 text-foreground font-semibold text-xs rounded-xl border border-border transition-all hover:bg-accent/25 active:scale-[0.97] disabled:opacity-60"
                  >
                    {extracting ? "⏳ Analisando..." : "🎨 Extrair cores da logo"}
                  </button>
                )}
              </div>
                </div>
              </div>

              {/* Footer settings */}
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rodapé das páginas</label>
                
                <div className="flex items-center justify-between bg-background border border-border rounded-xl px-4 py-3">
                  <div>
                    <div className="text-sm text-foreground font-medium">Exibir footer</div>
                    <div className="text-[0.66rem] text-muted-foreground">Mostrar "Powered by" nas páginas dos creators</div>
                  </div>
                  <button
                    onClick={() => canManageAgency && setFooterVisible(!footerVisible)}
                    disabled={!canManageAgency}
                    className={`w-11 h-6 rounded-full transition-colors relative disabled:opacity-60 ${footerVisible ? "bg-primary" : "bg-border"}`}
                  >
                    <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform absolute top-0.5 ${footerVisible ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                  </button>
                </div>

                {footerVisible && (
                  <>
                    <div>
                      <label className="block text-[0.68rem] text-muted-foreground mb-1.5">Texto do footer</label>
                      <input
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        disabled={!canManageAgency}
                        placeholder="Powered by"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary transition-all disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.68rem] text-muted-foreground mb-1.5">Link do footer (opcional)</label>
                      <input
                        value={footerLink}
                        onChange={(e) => setFooterLink(e.target.value)}
                        disabled={!canManageAgency}
                        placeholder="https://suaagencia.com"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary transition-all disabled:opacity-60"
                      />
                      <p className="text-[0.66rem] text-muted-foreground mt-1">Ao clicar no footer, o visitante será redirecionado para este link.</p>
                    </div>
                  </>
                )}
              </div>

              {/* Preview */}
              <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground font-extrabold text-lg"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                >
                  {agencyName?.[0] || "A"}
                </div>
                <div>
                  <div className="font-bold text-foreground">{agencyName || "Sua Agência"}</div>
                  <div className="text-[0.7rem] text-muted-foreground">in1.bio/{agencySlug}</div>
                </div>
              </div>

              {canManageAgency && (
                <button
                  onClick={handleSaveBranding}
                  disabled={saving}
                  className="px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar branding"}
                </button>
              )}
            </div>
          )}

          {activeSection === "domain" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">Domínios</h2>
                <p className="text-sm text-muted-foreground mb-6">Configure domínios personalizados.</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[0.66rem] text-muted-foreground uppercase tracking-wider font-bold mb-1">Domínio padrão</div>
                    <div className="text-sm text-foreground font-semibold font-mono">in1.bio/{agencySlug || agency?.slug}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[0.68rem] font-semibold bg-emerald-500/10 text-emerald-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-current" /> Ativo
                  </span>
                </div>
              </div>

              {canManageAgency && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="text-[0.66rem] text-muted-foreground uppercase tracking-wider font-bold mb-3">Domínio personalizado</div>
                  <div className="flex gap-2.5">
                    <input
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="ex: links.suaagencia.com"
                      className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={async () => {
                        if (!customDomain) return toast.error("Digite um domínio");
                        await updateAgency({ domain: customDomain });
                        toast.success("Domínio salvo!");
                      }}
                      className="px-5 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.97] whitespace-nowrap"
                    >
                      Conectar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === "account" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">Conta</h2>
                <p className="text-sm text-muted-foreground mb-6">Informações da sua conta.</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <div>
                  <div className="text-[0.66rem] text-muted-foreground uppercase tracking-wider font-bold mb-1">Email</div>
                  <div className="text-sm text-foreground">{user?.email}</div>
                </div>
                <div>
                  <div className="text-[0.66rem] text-muted-foreground uppercase tracking-wider font-bold mb-1">Nome</div>
                  <div className="text-sm text-foreground">{user?.user_metadata?.full_name || "—"}</div>
                </div>
                <div>
                  <div className="text-[0.66rem] text-muted-foreground uppercase tracking-wider font-bold mb-1">Papel</div>
                  <div className="text-sm text-foreground capitalize">{role || "—"}</div>
                </div>
                <div>
                  <div className="text-[0.66rem] text-muted-foreground uppercase tracking-wider font-bold mb-1">ID da Agência</div>
                  <div className="text-xs text-muted-foreground font-mono">{agency?.id || "—"}</div>
                </div>
              </div>

              {/* Reset onboarding */}
              {canManageAgency && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">Refazer onboarding</div>
                      <div className="text-[0.66rem] text-muted-foreground">Reinicie o assistente de configuração inicial</div>
                    </div>
                    <button
                      onClick={() => {
                        if (!user) return;
                        resetOnboarding(user.id);
                        toast.success("Onboarding resetado! Recarregando…");
                        setTimeout(() => window.location.href = "/app", 800);
                      }}
                      className="px-4 py-2 bg-primary/10 text-primary text-xs font-semibold rounded-xl hover:bg-primary/20 transition-colors"
                    >
                      🔄 Refazer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
