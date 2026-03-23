import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Cookies() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[800px] mx-auto flex items-center h-16 px-6 gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            in1<span className="text-primary">.bio</span>
          </span>
        </div>
      </nav>

      <main className="max-w-[800px] mx-auto px-6 py-16">
        <h1 className="font-display text-3xl font-extrabold mb-2">Política de Cookies</h1>
        <p className="text-sm text-muted-foreground mb-10">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <div className="prose prose-sm prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-10 [&_h2]:mb-3 [&_strong]:text-foreground">
          <p>
            Esta Política de Cookies explica como a <strong>in1.bio</strong> utiliza cookies e tecnologias semelhantes para reconhecer você quando visita nossa plataforma.
          </p>

          <h2>1. O que são Cookies?</h2>
          <p>
            Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site. Eles permitem que o site reconheça seu dispositivo e lembre suas preferências.
          </p>

          <h2>2. Cookies que Utilizamos</h2>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_2fr] items-center px-5 py-3 border-b border-border text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider">
              <div>Cookie</div>
              <div>Tipo</div>
              <div>Finalidade</div>
            </div>
            {[
              { name: "sb-*-auth-token", type: "Essencial", desc: "Autenticação e sessão do usuário (Supabase Auth)." },
              { name: "theme", type: "Funcional", desc: "Salvar preferência de tema (claro/escuro) nas páginas públicas." },
              { name: "localStorage", type: "Essencial", desc: "Persistência da sessão de autenticação." },
            ].map((c, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1fr_2fr] items-center px-5 py-3 border-b border-border last:border-b-0 text-sm">
                <div className="font-mono text-xs text-foreground">{c.name}</div>
                <div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${c.type === "Essencial" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent-foreground"}`}>
                    {c.type}
                  </span>
                </div>
                <div className="text-muted-foreground text-[0.78rem]">{c.desc}</div>
              </div>
            ))}
          </div>

          <h2>3. Cookies de Terceiros</h2>
          <p>
            Não utilizamos cookies de rastreamento de terceiros, pixels de rastreamento ou ferramentas de analytics externas como Google Analytics. Nosso sistema de analytics é próprio e não utiliza cookies adicionais.
          </p>

          <h2>4. Cookies Essenciais</h2>
          <p>
            Os cookies essenciais são necessários para o funcionamento básico da plataforma (autenticação, segurança). Eles não podem ser desativados sem comprometer o uso do serviço.
          </p>

          <h2>5. Como Gerenciar Cookies</h2>
          <p>Você pode gerenciar cookies através das configurações do seu navegador:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies</li>
            <li><strong>Firefox:</strong> Configurações → Privacidade e segurança</li>
            <li><strong>Safari:</strong> Preferências → Privacidade</li>
            <li><strong>Edge:</strong> Configurações → Cookies e permissões de site</li>
          </ul>
          <p>
            <strong>Atenção:</strong> desativar cookies essenciais pode impedir o funcionamento correto da plataforma.
          </p>

          <h2>6. Contato</h2>
          <p>
            Dúvidas sobre o uso de cookies? Entre em contato: <a href="mailto:privacidade@in1.bio" className="text-primary hover:underline">privacidade@in1.bio</a>
          </p>
        </div>
      </main>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <span className="text-sm font-extrabold text-muted-foreground">in1<span className="text-foreground">.bio</span></span>
          <div className="flex gap-4">
            <Link to="/privacidade" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacidade</Link>
            <Link to="/termos" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
