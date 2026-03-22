import { useState, useEffect } from "react";

type PageTheme = "dark" | "light";

const THEME_KEY = "in1_page_theme";

export function usePageTheme(): [PageTheme, (t: PageTheme) => void] {
  const [theme, setThemeState] = useState<PageTheme>(() => {
    try {
      return (localStorage.getItem(THEME_KEY) as PageTheme) || "dark";
    } catch {
      return "dark";
    }
  });

  const setTheme = (t: PageTheme) => {
    setThemeState(t);
    try { localStorage.setItem(THEME_KEY, t); } catch {}
  };

  return [theme, setTheme];
}

export default function ThemeToggle({ theme, onChange }: { theme: PageTheme; onChange: (t: PageTheme) => void }) {
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => onChange(isDark ? "light" : "dark")}
      className="w-10 h-10 rounded-full bg-card/70 backdrop-blur-xl border border-border/50 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-card/90 active:scale-95 shadow-lg"
      title={isDark ? "Modo claro" : "Modo escuro"}
      aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      <span className="text-base transition-transform duration-300" style={{ transform: isDark ? "rotate(0deg)" : "rotate(180deg)" }}>
        {isDark ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
