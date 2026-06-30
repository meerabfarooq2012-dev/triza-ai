// =============================================================================
// TRIZA - Gig Subcategories
// Maps each parent category slug to its list of subcategories (with name + slug)
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

const rawSubcategories: Record<string, string[]> = {
  'graphic-design': [
    'Logo Design',
    'Minimalist Logo Design',
    '3D Logo Design',
    'Mascot Logo Design',
    'Signature Logo Design',
    'Vintage Logo Design',
    'Gaming Logo Design',
    'Esports Logo Design',
    'Brand Identity Design',
    'Brand Guidelines',
    'Social Media Post Design',
    'Instagram Post Design',
    'Facebook Cover Design',
    'YouTube Thumbnail Design',
    'Twitch Banner Design',
    'LinkedIn Banner Design',
    'Poster Design',
    'Flyer Design',
    'Brochure Design',
    'Menu Design',
    'Catalog Design',
    'Magazine Design',
    'Book Cover Design',
    'Ebook Cover Design',
    'Album Cover Design',
    'Podcast Cover Design',
    'Packaging Design',
    'Label Design',
    'Product Packaging Design',
    'Mockup Design',
    'Business Card Design',
    'Letterhead Design',
    'Invoice Design',
    'Stationery Design',
    'Presentation Design',
    'PowerPoint Design',
    'Pitch Deck Design',
    'Infographic Design',
    'Resume/CV Design',
    'UI Design',
    'Web Banner Design',
    'Landing Page Design',
    'App Interface Design',
    'Icon Design',
    'Sticker Design',
    'Emoji Design',
    'Illustration Design',
    'Character Illustration',
    'Cartoon Design',
    'Anime Art',
    'NFT Art',
    'Digital Painting',
    'Vector Tracing',
    'Photo Manipulation',
    'Photo Retouching',
    'Background Removal',
    'Color Correction',
    'Photoshop Editing',
    'Canva Design',
    'Adobe Illustrator Design',
    'Adobe Photoshop Work',
    'Figma Design',
    'Textile Pattern Design',
    'Fabric Print Design',
    'Embroidery Design',
    'Fashion Illustration',
    'T-Shirt Design',
    'Hoodie Design',
    'Merchandise Design',
    'Mug Design',
    'Tote Bag Design',
    'Jewelry Design',
    'Ring Design',
    'Necklace Design',
    'Bracelet Design',
    'Earrings Design',
    'Pendant Design',
    'Luxury Jewelry Design',
    'Bridal Jewelry Design',
    'Handmade Jewelry Design',
    'Jewelry Rendering',
    '3D Jewelry Modeling',
    'CAD Jewelry Design',
    'Jewelry Packaging Design',
    'Gold Jewelry Design',
    'Silver Jewelry Design',
    'Gemstone Jewelry Design',
    'Tattoo Design',
    'Calligraphy Design',
    'Arabic Calligraphy',
    'Urdu Typography',
    'Custom Typography',
    'Invitation Card Design',
    'Wedding Card Design',
    'Birthday Card Design',
    'Certificate Design',
    'ID Card Design',
    'Event Banner Design',
    'Billboard Design',
    'Vehicle Wrap Design',
    'Signboard Design',
    'Stream Overlay Design',
    'Discord Server Graphics',
    'Gaming Graphics',
    'Esports Social Media Design',
  ],

  'web-development': [
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
    'Custom Website Development',
    'Portfolio Websites',
    'Business Websites',
    'Landing Pages',
    'Website Bug Fixing',
    'API Integration',
    'Website Optimization',
  ],

  'app-development': [
    'Android App Development',
    'iOS App Development',
    'Flutter Development',
    'React Native Development',
    'Hybrid Apps',
    'Mobile UI Design',
    'App Testing',
    'App Maintenance',
    'App Deployment',
  ],

  'ui-ux-design': [
    'Mobile App UI',
    'Website UI',
    'Wireframing',
    'Prototyping',
    'User Research',
    'Dashboard Design',
    'SaaS UI Design',
    'Figma Design',
    'Adobe XD Design',
  ],

  'video-editing': [
    'YouTube Video Editing',
    'Shorts/Reels Editing',
    'TikTok Editing',
    'Cinematic Editing',
    'Color Grading',
    'Subtitle Adding',
    'Podcast Editing',
    'Green Screen Editing',
    'Intro & Outro Videos',
  ],

  'animation-motion-graphics': [
    '2D Animation',
    '3D Animation',
    'Motion Graphics',
    'Explainer Videos',
    'Whiteboard Animation',
    'Character Animation',
    'Logo Animation',
    'VFX Effects',
  ],

  'content-writing': [
    'Blog Writing',
    'Article Writing',
    'Website Content',
    'Script Writing',
    'Technical Writing',
    'Product Descriptions',
    'Ghostwriting',
    'Story Writing',
  ],

  'copywriting': [
    'Sales Copy',
    'Ad Copy',
    'Email Copywriting',
    'Landing Page Copy',
    'Product Copy',
    'Social Media Captions',
    'Brand Messaging',
  ],

  'translation': [
    'English to Urdu',
    'Urdu to English',
    'Arabic Translation',
    'French Translation',
    'Subtitle Translation',
    'Document Translation',
    'Website Translation',
  ],

  'digital-marketing': [
    'Facebook Marketing',
    'Instagram Marketing',
    'TikTok Marketing',
    'Google Ads',
    'Influencer Marketing',
    'Affiliate Marketing',
    'Marketing Strategy',
    'Email Campaigns',
  ],

  'social-media-management': [
    'Instagram Management',
    'Facebook Page Management',
    'LinkedIn Management',
    'Content Scheduling',
    'Community Management',
    'Hashtag Research',
    'Social Media Growth',
  ],

  'seo-services': [
    'On-Page SEO',
    'Off-Page SEO',
    'Technical SEO',
    'Keyword Research',
    'Backlink Building',
    'Local SEO',
    'YouTube SEO',
    'Shopify SEO',
  ],

  'ai-machine-learning': [
    'AI Chatbots',
    'Machine Learning Models',
    'AI Automation',
    'Prompt Engineering',
    'Computer Vision',
    'NLP Projects',
    'Data Training',
    'AI Integrations',
  ],

  'data-entry': [
    'Copy Paste Work',
    'Excel Data Entry',
    'Web Research',
    'PDF to Word',
    'Typing Work',
    'CRM Data Entry',
    'Data Collection',
  ],

  'virtual-assistant': [
    'Email Management',
    'Calendar Management',
    'Customer Support',
    'Admin Support',
    'Research Assistance',
    'Appointment Scheduling',
    'File Organization',
  ],

  'cyber-security': [
    'Website Security',
    'Ethical Hacking',
    'Penetration Testing',
    'Malware Removal',
    'Security Audits',
    'Network Security',
    'Data Protection',
  ],

  'cloud-computing': [
    'AWS Services',
    'Google Cloud',
    'Microsoft Azure',
    'Cloud Deployment',
    'Server Management',
    'DevOps',
    'Cloud Security',
  ],

  'game-development': [
    'Unity Development',
    'Unreal Engine',
    '2D Games',
    '3D Games',
    'Multiplayer Games',
    'Mobile Games',
    'Game UI Design',
  ],

  'e-commerce-services': [
    'Product Uploading',
    'Store Management',
    'Product Listings',
    'Order Management',
    'Inventory Management',
    'Dropshipping Setup',
  ],

  'shopify-development': [
    'Shopify Store Setup',
    'Shopify Customization',
    'Theme Development',
    'Shopify SEO',
    'App Integration',
    'Product Pages',
  ],

  'wordpress-development': [
    'WordPress Website',
    'Elementor Design',
    'WooCommerce',
    'Plugin Development',
    'Theme Customization',
    'Website Migration',
  ],

  'photography-photo-editing': [
    'Photo Retouching',
    'Background Removal',
    'Product Photography',
    'Event Photography',
    'Lightroom Editing',
    'Photoshop Editing',
  ],

  'music-audio-production': [
    'Beat Making',
    'Mixing & Mastering',
    'Podcast Production',
    'Audio Editing',
    'Sound Effects',
    'Background Music',
  ],

  'voice-over': [
    'English Voice Over',
    'Urdu Voice Over',
    'Character Voice',
    'Narration',
    'Commercial Voice',
    'Audiobook Recording',
  ],

  'business-consulting': [
    'Startup Consulting',
    'Business Plans',
    'Market Research',
    'Financial Planning',
    'Growth Strategy',
    'HR Consulting',
  ],

  'accounting-finance': [
    'Bookkeeping',
    'Tax Filing',
    'Financial Analysis',
    'Payroll Management',
    'QuickBooks',
    'Budget Planning',
  ],

  'customer-support': [
    'Live Chat Support',
    'Email Support',
    'Call Support',
    'Technical Support',
    'Ticket Handling',
  ],

  'architecture-interior-design': [
    'House Plans',
    'Interior Design',
    'Landscape Design',
    'AutoCAD Drafting',
    '3D Floor Plans',
  ],

  '3d-modeling-rendering': [
    'Product Rendering',
    'Character Modeling',
    'Architectural Rendering',
    'Blender Modeling',
    '3D Texturing',
  ],

  'programming-software-engineering': [
    'Python Development',
    'JavaScript Development',
    'Java Development',
    'C++ Programming',
    'C# Development',
    'PHP Development',
    'Software Debugging',
  ],

  'online-tutoring': [
    'Math Tutoring',
    'English Tutoring',
    'Science Tutoring',
    'Quran Teaching',
    'Coding Lessons',
    'IELTS Preparation',
  ],

  'resume-cv-writing': [
    'CV Design',
    'Resume Writing',
    'LinkedIn Optimization',
    'Cover Letter Writing',
    'Job Application Help',
  ],

  'email-marketing': [
    'Mailchimp Setup',
    'Newsletter Design',
    'Campaign Management',
    'Automation Emails',
    'Email Templates',
  ],

  'branding-identity': [
    'Brand Guidelines',
    'Company Identity',
    'Packaging Branding',
    'Brand Strategy',
    'Typography Design',
  ],

  'nft-blockchain': [
    'NFT Art',
    'Smart Contracts',
    'Crypto Wallets',
    'Blockchain Apps',
    'Web3 Development',
  ],

  'chatbot-development': [
    'AI Chatbots',
    'WhatsApp Bots',
    'Telegram Bots',
    'Customer Support Bots',
    'Website Chatbots',
  ],

  'script-writing': [
    'YouTube Scripts',
    'Movie Scripts',
    'Ad Scripts',
    'Story Scripts',
    'Podcast Scripts',
  ],

  'presentation-design': [
    'PowerPoint Design',
    'Pitch Decks',
    'Business Presentations',
    'Investor Decks',
    'Google Slides Design',
  ],

  'product-design': [
    'Prototype Design',
    'Industrial Design',
    'Packaging Concepts',
    'Product Sketches',
    '3D Product Design',
  ],

  'legal-services': [
    'Contract Writing',
    'Legal Consulting',
    'Privacy Policies',
    'Terms & Conditions',
    'Trademark Help',
  ],
}

// Build the exported GIG_SUBCATEGORIES with {name, slug} objects
export const GIG_SUBCATEGORIES: Record<string, { name: string; slug: string }[]> = {}
for (const [parentSlug, names] of Object.entries(rawSubcategories)) {
  GIG_SUBCATEGORIES[parentSlug] = buildSubcategories(parentSlug, names)
}

// Also export the raw data for seeding (just names)
export { rawSubcategories }
export { toSlug }
