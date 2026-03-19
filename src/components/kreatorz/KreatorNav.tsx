import { cn } from "@/lib/utils";

interface KreatorNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "landing", label: "Landing Page" },
  { id: "creator", label: "Página do Creator" },
  { id: "dash", label: "Dashboard" },
  { id: "editor", label: "Editor" },
  { id: "settings", label: "Configurações" },
  { id: "login", label: "Login" },
];

export default function KreatorNav({ activeTab, onTabChange }: KreatorNavProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] px-6 bg-background/72 backdrop-blur-[32px] backdrop-saturate-150 border-b border-primary/10">
      <div className="max-w-[1440px] mx-auto flex items-center h-14 gap-1.5">
        <div className="flex items-center gap-2 mr-6 font-extrabold text-[1.1rem] tracking-tight text-primary-foreground whitespace-nowrap">
          <span className="w-[26px] h-[26px] rounded-[7px] gradient-primary flex items-center justify-center text-xs text-primary-foreground font-extrabold">K</span>
          Kreator<span className="text-k-300">z</span>
        </div>
        <div className="flex gap-0.5 overflow-x-auto flex-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[0.74rem] font-medium transition-all duration-300 whitespace-nowrap",
                activeTab === tab.id
                  ? "text-primary-foreground bg-primary shadow-k-purple"
                  : "text-k-3 hover:text-k-2 hover:bg-primary/[0.06]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[0.65rem] font-bold text-k-200 bg-k-glow border border-k-glow px-3 py-1 rounded-full tracking-widest">
          ✦ MOCKUP v5
        </span>
      </div>
    </nav>
  );
}
