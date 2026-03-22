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
      className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:bg-black/40 hover:scale-110 active:scale-95"
      title={isDark ? "Modo claro" : "Modo escuro"}
      aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      <span className="text-sm transition-transform duration-300" style={{ transform: isDark ? "rotate(0deg)" : "rotate(180deg)" }}>
        {isDark ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
