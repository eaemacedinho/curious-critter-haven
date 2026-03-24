import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const isPublicCreatorPage = location.pathname.startsWith("/c/");

  useEffect(() => {
    if (isPublicCreatorPage) return;
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) setVisible(true);
  }, [isPublicCreatorPage]);

  const accept = (all?: boolean) => {
    const final = all ? { essential: true, analytics: true, marketing: true } : prefs;
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(final));
    setVisible(false);
    supabase.from("analytics_events").insert({
      event_type: "cookie_consent",
      metadata: { action: all ? "accept_all" : "custom", prefs: final },
    }).then();
  };

  if (!visible || isPublicCreatorPage) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9999] p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-2xl p-5">
        {!showConfig ? (
          <>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">🍪</span>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">Nós usamos cookies</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Utilizamos cookies para melhorar sua experiência, analisar tráfego e personalizar conteúdo.
                  Leia nossa{" "}
                  <Link to="/cookies" className="text-primary underline font-medium">Política de Cookies</Link> e{" "}
                  <Link to="/privacidade" className="text-primary underline font-medium">Política de Privacidade</Link>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowConfig(true)}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-xl transition-colors"
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
            <h3 className="text-sm font-bold text-foreground mb-3">Preferências de cookies</h3>
            <div className="space-y-3 mb-4">
              {[
                { key: "essential" as const, label: "Essenciais", desc: "Autenticação e segurança. Sempre ativados.", locked: true },
                { key: "analytics" as const, label: "Analytics", desc: "Nos ajudam a entender como você usa a plataforma." },
                { key: "marketing" as const, label: "Marketing", desc: "Personalização de anúncios e campanhas." },
              ].map((c) => (
                <div key={c.key} className="flex items-center justify-between bg-secondary border border-border rounded-xl px-4 py-3">
                  <div>
                    <div className="text-xs font-semibold text-foreground">{c.label}</div>
                    <div className="text-[0.65rem] text-muted-foreground">{c.desc}</div>
                  </div>
                  <button
                    onClick={() => !c.locked && setPrefs((p) => ({ ...p, [c.key]: !p[c.key] }))}
                    disabled={c.locked}
                    className={`w-10 h-5 rounded-full transition-colors relative disabled:opacity-70 ${
                      prefs[c.key] ? "bg-primary" : "bg-muted"
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
              <button onClick={() => setShowConfig(false)} className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-xl transition-colors">
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
