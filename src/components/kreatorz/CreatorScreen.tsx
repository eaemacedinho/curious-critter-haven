import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCreatorData } from "@/hooks/useCreatorData";
import CreatorView from "./creator/CreatorView";
import CreatorViewLinkme from "./creator/CreatorViewLinkme";
import CreatorEditPanel, { type CreatorEditPanelHandle } from "./creator/CreatorEditPanel";

type LayoutTheme = "layout1" | "layout2";

export default function CreatorScreen() {
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
    uploadContentImage,
    refetch,
  } = useCreatorData(user?.id);
  const [editing, setEditing] = useState(false);
  const [transitionSaving, setTransitionSaving] = useState(false);
  const editPanelRef = useRef<CreatorEditPanelHandle>(null);

  const [layoutTheme, setLayoutTheme] = useState<LayoutTheme>(() => {
    return (localStorage.getItem("kreatorz-layout") as LayoutTheme) || "layout1";
  });

  useEffect(() => {
    localStorage.setItem("kreatorz-layout", layoutTheme);
  }, [layoutTheme]);

  const handleToggleEditing = async () => {
    if (!editing) {
      setEditing(true);
      return;
    }

    if (!editPanelRef.current) {
      setEditing(false);
      await refetch();
      return;
    }

    setTransitionSaving(true);
    const saved = await editPanelRef.current.saveAll();
    setTransitionSaving(false);

    if (!saved) return;

    setEditing(false);
    await refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-k-3 text-sm animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-k-2 text-sm mb-3">Faça login para ver sua página.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-k-2 text-sm">Perfil não encontrado. Tente recarregar.</p>
        </div>
      </div>
    );
  }

  const activeLinks = links.filter((link) => link.active);

  return (
    <div className="min-h-screen pt-14 relative">
      {/* Top bar: theme toggle + edit button */}
      <div className="fixed top-16 right-6 z-50 flex items-center gap-2">
        {/* Theme toggle */}
        {!editing && (
          <div className="flex bg-card/80 backdrop-blur-xl border border-primary/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setLayoutTheme("layout1")}
              className={`px-3 py-2 text-xs font-semibold transition-all ${
                layoutTheme === "layout1"
                  ? "bg-primary text-primary-foreground"
                  : "text-k-3 hover:text-k-1"
              }`}
            >
              Layout 1
            </button>
            <button
              onClick={() => setLayoutTheme("layout2")}
              className={`px-3 py-2 text-xs font-semibold transition-all ${
                layoutTheme === "layout2"
                  ? "bg-primary text-primary-foreground"
                  : "text-k-3 hover:text-k-1"
              }`}
            >
              Layout 2
            </button>
          </div>
        )}

        <button
          onClick={() => void handleToggleEditing()}
          disabled={transitionSaving}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 shadow-k-purple disabled:opacity-60 disabled:cursor-not-allowed ${
            editing
              ? "bg-k-ok/20 text-k-ok border border-k-ok/30 hover:bg-k-ok/30"
              : "gradient-primary text-primary-foreground hover:shadow-k-purple-lg"
          } active:scale-[0.97]`}
        >
          {transitionSaving ? "Salvando..." : editing ? "✓ Visualizar" : "✏️ Editar página"}
        </button>
      </div>

      {editing ? (
        <CreatorEditPanel
          ref={editPanelRef}
          profile={profile}
          links={links}
          socialLinks={socialLinks}
          products={products}
          campaigns={campaigns}
          activeLayout={layoutTheme}
          onSaveProfile={saveProfile}
          onSaveLinks={saveLinks}
          onSaveSocialLinks={saveSocialLinks}
          onSaveProducts={saveProducts}
          onSaveCampaigns={saveCampaigns}
          onUploadImage={uploadImage}
          onUploadContentImage={uploadContentImage}
          onDone={() => {
            setEditing(false);
            void refetch();
          }}
        />
      ) : layoutTheme === "layout2" ? (
        <CreatorViewLinkme
          profile={profile}
          links={activeLinks}
          socialLinks={socialLinks}
          products={products}
          campaigns={campaigns}
        />
      ) : (
        <CreatorView
          profile={profile}
          links={activeLinks}
          socialLinks={socialLinks}
          products={products}
          campaigns={campaigns}
        />
      )}
    </div>
  );
}
