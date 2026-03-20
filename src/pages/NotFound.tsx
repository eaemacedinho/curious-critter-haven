import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Página não encontrada</h1>
        <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
          A página <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{location.pathname}</span> não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/app"
            className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl transition-all hover:opacity-90"
          >
            Ir para o Dashboard
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 bg-card border border-border text-foreground font-medium text-sm rounded-xl transition-all hover:border-primary/30"
          >
            Página inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
