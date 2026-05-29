// =============================================================================
// Marketo - Digital Product Subcategories
// Maps each digital category slug to its list of subcategories (with name + slug)
// =============================================================================

// Helper to generate a slug from a name
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Build subcategories with name + slug for each parent
function buildSubcategories(parentSlug: string, names: string[]) {
  return names.map((name) => ({
    name,
    slug: `${parentSlug}--${toSlug(name)}`,
  }))
}

const rawDigitalSubcategories: Record<string, string[]> = {
  'graphic-design-assets': [
    'Logo Templates',
    'Social Media Templates',
    'Canva Templates',
    'Photoshop Templates',
    'Illustrator Files',
    'UI Kits',
    'Icon Packs',
    'Mockup Files',
    'Fonts',
    'Patterns & Textures',
  ],

  'website-development': [
    'Website Templates',
    'WordPress Themes',
    'Shopify Themes',
    'HTML Templates',
    'React Templates',
    'Landing Pages',
    'Plugins',
    'Scripts & Codes',
    'Mobile App Templates',
    'Admin Dashboards',
  ],

  'courses-education': [
    'Online Courses',
    'Programming Courses',
    'Graphic Design Courses',
    'Marketing Courses',
    'Business Courses',
    'Language Courses',
    'PDF Notes',
    'Study Guides',
    'Exam Preparation Material',
  ],

  'digital-books-learning-materials': [
    'Ebooks',
    'PDF Books',
    'Audiobooks',
    'Study Notes',
    'Research Papers',
    'Digital Magazines',
    'Digital Comics',
    'Manga PDFs',
    'Educational Guides',
    'Programming Ebooks',
    'Business Ebooks',
    'Self-Help Ebooks',
    'Islamic Ebooks',
    'Kids Digital Books',
    'Printable Worksheets',
    'Exam Preparation PDFs',
    'Language Learning PDFs',
    'Recipe Ebooks',
    'Digital Planners',
    'Journals & Templates',
  ],

  'video-animation': [
    'Video Templates',
    'Intro & Outro Videos',
    'Motion Graphics',
    'Animated Explainers',
    'Video Presets',
    'LUTs & Color Presets',
    'Green Screen Effects',
    'Transitions',
    'Stock Videos',
  ],

  'music-audio': [
    'Beats',
    'Instrumentals',
    'Sound Effects',
    'Background Music',
    'Podcast Intros',
    'Voice Overs',
    'Audio Loops',
    'Music Packs',
  ],

  'photography': [
    'Stock Photos',
    'Lightroom Presets',
    'Photoshop Actions',
    'Photo Filters',
    'Wallpapers',
    'Digital Art Prints',
  ],

  'ai-tech-products': [
    'AI Prompts',
    'Chatbot Templates',
    'Automation Systems',
    'AI Tools',
    'SaaS Products',
    'Chrome Extensions',
    'Mobile Apps',
    'Software Tools',
  ],

  'nfts-blockchain': [
    'NFT Art',
    'NFT Collections',
    'Smart Contracts',
    'Crypto Bots',
    'Blockchain Scripts',
    'Web3 Templates',
  ],

  'marketing-products': [
    'Social Media Packs',
    'Ad Templates',
    'Email Templates',
    'Sales Funnels',
    'SEO Tools',
    'Marketing Planners',
    'Content Calendars',
  ],

  'gaming-products': [
    'Game Assets',
    '2D Sprites',
    '3D Models',
    'Gaming Overlays',
    'Stream Packages',
    'Discord Templates',
    'Minecraft Assets',
  ],

  'business-productivity': [
    'Notion Templates',
    'Spreadsheet Templates',
    'Invoice Templates',
    'Finance Trackers',
    'Budget Planners',
    'CRM Templates',
    'Project Management Templates',
  ],

  'art-illustration': [
    'Digital Illustrations',
    'Character Designs',
    'Anime Art',
    'NFT Illustrations',
    'Tattoo Designs',
    'Coloring Pages',
    'Printable Art',
  ],

  'printable-products': [
    'Printable Planners',
    'Printable Calendars',
    'Wedding Invitations',
    'Greeting Cards',
    'Wall Art Prints',
    'Kids Activity Sheets',
    'Printable Stickers',
  ],

  'fashion-textile-design': [
    'Fabric Patterns',
    'Embroidery Files',
    'Sewing Patterns',
    'Fashion Sketches',
    'Jewelry CAD Files',
    'T-Shirt Print Designs',
    'Textile Prints',
  ],
}

// Build the exported DIGITAL_SUBCATEGORIES with {name, slug} objects
export const DIGITAL_SUBCATEGORIES: Record<string, { name: string; slug: string }[]> = {}
for (const [parentSlug, names] of Object.entries(rawDigitalSubcategories)) {
  DIGITAL_SUBCATEGORIES[parentSlug] = buildSubcategories(parentSlug, names)
}

// Also export the raw data for seeding (just names)
export { rawDigitalSubcategories }
export { toSlug }
