import { Link } from "react-router-dom";

export default function ExampleLink() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <span className="text-4xl">🔗</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Link de exemplo</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Este botão faz parte de um <strong className="text-foreground">template de demonstração</strong> e não possui um destino real.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 text-left space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">✏️</span>
            <div>
              <p className="text-sm font-semibold text-foreground">Edite o link</p>
              <p className="text-xs text-muted-foreground">
                Acesse o painel de edição do seu perfil e substitua este link pela URL do seu conteúdo real.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">🎯</span>
            <div>
              <p className="text-sm font-semibold text-foreground">Redirecione para onde quiser</p>
              <p className="text-xs text-muted-foreground">
                Coloque o link do seu site, loja, portfólio, formulário ou qualquer destino que desejar.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Conhecer o in1.bio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
