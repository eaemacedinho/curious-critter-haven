import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const COOKIE_CONSENT_KEY = "in1bio_cookie_consent";

type CookiePrefs = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
};

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>({
    essential: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  const accept = (all?: boolean) => {
    const final = all ? { essential: true, analytics: true, marketing: true } : prefs;
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(final));
    setVisible(false);
    supabase.from("analytics_events").insert({
      event_type: "cookie_consent",
      metadata: { action: all ? "accept_all" : "custom", prefs: final },
    }).then();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9999] p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl mx-auto bg-[hsl(0_0%_100%)] dark:bg-[hsl(240_20%_8%)] border border-[hsl(240_5%_85%)] dark:border-[hsl(240_10%_16%)] rounded-2xl shadow-2xl p-5">
        {!showConfig ? (
          <>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">🍪</span>
              <div>
                <h3 className="text-sm font-bold text-[hsl(240_20%_10%)] dark:text-[hsl(240_10%_96%)] mb-1">Nós usamos cookies</h3>
                <p className="text-xs text-[hsl(240_5%_40%)] dark:text-[hsl(240_10%_52%)] leading-relaxed">
                  Utilizamos cookies para melhorar sua experiência, analisar tráfego e personalizar conteúdo.
                  Leia nossa{" "}
                  <Link to="/cookies" className="text-primary underline">Política de Cookies</Link> e{" "}
                  <Link to="/privacidade" className="text-primary underline">Política de Privacidade</Link>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowConfig(true)}
                className="px-4 py-2 text-xs font-semibold text-[hsl(240_5%_40%)] dark:text-[hsl(240_10%_52%)] hover:text-[hsl(240_20%_10%)] dark:hover:text-[hsl(240_10%_96%)] border border-[hsl(240_5%_85%)] dark:border-[hsl(240_10%_16%)] rounded-xl transition-colors"
              >
                Configurar
              </button>
              <button
                onClick={() => accept(true)}
                className="px-5 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all"
              >
                Aceitar todos
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-bold text-[hsl(240_20%_10%)] dark:text-[hsl(240_10%_96%)] mb-3">Preferências de cookies</h3>
            <div className="space-y-3 mb-4">
              {[
                { key: "essential" as const, label: "Essenciais", desc: "Autenticação e segurança. Sempre ativados.", locked: true },
                { key: "analytics" as const, label: "Analytics", desc: "Nos ajudam a entender como você usa a plataforma." },
                { key: "marketing" as const, label: "Marketing", desc: "Personalização de anúncios e campanhas." },
              ].map((c) => (
                <div key={c.key} className="flex items-center justify-between bg-[hsl(0_0%_97%)] dark:bg-[hsl(240_18%_10%)] border border-[hsl(240_5%_88%)] dark:border-[hsl(240_10%_16%)] rounded-xl px-4 py-3">
                  <div>
                    <div className="text-xs font-semibold text-[hsl(240_20%_10%)] dark:text-[hsl(240_10%_96%)]">{c.label}</div>
                    <div className="text-[0.65rem] text-[hsl(240_5%_40%)] dark:text-[hsl(240_10%_52%)]">{c.desc}</div>
                  </div>
                  <button
                    onClick={() => !c.locked && setPrefs((p) => ({ ...p, [c.key]: !p[c.key] }))}
                    disabled={c.locked}
                    className={`w-10 h-5 rounded-full transition-colors relative disabled:opacity-70 ${
                      prefs[c.key] ? "bg-primary" : "bg-[hsl(240_5%_80%)] dark:bg-[hsl(240_10%_20%)]"
                    }`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform absolute top-0.5 ${
                      prefs[c.key] ? "translate-x-[22px]" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setShowConfig(false)} className="px-4 py-2 text-xs text-[hsl(240_5%_40%)] dark:text-[hsl(240_10%_52%)] hover:text-[hsl(240_20%_10%)] dark:hover:text-[hsl(240_10%_96%)] border border-[hsl(240_5%_85%)] dark:border-[hsl(240_10%_16%)] rounded-xl transition-colors">
                Voltar
              </button>
              <button onClick={() => accept()} className="px-5 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all">
                Salvar preferências
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
