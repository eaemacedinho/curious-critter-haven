import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCreatorData } from "@/hooks/useCreatorData";
import CreatorEditPanel, { type CreatorEditPanelHandle } from "@/components/kreatorz/creator/CreatorEditPanel";

export default function CreatorEdit() {
  const { user } = useAuth();
  const { creatorId } = useParams<{ creatorId: string }>();
  const {
    profile, links, socialLinks, products, campaigns, loading,
    saveProfile, saveLinks, saveSocialLinks, saveProducts, saveCampaigns,
    uploadImage, uploadContentImage, refetch,
  } = useCreatorData(user?.id, creatorId);
  const editorRef = useRef<CreatorEditPanelHandle>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editorRef.current) return;
    setSaving(true);
    const saved = await editorRef.current.saveAll();
    setSaving(false);
    if (!saved) return;
    await refetch();
    toast.success("Alterações salvas com sucesso!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Faça login para editar.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Creator não encontrado. Tente recarregar.</p>
      </div>
    );
  }

  const layoutOptions = [
    { id: "layout1", label: "Padrão" },
    { id: "layout2", label: "Imersivo" },
    { id: "minimal", label: "Minimalista" },
    { id: "grid", label: "Grid" },
    { id: "dark", label: "Dark" },
  ];

  const handleSetPublicLayout = async (layout: string) => {
    try {
      await saveProfile({ public_layout: layout } as any);
      const name = layoutOptions.find(l => l.id === layout)?.label || layout;
      toast.success(`Layout "${name}" definido como página pública`);
    } catch {
      toast.error("Erro ao salvar layout");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/app/creators" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Creators
            </Link>
          </div>
          <h1 className="font-display text-2xl text-foreground">
            {profile.name || "Editar Creator"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            As alterações aparecerão na página pública após salvar.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Layout toggle */}
          <div className="flex bg-card border border-border rounded-xl overflow-hidden">
            {layoutOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => void handleSetPublicLayout(opt.id)}
                className={`px-3 py-2 text-xs font-semibold transition-all ${
                  profile.public_layout === opt.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Preview */}
          <button
            onClick={() => {
              const handle = profile.handle?.replace(/^@+/, "");
              if (handle) window.open(`/c/${handle}`, "_blank");
            }}
            className="px-4 py-2 bg-card border border-border text-muted-foreground font-medium text-sm rounded-xl transition-all hover:border-primary/30 hover:text-foreground"
          >
            👁 Ver página
          </button>
          {/* Save */}
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-5 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>

      {/* Editor */}
      <CreatorEditPanel
        ref={editorRef}
        profile={profile}
        links={links}
        socialLinks={socialLinks}
        products={products}
        campaigns={campaigns}
        activeLayout={profile.public_layout}
        onSaveProfile={saveProfile}
        onSaveLinks={saveLinks}
        onSaveSocialLinks={saveSocialLinks}
        onSaveProducts={saveProducts}
        onSaveCampaigns={saveCampaigns}
        onUploadImage={uploadImage}
        onUploadContentImage={uploadContentImage}
        onDone={() => void refetch()}
      />
    </div>
  );
}
