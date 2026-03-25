import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[800px] mx-auto flex items-center h-16 px-6 gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            in1<span className="text-primary-readable">.bio</span>
          </span>
        </div>
      </nav>

      <main className="max-w-[800px] mx-auto px-6 py-16">
        <h1 className="font-display text-3xl font-extrabold mb-2">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground mb-10">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <div className="prose prose-sm prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-10 [&_h2]:mb-3 [&_strong]:text-foreground">
          <p>
            Bem-vindo ao <strong>in1.bio</strong>. Ao acessar e utilizar nossa plataforma, você concorda com os seguintes Termos de Uso. Leia-os atentamente.
          </p>

          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao criar uma conta ou utilizar qualquer funcionalidade do in1.bio, você declara ter lido, compreendido e concordado com estes Termos de Uso e com nossa Política de Privacidade.
          </p>

          <h2>2. Descrição do Serviço</h2>
          <p>
            O in1.bio é uma plataforma SaaS que permite a criação de páginas de bio personalizadas com links, campanhas, vídeos e analytics. O serviço está disponível em planos gratuitos e pagos.
          </p>

          <h2>3. Cadastro e Conta</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Você deve fornecer informações verdadeiras e atualizadas.</li>
            <li>É responsável por manter a confidencialidade da sua senha.</li>
            <li>Deve ter no mínimo 18 anos para utilizar o serviço.</li>
            <li>É responsável por todas as atividades realizadas em sua conta.</li>
          </ul>

          <h2>4. Uso Aceitável</h2>
          <p>Você concorda em <strong>não</strong> utilizar o in1.bio para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Publicar conteúdo ilegal, difamatório, discriminatório ou que viole direitos de terceiros.</li>
            <li>Distribuir malware, phishing ou conteúdo fraudulento.</li>
            <li>Realizar spam ou envio massivo não solicitado.</li>
            <li>Interferir no funcionamento da plataforma ou de outros usuários.</li>
            <li>Violar leis de proteção de dados (LGPD, GDPR).</li>
          </ul>

          <h2>5. Propriedade Intelectual</h2>
          <p>
            A plataforma in1.bio, incluindo marca, design, código e funcionalidades, é propriedade exclusiva da in1.bio. O conteúdo que você publica na plataforma permanece sendo de sua propriedade, mas você nos concede uma licença limitada para exibi-lo conforme necessário para a prestação do serviço.
          </p>

          <h2>6. Planos e Pagamentos</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Os planos pagos são cobrados conforme o ciclo escolhido (mensal ou anual).</li>
            <li>Pagamentos são processados pelo Pagar.me de forma segura.</li>
            <li>O cancelamento pode ser feito a qualquer momento nas configurações da conta.</li>
            <li>Reembolsos seguem a política do Código de Defesa do Consumidor (7 dias de arrependimento para compras online).</li>
          </ul>

          <h2>7. Disponibilidade do Serviço</h2>
          <p>
            Nos esforçamos para manter o serviço disponível 24/7, mas não garantimos disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência sempre que possível.
          </p>

          <h2>8. Limitação de Responsabilidade</h2>
          <p>
            O in1.bio não se responsabiliza por danos indiretos, incidentais ou consequenciais decorrentes do uso ou impossibilidade de uso da plataforma. Nossa responsabilidade total está limitada ao valor pago pelo usuário nos últimos 12 meses.
          </p>

          <h2>9. Encerramento de Conta</h2>
          <p>
            Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos de Uso, mediante notificação prévia quando possível. Você pode solicitar a exclusão da sua conta a qualquer momento.
          </p>

          <h2>10. Legislação Aplicável</h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias.
          </p>

          <h2>11. Contato</h2>
          <p>
            Dúvidas sobre estes Termos? Entre em contato: <a href="mailto:contato@in1.bio" className="text-primary hover:underline">contato@in1.bio</a>
          </p>
        </div>
      </main>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <span className="text-sm font-extrabold text-muted-foreground">in1<span className="text-foreground">.bio</span></span>
          <div className="flex gap-4">
            <Link to="/privacidade" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacidade</Link>
            <Link to="/cookies" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
