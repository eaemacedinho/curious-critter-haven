import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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
        <h1 className="font-display text-3xl font-extrabold mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-10">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <div className="prose prose-sm prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:text-base [&_strong]:text-foreground">
          <p>
            A <strong>in1.bio</strong> ("nós", "nosso") valoriza a privacidade dos seus usuários. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nossa plataforma.
          </p>

          <h2>1. Dados que Coletamos</h2>
          <p>Coletamos os seguintes tipos de dados:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Dados de cadastro:</strong> nome, e-mail e senha (criptografada).</li>
            <li><strong>Dados de perfil:</strong> foto, biografia, links e conteúdo que você publica na sua página.</li>
            <li><strong>Dados de uso:</strong> visualizações de página, cliques em links e campanhas, tempo de visualização de vídeos.</li>
            <li><strong>Dados técnicos:</strong> endereço IP (anonimizado), tipo de navegador, sistema operacional e resolução de tela.</li>
            <li><strong>Dados de pagamento:</strong> processados diretamente pelo Pagar.me. Não armazenamos dados de cartão de crédito.</li>
          </ul>

          <h2>2. Como Usamos seus Dados</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fornecer e manter nossos serviços.</li>
            <li>Personalizar sua experiência na plataforma.</li>
            <li>Gerar analytics e relatórios de desempenho dos seus creators.</li>
            <li>Enviar notificações importantes sobre sua conta.</li>
            <li>Melhorar nossos serviços e desenvolver novas funcionalidades.</li>
            <li>Prevenir fraudes e garantir a segurança da plataforma.</li>
          </ul>

          <h2>3. Base Legal (LGPD)</h2>
          <p>O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses legais previstas na Lei Geral de Proteção de Dados (Lei nº 13.709/2018):</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Execução de contrato:</strong> para fornecer os serviços contratados.</li>
            <li><strong>Consentimento:</strong> para envio de comunicações de marketing (quando aplicável).</li>
            <li><strong>Legítimo interesse:</strong> para melhorias na plataforma e analytics agregados.</li>
            <li><strong>Cumprimento de obrigação legal:</strong> para retenção de dados fiscais e contábeis.</li>
          </ul>

          <h2>4. Compartilhamento de Dados</h2>
          <p>Não vendemos seus dados pessoais. Compartilhamos dados apenas com:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase:</strong> infraestrutura de banco de dados e autenticação.</li>
            <li><strong>Pagar.me:</strong> processamento de pagamentos.</li>
            <li><strong>Prestadores de serviço:</strong> que auxiliam na operação da plataforma, sob contratos de confidencialidade.</li>
            <li><strong>Autoridades legais:</strong> quando exigido por lei ou ordem judicial.</li>
          </ul>

          <h2>5. Armazenamento e Segurança</h2>
          <p>
            Seus dados são armazenados em servidores seguros com criptografia em trânsito (TLS/SSL) e em repouso. Implementamos políticas de segurança em nível de linha (RLS) para garantir que cada agência acesse apenas seus próprios dados. Senhas são armazenadas com hash bcrypt e nunca em texto plano.
          </p>

          <h2>6. Seus Direitos (LGPD - Art. 18)</h2>
          <p>Você tem direito a:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Confirmar a existência de tratamento dos seus dados.</li>
            <li>Acessar seus dados pessoais.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
            <li>Solicitar a portabilidade dos dados.</li>
            <li>Revogar o consentimento a qualquer momento.</li>
            <li>Solicitar a exclusão da conta e de todos os dados associados.</li>
          </ul>
          <p>
            Para exercer qualquer desses direitos, entre em contato pelo e-mail: <a href="mailto:privacidade@in1.bio" className="text-primary hover:underline">privacidade@in1.bio</a>
          </p>

          <h2>7. Retenção de Dados</h2>
          <p>
            Mantemos seus dados pelo tempo necessário para fornecer os serviços contratados. Após a exclusão da conta, seus dados são removidos em até 30 dias, exceto quando houver obrigação legal de retenção.
          </p>

          <h2>8. Menores de Idade</h2>
          <p>
            Nossos serviços não são destinados a menores de 18 anos. Não coletamos intencionalmente dados de menores. Caso identifiquemos dados de menores, estes serão eliminados imediatamente.
          </p>

          <h2>9. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos os usuários sobre alterações significativas por e-mail ou aviso na plataforma.
          </p>

          <h2>10. Contato do Encarregado (DPO)</h2>
          <p>
            Para questões relacionadas à proteção de dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados:<br />
            E-mail: <a href="mailto:privacidade@in1.bio" className="text-primary hover:underline">privacidade@in1.bio</a>
          </p>
        </div>
      </main>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <span className="text-sm font-extrabold text-muted-foreground">in1<span className="text-foreground">.bio</span></span>
          <div className="flex gap-4">
            <Link to="/cookies" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cookies</Link>
            <Link to="/termos" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
