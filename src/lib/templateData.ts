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
  image_url?: string;
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
import avatarFitness from "@/assets/templates/avatar-fitness.jpg";
import avatarMusician from "@/assets/templates/avatar-musician.jpg";
import avatarGamer from "@/assets/templates/avatar-gamer.jpg";
import avatarHealth from "@/assets/templates/avatar-health.jpg";
import avatarTech from "@/assets/templates/avatar-tech.jpg";
import avatarFashion from "@/assets/templates/avatar-fashion.jpg";
import avatarEducator from "@/assets/templates/avatar-educator.jpg";
import coverPortfolio from "@/assets/templates/cover-portfolio.jpg";
import coverSales from "@/assets/templates/cover-sales.jpg";
import coverInfluencer from "@/assets/templates/cover-influencer.jpg";
import coverProfessional from "@/assets/templates/cover-professional.jpg";
import coverLocal from "@/assets/templates/cover-local.jpg";
import coverArtist from "@/assets/templates/cover-artist.jpg";
import coverPodcast from "@/assets/templates/cover-podcast.jpg";
import coverCoach from "@/assets/templates/cover-coach.jpg";
import coverEcommerce from "@/assets/templates/cover-ecommerce.jpg";
import coverFitness from "@/assets/templates/cover-fitness.jpg";
import coverMusician from "@/assets/templates/cover-musician.jpg";
import coverGamer from "@/assets/templates/cover-gamer.jpg";
import coverHealth from "@/assets/templates/cover-health.jpg";
import coverTech from "@/assets/templates/cover-tech.jpg";
import coverFashion from "@/assets/templates/cover-fashion.jpg";
import coverEducator from "@/assets/templates/cover-educator.jpg";

// Product images
import productPresets from "@/assets/templates/product-presets.jpg";
import productEbook from "@/assets/templates/product-ebook.jpg";
import productMentoria from "@/assets/templates/product-mentoria.jpg";
import productCurso from "@/assets/templates/product-curso.jpg";
import productTemplates from "@/assets/templates/product-templates.jpg";
import productWorkout from "@/assets/templates/product-workout.jpg";
import productDieta from "@/assets/templates/product-dieta.jpg";
import productAlbum from "@/assets/templates/product-album.jpg";
import productGaming from "@/assets/templates/product-gaming.jpg";
import productSkincare from "@/assets/templates/product-skincare.jpg";
import productPodcast from "@/assets/templates/product-podcast.jpg";
import productArtprint from "@/assets/templates/product-artprint.jpg";
import productMerch from "@/assets/templates/product-merch.jpg";
import productCv from "@/assets/templates/product-cv.jpg";
import productCafe from "@/assets/templates/product-cafe.jpg";
import productSuplemento from "@/assets/templates/product-suplemento.jpg";
import productTech from "@/assets/templates/product-tech.jpg";
import productCodeCourse from "@/assets/templates/product-code-course.jpg";

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
      { title: "Pack 20 Presets Pro", price: "R$ 97", icon: "🎨", url: "https://exemplo.com/presets", is_active: true, image_url: productPresets },
      { title: "E-book Fotografia", price: "R$ 49", icon: "📖", url: "https://exemplo.com/ebook", is_active: true, image_url: productEbook },
      { title: "Mentoria Individual", price: "R$ 297", icon: "🧠", url: "https://exemplo.com/mentoria", is_active: true, image_url: productMentoria },
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
      font_family: "inter",
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
      { title: "Mentoria de Vendas", price: "R$ 497", icon: "🚀", url: "https://exemplo.com/mentoria", is_active: true, image_url: productMentoria },
      { title: "Pack de Templates", price: "R$ 127", icon: "📋", url: "https://exemplo.com/templates", is_active: true, image_url: productTemplates },
      { title: "Curso de Copywriting", price: "R$ 197", icon: "✍️", url: "https://exemplo.com/copy", is_active: true, image_url: productCurso },
      { title: "Planilha de Gestão", price: "R$ 47", icon: "📊", url: "https://exemplo.com/planilha", is_active: true, image_url: productEbook },
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
      font_family: "poppins",
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
      { title: "Guia de Viagem Bali", price: "R$ 39", icon: "🗺️", url: "https://exemplo.com/guia", is_active: true, image_url: productEbook },
      { title: "Filtros Exclusivos", price: "R$ 29", icon: "📱", url: "https://exemplo.com/filtros", is_active: true, image_url: productPresets },
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
      font_family: "inter",
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
      { title: "Consultoria de Design", price: "R$ 350/h", icon: "💡", url: "https://exemplo.com/consultoria", is_active: true, image_url: productMentoria },
      { title: "Template UI Kit", price: "R$ 89", icon: "🧩", url: "https://exemplo.com/uikit", is_active: true, image_url: productTemplates },
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
      font_family: "default",
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
      { title: "Café Especial 250g", price: "R$ 35", icon: "☕", url: "https://exemplo.com/cafe", is_active: true, image_url: productCafe },
      { title: "Kit Brunch em Casa", price: "R$ 89", icon: "🥐", url: "https://exemplo.com/brunch", is_active: true, image_url: productDieta },
      { title: "Vale-Presente", price: "R$ 50", icon: "🎁", url: "https://exemplo.com/gift", is_active: true, image_url: productCafe },
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
      font_family: "playfair",
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
      { title: "Print A3 - Série Cosmos", price: "R$ 120", icon: "🌌", url: "https://exemplo.com/cosmos", is_active: true, image_url: productArtprint },
      { title: "Print A4 - Natureza", price: "R$ 75", icon: "🌿", url: "https://exemplo.com/natureza", is_active: true, image_url: productArtprint },
      { title: "Arte Digital Custom", price: "Sob consulta", icon: "💎", url: "https://exemplo.com/custom", is_active: true, image_url: productMentoria },
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
      font_family: "poppins",
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
      { title: "Caneca do Podcast", price: "R$ 45", icon: "☕", url: "https://exemplo.com/caneca", is_active: true, image_url: productPodcast },
      { title: "Camiseta Oficial", price: "R$ 69", icon: "👕", url: "https://exemplo.com/camiseta", is_active: true, image_url: productMerch },
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
      font_family: "inter",
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
      { title: "Mentoria Premium", price: "R$ 997", icon: "💎", url: "https://exemplo.com/premium", is_active: true, image_url: productMentoria },
      { title: "Curso de Liderança", price: "R$ 297", icon: "📚", url: "https://exemplo.com/lideranca", is_active: true, image_url: productCurso },
      { title: "E-book Gratuito", price: "Grátis", icon: "📖", url: "https://exemplo.com/ebook", is_active: true, image_url: productEbook },
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
      avatar_url: avatarEcommerce,
      cover_url: coverEcommerce,
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
      { title: "Colar Lua Dourada", price: "R$ 89", icon: "🌙", url: "https://exemplo.com/colar", is_active: true, image_url: productSkincare },
      { title: "Brinco Estrela", price: "R$ 59", icon: "⭐", url: "https://exemplo.com/brinco", is_active: true, image_url: productSkincare },
      { title: "Pulseira Cristal", price: "R$ 69", icon: "💎", url: "https://exemplo.com/pulseira", is_active: true, image_url: productSkincare },
      { title: "Kit Presente", price: "R$ 149", icon: "🎁", url: "https://exemplo.com/kit", is_active: true, image_url: productSkincare },
    ],
    testimonials: [
      { author_name: "Camila Torres", author_role: "Cliente", content: "Peças lindas e embalagem impecável! Chegou super rápido.", rating: 5, is_active: true },
      { author_name: "Isabela Ferreira", author_role: "Cliente", content: "Qualidade incrível, já comprei 4 vezes. Super recomendo!", rating: 5, is_active: true },
    ],
  },
  {
    id: "fitness",
    name: "Personal Trainer",
    description: "Treinos, planos alimentares e links para agendar aulas. Estilo motivacional.",
    objective: "Atrair alunos e vender planos",
    niches: ["fitness", "coach", "saude"],
    popular: true,
    profile: {
      bio: "Personal Trainer 💪 Transformação corporal e bem-estar. Treinos online e presencial",
      category: "Personal Trainer",
      avatar_url: avatarFitness,
      cover_url: coverFitness,
      font_family: "space-grotesk",
      font_size: "large",
      image_shape: "circular",
      image_shape_links: "rounded",
      image_shape_products: "rounded",
      tags: [{ label: "Musculação" }, { label: "Funcional" }, { label: "Emagrecimento" }],
      stats: [{ value: "800+", label: "Alunos" }, { value: "5 anos", label: "Experiência" }, { value: "4.9⭐", label: "Avaliação" }],
      brands: [{ name: "Growth" }, { name: "Nike Training" }],
      brands_display_mode: "static",
      section_order: ["links", "products", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Agende sua Avaliação", url: "https://exemplo.com/avaliacao", subtitle: "Primeira aula grátis", icon: "📋", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Treino da Semana", url: "https://exemplo.com/treino", subtitle: "Vídeo novo toda segunda", icon: "🏋️", is_featured: false, is_active: true, display_mode: "full" },
      { title: "Plano Online", url: "https://exemplo.com/plano", subtitle: "Treino + dieta personalizados", icon: "📱", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Resultados dos Alunos", url: "https://exemplo.com/resultados", subtitle: "Antes e depois", icon: "📸", is_featured: false, is_active: true, display_mode: "half" },
    ],
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/exemplo" },
      { platform: "youtube", label: "YouTube", url: "https://youtube.com/@exemplo" },
      { platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/5511999999999" },
    ],
    products: [
      { title: "Plano Mensal Online", price: "R$ 149/mês", icon: "📱", url: "https://exemplo.com/mensal", is_active: true, image_url: productWorkout },
      { title: "Consultoria Nutricional", price: "R$ 197", icon: "🥗", url: "https://exemplo.com/nutri", is_active: true, image_url: productDieta },
      { title: "Pack 12 Semanas", price: "R$ 397", icon: "🔥", url: "https://exemplo.com/pack12", is_active: true, image_url: productSuplemento },
    ],
    testimonials: [
      { author_name: "Marcos Silva", author_role: "Aluno há 1 ano", content: "Perdi 15kg em 6 meses! Melhor decisão que tomei.", rating: 5, is_active: true },
      { author_name: "Patrícia Lopes", author_role: "Aluna online", content: "Treinos incríveis e acompanhamento top. Super recomendo!", rating: 5, is_active: true },
    ],
  },
  {
    id: "musician",
    name: "Músico & DJ",
    description: "Shows, plataformas de streaming e contato para eventos. Estilo neon vibrante.",
    objective: "Divulgar música e agendar shows",
    niches: ["musica", "artista", "creator"],
    profile: {
      bio: "DJ & Produtora Musical 🎧 Sets eletrônicos e remixes. Booking aberto para eventos",
      category: "DJ / Produtora",
      avatar_url: avatarMusician,
      cover_url: coverMusician,
      font_family: "bebas",
      font_size: "xlarge",
      image_shape: "circular",
      image_shape_links: "pill",
      image_shape_products: "rounded",
      tags: [{ label: "Eletrônica" }, { label: "House" }, { label: "Remix" }],
      stats: [{ value: "1M+", label: "Plays" }, { value: "50+", label: "Shows" }, { value: "10K", label: "Ouvintes" }],
      brands: [{ name: "Spotify" }, { name: "SoundCloud" }, { name: "Beatport" }],
      brands_display_mode: "marquee",
      section_order: ["links", "products", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Ouça no Spotify", url: "https://open.spotify.com/exemplo", subtitle: "Todos os singles e EPs", icon: "🎵", is_featured: true, is_active: true, display_mode: "full" },
      { title: "SoundCloud", url: "https://soundcloud.com/exemplo", subtitle: "Sets e mixes exclusivos", icon: "☁️", is_featured: false, is_active: true, display_mode: "full" },
      { title: "Booking", url: "https://exemplo.com/booking", subtitle: "Contrate para seu evento", icon: "🎤", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Próximo Show", url: "https://exemplo.com/show", subtitle: "São Paulo - 15/03", icon: "🎉", is_featured: false, is_active: true, display_mode: "half" },
    ],
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/exemplo" },
      { platform: "spotify", label: "Spotify", url: "https://open.spotify.com/exemplo" },
      { platform: "youtube", label: "YouTube", url: "https://youtube.com/@exemplo" },
      { platform: "tiktok", label: "TikTok", url: "https://tiktok.com/@exemplo" },
    ],
    products: [
      { title: "Sample Pack Vol. 1", price: "R$ 59", icon: "🎹", url: "https://exemplo.com/samples", is_active: true, image_url: productAlbum },
      { title: "Curso de Produção", price: "R$ 297", icon: "🎓", url: "https://exemplo.com/curso", is_active: true, image_url: productCurso },
    ],
    testimonials: [],
  },
  {
    id: "gamer",
    name: "Gamer & Streamer",
    description: "Lives, clips, loja de merch e comunidade. Visual gamer com neon RGB.",
    objective: "Crescer audiência e monetizar conteúdo",
    niches: ["gamer", "creator"],
    popular: true,
    profile: {
      bio: "Streamer & Content Creator 🎮 Lives diárias de FPS e RPG. Vem jogar comigo!",
      category: "Streamer",
      avatar_url: avatarGamer,
      cover_url: coverGamer,
      font_family: "space-grotesk",
      font_size: "medium",
      image_shape: "rounded",
      image_shape_links: "rounded",
      image_shape_products: "rounded",
      tags: [{ label: "FPS" }, { label: "RPG" }, { label: "Valorant" }],
      stats: [{ value: "25K", label: "Seguidores" }, { value: "500h+", label: "Live" }, { value: "Top 100", label: "Ranking" }],
      brands: [{ name: "Twitch" }, { name: "Discord" }, { name: "Razer" }],
      brands_display_mode: "marquee",
      section_order: ["links", "products", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Twitch - Ao Vivo", url: "https://twitch.tv/exemplo", subtitle: "Lives todos os dias 20h", icon: "🔴", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Discord da Comunidade", url: "https://discord.gg/exemplo", subtitle: "Entre no server", icon: "💬", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Melhores Clips", url: "https://youtube.com/@exemplo/clips", subtitle: "Compilação semanal", icon: "🎬", is_featured: false, is_active: true, display_mode: "full" },
      { title: "Setup Tour", url: "https://exemplo.com/setup", subtitle: "Meu equipamento", icon: "🖥️", is_featured: false, is_active: true, display_mode: "half" },
    ],
    socialLinks: [
      { platform: "twitch", label: "Twitch", url: "https://twitch.tv/exemplo" },
      { platform: "youtube", label: "YouTube", url: "https://youtube.com/@exemplo" },
      { platform: "tiktok", label: "TikTok", url: "https://tiktok.com/@exemplo" },
      { platform: "twitter", label: "Twitter", url: "https://twitter.com/exemplo" },
    ],
    products: [
      { title: "Camiseta Gamer", price: "R$ 79", icon: "👕", url: "https://exemplo.com/camiseta", is_active: true, image_url: productMerch },
      { title: "Mousepad Custom", price: "R$ 49", icon: "🖱️", url: "https://exemplo.com/mousepad", is_active: true, image_url: productGaming },
      { title: "Sub Twitch Tier 1", price: "R$ 7,90/mês", icon: "⭐", url: "https://twitch.tv/subs/exemplo", is_active: true, image_url: productGaming },
    ],
    testimonials: [],
  },
  {
    id: "health",
    name: "Saúde & Nutrição",
    description: "Consultas, dicas de alimentação e conteúdo educativo. Estilo clean e profissional.",
    objective: "Atrair pacientes e educar",
    niches: ["saude", "coach", "educacao"],
    profile: {
      bio: "Nutricionista Clínica 🥗 Alimentação saudável sem neura. Consultas online e presencial",
      category: "Nutricionista",
      avatar_url: avatarHealth,
      cover_url: coverHealth,
      font_family: "outfit",
      font_size: "medium",
      image_shape: "circular",
      image_shape_links: "pill",
      image_shape_products: "rounded",
      tags: [{ label: "Nutrição" }, { label: "Saúde" }, { label: "Bem-estar" }],
      stats: [{ value: "1.200+", label: "Pacientes" }, { value: "8 anos", label: "CRN Ativo" }, { value: "4.9⭐", label: "Avaliação" }],
      brands: [],
      brands_display_mode: "static",
      section_order: ["links", "products", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Agendar Consulta", url: "https://exemplo.com/consulta", subtitle: "Online ou presencial", icon: "📅", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Receitas Saudáveis", url: "https://exemplo.com/receitas", subtitle: "Blog com 100+ receitas", icon: "🍳", is_featured: false, is_active: true, display_mode: "full" },
      { title: "Guia Alimentar Grátis", url: "https://exemplo.com/guia", subtitle: "PDF com dicas essenciais", icon: "📖", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Depoimentos", url: "https://exemplo.com/depoimentos", subtitle: "Resultados reais", icon: "💚", is_featured: false, is_active: true, display_mode: "half" },
    ],
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/exemplo" },
      { platform: "youtube", label: "YouTube", url: "https://youtube.com/@exemplo" },
      { platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/5511999999999" },
    ],
    products: [
      { title: "Plano Alimentar 30 dias", price: "R$ 197", icon: "🥗", url: "https://exemplo.com/plano30", is_active: true, image_url: productDieta },
      { title: "E-book 50 Receitas Fit", price: "R$ 39", icon: "📚", url: "https://exemplo.com/ebook", is_active: true, image_url: productEbook },
      { title: "Consultoria Express", price: "R$ 97", icon: "⚡", url: "https://exemplo.com/express", is_active: true, image_url: productMentoria },
    ],
    testimonials: [
      { author_name: "Amanda Reis", author_role: "Paciente", content: "Mudou minha relação com a comida! Me sinto muito melhor.", rating: 5, is_active: true },
      { author_name: "João Pedro", author_role: "Paciente", content: "Perdi peso sem passar fome. Acompanhamento incrível!", rating: 5, is_active: true },
    ],
  },
  {
    id: "tech",
    name: "Dev & Tech",
    description: "Portfólio de projetos, GitHub, blog técnico e serviços. Estilo código/dark.",
    objective: "Mostrar habilidades e atrair clientes",
    niches: ["tech", "freelancer"],
    profile: {
      bio: "Desenvolvedor Full Stack 🚀 React, Node.js e Cloud. Open source enthusiast",
      category: "Desenvolvedor",
      avatar_url: avatarTech,
      cover_url: coverTech,
      font_family: "space-grotesk",
      font_size: "medium",
      image_shape: "rounded",
      image_shape_links: "rounded",
      image_shape_products: "rounded",
      tags: [{ label: "React" }, { label: "Node.js" }, { label: "TypeScript" }],
      stats: [{ value: "50+", label: "Projetos" }, { value: "2K+", label: "Commits" }, { value: "6 anos", label: "Experiência" }],
      brands: [{ name: "AWS" }, { name: "Vercel" }, { name: "GitHub" }],
      brands_display_mode: "static",
      section_order: ["links", "products", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "GitHub", url: "https://github.com/exemplo", subtitle: "Projetos open source", icon: "🐙", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Portfólio", url: "https://exemplo.dev", subtitle: "Cases e projetos entregues", icon: "💻", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Blog Técnico", url: "https://exemplo.com/blog", subtitle: "Artigos sobre React e Cloud", icon: "✍️", is_featured: false, is_active: true, display_mode: "full" },
      { title: "Contratar Freelance", url: "https://exemplo.com/hire", subtitle: "Disponível para projetos", icon: "🤝", is_featured: false, is_active: true, display_mode: "half" },
    ],
    socialLinks: [
      { platform: "github", label: "GitHub", url: "https://github.com/exemplo" },
      { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/exemplo" },
      { platform: "twitter", label: "Twitter", url: "https://twitter.com/exemplo" },
    ],
    products: [
      { title: "Template SaaS Starter", price: "R$ 149", icon: "🧩", url: "https://exemplo.com/template", is_active: true },
      { title: "Curso React Avançado", price: "R$ 247", icon: "📚", url: "https://exemplo.com/curso", is_active: true },
      { title: "Mentoria 1:1", price: "R$ 300/h", icon: "🧠", url: "https://exemplo.com/mentoria", is_active: true },
    ],
    testimonials: [
      { author_name: "Ricardo Almeida", author_role: "CTO, StartupXYZ", content: "Entregou o MVP em 3 semanas. Código limpo e documentado.", rating: 5, is_active: true },
    ],
  },
  {
    id: "fashion",
    name: "Moda & Estilo",
    description: "Looks, collabs com marcas, loja de peças e dicas de estilo. Visual editorial.",
    objective: "Influenciar e vender moda",
    niches: ["moda", "creator", "social", "ecommerce"],
    popular: true,
    profile: {
      bio: "Consultora de Imagem & Estilo 👗 Moda acessível, tendências e looks do dia",
      category: "Fashion Creator",
      avatar_url: avatarFashion,
      cover_url: coverFashion,
      font_family: "playfair",
      font_size: "medium",
      image_shape: "circular",
      image_shape_links: "pill",
      image_shape_products: "pill",
      tags: [{ label: "Moda" }, { label: "Estilo" }, { label: "Tendências" }],
      stats: [{ value: "80K", label: "Seguidores" }, { value: "200+", label: "Looks" }, { value: "30+", label: "Marcas" }],
      brands: [{ name: "Zara" }, { name: "Shein" }, { name: "Farm" }, { name: "Arezzo" }],
      brands_display_mode: "marquee",
      section_order: ["links", "products", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Looks da Semana", url: "https://exemplo.com/looks", subtitle: "Inspiração todo dia", icon: "👗", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Shopee Favoritos", url: "https://shopee.com.br/exemplo", subtitle: "Achados até R$50", icon: "🛍️", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Consultoria de Imagem", url: "https://exemplo.com/consultoria", subtitle: "Descubra seu estilo", icon: "✨", is_featured: false, is_active: true, display_mode: "full" },
      { title: "Mídia Kit", url: "https://exemplo.com/midiakit", subtitle: "Parcerias & collabs", icon: "📩", is_featured: false, is_active: true, display_mode: "half" },
    ],
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/exemplo" },
      { platform: "tiktok", label: "TikTok", url: "https://tiktok.com/@exemplo" },
      { platform: "pinterest", label: "Pinterest", url: "https://pinterest.com/exemplo" },
    ],
    products: [
      { title: "Guia de Estilo Pessoal", price: "R$ 67", icon: "📖", url: "https://exemplo.com/guia", is_active: true },
      { title: "Closet Cápsula PDF", price: "R$ 39", icon: "👚", url: "https://exemplo.com/capsula", is_active: true },
      { title: "Consultoria Online", price: "R$ 197", icon: "💎", url: "https://exemplo.com/online", is_active: true },
    ],
    testimonials: [
      { author_name: "Larissa Nunes", author_role: "Cliente", content: "Nunca mais comprei peça errada! A consultoria vale cada centavo.", rating: 5, is_active: true },
    ],
  },
  {
    id: "educator",
    name: "Educador & Professor",
    description: "Cursos, materiais didáticos e links para aulas. Estilo acadêmico acolhedor.",
    objective: "Compartilhar conhecimento e vender cursos",
    niches: ["educacao", "coach", "freelancer"],
    profile: {
      bio: "Professora de Inglês 📚 Aulas online para todos os níveis. Método imersivo e divertido",
      category: "Professora",
      avatar_url: avatarEducator,
      cover_url: coverEducator,
      font_family: "crimson",
      font_size: "medium",
      image_shape: "circular",
      image_shape_links: "rounded",
      image_shape_products: "rounded",
      tags: [{ label: "Inglês" }, { label: "Aulas Online" }, { label: "Conversação" }],
      stats: [{ value: "3.000+", label: "Alunos" }, { value: "10 anos", label: "Experiência" }, { value: "CELTA", label: "Certificação" }],
      brands: [],
      brands_display_mode: "static",
      section_order: ["links", "products", "spotlight", "past_campaigns"],
    },
    links: [
      { title: "Aula Experimental Grátis", url: "https://exemplo.com/experimental", subtitle: "Teste o método sem compromisso", icon: "🎁", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Plataforma de Aulas", url: "https://exemplo.com/plataforma", subtitle: "Acesse seu curso", icon: "🎓", is_featured: true, is_active: true, display_mode: "full" },
      { title: "Canal no YouTube", url: "https://youtube.com/@exemplo", subtitle: "Dicas gratuitas de inglês", icon: "▶️", is_featured: false, is_active: true, display_mode: "full" },
      { title: "Material de Apoio", url: "https://exemplo.com/materiais", subtitle: "PDFs e exercícios", icon: "📝", is_featured: false, is_active: true, display_mode: "half" },
    ],
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/exemplo" },
      { platform: "youtube", label: "YouTube", url: "https://youtube.com/@exemplo" },
      { platform: "tiktok", label: "TikTok", url: "https://tiktok.com/@exemplo" },
    ],
    products: [
      { title: "Curso Completo A1-B2", price: "R$ 297", icon: "📚", url: "https://exemplo.com/curso", is_active: true },
      { title: "Pack de Flashcards", price: "R$ 29", icon: "🃏", url: "https://exemplo.com/flashcards", is_active: true },
      { title: "Aulas Particulares", price: "R$ 80/h", icon: "👩‍🏫", url: "https://exemplo.com/particular", is_active: true },
      { title: "Grupo de Conversação", price: "R$ 49/mês", icon: "💬", url: "https://exemplo.com/grupo", is_active: true },
    ],
    testimonials: [
      { author_name: "Thiago Santos", author_role: "Aluno B2", content: "Em 6 meses já consigo conversar fluente! Método incrível.", rating: 5, is_active: true },
      { author_name: "Marina Costa", author_role: "Aluna A2", content: "Aulas dinâmicas e divertidas. Melhor professora que já tive!", rating: 5, is_active: true },
    ],
  },
];
