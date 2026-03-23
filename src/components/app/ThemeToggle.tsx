import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function DashboardThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("in1bio_dashboard_theme");
    return stored ? stored === "dark" : true; // default dark
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("light");
    } else {
      root.classList.add("light");
    }
    localStorage.setItem("in1bio_dashboard_theme", isDark ? "dark" : "light");
    return () => {
      root.classList.remove("light");
    };
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
      title={isDark ? "Modo claro" : "Modo escuro"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
