import type {
  ProductType,
  OrderStatus,
  PaymentStatus,
  UserRole,
  LayoutStyle,
  DisplayStyle,
  NotificationType,
  DisputeStatus,
  SocialPlatform,
} from '@/types'

// =============================================================================
// Marketo Marketplace - Constants
// =============================================================================

// ----- Platform -----

export const PLATFORM_NAME = 'Marketo'
export const PLATFORM_TAGLINE = 'Your Marketplace, Your Way'
export const PLATFORM_DESCRIPTION =
  'Create your own customizable shop, sell digital & physical products, or offer freelance services — all in one place.'

export const PLATFORM_FEE_PERCENT = 10 // 10% platform commission

// ----- Product Types -----

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  digital: 'Digital Product',
  physical: 'Physical Product',
  freelance: 'Freelance Service',
}

export const PRODUCT_TYPE_DESCRIPTIONS: Record<ProductType, string> = {
  digital:
    'Downloadable products like ebooks, software, templates, and courses',
  physical: 'Tangible items that require shipping',
  freelance: 'Services delivered by the seller to the buyer',
}

export const PRODUCT_TYPE_ICONS: Record<ProductType, string> = {
  digital: 'Download',
  physical: 'Package',
  freelance: 'Briefcase',
}

// ----- Order Status -----

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  delivered: 'bg-amber-100 text-amber-800 border-amber-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  refunded: 'bg-gray-100 text-gray-800 border-gray-200',
}

export const ORDER_STATUS_DOT_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  shipped: 'bg-yellow-500',
  delivered: 'bg-amber-500',
  cancelled: 'bg-red-500',
  refunded: 'bg-gray-500',
}

// ----- Payment Status -----

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

// ----- User Roles -----

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  both: 'Buyer & Seller',
}

export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  buyer: 'Shop and purchase from marketplace sellers',
  seller: 'Create a shop and sell your products or services',
  both: 'Buy and sell on the marketplace',
}

// ----- Shop Layout & Display -----

export const LAYOUT_STYLE_LABELS: Record<LayoutStyle, string> = {
  grid: 'Grid View',
  list: 'List View',
  featured: 'Featured Layout',
}

export const DISPLAY_STYLE_LABELS: Record<DisplayStyle, string> = {
  modern: 'Modern',
  classic: 'Classic',
  minimal: 'Minimal',
}

// ----- Notification Types -----

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  info: 'Information',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  order: 'Order Update',
  message: 'New Message',
  payment: 'Payment',
  review: 'New Review',
  shop: 'Shop Update',
  promotion: 'Promotion',
  system: 'System',
}

export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, string> = {
  info: 'text-blue-600',
  success: 'text-amber-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  order: 'text-amber-600',
  message: 'text-orange-600',
  payment: 'text-amber-600',
  review: 'text-amber-600',
  shop: 'text-amber-600',
  promotion: 'text-orange-600',
  system: 'text-gray-600',
}

// ----- Notification Categories -----

export const NOTIFICATION_CATEGORY_LABELS: Record<string, string> = {
  order: 'Orders',
  payment: 'Payments',
  message: 'Messages',
  review: 'Reviews',
  shop: 'Shop',
  promotion: 'Promotions',
  system: 'System',
}

export const NOTIFICATION_CATEGORY_COLORS: Record<string, string> = {
  order: 'bg-amber-100 text-amber-700 border-amber-200',
  payment: 'bg-amber-100 text-amber-700 border-amber-200',
  message: 'bg-orange-100 text-orange-700 border-orange-200',
  review: 'bg-amber-100 text-amber-700 border-amber-200',
  shop: 'bg-amber-100 text-amber-700 border-amber-200',
  promotion: 'bg-orange-100 text-orange-700 border-orange-200',
  system: 'bg-gray-100 text-gray-700 border-gray-200',
}

export const NOTIFICATION_CATEGORY_ICONS: Record<string, string> = {
  order: 'ShoppingCart',
  payment: 'CreditCard',
  message: 'MessageSquare',
  review: 'Star',
  shop: 'Store',
  promotion: 'Tag',
  system: 'Settings',
}

// ----- Notification Priority -----

export const NOTIFICATION_PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: '',
  high: 'bg-amber-50 text-amber-600',
  urgent: 'bg-red-50 text-red-600',
}

// ----- Dispute Status -----

export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const DISPUTE_STATUS_COLORS: Record<DisputeStatus, string> = {
  open: 'bg-red-100 text-red-800',
  investigating: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-amber-100 text-amber-800',
  closed: 'bg-gray-100 text-gray-800',
}

// ----- Social Platforms -----

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  twitter: 'Twitter / X',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  website: 'Website',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
}

export const SOCIAL_PLATFORM_ICONS: Record<SocialPlatform, string> = {
  twitter: 'Twitter',
  github: 'Github',
  linkedin: 'Linkedin',
  website: 'Globe',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'Youtube',
}

// ----- Digital Product Categories -----

export const DIGITAL_CATEGORIES = [
  { name: 'Graphic Design Assets', slug: 'graphic-design-assets', icon: 'Palette', description: 'Logo templates, UI kits, mockups, fonts, and design resources', sortOrder: 0 },
  { name: 'Website & Development', slug: 'website-development', icon: 'Globe', description: 'Website templates, WordPress themes, scripts, and code', sortOrder: 1 },
  { name: 'Courses & Education', slug: 'courses-education', icon: 'GraduationCap', description: 'Online courses, study guides, and exam preparation material', sortOrder: 2 },
  { name: 'Digital Books & Learning Materials', slug: 'digital-books-learning-materials', icon: 'BookOpen', description: 'Ebooks, audiobooks, PDF books, study notes, and digital learning resources', sortOrder: 3 },
  { name: 'Video & Animation', slug: 'video-animation', icon: 'Film', description: 'Video templates, motion graphics, transitions, and stock videos', sortOrder: 4 },
  { name: 'Music & Audio', slug: 'music-audio', icon: 'Music', description: 'Beats, sound effects, background music, and audio loops', sortOrder: 5 },
  { name: 'Photography', slug: 'photography', icon: 'Camera', description: 'Stock photos, presets, actions, and digital art prints', sortOrder: 6 },
  { name: 'AI & Tech Products', slug: 'ai-tech-products', icon: 'Brain', description: 'AI prompts, chatbot templates, SaaS products, and tools', sortOrder: 7 },
  { name: 'NFTs & Blockchain', slug: 'nfts-blockchain', icon: 'Layers', description: 'NFT art, smart contracts, crypto bots, and Web3 templates', sortOrder: 8 },
  { name: 'Marketing Products', slug: 'marketing-products', icon: 'Megaphone', description: 'Social media packs, ad templates, SEO tools, and funnels', sortOrder: 9 },
  { name: 'Gaming Products', slug: 'gaming-products', icon: 'Gamepad2', description: 'Game assets, 3D models, stream packages, and overlays', sortOrder: 10 },
  { name: 'Business & Productivity', slug: 'business-productivity', icon: 'Briefcase', description: 'Notion templates, spreadsheets, invoices, and CRM templates', sortOrder: 11 },
  { name: 'Art & Illustration', slug: 'art-illustration', icon: 'Paintbrush', description: 'Digital illustrations, character designs, anime art, and tattoos', sortOrder: 12 },
  { name: 'Printable Products', slug: 'printable-products', icon: 'Printer', description: 'Printable planners, calendars, invitations, and wall art', sortOrder: 13 },
  { name: 'Fashion & Textile Design', slug: 'fashion-textile-design', icon: 'Scissors', description: 'Fabric patterns, embroidery files, sewing patterns, and prints', sortOrder: 14 },
] as const

// ----- Physical Product Categories -----

export const PHYSICAL_CATEGORIES = [
  { name: 'Fashion & Clothing', slug: 'fashion-clothing', icon: 'Shirt', description: 'Clothing, footwear, and fashion for all ages', sortOrder: 0 },
  { name: 'Jewelry & Accessories', slug: 'jewelry-accessories', icon: 'Gem', description: 'Rings, necklaces, watches, bags, and luxury accessories', sortOrder: 1 },
  { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', icon: 'Sparkles', description: 'Makeup, skincare, perfumes, and beauty tools', sortOrder: 2 },
  { name: 'Electronics', slug: 'electronics', icon: 'Smartphone', description: 'Phones, laptops, gadgets, and tech accessories', sortOrder: 3 },
  { name: 'Home & Living', slug: 'home-living', icon: 'Home', description: 'Furniture, decor, kitchen accessories, and home essentials', sortOrder: 4 },
  { name: 'Handmade Products', slug: 'handmade-products', icon: 'Hand', description: 'Handcrafted jewelry, crafts, bags, and decor', sortOrder: 5 },
  { name: 'Art & Crafts', slug: 'art-crafts', icon: 'Paintbrush', description: 'Paintings, sketches, craft supplies, and DIY kits', sortOrder: 6 },
  { name: 'Textile & Fabric', slug: 'textile-fabric', icon: 'Scissors', description: 'Fabric materials, printed fabric, lawn, cotton, and silk', sortOrder: 7 },
  { name: 'Food & Beverages', slug: 'food-beverages', icon: 'UtensilsCrossed', description: 'Snacks, bakery, organic food, and homemade items', sortOrder: 8 },
  { name: 'Health & Fitness', slug: 'health-fitness', icon: 'Dumbbell', description: 'Gym equipment, yoga products, and fitness gear', sortOrder: 9 },
  { name: 'Toys & Games', slug: 'toys-games', icon: 'Gamepad2', description: 'Kids toys, educational toys, and board games', sortOrder: 10 },
  { name: 'Pet Supplies', slug: 'pet-supplies', icon: 'PawPrint', description: 'Pet food, toys, clothes, and accessories', sortOrder: 11 },
  { name: 'Automotive', slug: 'automotive', icon: 'Car', description: 'Car and bike accessories, care products, and helmets', sortOrder: 12 },
  { name: 'Books', slug: 'books', icon: 'BookOpen', description: 'Academic books, novels, Islamic books, kids books, and more', sortOrder: 13 },
  { name: 'Furniture', slug: 'furniture', icon: 'Armchair', description: 'Sofas, chairs, tables, and office furniture', sortOrder: 14 },
  { name: 'Baby Products', slug: 'baby-products', icon: 'Baby', description: 'Baby clothes, toys, care, and feeding products', sortOrder: 15 },
  { name: 'Sports & Outdoor', slug: 'sports-outdoor', icon: 'Tent', description: 'Camping gear, outdoor equipment, and sportswear', sortOrder: 16 },
  { name: 'Gifts & Custom Products', slug: 'gifts-custom-products', icon: 'Gift', description: 'Personalized gifts, custom mugs, and customized items', sortOrder: 17 },
] as const

// ----- Default Categories (legacy - combines digital + physical) -----
export const DEFAULT_CATEGORIES = [
  ...DIGITAL_CATEGORIES,
  ...PHYSICAL_CATEGORIES,
] as const

// ----- Gig Categories -----

export const GIG_CATEGORIES = [
  { name: 'Graphic Design', slug: 'graphic-design', icon: 'Palette', description: 'Logos, branding, illustrations, and visual design', sortOrder: 0 },
  { name: 'Web Development', slug: 'web-development', icon: 'Globe', description: 'Website design, front-end & back-end development', sortOrder: 1 },
  { name: 'App Development', slug: 'app-development', icon: 'Smartphone', description: 'iOS, Android, and cross-platform app development', sortOrder: 2 },
  { name: 'UI/UX Design', slug: 'ui-ux-design', icon: 'Figma', description: 'User interface and experience design', sortOrder: 3 },
  { name: 'Video Editing', slug: 'video-editing', icon: 'Film', description: 'Video editing, post-production, and color grading', sortOrder: 4 },
  { name: 'Animation & Motion Graphics', slug: 'animation-motion-graphics', icon: 'Sparkles', description: '2D/3D animation, motion graphics, and visual effects', sortOrder: 5 },
  { name: 'Content Writing', slug: 'content-writing', icon: 'FileText', description: 'Blog posts, articles, and web content creation', sortOrder: 6 },
  { name: 'Copywriting', slug: 'copywriting', icon: 'Type', description: 'Sales copy, ad copy, and persuasive writing', sortOrder: 7 },
  { name: 'Translation', slug: 'translation', icon: 'BookOpen', description: 'Document, website, and multimedia translation services', sortOrder: 8 },
  { name: 'Digital Marketing', slug: 'digital-marketing', icon: 'Megaphone', description: 'Online marketing, PPC, and digital ad campaigns', sortOrder: 9 },
  { name: 'Social Media Management', slug: 'social-media-management', icon: 'Share2', description: 'Social media strategy, content, and account management', sortOrder: 10 },
  { name: 'SEO Services', slug: 'seo-services', icon: 'Search', description: 'Search engine optimization and ranking improvement', sortOrder: 11 },
  { name: 'AI & Machine Learning', slug: 'ai-machine-learning', icon: 'Brain', description: 'AI solutions, ML models, and data science', sortOrder: 12 },
  { name: 'Data Entry', slug: 'data-entry', icon: 'Database', description: 'Data processing, spreadsheet management, and data entry', sortOrder: 13 },
  { name: 'Virtual Assistant', slug: 'virtual-assistant', icon: 'Headphones', description: 'Admin support, scheduling, and virtual assistance', sortOrder: 14 },
  { name: 'Cyber Security', slug: 'cyber-security', icon: 'Shield', description: 'Security audits, penetration testing, and protection', sortOrder: 15 },
  { name: 'Cloud Computing', slug: 'cloud-computing', icon: 'Cloud', description: 'Cloud infrastructure, deployment, and management', sortOrder: 16 },
  { name: 'Game Development', slug: 'game-development', icon: 'Gamepad2', description: 'Game design, development, and asset creation', sortOrder: 17 },
  { name: 'E-commerce Services', slug: 'e-commerce-services', icon: 'ShoppingCart', description: 'Store setup, product listings, and e-commerce solutions', sortOrder: 18 },
  { name: 'Shopify Development', slug: 'shopify-development', icon: 'Store', description: 'Shopify store setup, customization, and optimization', sortOrder: 19 },
  { name: 'WordPress Development', slug: 'wordpress-development', icon: 'FileCode', description: 'WordPress site design, plugins, and customization', sortOrder: 20 },
  { name: 'Photography & Photo Editing', slug: 'photography-photo-editing', icon: 'Camera', description: 'Photo editing, retouching, and professional photography', sortOrder: 21 },
  { name: 'Music & Audio Production', slug: 'music-audio-production', icon: 'Music', description: 'Music production, mixing, and sound design', sortOrder: 22 },
  { name: 'Voice Over Services', slug: 'voice-over', icon: 'Mic', description: 'Professional voiceover recording and narration', sortOrder: 23 },
  { name: 'Business Consulting', slug: 'business-consulting', icon: 'Briefcase', description: 'Business strategy, planning, and growth consulting', sortOrder: 24 },
  { name: 'Accounting & Finance', slug: 'accounting-finance', icon: 'Calculator', description: 'Bookkeeping, tax preparation, and financial consulting', sortOrder: 25 },
  { name: 'Customer Support', slug: 'customer-support', icon: 'HeartHandshake', description: 'Customer service, help desk, and support solutions', sortOrder: 26 },
  { name: 'Architecture & Interior Design', slug: 'architecture-interior-design', icon: 'Building2', description: 'Architectural design and interior styling', sortOrder: 27 },
  { name: '3D Modeling & Rendering', slug: '3d-modeling-rendering', icon: 'Box', description: '3D modeling, rendering, and visualization', sortOrder: 28 },
  { name: 'Programming & Software Engineering', slug: 'programming-software-engineering', icon: 'Code', description: 'Custom software, APIs, and engineering solutions', sortOrder: 29 },
  { name: 'Online Tutoring', slug: 'online-tutoring', icon: 'GraduationCap', description: 'Online tutoring, courses, and educational training', sortOrder: 30 },
  { name: 'Resume & CV Writing', slug: 'resume-cv-writing', icon: 'Award', description: 'Professional resume, CV, and cover letter writing', sortOrder: 31 },
  { name: 'Email Marketing', slug: 'email-marketing', icon: 'Mail', description: 'Email campaign design, automation, and optimization', sortOrder: 32 },
  { name: 'Branding & Identity Design', slug: 'branding-identity', icon: 'PenTool', description: 'Brand identity, style guides, and visual branding', sortOrder: 33 },
  { name: 'NFT & Blockchain Development', slug: 'nft-blockchain', icon: 'Layers', description: 'Smart contracts, NFT creation, and blockchain solutions', sortOrder: 34 },
  { name: 'Chatbot Development', slug: 'chatbot-development', icon: 'MessageCircle', description: 'AI chatbots, conversational AI, and bot development', sortOrder: 35 },
  { name: 'Script Writing', slug: 'script-writing', icon: 'ScrollText', description: 'Screenwriting, video scripts, and creative writing', sortOrder: 36 },
  { name: 'Presentation Design', slug: 'presentation-design', icon: 'Monitor', description: 'Slide design, pitch decks, and visual presentations', sortOrder: 37 },
  { name: 'Product Design', slug: 'product-design', icon: 'Ruler', description: 'Industrial design, product prototyping, and UX research', sortOrder: 38 },
  { name: 'Legal Services', slug: 'legal-services', icon: 'Scale', description: 'Legal consulting, contracts, and compliance', sortOrder: 39 },
] as const

// ----- Gig Subcategories -----

export const GIG_SUBCATEGORIES: Record<string, { name: string; slug: string; sortOrder: number }[]> = {
  'graphic-design': [
    { name: 'Logo Design', slug: 'logo-design', sortOrder: 0 },
    { name: 'Minimalist Logo Design', slug: 'minimalist-logo-design', sortOrder: 1 },
    { name: '3D Logo Design', slug: '3d-logo-design', sortOrder: 2 },
    { name: 'Mascot Logo Design', slug: 'mascot-logo-design', sortOrder: 3 },
    { name: 'Signature Logo Design', slug: 'signature-logo-design', sortOrder: 4 },
    { name: 'Vintage Logo Design', slug: 'vintage-logo-design', sortOrder: 5 },
    { name: 'Gaming Logo Design', slug: 'gaming-logo-design', sortOrder: 6 },
    { name: 'Esports Logo Design', slug: 'esports-logo-design', sortOrder: 7 },
    { name: 'Brand Identity Design', slug: 'brand-identity-design', sortOrder: 8 },
    { name: 'Brand Guidelines', slug: 'brand-guidelines', sortOrder: 9 },
    { name: 'Social Media Post Design', slug: 'social-media-post-design', sortOrder: 10 },
    { name: 'Instagram Post Design', slug: 'instagram-post-design', sortOrder: 11 },
    { name: 'Facebook Cover Design', slug: 'facebook-cover-design', sortOrder: 12 },
    { name: 'YouTube Thumbnail Design', slug: 'youtube-thumbnail-design', sortOrder: 13 },
    { name: 'Twitch Banner Design', slug: 'twitch-banner-design', sortOrder: 14 },
    { name: 'LinkedIn Banner Design', slug: 'linkedin-banner-design', sortOrder: 15 },
    { name: 'Poster Design', slug: 'poster-design', sortOrder: 16 },
    { name: 'Flyer Design', slug: 'flyer-design', sortOrder: 17 },
    { name: 'Brochure Design', slug: 'brochure-design', sortOrder: 18 },
    { name: 'Menu Design', slug: 'menu-design', sortOrder: 19 },
    { name: 'Catalog Design', slug: 'catalog-design', sortOrder: 20 },
    { name: 'Magazine Design', slug: 'magazine-design', sortOrder: 21 },
    { name: 'Book Cover Design', slug: 'book-cover-design', sortOrder: 22 },
    { name: 'Ebook Cover Design', slug: 'ebook-cover-design', sortOrder: 23 },
    { name: 'Album Cover Design', slug: 'album-cover-design', sortOrder: 24 },
    { name: 'Podcast Cover Design', slug: 'podcast-cover-design', sortOrder: 25 },
    { name: 'Packaging Design', slug: 'packaging-design', sortOrder: 26 },
    { name: 'Label Design', slug: 'label-design', sortOrder: 27 },
    { name: 'Product Packaging Design', slug: 'product-packaging-design', sortOrder: 28 },
    { name: 'Mockup Design', slug: 'mockup-design', sortOrder: 29 },
    { name: 'Business Card Design', slug: 'business-card-design', sortOrder: 30 },
    { name: 'Letterhead Design', slug: 'letterhead-design', sortOrder: 31 },
    { name: 'Invoice Design', slug: 'invoice-design', sortOrder: 32 },
    { name: 'Stationery Design', slug: 'stationery-design', sortOrder: 33 },
    { name: 'Presentation Design', slug: 'graphic-presentation-design', sortOrder: 34 },
    { name: 'PowerPoint Design', slug: 'powerpoint-design', sortOrder: 35 },
    { name: 'Pitch Deck Design', slug: 'pitch-deck-design', sortOrder: 36 },
    { name: 'Infographic Design', slug: 'infographic-design', sortOrder: 37 },
    { name: 'Resume/CV Design', slug: 'resume-cv-design', sortOrder: 38 },
    { name: 'UI Design', slug: 'ui-design', sortOrder: 39 },
    { name: 'Web Banner Design', slug: 'web-banner-design', sortOrder: 40 },
    { name: 'Landing Page Design', slug: 'landing-page-design', sortOrder: 41 },
    { name: 'App Interface Design', slug: 'app-interface-design', sortOrder: 42 },
    { name: 'Icon Design', slug: 'icon-design', sortOrder: 43 },
    { name: 'Sticker Design', slug: 'sticker-design', sortOrder: 44 },
    { name: 'Emoji Design', slug: 'emoji-design', sortOrder: 45 },
    { name: 'Illustration Design', slug: 'illustration-design', sortOrder: 46 },
    { name: 'Character Illustration', slug: 'character-illustration', sortOrder: 47 },
    { name: 'Cartoon Design', slug: 'cartoon-design', sortOrder: 48 },
    { name: 'Anime Art', slug: 'anime-art', sortOrder: 49 },
    { name: 'NFT Art', slug: 'nft-art', sortOrder: 50 },
    { name: 'Digital Painting', slug: 'digital-painting', sortOrder: 51 },
    { name: 'Vector Tracing', slug: 'vector-tracing', sortOrder: 52 },
    { name: 'Photo Manipulation', slug: 'photo-manipulation', sortOrder: 53 },
    { name: 'Photo Retouching', slug: 'photo-retouching', sortOrder: 54 },
    { name: 'Background Removal', slug: 'background-removal', sortOrder: 55 },
    { name: 'Color Correction', slug: 'color-correction', sortOrder: 56 },
    { name: 'Photoshop Editing', slug: 'photoshop-editing', sortOrder: 57 },
    { name: 'Canva Design', slug: 'canva-design', sortOrder: 58 },
    { name: 'Adobe Illustrator Design', slug: 'adobe-illustrator-design', sortOrder: 59 },
    { name: 'Adobe Photoshop Work', slug: 'adobe-photoshop-work', sortOrder: 60 },
    { name: 'Figma Design', slug: 'figma-design', sortOrder: 61 },
    { name: 'Textile Pattern Design', slug: 'textile-pattern-design', sortOrder: 62 },
    { name: 'Fabric Print Design', slug: 'fabric-print-design', sortOrder: 63 },
    { name: 'Embroidery Design', slug: 'embroidery-design', sortOrder: 64 },
    { name: 'Fashion Illustration', slug: 'fashion-illustration', sortOrder: 65 },
    { name: 'T-Shirt Design', slug: 't-shirt-design', sortOrder: 66 },
    { name: 'Hoodie Design', slug: 'hoodie-design', sortOrder: 67 },
    { name: 'Merchandise Design', slug: 'merchandise-design', sortOrder: 68 },
    { name: 'Mug Design', slug: 'mug-design', sortOrder: 69 },
    { name: 'Tote Bag Design', slug: 'tote-bag-design', sortOrder: 70 },
    { name: 'Jewelry Design', slug: 'jewelry-design', sortOrder: 71 },
    { name: 'Ring Design', slug: 'ring-design', sortOrder: 72 },
    { name: 'Necklace Design', slug: 'necklace-design', sortOrder: 73 },
    { name: 'Bracelet Design', slug: 'bracelet-design', sortOrder: 74 },
    { name: 'Earrings Design', slug: 'earrings-design', sortOrder: 75 },
    { name: 'Pendant Design', slug: 'pendant-design', sortOrder: 76 },
    { name: 'Luxury Jewelry Design', slug: 'luxury-jewelry-design', sortOrder: 77 },
    { name: 'Bridal Jewelry Design', slug: 'bridal-jewelry-design', sortOrder: 78 },
    { name: 'Handmade Jewelry Design', slug: 'handmade-jewelry-design', sortOrder: 79 },
    { name: 'Jewelry Rendering', slug: 'jewelry-rendering', sortOrder: 80 },
    { name: '3D Jewelry Modeling', slug: '3d-jewelry-modeling', sortOrder: 81 },
    { name: 'CAD Jewelry Design', slug: 'cad-jewelry-design', sortOrder: 82 },
    { name: 'Jewelry Packaging Design', slug: 'jewelry-packaging-design', sortOrder: 83 },
    { name: 'Gold Jewelry Design', slug: 'gold-jewelry-design', sortOrder: 84 },
    { name: 'Silver Jewelry Design', slug: 'silver-jewelry-design', sortOrder: 85 },
    { name: 'Gemstone Jewelry Design', slug: 'gemstone-jewelry-design', sortOrder: 86 },
    { name: 'Tattoo Design', slug: 'tattoo-design', sortOrder: 87 },
    { name: 'Calligraphy Design', slug: 'calligraphy-design', sortOrder: 88 },
    { name: 'Arabic Calligraphy', slug: 'arabic-calligraphy', sortOrder: 89 },
    { name: 'Urdu Typography', slug: 'urdu-typography', sortOrder: 90 },
    { name: 'Custom Typography', slug: 'custom-typography', sortOrder: 91 },
    { name: 'Invitation Card Design', slug: 'invitation-card-design', sortOrder: 92 },
    { name: 'Wedding Card Design', slug: 'wedding-card-design', sortOrder: 93 },
    { name: 'Birthday Card Design', slug: 'birthday-card-design', sortOrder: 94 },
    { name: 'Certificate Design', slug: 'certificate-design', sortOrder: 95 },
    { name: 'ID Card Design', slug: 'id-card-design', sortOrder: 96 },
    { name: 'Event Banner Design', slug: 'event-banner-design', sortOrder: 97 },
    { name: 'Billboard Design', slug: 'billboard-design', sortOrder: 98 },
    { name: 'Vehicle Wrap Design', slug: 'vehicle-wrap-design', sortOrder: 99 },
    { name: 'Signboard Design', slug: 'signboard-design', sortOrder: 100 },
    { name: 'Stream Overlay Design', slug: 'stream-overlay-design', sortOrder: 101 },
    { name: 'Discord Server Graphics', slug: 'discord-server-graphics', sortOrder: 102 },
    { name: 'Gaming Graphics', slug: 'gaming-graphics', sortOrder: 103 },
    { name: 'Esports Social Media Design', slug: 'esports-social-media-design', sortOrder: 104 },
  ],
  'web-development': [
    { name: 'Frontend Development', slug: 'frontend-development', sortOrder: 0 },
    { name: 'Backend Development', slug: 'backend-development', sortOrder: 1 },
    { name: 'Full Stack Development', slug: 'full-stack-development', sortOrder: 2 },
    { name: 'Custom Website Development', slug: 'custom-website-development', sortOrder: 3 },
    { name: 'Portfolio Websites', slug: 'portfolio-websites', sortOrder: 4 },
    { name: 'Business Websites', slug: 'business-websites', sortOrder: 5 },
    { name: 'Landing Pages', slug: 'landing-pages', sortOrder: 6 },
    { name: 'Website Bug Fixing', slug: 'website-bug-fixing', sortOrder: 7 },
    { name: 'API Integration', slug: 'api-integration', sortOrder: 8 },
    { name: 'Website Optimization', slug: 'website-optimization', sortOrder: 9 },
  ],
  'app-development': [
    { name: 'Android App Development', slug: 'android-app-development', sortOrder: 0 },
    { name: 'iOS App Development', slug: 'ios-app-development', sortOrder: 1 },
    { name: 'Flutter Development', slug: 'flutter-development', sortOrder: 2 },
    { name: 'React Native Development', slug: 'react-native-development', sortOrder: 3 },
    { name: 'Hybrid Apps', slug: 'hybrid-apps', sortOrder: 4 },
    { name: 'Mobile UI Design', slug: 'mobile-ui-design', sortOrder: 5 },
    { name: 'App Testing', slug: 'app-testing', sortOrder: 6 },
    { name: 'App Maintenance', slug: 'app-maintenance', sortOrder: 7 },
    { name: 'App Deployment', slug: 'app-deployment', sortOrder: 8 },
  ],
  'ui-ux-design': [
    { name: 'Mobile App UI', slug: 'mobile-app-ui', sortOrder: 0 },
    { name: 'Website UI', slug: 'website-ui', sortOrder: 1 },
    { name: 'Wireframing', slug: 'wireframing', sortOrder: 2 },
    { name: 'Prototyping', slug: 'prototyping', sortOrder: 3 },
    { name: 'User Research', slug: 'user-research', sortOrder: 4 },
    { name: 'Dashboard Design', slug: 'dashboard-design', sortOrder: 5 },
    { name: 'SaaS UI Design', slug: 'saas-ui-design', sortOrder: 6 },
    { name: 'Figma Design', slug: 'figma-design', sortOrder: 7 },
    { name: 'Adobe XD Design', slug: 'adobe-xd-design', sortOrder: 8 },
  ],
  'video-editing': [
    { name: 'YouTube Video Editing', slug: 'youtube-video-editing', sortOrder: 0 },
    { name: 'Shorts/Reels Editing', slug: 'shorts-reels-editing', sortOrder: 1 },
    { name: 'TikTok Editing', slug: 'tiktok-editing', sortOrder: 2 },
    { name: 'Cinematic Editing', slug: 'cinematic-editing', sortOrder: 3 },
    { name: 'Color Grading', slug: 'color-grading', sortOrder: 4 },
    { name: 'Subtitle Adding', slug: 'subtitle-adding', sortOrder: 5 },
    { name: 'Podcast Editing', slug: 'podcast-editing', sortOrder: 6 },
    { name: 'Green Screen Editing', slug: 'green-screen-editing', sortOrder: 7 },
    { name: 'Intro & Outro Videos', slug: 'intro-and-outro-videos', sortOrder: 8 },
  ],
  'animation-motion-graphics': [
    { name: '2D Animation', slug: '2d-animation', sortOrder: 0 },
    { name: '3D Animation', slug: '3d-animation', sortOrder: 1 },
    { name: 'Motion Graphics', slug: 'motion-graphics', sortOrder: 2 },
    { name: 'Explainer Videos', slug: 'explainer-videos', sortOrder: 3 },
    { name: 'Whiteboard Animation', slug: 'whiteboard-animation', sortOrder: 4 },
    { name: 'Character Animation', slug: 'character-animation', sortOrder: 5 },
    { name: 'Logo Animation', slug: 'logo-animation', sortOrder: 6 },
    { name: 'VFX Effects', slug: 'vfx-effects', sortOrder: 7 },
  ],
  'content-writing': [
    { name: 'Blog Writing', slug: 'blog-writing', sortOrder: 0 },
    { name: 'Article Writing', slug: 'article-writing', sortOrder: 1 },
    { name: 'Website Content', slug: 'website-content', sortOrder: 2 },
    { name: 'Script Writing', slug: 'content-script-writing', sortOrder: 3 },
    { name: 'Technical Writing', slug: 'technical-writing', sortOrder: 4 },
    { name: 'Product Descriptions', slug: 'product-descriptions', sortOrder: 5 },
    { name: 'Ghostwriting', slug: 'ghostwriting', sortOrder: 6 },
    { name: 'Story Writing', slug: 'story-writing', sortOrder: 7 },
  ],
  'copywriting': [
    { name: 'Sales Copy', slug: 'sales-copy', sortOrder: 0 },
    { name: 'Ad Copy', slug: 'ad-copy', sortOrder: 1 },
    { name: 'Email Copywriting', slug: 'email-copywriting', sortOrder: 2 },
    { name: 'Landing Page Copy', slug: 'landing-page-copy', sortOrder: 3 },
    { name: 'Product Copy', slug: 'product-copy', sortOrder: 4 },
    { name: 'Social Media Captions', slug: 'social-media-captions', sortOrder: 5 },
    { name: 'Brand Messaging', slug: 'brand-messaging', sortOrder: 6 },
  ],
  'translation': [
    { name: 'English to Urdu', slug: 'english-to-urdu', sortOrder: 0 },
    { name: 'Urdu to English', slug: 'urdu-to-english', sortOrder: 1 },
    { name: 'Arabic Translation', slug: 'arabic-translation', sortOrder: 2 },
    { name: 'French Translation', slug: 'french-translation', sortOrder: 3 },
    { name: 'Subtitle Translation', slug: 'subtitle-translation', sortOrder: 4 },
    { name: 'Document Translation', slug: 'document-translation', sortOrder: 5 },
    { name: 'Website Translation', slug: 'website-translation', sortOrder: 6 },
  ],
  'digital-marketing': [
    { name: 'Facebook Marketing', slug: 'facebook-marketing', sortOrder: 0 },
    { name: 'Instagram Marketing', slug: 'instagram-marketing', sortOrder: 1 },
    { name: 'TikTok Marketing', slug: 'tiktok-marketing', sortOrder: 2 },
    { name: 'Google Ads', slug: 'google-ads', sortOrder: 3 },
    { name: 'Influencer Marketing', slug: 'influencer-marketing', sortOrder: 4 },
    { name: 'Affiliate Marketing', slug: 'affiliate-marketing', sortOrder: 5 },
    { name: 'Marketing Strategy', slug: 'marketing-strategy', sortOrder: 6 },
    { name: 'Email Campaigns', slug: 'email-campaigns', sortOrder: 7 },
  ],
  'social-media-management': [
    { name: 'Instagram Management', slug: 'instagram-management', sortOrder: 0 },
    { name: 'Facebook Page Management', slug: 'facebook-page-management', sortOrder: 1 },
    { name: 'LinkedIn Management', slug: 'linkedin-management', sortOrder: 2 },
    { name: 'Content Scheduling', slug: 'content-scheduling', sortOrder: 3 },
    { name: 'Community Management', slug: 'community-management', sortOrder: 4 },
    { name: 'Hashtag Research', slug: 'hashtag-research', sortOrder: 5 },
    { name: 'Social Media Growth', slug: 'social-media-growth', sortOrder: 6 },
  ],
  'seo-services': [
    { name: 'On-Page SEO', slug: 'on-page-seo', sortOrder: 0 },
    { name: 'Off-Page SEO', slug: 'off-page-seo', sortOrder: 1 },
    { name: 'Technical SEO', slug: 'technical-seo', sortOrder: 2 },
    { name: 'Keyword Research', slug: 'keyword-research', sortOrder: 3 },
    { name: 'Backlink Building', slug: 'backlink-building', sortOrder: 4 },
    { name: 'Local SEO', slug: 'local-seo', sortOrder: 5 },
    { name: 'YouTube SEO', slug: 'youtube-seo', sortOrder: 6 },
    { name: 'Shopify SEO', slug: 'shopify-seo', sortOrder: 7 },
  ],
  'ai-machine-learning': [
    { name: 'AI Chatbots', slug: 'ai-chatbots', sortOrder: 0 },
    { name: 'Machine Learning Models', slug: 'machine-learning-models', sortOrder: 1 },
    { name: 'AI Automation', slug: 'ai-automation', sortOrder: 2 },
    { name: 'Prompt Engineering', slug: 'prompt-engineering', sortOrder: 3 },
    { name: 'Computer Vision', slug: 'computer-vision', sortOrder: 4 },
    { name: 'NLP Projects', slug: 'nlp-projects', sortOrder: 5 },
    { name: 'Data Training', slug: 'data-training', sortOrder: 6 },
    { name: 'AI Integrations', slug: 'ai-integrations', sortOrder: 7 },
  ],
  'data-entry': [
    { name: 'Copy Paste Work', slug: 'copy-paste-work', sortOrder: 0 },
    { name: 'Excel Data Entry', slug: 'excel-data-entry', sortOrder: 1 },
    { name: 'Web Research', slug: 'web-research', sortOrder: 2 },
    { name: 'PDF to Word', slug: 'pdf-to-word', sortOrder: 3 },
    { name: 'Typing Work', slug: 'typing-work', sortOrder: 4 },
    { name: 'CRM Data Entry', slug: 'crm-data-entry', sortOrder: 5 },
    { name: 'Data Collection', slug: 'data-collection', sortOrder: 6 },
  ],
  'virtual-assistant': [
    { name: 'Email Management', slug: 'email-management', sortOrder: 0 },
    { name: 'Calendar Management', slug: 'calendar-management', sortOrder: 1 },
    { name: 'Customer Support', slug: 'va-customer-support', sortOrder: 2 },
    { name: 'Admin Support', slug: 'admin-support', sortOrder: 3 },
    { name: 'Research Assistance', slug: 'research-assistance', sortOrder: 4 },
    { name: 'Appointment Scheduling', slug: 'appointment-scheduling', sortOrder: 5 },
    { name: 'File Organization', slug: 'file-organization', sortOrder: 6 },
  ],
  'cyber-security': [
    { name: 'Website Security', slug: 'website-security', sortOrder: 0 },
    { name: 'Ethical Hacking', slug: 'ethical-hacking', sortOrder: 1 },
    { name: 'Penetration Testing', slug: 'penetration-testing', sortOrder: 2 },
    { name: 'Malware Removal', slug: 'malware-removal', sortOrder: 3 },
    { name: 'Security Audits', slug: 'security-audits', sortOrder: 4 },
    { name: 'Network Security', slug: 'network-security', sortOrder: 5 },
    { name: 'Data Protection', slug: 'data-protection', sortOrder: 6 },
  ],
  'cloud-computing': [
    { name: 'AWS Services', slug: 'aws-services', sortOrder: 0 },
    { name: 'Google Cloud', slug: 'google-cloud', sortOrder: 1 },
    { name: 'Microsoft Azure', slug: 'microsoft-azure', sortOrder: 2 },
    { name: 'Cloud Deployment', slug: 'cloud-deployment', sortOrder: 3 },
    { name: 'Server Management', slug: 'server-management', sortOrder: 4 },
    { name: 'DevOps', slug: 'devops', sortOrder: 5 },
    { name: 'Cloud Security', slug: 'cloud-security', sortOrder: 6 },
  ],
  'game-development': [
    { name: 'Unity Development', slug: 'unity-development', sortOrder: 0 },
    { name: 'Unreal Engine', slug: 'unreal-engine', sortOrder: 1 },
    { name: '2D Games', slug: '2d-games', sortOrder: 2 },
    { name: '3D Games', slug: '3d-games', sortOrder: 3 },
    { name: 'Multiplayer Games', slug: 'multiplayer-games', sortOrder: 4 },
    { name: 'Mobile Games', slug: 'mobile-games', sortOrder: 5 },
    { name: 'Game UI Design', slug: 'game-ui-design', sortOrder: 6 },
  ],
  'e-commerce-services': [
    { name: 'Product Uploading', slug: 'product-uploading', sortOrder: 0 },
    { name: 'Store Management', slug: 'store-management', sortOrder: 1 },
    { name: 'Product Listings', slug: 'product-listings', sortOrder: 2 },
    { name: 'Order Management', slug: 'order-management', sortOrder: 3 },
    { name: 'Inventory Management', slug: 'inventory-management', sortOrder: 4 },
    { name: 'Dropshipping Setup', slug: 'dropshipping-setup', sortOrder: 5 },
  ],
  'shopify-development': [
    { name: 'Shopify Store Setup', slug: 'shopify-store-setup', sortOrder: 0 },
    { name: 'Shopify Customization', slug: 'shopify-customization', sortOrder: 1 },
    { name: 'Theme Development', slug: 'theme-development', sortOrder: 2 },
    { name: 'Shopify SEO', slug: 'shopify-seo', sortOrder: 3 },
    { name: 'App Integration', slug: 'app-integration', sortOrder: 4 },
    { name: 'Product Pages', slug: 'product-pages', sortOrder: 5 },
  ],
  'wordpress-development': [
    { name: 'WordPress Website', slug: 'wordpress-website', sortOrder: 0 },
    { name: 'Elementor Design', slug: 'elementor-design', sortOrder: 1 },
    { name: 'WooCommerce', slug: 'woocommerce', sortOrder: 2 },
    { name: 'Plugin Development', slug: 'plugin-development', sortOrder: 3 },
    { name: 'Theme Customization', slug: 'theme-customization', sortOrder: 4 },
    { name: 'Website Migration', slug: 'website-migration', sortOrder: 5 },
  ],
  'photography-photo-editing': [
    { name: 'Photo Retouching', slug: 'photo-retouching', sortOrder: 0 },
    { name: 'Background Removal', slug: 'background-removal', sortOrder: 1 },
    { name: 'Product Photography', slug: 'product-photography', sortOrder: 2 },
    { name: 'Event Photography', slug: 'event-photography', sortOrder: 3 },
    { name: 'Lightroom Editing', slug: 'lightroom-editing', sortOrder: 4 },
    { name: 'Photoshop Editing', slug: 'photoshop-editing', sortOrder: 5 },
  ],
  'music-audio-production': [
    { name: 'Beat Making', slug: 'beat-making', sortOrder: 0 },
    { name: 'Mixing & Mastering', slug: 'mixing-and-mastering', sortOrder: 1 },
    { name: 'Podcast Production', slug: 'podcast-production', sortOrder: 2 },
    { name: 'Audio Editing', slug: 'audio-editing', sortOrder: 3 },
    { name: 'Sound Effects', slug: 'sound-effects', sortOrder: 4 },
    { name: 'Background Music', slug: 'background-music', sortOrder: 5 },
  ],
  'voice-over': [
    { name: 'English Voice Over', slug: 'english-voice-over', sortOrder: 0 },
    { name: 'Urdu Voice Over', slug: 'urdu-voice-over', sortOrder: 1 },
    { name: 'Character Voice', slug: 'character-voice', sortOrder: 2 },
    { name: 'Narration', slug: 'narration', sortOrder: 3 },
    { name: 'Commercial Voice', slug: 'commercial-voice', sortOrder: 4 },
    { name: 'Audiobook Recording', slug: 'audiobook-recording', sortOrder: 5 },
  ],
  'business-consulting': [
    { name: 'Startup Consulting', slug: 'startup-consulting', sortOrder: 0 },
    { name: 'Business Plans', slug: 'business-plans', sortOrder: 1 },
    { name: 'Market Research', slug: 'market-research', sortOrder: 2 },
    { name: 'Financial Planning', slug: 'financial-planning', sortOrder: 3 },
    { name: 'Growth Strategy', slug: 'growth-strategy', sortOrder: 4 },
    { name: 'HR Consulting', slug: 'hr-consulting', sortOrder: 5 },
  ],
  'accounting-finance': [
    { name: 'Bookkeeping', slug: 'bookkeeping', sortOrder: 0 },
    { name: 'Tax Filing', slug: 'tax-filing', sortOrder: 1 },
    { name: 'Financial Analysis', slug: 'financial-analysis', sortOrder: 2 },
    { name: 'Payroll Management', slug: 'payroll-management', sortOrder: 3 },
    { name: 'QuickBooks', slug: 'quickbooks', sortOrder: 4 },
    { name: 'Budget Planning', slug: 'budget-planning', sortOrder: 5 },
  ],
  'customer-support': [
    { name: 'Live Chat Support', slug: 'live-chat-support', sortOrder: 0 },
    { name: 'Email Support', slug: 'email-support', sortOrder: 1 },
    { name: 'Call Support', slug: 'call-support', sortOrder: 2 },
    { name: 'Technical Support', slug: 'technical-support', sortOrder: 3 },
    { name: 'Ticket Handling', slug: 'ticket-handling', sortOrder: 4 },
  ],
  'architecture-interior-design': [
    { name: 'House Plans', slug: 'house-plans', sortOrder: 0 },
    { name: 'Interior Design', slug: 'interior-design', sortOrder: 1 },
    { name: 'Landscape Design', slug: 'landscape-design', sortOrder: 2 },
    { name: 'AutoCAD Drafting', slug: 'autocad-drafting', sortOrder: 3 },
    { name: '3D Floor Plans', slug: '3d-floor-plans', sortOrder: 4 },
  ],
  '3d-modeling-rendering': [
    { name: 'Product Rendering', slug: 'product-rendering', sortOrder: 0 },
    { name: 'Character Modeling', slug: 'character-modeling', sortOrder: 1 },
    { name: 'Architectural Rendering', slug: 'architectural-rendering', sortOrder: 2 },
    { name: 'Blender Modeling', slug: 'blender-modeling', sortOrder: 3 },
    { name: '3D Texturing', slug: '3d-texturing', sortOrder: 4 },
  ],
  'programming-software-engineering': [
    { name: 'Python Development', slug: 'python-development', sortOrder: 0 },
    { name: 'JavaScript Development', slug: 'javascript-development', sortOrder: 1 },
    { name: 'Java Development', slug: 'java-development', sortOrder: 2 },
    { name: 'C++ Programming', slug: 'c-programming', sortOrder: 3 },
    { name: 'C# Development', slug: 'c-development', sortOrder: 4 },
    { name: 'PHP Development', slug: 'php-development', sortOrder: 5 },
    { name: 'Software Debugging', slug: 'software-debugging', sortOrder: 6 },
  ],
  'online-tutoring': [
    { name: 'Math Tutoring', slug: 'math-tutoring', sortOrder: 0 },
    { name: 'English Tutoring', slug: 'english-tutoring', sortOrder: 1 },
    { name: 'Science Tutoring', slug: 'science-tutoring', sortOrder: 2 },
    { name: 'Quran Teaching', slug: 'quran-teaching', sortOrder: 3 },
    { name: 'Coding Lessons', slug: 'coding-lessons', sortOrder: 4 },
    { name: 'IELTS Preparation', slug: 'ielts-preparation', sortOrder: 5 },
  ],
  'resume-cv-writing': [
    { name: 'CV Design', slug: 'cv-design', sortOrder: 0 },
    { name: 'Resume Writing', slug: 'resume-writing', sortOrder: 1 },
    { name: 'LinkedIn Optimization', slug: 'linkedin-optimization', sortOrder: 2 },
    { name: 'Cover Letter Writing', slug: 'cover-letter-writing', sortOrder: 3 },
    { name: 'Job Application Help', slug: 'job-application-help', sortOrder: 4 },
  ],
  'email-marketing': [
    { name: 'Mailchimp Setup', slug: 'mailchimp-setup', sortOrder: 0 },
    { name: 'Newsletter Design', slug: 'newsletter-design', sortOrder: 1 },
    { name: 'Campaign Management', slug: 'campaign-management', sortOrder: 2 },
    { name: 'Automation Emails', slug: 'automation-emails', sortOrder: 3 },
    { name: 'Email Templates', slug: 'email-templates', sortOrder: 4 },
  ],
  'branding-identity': [
    { name: 'Brand Guidelines', slug: 'brand-guidelines', sortOrder: 0 },
    { name: 'Company Identity', slug: 'company-identity', sortOrder: 1 },
    { name: 'Packaging Branding', slug: 'packaging-branding', sortOrder: 2 },
    { name: 'Brand Strategy', slug: 'brand-strategy', sortOrder: 3 },
    { name: 'Typography Design', slug: 'typography-design', sortOrder: 4 },
  ],
  'nft-blockchain': [
    { name: 'NFT Art', slug: 'nft-art', sortOrder: 0 },
    { name: 'Smart Contracts', slug: 'smart-contracts', sortOrder: 1 },
    { name: 'Crypto Wallets', slug: 'crypto-wallets', sortOrder: 2 },
    { name: 'Blockchain Apps', slug: 'blockchain-apps', sortOrder: 3 },
    { name: 'Web3 Development', slug: 'web3-development', sortOrder: 4 },
  ],
  'chatbot-development': [
    { name: 'AI Chatbots', slug: 'ai-chatbots', sortOrder: 0 },
    { name: 'WhatsApp Bots', slug: 'whatsapp-bots', sortOrder: 1 },
    { name: 'Telegram Bots', slug: 'telegram-bots', sortOrder: 2 },
    { name: 'Customer Support Bots', slug: 'customer-support-bots', sortOrder: 3 },
    { name: 'Website Chatbots', slug: 'website-chatbots', sortOrder: 4 },
  ],
  'script-writing': [
    { name: 'YouTube Scripts', slug: 'youtube-scripts', sortOrder: 0 },
    { name: 'Movie Scripts', slug: 'movie-scripts', sortOrder: 1 },
    { name: 'Ad Scripts', slug: 'ad-scripts', sortOrder: 2 },
    { name: 'Story Scripts', slug: 'story-scripts', sortOrder: 3 },
    { name: 'Podcast Scripts', slug: 'podcast-scripts', sortOrder: 4 },
  ],
  'presentation-design': [
    { name: 'PowerPoint Design', slug: 'powerpoint-design', sortOrder: 0 },
    { name: 'Pitch Decks', slug: 'pitch-decks', sortOrder: 1 },
    { name: 'Business Presentations', slug: 'business-presentations', sortOrder: 2 },
    { name: 'Investor Decks', slug: 'investor-decks', sortOrder: 3 },
    { name: 'Google Slides Design', slug: 'google-slides-design', sortOrder: 4 },
  ],
  'product-design': [
    { name: 'Prototype Design', slug: 'prototype-design', sortOrder: 0 },
    { name: 'Industrial Design', slug: 'industrial-design', sortOrder: 1 },
    { name: 'Packaging Concepts', slug: 'packaging-concepts', sortOrder: 2 },
    { name: 'Product Sketches', slug: 'product-sketches', sortOrder: 3 },
    { name: '3D Product Design', slug: '3d-product-design', sortOrder: 4 },
  ],
  'legal-services': [
    { name: 'Contract Writing', slug: 'contract-writing', sortOrder: 0 },
    { name: 'Legal Consulting', slug: 'legal-consulting', sortOrder: 1 },
    { name: 'Privacy Policies', slug: 'privacy-policies', sortOrder: 2 },
    { name: 'Terms & Conditions', slug: 'terms-and-conditions', sortOrder: 3 },
    { name: 'Trademark Help', slug: 'trademark-help', sortOrder: 4 },
  ],
}

// ----- Color Theme Presets for Shops -----

export const SHOP_COLOR_PRESETS = [
  {
    name: 'Default Purple',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#a78bfa',
  },
  {
    name: 'Ocean Blue',
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#67e8f9',
  },
  {
    name: 'Forest Green',
    primary: '#22c55e',
    secondary: '#16a34a',
    accent: '#4ade80',
  },
  {
    name: 'Sunset Orange',
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
  },
  {
    name: 'Rose Pink',
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#f472b6',
  },
  {
    name: 'Warm Red',
    primary: '#ef4444',
    secondary: '#dc2626',
    accent: '#f87171',
  },
  {
    name: 'Slate Dark',
    primary: '#475569',
    secondary: '#334155',
    accent: '#94a3b8',
  },
  {
    name: 'Amber Gold',
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
  },
  {
    name: 'Teal',
    primary: '#14b8a6',
    secondary: '#0d9488',
    accent: '#5eead4',
  },
  {
    name: 'Crimson',
    primary: '#be123c',
    secondary: '#9f1239',
    accent: '#f43f5e',
  },
] as const

// ----- Pagination -----

export const DEFAULT_PAGE_SIZE = 12
export const MAX_PAGE_SIZE = 100

// ----- File Upload Limits -----

export const MAX_IMAGE_SIZE_MB = 5
export const MAX_FILE_SIZE_MB = 50
export const MAX_IMAGES_PER_PRODUCT = 8
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
]

// ----- Rating -----

export const MIN_RATING = 1
export const MAX_RATING = 5

// ----- Sort Options -----

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
] as const

// ----- Custom Section Types -----

export const CUSTOM_SECTION_TYPES = [
  { value: 'text', label: 'Text Block' },
  { value: 'banner', label: 'Banner Image' },
  { value: 'gallery', label: 'Image Gallery' },
  { value: 'faq', label: 'FAQ Section' },
  { value: 'testimonials', label: 'Testimonials' },
] as const

// ----- Payment Methods -----

export const PAYMENT_METHODS = [
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
] as const

// ----- Payment Gateway -----

export const PAYMENT_GATEWAY_MODE = process.env.PAYMENT_GATEWAY_MODE || 'sandbox'
export const PAYMENT_CALLBACK_BASE_URL = process.env.PAYMENT_CALLBACK_BASE_URL || 'http://localhost:3000'
