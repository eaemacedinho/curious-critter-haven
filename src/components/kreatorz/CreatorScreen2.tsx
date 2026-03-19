import { useAuth } from "@/hooks/useAuth";
import { useCreatorData } from "@/hooks/useCreatorData";
import CreatorViewLinkme from "./creator/CreatorViewLinkme";

export default function CreatorScreen2() {
  const { user } = useAuth();
  const { profile, links, socialLinks, products, campaigns, loading } = useCreatorData(user?.id);

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
        <p className="text-k-2 text-sm">Faça login para ver sua página.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-k-2 text-sm">Perfil não encontrado. Tente recarregar.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14">
      <CreatorViewLinkme
        profile={profile}
        links={links.filter((l) => l.active)}
        socialLinks={socialLinks}
        products={products}
        campaigns={campaigns}
      />
    </div>
  );
}
