/**
 * Complete template data definitions.
 * Each template includes all data needed to populate a creator page:
 * profile fields, links, social links, products, and testimonials.
 */

export interface TemplateProfileData {
  bio: string;
  category: string;
  font_family: string;
  font_size: string;
  image_shape: string;
  image_shape_links: string;
  image_shape_products: string;
  tags: { label: string; color?: string }[];
  stats: { value: string; label: string }[];
  brands: { name: string }[];
  brands_display_mode: string;
  section_order: string[];
  avatar_url?: string;
  cover_url?: string;
}

export interface TemplateLinkData {
  title: string;
  url: string;
  subtitle: string;
  icon: string;
  is_featured: boolean;
  is_active: boolean;
  display_mode: string;
}

export interface TemplateSocialData {
  platform: string;
  label: string;
  url: string;
}

export interface TemplateProductData {
  title: string;
  price: string;
  icon: string;
  url: string;
  is_active: boolean;
}

export interface TemplateTestimonialData {
  author_name: string;
  author_role: string;
  content: string;
  rating: number;
  is_active: boolean;
}

export interface FullTemplateData {
  id: string;
  name: string;
  description: string;
  objective: string;
  niches: string[];
  popular?: boolean;
  profile: TemplateProfileData;
  links: TemplateLinkData[];
  socialLinks: TemplateSocialData[];
  products: TemplateProductData[];
  testimonials: TemplateTestimonialData[];
}

// Image imports
import avatarPortfolio from "@/assets/templates/avatar-portfolio.jpg";
import avatarSales from "@/assets/templates/avatar-sales.jpg";
import avatarInfluencer from "@/assets/templates/avatar-influencer.jpg";
import avatarProfessional from "@/assets/templates/avatar-professional.jpg";
import avatarLocal from "@/assets/templates/avatar-local.jpg";
import avatarArtist from "@/assets/templates/avatar-artist.jpg";
import avatarPodcast from "@/assets/templates/avatar-podcast.jpg";
import avatarCoach from "@/assets/templates/avatar-coach.jpg";
import avatarEcommerce from "@/assets/templates/avatar-ecommerce.jpg";
import coverPortfolio from "@/assets/templates/cover-portfolio.jpg";
import coverSales from "@/assets/templates/cover-sales.jpg";
import coverInfluencer from "@/assets/templates/cover-influencer.jpg";
import coverProfessional from "@/assets/templates/cover-professional.jpg";
import coverLocal from "@/assets/templates/cover-local.jpg";
import coverArtist from "@/assets/templates/cover-artist.jpg";
import coverPodcast from "@/assets/templates/cover-podcast.jpg";
import coverCoach from "@/assets/templates/cover-coach.jpg";
import coverEcommerce from "@/assets/templates/cover-ecommerce.jpg";

export const TEMPLATE_DATA: FullTemplateData[] = [
  {
    id: "portfolio",
    name: "Portfólio Visual",
    description: "Mostre seu trabalho com impacto. Grid de imagens, vídeos e links organizados.",
    objective: "Exibir trabalhos e atrair clientes",
    niches: ["creator", "fotografo", "videomaker", "artista"],
    popular: true,
    profile: {
      bio: "Fotógrafa & Diretora Criativa ✨ Transformando momentos em arte visual",
      category: "Fotógrafa",
      avatar_url: avatarPortfolio,
      cover_url: coverPortfolio,
      font_family: "playfair",
      font_size: "medium",
      image_shape: "rounded",
      image_shape_links: "rounded",
      image_shape_products: "rounded",
      tags: [
        { label: "Fotografia" },
        { label: "Direção de Arte" },
        { label: "Retratos" },
      ],
      stats: [
        { value: "500+", label: "Ensaios" },
        { value: "12", label: "Prêmios" },
        { value: "8 anos", label: "Experiência" },
      ],
      brands: [
        { name: "Vogue" },
        { name: "Elle" },
        { name: "Adobe" },
      ],
      brands_display_mode: "marquee",
      section_order: ["links", "products", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Portfólio Completo", url: "https://exemplo.com/portfolio", subtitle: "Veja meus melhores trabalhos", icon: "📸", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Agende seu Ensaio", url: "https://exemplo.com/agendar", subtitle: "Horários disponíveis", icon: "📅", is_featured: false, is_active: true, display_mode: "full" },
      { title: "Workshop de Fotografia", url: "https://exemplo.com/workshop", subtitle: "Aprenda comigo", icon: "🎓", is_featured: false, is_active: true, display_mode: "full" },
      { title: "Loja de Presets", url: "https://exemplo.com/presets", subtitle: "Presets exclusivos Lightroom", icon: "🎨", is_featured: false, is_active: true, display_mode: "half" },
    ],
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/exemplo" },
      { platform: "youtube", label: "YouTube", url: "https://youtube.com/@exemplo" },
      { platform: "tiktok", label: "TikTok", url: "https://tiktok.com/@exemplo" },
    ],
    products: [
      { title: "Pack 20 Presets Pro", price: "R$ 97", icon: "🎨", url: "https://exemplo.com/presets", is_active: true },
      { title: "E-book Fotografia", price: "R$ 49", icon: "📖", url: "https://exemplo.com/ebook", is_active: true },
      { title: "Mentoria Individual", price: "R$ 297", icon: "🧠", url: "https://exemplo.com/mentoria", is_active: true },
    ],
    testimonials: [],
  },
  {
    id: "sales",
    name: "Página de Vendas",
    description: "Converta seguidores em clientes com CTA poderosos e vitrine de produtos.",
    objective: "Vender produtos e serviços",
    niches: ["freelancer", "social", "agencia", "ecommerce"],
    profile: {
      bio: "Especialista em Marketing Digital 🚀 Ajudando negócios a crescer online",
      category: "Marketing Digital",
      avatar_url: avatarSales,
      cover_url: coverSales,
      font_size: "medium",
      image_shape: "rounded",
      image_shape_links: "pill",
      image_shape_products: "rounded",
      tags: [
        { label: "Marketing" },
        { label: "Vendas" },
        { label: "Social Media" },
      ],
      stats: [
        { value: "200+", label: "Clientes" },
        { value: "R$5M+", label: "Faturados" },
        { value: "98%", label: "Satisfação" },
      ],
      brands: [],
      brands_display_mode: "static",
      section_order: ["products", "links", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Consultoria Gratuita", url: "https://exemplo.com/consultoria", subtitle: "Agende 30 min grátis", icon: "🎯", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Curso Completo de Vendas", url: "https://exemplo.com/curso", subtitle: "De zero a expert", icon: "📚", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Comunidade VIP", url: "https://exemplo.com/comunidade", subtitle: "Networking exclusivo", icon: "👥", is_featured: false, is_active: true, display_mode: "full" },
    ],
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/exemplo" },
      { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/exemplo" },
      { platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/5511999999999" },
    ],
    products: [
      { title: "Mentoria de Vendas", price: "R$ 497", icon: "🚀", url: "https://exemplo.com/mentoria", is_active: true },
      { title: "Pack de Templates", price: "R$ 127", icon: "📋", url: "https://exemplo.com/templates", is_active: true },
      { title: "Curso de Copywriting", price: "R$ 197", icon: "✍️", url: "https://exemplo.com/copy", is_active: true },
      { title: "Planilha de Gestão", price: "R$ 47", icon: "📊", url: "https://exemplo.com/planilha", is_active: true },
    ],
    testimonials: [
      { author_name: "Carlos Silva", author_role: "Empreendedor", content: "Triplicou minhas vendas em 3 meses! Metodologia incrível.", rating: 5, is_active: true },
      { author_name: "Ana Costa", author_role: "Loja Online", content: "O melhor investimento que fiz pro meu negócio.", rating: 5, is_active: true },
    ],
  },
  {
    id: "influencer",
    name: "Influencer Bio",
    description: "Bio completa com stats, parcerias de marcas e links para todas as redes.",
    objective: "Centralizar presença digital",
    niches: ["creator", "social"],
    popular: true,
    profile: {
      bio: "Criadora de conteúdo 🎬 Lifestyle, viagens e dicas do dia a dia ✈️",
      category: "Influencer",
      avatar_url: avatarInfluencer,
      cover_url: coverInfluencer,
      font_size: "medium",
      image_shape: "circular",
      image_shape_links: "pill",
      image_shape_products: "rounded",
      tags: [
        { label: "Lifestyle" },
        { label: "Viagens" },
        { label: "Moda" },
      ],
      stats: [
        { value: "150K", label: "Seguidores" },
        { value: "3M", label: "Visualizações" },
        { value: "50+", label: "Marcas" },
      ],
      brands: [
        { name: "Nike" },
        { name: "Samsung" },
        { name: "Natura" },
        { name: "Netflix" },
      ],
      brands_display_mode: "marquee",
      section_order: ["links", "products", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Meu Canal no YouTube", url: "https://youtube.com/@exemplo", subtitle: "Vídeos toda semana", icon: "▶️", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Última Viagem - Bali", url: "https://exemplo.com/bali", subtitle: "Vlog completo", icon: "🌴", is_featured: false, is_active: true, display_mode: "full" },
      { title: "Looks da Semana", url: "https://exemplo.com/looks", subtitle: "Inspiração de moda", icon: "👗", is_featured: false, is_active: true, display_mode: "half" },
      { title: "Publi & Parcerias", url: "https://exemplo.com/midia-kit", subtitle: "Mídia kit", icon: "📩", is_featured: false, is_active: true, display_mode: "half" },
    ],
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/exemplo" },
      { platform: "youtube", label: "YouTube", url: "https://youtube.com/@exemplo" },
      { platform: "tiktok", label: "TikTok", url: "https://tiktok.com/@exemplo" },
      { platform: "twitter", label: "Twitter", url: "https://twitter.com/exemplo" },
    ],
    products: [
      { title: "Guia de Viagem Bali", price: "R$ 39", icon: "🗺️", url: "https://exemplo.com/guia", is_active: true },
      { title: "Filtros Exclusivos", price: "R$ 29", icon: "📱", url: "https://exemplo.com/filtros", is_active: true },
    ],
    testimonials: [],
  },
  {
    id: "professional",
    name: "Profissional",
    description: "Cartão de visita digital com serviços, contato e credibilidade.",
    objective: "Gerar autoridade e leads",
    niches: ["freelancer", "agencia", "social", "coach"],
    profile: {
      bio: "Designer UX/UI 💼 Criando experiências digitais memoráveis há 10 anos",
      category: "Designer",
      avatar_url: avatarProfessional,
      cover_url: coverProfessional,
      font_size: "medium",
      image_shape: "rounded",
      image_shape_links: "rounded",
      image_shape_products: "rounded",
      tags: [
        { label: "UX Design" },
        { label: "UI Design" },
        { label: "Branding" },
      ],
      stats: [
        { value: "300+", label: "Projetos" },
        { value: "10 anos", label: "Experiência" },
        { value: "4.9⭐", label: "Avaliação" },
      ],
      brands: [
        { name: "Google" },
        { name: "Nubank" },
        { name: "iFood" },
      ],
      brands_display_mode: "static",
      section_order: ["links", "products", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Portfólio no Behance", url: "https://behance.net/exemplo", subtitle: "Cases e projetos", icon: "🎨", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Agendar Reunião", url: "https://calendly.com/exemplo", subtitle: "Escolha o melhor horário", icon: "📅", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Currículo", url: "https://exemplo.com/cv", subtitle: "PDF completo", icon: "📄", is_featured: false, is_active: true, display_mode: "half" },
      { title: "Certificações", url: "https://exemplo.com/certs", subtitle: "Google, Adobe, Figma", icon: "🏆", is_featured: false, is_active: true, display_mode: "half" },
    ],
    socialLinks: [
      { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/exemplo" },
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/exemplo" },
      { platform: "github", label: "GitHub", url: "https://github.com/exemplo" },
    ],
    products: [
      { title: "Consultoria de Design", price: "R$ 350/h", icon: "💡", url: "https://exemplo.com/consultoria", is_active: true },
      { title: "Template UI Kit", price: "R$ 89", icon: "🧩", url: "https://exemplo.com/uikit", is_active: true },
    ],
    testimonials: [
      { author_name: "Pedro Souza", author_role: "CEO, TechStart", content: "Profissional excepcional! Entregou o projeto no prazo com qualidade impressionante.", rating: 5, is_active: true },
      { author_name: "Maria Oliveira", author_role: "Product Manager", content: "Transformou completamente a experiência dos nossos usuários.", rating: 5, is_active: true },
    ],
  },
  {
    id: "local",
    name: "Negócio Local",
    description: "Horários, localização, cardápio e avaliações. Tudo em um link.",
    objective: "Facilitar acesso do cliente local",
    niches: ["local"],
    profile: {
      bio: "Café & Bistrô ☕ O melhor café artesanal da cidade. De segunda a sábado, 7h às 20h",
      category: "Cafeteria",
      avatar_url: avatarLocal,
      cover_url: coverLocal,
      font_size: "medium",
      image_shape: "rounded",
      image_shape_links: "rounded",
      image_shape_products: "pill",
      tags: [
        { label: "Café Especial" },
        { label: "Brunch" },
        { label: "Delivery" },
      ],
      stats: [
        { value: "4.8⭐", label: "Google" },
        { value: "2K+", label: "Avaliações" },
        { value: "Desde 2018", label: "Aberto" },
      ],
      brands: [],
      brands_display_mode: "static",
      section_order: ["links", "products", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Nosso Cardápio", url: "https://exemplo.com/cardapio", subtitle: "Veja todas as opções", icon: "🍽️", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Peça pelo iFood", url: "https://ifood.com.br/exemplo", subtitle: "Delivery rápido", icon: "🛵", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Como Chegar", url: "https://maps.google.com/exemplo", subtitle: "Rua Exemplo, 123 - Centro", icon: "📍", is_featured: false, is_active: true, display_mode: "full" },
      { title: "Reservar Mesa", url: "https://exemplo.com/reserva", subtitle: "Garanta seu lugar", icon: "🪑", is_featured: false, is_active: true, display_mode: "full" },
    ],
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/exemplo" },
      { platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/5511999999999" },
    ],
    products: [
      { title: "Café Especial 250g", price: "R$ 35", icon: "☕", url: "https://exemplo.com/cafe", is_active: true },
      { title: "Kit Brunch em Casa", price: "R$ 89", icon: "🥐", url: "https://exemplo.com/brunch", is_active: true },
      { title: "Vale-Presente", price: "R$ 50", icon: "🎁", url: "https://exemplo.com/gift", is_active: true },
    ],
    testimonials: [
      { author_name: "Juliana Lima", author_role: "Cliente frequente", content: "Melhor café da cidade! Ambiente acolhedor e atendimento nota 10.", rating: 5, is_active: true },
      { author_name: "Rafael Santos", author_role: "Food Blogger", content: "O brunch é imperdível. Voltei 3 vezes na mesma semana!", rating: 5, is_active: true },
    ],
  },
  {
    id: "artist",
    name: "Artista",
    description: "Galeria visual imersiva para exibir portfólio artístico e exposições.",
    objective: "Criar presença artística impactante",
    niches: ["artista", "fotografo", "videomaker"],
    profile: {
      bio: "Artista Visual 🎨 Pintura, ilustração e arte digital. Exposições pelo Brasil",
      category: "Artista Visual",
      avatar_url: avatarArtist,
      cover_url: coverArtist,
      font_size: "large",
      image_shape: "rounded",
      image_shape_links: "shadow",
      image_shape_products: "polaroid",
      tags: [
        { label: "Arte Digital" },
        { label: "Pintura" },
        { label: "Ilustração" },
      ],
      stats: [
        { value: "15", label: "Exposições" },
        { value: "200+", label: "Obras" },
        { value: "5 países", label: "Exibido" },
      ],
      brands: [],
      brands_display_mode: "static",
      section_order: ["links", "products", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Galeria de Obras", url: "https://exemplo.com/galeria", subtitle: "Coleção completa", icon: "🖼️", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Loja de Prints", url: "https://exemplo.com/prints", subtitle: "Impressões em alta qualidade", icon: "🖨️", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Comissões", url: "https://exemplo.com/comissoes", subtitle: "Encomende sua arte personalizada", icon: "✏️", is_featured: false, is_active: true, display_mode: "full" },
    ],
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/exemplo" },
      { platform: "website", label: "Site", url: "https://exemplo.com" },
    ],
    products: [
      { title: "Print A3 - Série Cosmos", price: "R$ 120", icon: "🌌", url: "https://exemplo.com/cosmos", is_active: true },
      { title: "Print A4 - Natureza", price: "R$ 75", icon: "🌿", url: "https://exemplo.com/natureza", is_active: true },
      { title: "Arte Digital Custom", price: "Sob consulta", icon: "💎", url: "https://exemplo.com/custom", is_active: true },
    ],
    testimonials: [],
  },
  {
    id: "podcast",
    name: "Podcast",
    description: "Centralize seus episódios, plataformas de áudio e links para ouvintes.",
    objective: "Crescer audiência e facilitar acesso",
    niches: ["podcast", "creator"],
    popular: true,
    profile: {
      bio: "Podcast sobre empreendedorismo e tecnologia 🎙️ Novos episódios toda segunda",
      category: "Podcaster",
      avatar_url: avatarPodcast,
      cover_url: coverPodcast,
      font_size: "medium",
      image_shape: "circular",
      image_shape_links: "pill",
      image_shape_products: "rounded",
      tags: [
        { label: "Empreendedorismo" },
        { label: "Tecnologia" },
        { label: "Negócios" },
      ],
      stats: [
        { value: "200+", label: "Episódios" },
        { value: "500K", label: "Downloads" },
        { value: "Top 10", label: "Brasil" },
      ],
      brands: [
        { name: "Spotify" },
        { name: "Apple Podcasts" },
      ],
      brands_display_mode: "static",
      section_order: ["links", "products", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Ouvir no Spotify", url: "https://open.spotify.com/show/exemplo", subtitle: "Todos os episódios", icon: "🎧", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Apple Podcasts", url: "https://podcasts.apple.com/exemplo", subtitle: "Ouça na Apple", icon: "🍎", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Último Episódio", url: "https://exemplo.com/ep200", subtitle: "Ep. 200 - Especial de Aniversário", icon: "🆕", is_featured: false, is_active: true, display_mode: "full" },
      { title: "Newsletter", url: "https://exemplo.com/newsletter", subtitle: "Resumo semanal", icon: "📧", is_featured: false, is_active: true, display_mode: "half" },
      { title: "Seja Patrocinador", url: "https://exemplo.com/patrocinio", subtitle: "Mídia kit", icon: "🤝", is_featured: false, is_active: true, display_mode: "half" },
    ],
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/exemplo" },
      { platform: "youtube", label: "YouTube", url: "https://youtube.com/@exemplo" },
      { platform: "twitter", label: "Twitter", url: "https://twitter.com/exemplo" },
      { platform: "spotify", label: "Spotify", url: "https://open.spotify.com/show/exemplo" },
    ],
    products: [
      { title: "Caneca do Podcast", price: "R$ 45", icon: "☕", url: "https://exemplo.com/caneca", is_active: true },
      { title: "Camiseta Oficial", price: "R$ 69", icon: "👕", url: "https://exemplo.com/camiseta", is_active: true },
    ],
    testimonials: [],
  },
  {
    id: "coach",
    name: "Coach & Mentor",
    description: "Apresente seus serviços, depoimentos e agenda de sessões em um só lugar.",
    objective: "Atrair alunos e gerar autoridade",
    niches: ["coach", "freelancer"],
    profile: {
      bio: "Coach de carreira & liderança 🧠 +500 vidas transformadas. Agende sua sessão!",
      category: "Coach",
      avatar_url: avatarCoach,
      cover_url: coverCoach,
      font_size: "medium",
      image_shape: "rounded",
      image_shape_links: "pill",
      image_shape_products: "rounded",
      tags: [
        { label: "Coaching" },
        { label: "Liderança" },
        { label: "Carreira" },
      ],
      stats: [
        { value: "500+", label: "Mentorados" },
        { value: "15 anos", label: "Experiência" },
        { value: "4.9⭐", label: "Nota" },
      ],
      brands: [],
      brands_display_mode: "static",
      section_order: ["links", "products", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Agendar Sessão Gratuita", url: "https://calendly.com/exemplo", subtitle: "30 minutos de mentoria", icon: "📞", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Programa de Mentoria", url: "https://exemplo.com/mentoria", subtitle: "12 semanas intensivas", icon: "🎯", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Blog & Artigos", url: "https://exemplo.com/blog", subtitle: "Dicas gratuitas", icon: "📝", is_featured: false, is_active: true, display_mode: "full" },
      { title: "Palestras & Eventos", url: "https://exemplo.com/palestras", subtitle: "Contrate para seu evento", icon: "🎤", is_featured: false, is_active: true, display_mode: "full" },
    ],
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/exemplo" },
      { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/exemplo" },
      { platform: "youtube", label: "YouTube", url: "https://youtube.com/@exemplo" },
    ],
    products: [
      { title: "Mentoria Premium", price: "R$ 997", icon: "💎", url: "https://exemplo.com/premium", is_active: true },
      { title: "Curso de Liderança", price: "R$ 297", icon: "📚", url: "https://exemplo.com/lideranca", is_active: true },
      { title: "E-book Gratuito", price: "Grátis", icon: "📖", url: "https://exemplo.com/ebook", is_active: true },
    ],
    testimonials: [
      { author_name: "Fernanda Rocha", author_role: "Gerente de Projetos", content: "A mentoria mudou minha carreira! Fui promovida em 3 meses.", rating: 5, is_active: true },
      { author_name: "Lucas Mendes", author_role: "Empreendedor", content: "Clareza, foco e resultados. Recomendo de olhos fechados.", rating: 5, is_active: true },
      { author_name: "Beatriz Alves", author_role: "Diretora de RH", content: "Metodologia prática e transformadora. Nota 10!", rating: 5, is_active: true },
    ],
  },
  {
    id: "ecommerce",
    name: "Loja Online",
    description: "Vitrine de produtos com links diretos para compra e promoções em destaque.",
    objective: "Vender produtos e aumentar conversão",
    niches: ["ecommerce", "local"],
    profile: {
      bio: "Loja de acessórios artesanais 🛍️ Peças únicas feitas à mão. Envio para todo Brasil",
      category: "Loja Online",
      font_family: "default",
      font_size: "medium",
      image_shape: "rounded",
      image_shape_links: "rounded",
      image_shape_products: "pill",
      tags: [
        { label: "Artesanal" },
        { label: "Acessórios" },
        { label: "Sustentável" },
      ],
      stats: [
        { value: "5K+", label: "Vendas" },
        { value: "4.9⭐", label: "Avaliação" },
        { value: "Todo BR", label: "Entrega" },
      ],
      brands: [],
      brands_display_mode: "static",
      section_order: ["products", "links", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Loja Completa", url: "https://exemplo.com/loja", subtitle: "Veja todos os produtos", icon: "🛒", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Promoções da Semana", url: "https://exemplo.com/promo", subtitle: "Até 40% OFF", icon: "🔥", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Rastrear Pedido", url: "https://exemplo.com/rastreio", subtitle: "Acompanhe sua entrega", icon: "📦", is_featured: false, is_active: true, display_mode: "half" },
      { title: "WhatsApp", url: "https://wa.me/5511999999999", subtitle: "Tire dúvidas", icon: "💬", is_featured: false, is_active: true, display_mode: "half" },
    ],
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/exemplo" },
      { platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/5511999999999" },
      { platform: "tiktok", label: "TikTok", url: "https://tiktok.com/@exemplo" },
    ],
    products: [
      { title: "Colar Lua Dourada", price: "R$ 89", icon: "🌙", url: "https://exemplo.com/colar", is_active: true },
      { title: "Brinco Estrela", price: "R$ 59", icon: "⭐", url: "https://exemplo.com/brinco", is_active: true },
      { title: "Pulseira Cristal", price: "R$ 69", icon: "💎", url: "https://exemplo.com/pulseira", is_active: true },
      { title: "Kit Presente", price: "R$ 149", icon: "🎁", url: "https://exemplo.com/kit", is_active: true },
    ],
    testimonials: [
      { author_name: "Camila Torres", author_role: "Cliente", content: "Peças lindas e embalagem impecável! Chegou super rápido.", rating: 5, is_active: true },
      { author_name: "Isabela Ferreira", author_role: "Cliente", content: "Qualidade incrível, já comprei 4 vezes. Super recomendo!", rating: 5, is_active: true },
    ],
  },
];
