import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCreatorData } from "@/hooks/useCreatorData";
import CreatorEditPanel, { type CreatorEditPanelHandle } from "./creator/CreatorEditPanel";

interface EditorScreenProps {
  onNavigate: (tab: string) => void;
}

export default function EditorScreen({ onNavigate }: EditorScreenProps) {
  const { user } = useAuth();
  const {
    profile,
    links,
    socialLinks,
    products,
    campaigns,
    loading,
    saveProfile,
    saveLinks,
    saveSocialLinks,
    saveProducts,
    saveCampaigns,
    uploadImage,
    refetch,
  } = useCreatorData(user?.id);
  const editorRef = useRef<CreatorEditPanelHandle>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editorRef.current) return;

    setSaving(true);
    const saved = await editorRef.current.saveAll();
    setSaving(false);

    if (!saved) return;

    await refetch();
    toast.success("Editor sincronizado com a página do creator.");
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] pt-14 flex items-center justify-center">
        <div className="text-k-3 text-sm animate-pulse">Carregando editor...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-56px)] pt-14 flex items-center justify-center px-6">
        <div className="max-w-md text-center bg-card/65 backdrop-blur-xl border border-primary/10 rounded-3xl p-8">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="font-display text-2xl text-primary-foreground mb-3">Faça login para editar</h1>
          <p className="text-k-2 text-sm leading-relaxed mb-6">
            O Editor agora salva no perfil real do creator, então é preciso estar autenticado.
          </p>
          <button
            onClick={() => onNavigate("login")}
            className="px-5 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-2xl transition-all duration-300 hover:bg-k-400 hover:shadow-k-purple active:scale-[0.97]"
          >
            Ir para login
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-56px)] pt-14 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-k-2 text-sm">Perfil não encontrado. Tente recarregar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] pt-14">
      <div className="sticky top-14 z-40 bg-background/85 backdrop-blur-xl border-b border-primary/10 px-6 py-4">
        <div className="max-w-[980px] mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[0.66rem] font-bold text-k-4 tracking-[0.14em] uppercase mb-1">Editor sincronizado</div>
            <h1 className="font-display text-2xl text-primary-foreground">Editar creator</h1>
            <p className="text-sm text-k-3">Tudo o que você salvar aqui aparece na Página do Creator.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate("creator")}
              className="px-4 py-2.5 bg-k-800 border border-primary/10 text-k-2 font-medium text-sm rounded-xl transition-all hover:border-k-400 hover:text-primary-foreground"
            >
              Ver página
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all duration-300 hover:bg-k-400 hover:shadow-k-purple active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>

      <CreatorEditPanel
        ref={editorRef}
        profile={profile}
        links={links}
        socialLinks={socialLinks}
        products={products}
        campaigns={campaigns}
        onSaveProfile={saveProfile}
        onSaveLinks={saveLinks}
        onSaveSocialLinks={saveSocialLinks}
        onSaveProducts={saveProducts}
        onSaveCampaigns={saveCampaigns}
        onUploadImage={uploadImage}
        onUploadContentImage={uploadContentImage}
        onDone={() => {
          void refetch();
        }}
      />
    </div>
  );
}
