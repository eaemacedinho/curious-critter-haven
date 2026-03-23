import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useSubscription } from "@/hooks/useSubscription";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "sonner";
import GuidedTooltips from "@/components/onboarding/GuidedTooltips";
import { Crown } from "lucide-react";

const navItems = [
  { icon: "▦", label: "Dashboard", path: "/app", tour: "dashboard" },
  { icon: "👥", label: "Creators", path: "/app/creators", tour: "creators" },
  { icon: "📢", label: "Campanhas", path: "/app/campaigns", tour: "campaigns" },
  { icon: "📊", label: "Analytics", path: "/app/analytics", tour: "analytics", pro: true },
];

const settingsItems = [
  { icon: "🎁", label: "Indicações", path: "/app/referrals", tour: "referrals" },
  { icon: "👥", label: "Membros", path: "/app/members", tour: "members" },
  { icon: "⚙", label: "Configurações", path: "/app/settings", tour: "settings" },
];

function hexToHsl(hex: string): string | null {
  if (!hex || !hex.startsWith("#")) return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const { agency } = useTenant();
  const { currentPlan, isPro } = useSubscription();
  const onboarding = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Apply dynamic agency colors as CSS variables
  useEffect(() => {
    if (!agency) return;
    const root = document.documentElement;
    const primary = hexToHsl(agency.primary_color || "");
    const accent = hexToHsl(agency.accent_color || "");
    if (primary) {
      root.style.setProperty("--primary", primary);
      root.style.setProperty("--ring", primary);
      root.style.setProperty("--accent", primary);
      root.style.setProperty("--sidebar-primary", primary);
      root.style.setProperty("--k-500", primary);
    }
    if (accent) {
      root.style.setProperty("--k-400", accent);
    }
    return () => {
      // Reset on unmount so public pages use defaults
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--sidebar-primary");
      root.style.removeProperty("--k-500");
      root.style.removeProperty("--k-400");
    };
  }, [agency]);

  const isActive = (path: string) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sessão encerrada");
    navigate("/login");
  };

  const sidebarContent = (
    <>
      {/* Agency branding */}
      <div className="flex items-center gap-2.5 px-4 pb-6 border-b border-border mb-6">
        {agency?.logo_url ? (
          <img src={agency.logo_url} alt="" className="w-8 h-8 rounded-lg object-contain" />
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-primary-foreground"
            style={{
              background: `linear-gradient(135deg, ${agency?.primary_color || "hsl(268,69%,50%)"}, ${agency?.accent_color || "hsl(268,85%,61%)"})`,
            }}
          >
            {agency?.name?.[0] || "A"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-foreground truncate">
            {agency?.name || "Minha Agência"}
          </div>
          <div className="text-[0.65rem] text-muted-foreground truncate">
            {agency?.slug ? `in1.bio/${agency.slug}` : "in1.bio"}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="mb-6">
        <div className="text-[0.6rem] font-bold text-muted-foreground tracking-[0.14em] uppercase px-3 mb-2">
          Principal
        </div>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            data-tour={item.tour}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm mb-0.5 transition-all duration-200 ${
              isActive(item.path)
                ? "bg-card border border-border text-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
            }`}
          >
            <span className="text-xs w-4 text-center">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Settings */}
      <div className="mb-6">
        <div className="text-[0.6rem] font-bold text-muted-foreground tracking-[0.14em] uppercase px-3 mb-2">
          Sistema
        </div>
        {settingsItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            data-tour={item.tour}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm mb-0.5 transition-all duration-200 ${
              isActive(item.path)
                ? "bg-card border border-border text-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
            }`}
          >
            <span className="text-xs w-4 text-center">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* User footer */}
      <div className="mt-auto flex items-center gap-2.5 p-3 border-t border-border">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
          {user?.email?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-foreground truncate">
            {user?.user_metadata?.full_name || user?.email || "Usuário"}
          </div>
          <div className="text-[0.65rem] text-muted-foreground truncate">{user?.email}</div>
        </div>
        <button
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-destructive transition-colors text-xs"
          title="Sair"
        >
          🚪
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="w-[260px] bg-card border-r border-border p-5 pt-5 flex flex-col flex-shrink-0 max-lg:hidden">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-[280px] bg-card border-r border-border p-5 pt-5 flex flex-col lg:hidden animate-k-fade-up">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 flex items-center gap-3 px-4 sm:px-6 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            ☰
          </button>
          <div className="flex-1" />
          <span className="text-[0.65rem] font-semibold text-muted-foreground">
            {agency?.name || ""}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-border text-center">
          <span className="text-[0.65rem] text-muted-foreground">
            Gerido por <span className="font-semibold">{agency?.name || "Sua Agência"}</span>
          </span>
        </footer>
      </div>

      {/* Guided tooltips — only on fresh onboarding session, never on repeat logins */}
      {user && onboarding.freshOnboarding && (
        <GuidedTooltips userId={user.id} onComplete={() => onboarding.markTourDone()} />
      )}
    </div>
  );
}
