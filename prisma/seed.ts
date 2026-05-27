import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

// =============================================================================
// Marketo Marketplace - Database Seed Script
// =============================================================================

const SALT_ROUNDS = 10

// Color presets from constants
const SHOP_COLOR_PRESETS = [
  { name: 'Default Purple', primary: '#6366f1', secondary: '#8b5cf6', accent: '#a78bfa' },
  { name: 'Ocean Blue', primary: '#0ea5e9', secondary: '#06b6d4', accent: '#67e8f9' },
  { name: 'Forest Green', primary: '#22c55e', secondary: '#16a34a', accent: '#4ade80' },
  { name: 'Sunset Orange', primary: '#f97316', secondary: '#ea580c', accent: '#fb923c' },
  { name: 'Rose Pink', primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' },
  { name: 'Warm Red', primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' },
  { name: 'Slate Dark', primary: '#475569', secondary: '#334155', accent: '#94a3b8' },
  { name: 'Amber Gold', primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
  { name: 'Teal', primary: '#14b8a6', secondary: '#0d9488', accent: '#5eead4' },
  { name: 'Crimson', primary: '#be123c', secondary: '#9f1239', accent: '#f43f5e' },
]

// Default categories from constants
const DEFAULT_CATEGORIES = [
  { name: 'Digital Downloads', slug: 'digital-downloads', icon: 'Download', sortOrder: 0, description: 'Downloadable digital products and resources' },
  { name: 'E-Books', slug: 'ebooks', icon: 'BookOpen', sortOrder: 1, description: 'Electronic books and publications' },
  { name: 'Software & Tools', slug: 'software-tools', icon: 'Code', sortOrder: 2, description: 'Software applications and development tools' },
  { name: 'Templates & Themes', slug: 'templates-themes', icon: 'Layout', sortOrder: 3, description: 'Website templates, themes, and UI kits' },
  { name: 'Courses & Tutorials', slug: 'courses-tutorials', icon: 'GraduationCap', sortOrder: 4, description: 'Online courses and learning materials' },
  { name: 'Graphics & Design', slug: 'graphics-design', icon: 'Palette', sortOrder: 5, description: 'Graphic design assets and resources' },
  { name: 'Music & Audio', slug: 'music-audio', icon: 'Music', sortOrder: 6, description: 'Music tracks, sound effects, and audio resources' },
  { name: 'Photography', slug: 'photography', icon: 'Camera', sortOrder: 7, description: 'Stock photos and photography resources' },
  { name: 'Physical Goods', slug: 'physical-goods', icon: 'Package', sortOrder: 8, description: 'Tangible products that require shipping' },
  { name: 'Clothing & Apparel', slug: 'clothing-apparel', icon: 'Shirt', sortOrder: 9, description: 'Clothing, accessories, and fashion items' },
  { name: 'Art & Crafts', slug: 'art-crafts', icon: 'Paintbrush', sortOrder: 10, description: 'Handmade art and craft items' },
  { name: 'Freelance Services', slug: 'freelance-services', icon: 'Briefcase', sortOrder: 11, description: 'Professional freelance services' },
  { name: 'Web Development', slug: 'web-development', icon: 'Globe', sortOrder: 12, description: 'Web development and programming services' },
  { name: 'Writing & Translation', slug: 'writing-translation', icon: 'PenTool', sortOrder: 13, description: 'Content writing and translation services' },
  { name: 'Consulting', slug: 'consulting', icon: 'MessageSquare', sortOrder: 14, description: 'Business and professional consulting' },
]

async function main() {
  console.log('🌱 Starting Marketo database seed...\n')

  // ---- Clear existing data ----
  console.log('🧹 Clearing existing data...')
  await db.notification.deleteMany()
  await db.dispute.deleteMany()
  await db.message.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.review.deleteMany()
  await db.favorite.deleteMany()
  await db.socialLink.deleteMany()
  await db.product.deleteMany()
  await db.shop.deleteMany()
  await db.category.deleteMany()
  await db.platformStats.deleteMany()
  await db.user.deleteMany()
  console.log('  ✅ All existing data cleared\n')

  // =========================================================================
  // 1. Create Users
  // =========================================================================
  console.log('👤 Creating users...')

  const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS)
  const userPassword = await bcrypt.hash('password123', SALT_ROUNDS)

  // Admin user
  const admin = await db.user.create({
    data: {
      email: 'admin@marketo.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'both',
      isAdmin: true,
      isVerified: true,
      isActive: true,
      bio: 'Platform administrator for Marketo marketplace.',
    },
  })
  console.log(`  ✅ Admin: ${admin.email}`)

  // Seller users
  const sellerData = [
    { name: 'Sarah Chen', email: 'sarah@digitalcrafts.com', bio: 'Digital product creator with a passion for beautiful design and clean code.' },
    { name: 'Marcus Johnson', email: 'marcus@codedesign.com', bio: 'Full-stack developer and UI/UX designer creating premium digital assets.' },
    { name: 'Elena Rodriguez', email: 'elena@creativemarket.com', bio: 'Award-winning graphic designer specializing in brand identity and illustration.' },
    { name: 'James Wilson', email: 'james@handmadehaven.com', bio: 'Artisan crafter creating unique handmade goods with sustainable materials.' },
    { name: 'Priya Patel', email: 'priya@techsolutions.com', bio: 'Tech consultant and software architect with 10+ years of industry experience.' },
  ]

  const sellers = []
  for (const s of sellerData) {
    const seller = await db.user.create({
      data: {
        email: s.email,
        password: userPassword,
        name: s.name,
        role: 'both',
        isVerified: true,
        isActive: true,
        bio: s.bio,
      },
    })
    sellers.push(seller)
    console.log(`  ✅ Seller: ${seller.name} (${seller.email})`)
  }

  // Buyer users
  const buyerData = [
    { name: 'Alex Thompson', email: 'alex.thompson@email.com', bio: 'Design enthusiast and digital nomad.' },
    { name: 'Mia Nakamura', email: 'mia.nakamura@email.com', bio: 'Startup founder looking for great tools and resources.' },
    { name: 'David Kim', email: 'david.kim@email.com', bio: 'Freelance developer who loves collecting digital assets.' },
    { name: 'Olivia Brown', email: 'olivia.brown@email.com', bio: 'Creative professional and avid online shopper.' },
    { name: 'Ryan O\'Brien', email: 'ryan.obrien@email.com', bio: 'Tech hobbyist and digital product collector.' },
  ]

  const buyers = []
  for (const b of buyerData) {
    const buyer = await db.user.create({
      data: {
        email: b.email,
        password: userPassword,
        name: b.name,
        role: 'buyer',
        isVerified: true,
        isActive: true,
        bio: b.bio,
      },
    })
    buyers.push(buyer)
    console.log(`  ✅ Buyer: ${buyer.name} (${buyer.email})`)
  }

  console.log()

  // =========================================================================
  // 2. Create Categories
  // =========================================================================
  console.log('📂 Creating categories...')

  const categories = []
  for (const cat of DEFAULT_CATEGORIES) {
    const category = await db.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    })
    categories.push(category)
  }
  console.log(`  ✅ Created ${categories.length} categories\n`)

  // Helper to find category by slug
  const getCategory = (slug: string) => categories.find(c => c.slug === slug)!

  // =========================================================================
  // 3. Create Shops
  // =========================================================================
  console.log('🏪 Creating shops...')

  const shopData = [
    {
      userId: sellers[0].id,
      name: 'Digital Crafts Studio',
      slug: 'digital-crafts-studio',
      description: 'Premium digital products crafted with care. From UI kits to design systems, we create tools that help you build faster.',
      about: 'Digital Crafts Studio was founded in 2022 with a mission to create beautiful, functional digital products. Our team of designers and developers work tirelessly to deliver assets that are both aesthetically pleasing and highly practical. Every product is meticulously crafted and thoroughly tested.',
      contactEmail: 'hello@digitalcrafts.com',
      contactPhone: '+1 (555) 123-4567',
      address: '456 Creative Ave, San Francisco, CA 94102',
      colorPreset: SHOP_COLOR_PRESETS[0], // Default Purple
      layoutStyle: 'grid' as const,
      displayStyle: 'modern' as const,
      customSections: [
        { title: 'Our Process', type: 'text', content: 'We follow a rigorous design process: Research → Concept → Design → Test → Refine → Deliver. Each step ensures our products meet the highest standards of quality and usability.' },
        { title: 'FAQ', type: 'faq', content: JSON.stringify([
          { question: 'Do you offer refunds?', answer: 'Yes, we offer a 30-day money-back guarantee on all products.' },
          { question: 'Can I use your products commercially?', answer: 'All our products come with a commercial license included.' },
          { question: 'Do you offer support?', answer: 'We provide email support for all our products within 24 hours.' },
        ]) },
      ],
      socialLinks: [
        { platform: 'twitter', url: 'https://twitter.com/digitalcrafts' },
        { platform: 'github', url: 'https://github.com/digitalcrafts' },
        { platform: 'website', url: 'https://digitalcrafts.com' },
      ],
    },
    {
      userId: sellers[1].id,
      name: 'Code & Design Hub',
      slug: 'code-design-hub',
      description: 'Where code meets creativity. We build developer tools, code snippets, and design resources that supercharge your workflow.',
      about: 'Code & Design Hub bridges the gap between development and design. Founded by Marcus Johnson, a full-stack developer with a passion for creating tools that make developers\' lives easier. Our products range from boilerplate code to complete design systems.',
      contactEmail: 'support@codedesignhub.com',
      contactPhone: '+1 (555) 234-5678',
      address: '789 Dev Street, Austin, TX 73301',
      colorPreset: SHOP_COLOR_PRESETS[8], // Teal
      layoutStyle: 'featured' as const,
      displayStyle: 'modern' as const,
      customSections: [
        { title: 'Why Choose Us?', type: 'text', content: 'Our products are built by developers, for developers. We understand the challenges you face and create solutions that integrate seamlessly into your workflow. Clean code, comprehensive documentation, and active support.' },
      ],
      socialLinks: [
        { platform: 'github', url: 'https://github.com/codedesignhub' },
        { platform: 'linkedin', url: 'https://linkedin.com/company/codedesignhub' },
      ],
    },
    {
      userId: sellers[2].id,
      name: 'Creative Market Shop',
      slug: 'creative-market-shop',
      description: 'Hand-picked design assets, illustrations, and creative resources for designers who demand excellence.',
      about: 'Creative Market Shop is Elena Rodriguez\'s passion project. With over 15 years of experience in graphic design, Elena curates and creates design assets that are both trendy and timeless. Every product reflects a commitment to quality and artistic expression.',
      contactEmail: 'elena@creativemarketshop.com',
      contactPhone: '+1 (555) 345-6789',
      address: '321 Art Boulevard, New York, NY 10001',
      colorPreset: SHOP_COLOR_PRESETS[4], // Rose Pink
      layoutStyle: 'grid' as const,
      displayStyle: 'classic' as const,
      customSections: [
        { title: 'Testimonials', type: 'testimonials', content: JSON.stringify([
          { name: 'Lisa M.', text: 'Absolutely stunning designs! The quality is unmatched.', rating: 5 },
          { name: 'Tom R.', text: 'Elena\'s templates saved me weeks of work. Highly recommended!', rating: 5 },
          { name: 'Sarah K.', text: 'Beautiful illustrations with incredible attention to detail.', rating: 4 },
        ]) },
        { title: 'Banner', type: 'banner', content: 'New collection: Spring 2025 Design Pack — 50% off for the first week!' },
      ],
      socialLinks: [
        { platform: 'instagram', url: 'https://instagram.com/creativemarketshop' },
        { platform: 'twitter', url: 'https://twitter.com/creativemshop' },
        { platform: 'website', url: 'https://creativemarketshop.com' },
      ],
    },
    {
      userId: sellers[3].id,
      name: 'Handmade Haven',
      slug: 'handmade-haven',
      description: 'Artisanal handmade goods crafted with love. Sustainable, unique, and made to last.',
      about: 'Handmade Haven is James Wilson\'s workshop turned online store. Every item is handcrafted using sustainable materials and traditional techniques. From hand-carved wooden pieces to organic cotton textiles, each product tells a story of craftsmanship and care for the environment.',
      contactEmail: 'james@handmadehaven.com',
      contactPhone: '+1 (555) 456-7890',
      address: '55 Craft Lane, Portland, OR 97201',
      colorPreset: SHOP_COLOR_PRESETS[3], // Sunset Orange
      layoutStyle: 'grid' as const,
      displayStyle: 'minimal' as const,
      customSections: [
        { title: 'Our Story', type: 'text', content: 'What started as a weekend hobby in 2019 has grown into a full-time passion. Each piece is made by hand in our Portland workshop using locally sourced, sustainable materials. We believe in slow, intentional creation — every item has a story.' },
      ],
      socialLinks: [
        { platform: 'instagram', url: 'https://instagram.com/handmadehaven' },
        { platform: 'facebook', url: 'https://facebook.com/handmadehaven' },
      ],
    },
    {
      userId: sellers[4].id,
      name: 'Tech Solutions Pro',
      slug: 'tech-solutions-pro',
      description: 'Professional tech consulting, custom software development, and IT solutions for businesses of all sizes.',
      about: 'Tech Solutions Pro, led by Priya Patel, delivers enterprise-grade consulting and development services. With expertise spanning cloud architecture, web development, and system design, we help businesses transform their digital presence and optimize their technology stack.',
      contactEmail: 'info@techsolutionspro.com',
      contactPhone: '+1 (555) 567-8901',
      address: '100 Tech Park, Seattle, WA 98101',
      colorPreset: SHOP_COLOR_PRESETS[6], // Slate Dark
      layoutStyle: 'list' as const,
      displayStyle: 'modern' as const,
      customSections: [
        { title: 'Our Expertise', type: 'text', content: 'We specialize in cloud-native architectures, microservices, and full-stack web development. Our team has delivered solutions for Fortune 500 companies and innovative startups alike.' },
        { title: 'FAQ', type: 'faq', content: JSON.stringify([
          { question: 'What is your typical project timeline?', answer: 'Most projects take 4-12 weeks depending on scope and complexity.' },
          { question: 'Do you offer ongoing support?', answer: 'Yes, we offer monthly retainer packages for ongoing support and maintenance.' },
          { question: 'What technologies do you work with?', answer: 'React, Next.js, Node.js, Python, AWS, GCP, and more.' },
        ]) },
      ],
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com/company/techsolutionspro' },
        { platform: 'twitter', url: 'https://twitter.com/techsolpro' },
        { platform: 'github', url: 'https://github.com/techsolutionspro' },
        { platform: 'website', url: 'https://techsolutionspro.com' },
      ],
    },
  ]

  const shops = []
  for (const s of shopData) {
    const shop = await db.shop.create({
      data: {
        userId: s.userId,
        name: s.name,
        slug: s.slug,
        description: s.description,
        about: s.about,
        contactEmail: s.contactEmail,
        contactPhone: s.contactPhone,
        address: s.address,
        primaryColor: s.colorPreset.primary,
        secondaryColor: s.colorPreset.secondary,
        accentColor: s.colorPreset.accent,
        layoutStyle: s.layoutStyle,
        displayStyle: s.displayStyle,
        customSections: JSON.stringify(s.customSections),
        isApproved: true,
        isActive: true,
      },
    })

    // Create social links for this shop
    for (const sl of s.socialLinks) {
      await db.socialLink.create({
        data: {
          userId: s.userId,
          shopId: shop.id,
          platform: sl.platform,
          url: sl.url,
        },
      })
    }

    shops.push(shop)
    console.log(`  ✅ Shop: ${shop.name} (${shop.slug})`)
  }
  console.log()

  // =========================================================================
  // 4. Create Products
  // =========================================================================
  console.log('📦 Creating products...')

  // Products for shop 0 (Digital Crafts Studio)
  const productsData = [
    // Shop 0: Digital Crafts Studio - Digital products
    {
      shopId: shops[0].id,
      categoryId: getCategory('templates-themes').id,
      name: 'Starter UI Kit Pro',
      slug: 'starter-ui-kit-pro',
      description: 'A comprehensive UI kit with 200+ components, 50+ page templates, and a complete design system. Built with modern design principles and fully customizable. Includes dark mode support, responsive layouts, and accessibility features out of the box.',
      shortDesc: '200+ components & 50+ page templates for modern apps',
      price: 79,
      comparePrice: 129,
      type: 'digital',
      tags: ['ui-kit', 'design-system', 'components', 'templates'],
      isFeatured: true,
      fileUrl: '/files/starter-ui-kit-pro.zip',
      fileSize: '245 MB',
      stock: -1,
    },
    {
      shopId: shops[0].id,
      categoryId: getCategory('graphics-design').id,
      name: '3D Icon Collection',
      slug: '3d-icon-collection',
      description: '500+ beautifully crafted 3D icons in multiple formats (SVG, PNG, Figma). Perfect for web and mobile applications. Each icon comes in 5 color variations and 3 sizes. Regularly updated with new icons.',
      shortDesc: '500+ 3D icons in SVG, PNG, and Figma formats',
      price: 49,
      comparePrice: 69,
      type: 'digital',
      tags: ['icons', '3d', 'svg', 'figma'],
      isFeatured: true,
      fileUrl: '/files/3d-icons.zip',
      fileSize: '180 MB',
      stock: -1,
    },
    {
      shopId: shops[0].id,
      categoryId: getCategory('digital-downloads').id,
      name: 'Dashboard Wireframe Pack',
      slug: 'dashboard-wireframe-pack',
      description: 'Professional wireframe templates for dashboard design. 30 unique dashboard layouts covering analytics, e-commerce, project management, and more. Available in Figma and Sketch formats.',
      shortDesc: '30 dashboard wireframe templates for rapid prototyping',
      price: 29,
      type: 'digital',
      tags: ['wireframes', 'dashboard', 'figma', 'sketch'],
      isFeatured: false,
      fileUrl: '/files/dashboard-wireframes.zip',
      fileSize: '85 MB',
      stock: -1,
    },
    {
      shopId: shops[0].id,
      categoryId: getCategory('templates-themes').id,
      name: 'Landing Page Templates',
      slug: 'landing-page-templates',
      description: '15 high-converting landing page templates with modern design. Fully responsive, SEO-optimized, and easy to customize. Includes source files and documentation.',
      shortDesc: '15 high-converting responsive landing page templates',
      price: 59,
      comparePrice: 89,
      type: 'digital',
      tags: ['landing-page', 'templates', 'marketing', 'responsive'],
      isFeatured: false,
      fileUrl: '/files/landing-pages.zip',
      fileSize: '150 MB',
      stock: -1,
    },

    // Shop 1: Code & Design Hub - Mix of digital and freelance
    {
      shopId: shops[1].id,
      categoryId: getCategory('software-tools').id,
      name: 'DevOps CLI Toolkit',
      slug: 'devops-cli-toolkit',
      description: 'A powerful command-line toolkit for DevOps engineers. Automate deployments, monitor infrastructure, and manage configurations with ease. Supports AWS, GCP, and Azure. Includes 50+ pre-built scripts and comprehensive documentation.',
      shortDesc: 'CLI toolkit with 50+ scripts for DevOps automation',
      price: 99,
      comparePrice: 149,
      type: 'digital',
      tags: ['devops', 'cli', 'automation', 'cloud'],
      isFeatured: true,
      fileUrl: '/files/devops-toolkit.tar.gz',
      fileSize: '12 MB',
      stock: -1,
    },
    {
      shopId: shops[1].id,
      categoryId: getCategory('web-development').id,
      name: 'Full-Stack Boilerplate',
      slug: 'full-stack-boilerplate',
      description: 'Production-ready Next.js boilerplate with authentication, database, payments, and more. Save weeks of development time with our battle-tested starter. Includes TypeScript, Prisma, Tailwind CSS, and comprehensive testing setup.',
      shortDesc: 'Production-ready Next.js boilerplate with auth & payments',
      price: 149,
      comparePrice: 199,
      type: 'digital',
      tags: ['nextjs', 'boilerplate', 'typescript', 'fullstack'],
      isFeatured: true,
      fileUrl: '/files/fullstack-boilerplate.tar.gz',
      fileSize: '8 MB',
      stock: -1,
    },
    {
      shopId: shops[1].id,
      categoryId: getCategory('web-development').id,
      name: 'Custom API Development',
      slug: 'custom-api-development',
      description: 'Need a custom REST or GraphQL API? We\'ll build it for you. Our experienced developers will create a scalable, well-documented API tailored to your specific requirements. Includes architecture design, implementation, testing, and deployment.',
      shortDesc: 'Custom REST/GraphQL API built to your specifications',
      price: 499,
      type: 'freelance',
      tags: ['api', 'rest', 'graphql', 'backend'],
      isFeatured: true,
      deliveryInfo: '2-4 weeks depending on complexity',
      requirements: 'Detailed API requirements document, preferred tech stack, authentication needs, and expected traffic volume',
      stock: -1,
    },
    {
      shopId: shops[1].id,
      categoryId: getCategory('software-tools').id,
      name: 'React Component Library',
      slug: 'react-component-library',
      description: 'A curated collection of 100+ production-ready React components. Accessible, performant, and fully typed with TypeScript. Includes forms, data tables, charts, modals, and more.',
      shortDesc: '100+ production-ready React components with TypeScript',
      price: 69,
      type: 'digital',
      tags: ['react', 'components', 'typescript', 'library'],
      isFeatured: false,
      fileUrl: '/files/react-components.tar.gz',
      fileSize: '15 MB',
      stock: -1,
    },

    // Shop 2: Creative Market Shop - Digital design assets
    {
      shopId: shops[2].id,
      categoryId: getCategory('graphics-design').id,
      name: 'Watercolor Illustration Pack',
      slug: 'watercolor-illustration-pack',
      description: '200+ hand-painted watercolor illustrations perfect for branding, social media, and print. High-resolution PNG files with transparent backgrounds. Includes flowers, animals, landscapes, and abstract shapes.',
      shortDesc: '200+ hand-painted watercolor illustrations',
      price: 39,
      comparePrice: 59,
      type: 'digital',
      tags: ['watercolor', 'illustration', 'design', 'branding'],
      isFeatured: true,
      fileUrl: '/files/watercolor-pack.zip',
      fileSize: '520 MB',
      stock: -1,
    },
    {
      shopId: shops[2].id,
      categoryId: getCategory('graphics-design').id,
      name: 'Brand Identity Template',
      slug: 'brand-identity-template',
      description: 'Complete brand identity template with logo variations, color palettes, typography systems, business card designs, letterheads, and social media templates. Fully editable in Adobe Illustrator and Figma.',
      shortDesc: 'Complete brand identity kit with logo & stationery designs',
      price: 89,
      comparePrice: 129,
      type: 'digital',
      tags: ['branding', 'identity', 'logo', 'design'],
      isFeatured: true,
      fileUrl: '/files/brand-identity.zip',
      fileSize: '340 MB',
      stock: -1,
    },
    {
      shopId: shops[2].id,
      categoryId: getCategory('photography').id,
      name: 'Stock Photo Collection: Urban Life',
      slug: 'stock-photo-urban-life',
      description: '300+ curated urban lifestyle photographs shot in major cities worldwide. Perfect for websites, marketing materials, and social media. High-resolution (4K+) with commercial license included.',
      shortDesc: '300+ curated urban lifestyle stock photos',
      price: 49,
      type: 'digital',
      tags: ['stock-photos', 'urban', 'lifestyle', 'photography'],
      isFeatured: false,
      fileUrl: '/files/urban-photos.zip',
      fileSize: '2.1 GB',
      stock: -1,
    },
    {
      shopId: shops[2].id,
      categoryId: getCategory('graphics-design').id,
      name: 'Social Media Templates Bundle',
      slug: 'social-media-templates-bundle',
      description: '150+ social media templates for Instagram, Facebook, Twitter, and LinkedIn. Editable in Canva and Figma. Includes stories, posts, carousels, and ads templates in multiple themes.',
      shortDesc: '150+ social media templates for all major platforms',
      price: 35,
      comparePrice: 55,
      type: 'digital',
      tags: ['social-media', 'templates', 'instagram', 'marketing'],
      isFeatured: false,
      fileUrl: '/files/social-media-templates.zip',
      fileSize: '280 MB',
      stock: -1,
    },

    // Shop 3: Handmade Haven - Physical products
    {
      shopId: shops[3].id,
      categoryId: getCategory('art-crafts').id,
      name: 'Hand-Carved Wooden Desk Organizer',
      slug: 'hand-carved-wooden-desk-organizer',
      description: 'Beautifully hand-carved desk organizer made from sustainably sourced walnut wood. Features compartments for pens, cards, phone, and small items. Each piece is unique with natural wood grain patterns. Finished with natural beeswax.',
      shortDesc: 'Hand-carved walnut wood desk organizer',
      price: 89,
      comparePrice: 120,
      type: 'physical',
      tags: ['wooden', 'handmade', 'desk', 'organizer'],
      isFeatured: true,
      stock: 15,
      sku: 'HH-WDO-001',
      deliveryInfo: 'Ships within 3-5 business days. Free shipping on orders over $75.',
    },
    {
      shopId: shops[3].id,
      categoryId: getCategory('clothing-apparel').id,
      name: 'Organic Cotton Knit Scarf',
      slug: 'organic-cotton-knit-scarf',
      description: 'Soft, warm scarf hand-knitted from 100% organic cotton. Available in earth-tone colors. Lightweight yet warm, perfect for transitional weather. Machine washable.',
      shortDesc: 'Hand-knitted organic cotton scarf in earth tones',
      price: 45,
      type: 'physical',
      tags: ['scarf', 'organic', 'handmade', 'cotton'],
      isFeatured: false,
      stock: 25,
      sku: 'HH-OCS-002',
      deliveryInfo: 'Ships within 2-3 business days. Standard shipping $5.99.',
    },
    {
      shopId: shops[3].id,
      categoryId: getCategory('art-crafts').id,
      name: 'Ceramic Planter Set',
      slug: 'ceramic-planter-set',
      description: 'Set of 3 hand-thrown ceramic planters in varying sizes. Each planter features a unique glaze pattern. Perfect for succulents, herbs, or small plants. Includes drainage holes and bamboo saucers.',
      shortDesc: 'Set of 3 hand-thrown ceramic planters with saucers',
      price: 65,
      comparePrice: 85,
      type: 'physical',
      tags: ['ceramic', 'planter', 'handmade', 'home-decor'],
      isFeatured: true,
      stock: 10,
      sku: 'HH-CPS-003',
      deliveryInfo: 'Ships within 5-7 business days. Fragile — carefully packaged.',
    },
    {
      shopId: shops[3].id,
      categoryId: getCategory('physical-goods').id,
      name: 'Beeswax Candle Collection',
      slug: 'beeswax-candle-collection',
      description: 'Set of 5 hand-poured beeswax candles in different shapes. Natural honey scent, no artificial fragrances. Clean-burning and long-lasting. Each candle burns for 20-40 hours.',
      shortDesc: 'Set of 5 hand-poured beeswax candles',
      price: 38,
      type: 'physical',
      tags: ['candles', 'beeswax', 'handmade', 'natural'],
      isFeatured: false,
      stock: 30,
      sku: 'HH-BCC-004',
      deliveryInfo: 'Ships within 2-3 business days. Standard shipping $5.99.',
    },

    // Shop 4: Tech Solutions Pro - Freelance services and digital
    {
      shopId: shops[4].id,
      categoryId: getCategory('consulting').id,
      name: 'Cloud Architecture Consulting',
      slug: 'cloud-architecture-consulting',
      description: 'Expert cloud architecture consulting for AWS, GCP, and Azure. We\'ll review your current infrastructure, identify optimization opportunities, and create a roadmap for scaling. Includes detailed documentation and cost analysis.',
      shortDesc: 'Expert cloud architecture review and optimization plan',
      price: 299,
      type: 'freelance',
      tags: ['cloud', 'aws', 'architecture', 'consulting'],
      isFeatured: true,
      deliveryInfo: 'Initial consultation within 48 hours, full report within 1 week',
      requirements: 'Current infrastructure overview, main pain points, growth projections, and budget considerations',
      stock: -1,
    },
    {
      shopId: shops[4].id,
      categoryId: getCategory('web-development').id,
      name: 'E-Commerce Website Development',
      slug: 'ecommerce-website-development',
      description: 'Custom e-commerce website development with modern tech stack. Includes product catalog, shopping cart, payment integration (Stripe/PayPal), admin dashboard, and SEO optimization. Mobile-first responsive design.',
      shortDesc: 'Custom e-commerce site with payments & admin dashboard',
      price: 1999,
      comparePrice: 2999,
      type: 'freelance',
      tags: ['ecommerce', 'web-development', 'shopify', 'nextjs'],
      isFeatured: true,
      deliveryInfo: '4-8 weeks depending on features and complexity',
      requirements: 'Product catalog size, preferred payment gateways, shipping requirements, design preferences, and any specific features needed',
      stock: -1,
    },
    {
      shopId: shops[4].id,
      categoryId: getCategory('courses-tutorials').id,
      name: 'System Design Masterclass',
      slug: 'system-design-masterclass',
      description: 'Comprehensive system design course covering distributed systems, scalability, and architecture patterns. 40+ hours of video content, real-world case studies, and practice problems. Perfect for senior engineer interviews.',
      shortDesc: '40+ hour system design course with real-world case studies',
      price: 129,
      comparePrice: 199,
      type: 'digital',
      tags: ['system-design', 'course', 'distributed-systems', 'interview'],
      isFeatured: false,
      fileUrl: '/files/system-design-course.zip',
      fileSize: '8.5 GB',
      stock: -1,
    },
    {
      shopId: shops[4].id,
      categoryId: getCategory('writing-translation').id,
      name: 'Technical Documentation Service',
      slug: 'technical-documentation-service',
      description: 'Professional technical documentation writing for software products. We create clear, comprehensive docs that your users will love. Includes API documentation, user guides, tutorials, and developer references.',
      shortDesc: 'Professional technical documentation for software products',
      price: 399,
      type: 'freelance',
      tags: ['documentation', 'technical-writing', 'api-docs', 'guides'],
      isFeatured: false,
      deliveryInfo: '1-3 weeks depending on documentation scope',
      requirements: 'Product overview, target audience, existing documentation (if any), preferred format and style guide',
      stock: -1,
    },
  ]

  const products = []
  for (const p of productsData) {
    const { tags, ...rest } = p
    const product = await db.product.create({
      data: {
        ...rest,
        tags: JSON.stringify(tags),
        images: '[]',
        totalSales: Math.floor(Math.random() * 50) + 5,
        totalReviews: Math.floor(Math.random() * 15),
        averageRating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        isApproved: true,
        isActive: true,
      },
    })
    products.push(product)
  }
  console.log(`  ✅ Created ${products.length} products\n`)

  // Update shop totalSales based on products
  for (const shop of shops) {
    const shopProducts = products.filter(p => p.shopId === shop.id)
    const totalSales = shopProducts.reduce((sum, p) => sum + p.totalSales, 0)
    await db.shop.update({
      where: { id: shop.id },
      data: { totalSales },
    })
  }

  // =========================================================================
  // 5. Create Orders
  // =========================================================================
  console.log('🛒 Creating orders...')

  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'delivered', 'delivered', 'processing', 'pending', 'delivered', 'shipped']
  const paymentStatuses: Record<string, string> = {
    pending: 'pending',
    processing: 'paid',
    shipped: 'paid',
    delivered: 'paid',
    cancelled: 'refunded',
  }

  const orders = []
  for (let i = 0; i < 10; i++) {
    const buyer = buyers[i % buyers.length]
    const sellerIndex = Math.floor(Math.random() * sellers.length)
    const seller = sellers[sellerIndex]
    const sellerShop = shops[sellerIndex]

    // Pick 1-3 products from this seller's shop
    const shopProducts = products.filter(p => p.shopId === sellerShop.id)
    const numItems = Math.min(Math.floor(Math.random() * 3) + 1, shopProducts.length)
    const selectedProducts = shopProducts.sort(() => Math.random() - 0.5).slice(0, numItems)

    const status = orderStatuses[i]
    const paymentStatus = paymentStatuses[status]

    // Calculate total
    let totalAmount = 0
    const orderItemsData = selectedProducts.map(p => {
      const qty = p.type === 'digital' || p.type === 'freelance' ? 1 : Math.floor(Math.random() * 3) + 1
      const itemTotal = p.price * qty
      totalAmount += itemTotal
      return { productId: p.id, quantity: qty, price: p.price, type: p.type }
    })

    const platformFee = Math.round(totalAmount * 0.05 * 100) / 100

    const order = await db.order.create({
      data: {
        buyerId: buyer.id,
        sellerId: seller.id,
        status,
        totalAmount: Math.round(totalAmount * 100) / 100,
        platformFee,
        paymentMethod: 'card',
        paymentStatus,
        shippingName: status !== 'pending' ? buyer.name : undefined,
        shippingAddr: status !== 'pending' ? `${100 + i} Main Street` : undefined,
        shippingCity: status !== 'pending' ? ['San Francisco', 'New York', 'Austin', 'Seattle', 'Portland'][i % 5] : undefined,
        shippingZip: status !== 'pending' ? `${10000 + i * 1111}` : undefined,
        shippingPhone: status !== 'pending' ? `+1 (555) ${100 + i}-${1000 + i}` : undefined,
        trackingNo: status === 'shipped' || status === 'delivered' ? `TRK${Date.now()}${i}` : undefined,
        items: {
          create: orderItemsData,
        },
      },
    })
    orders.push(order)
  }
  console.log(`  ✅ Created ${orders.length} orders\n`)

  // =========================================================================
  // 6. Create Reviews
  // =========================================================================
  console.log('⭐ Creating reviews...')

  const reviewData = [
    { userId: buyers[0].id, productId: products[0].id, rating: 5, title: 'Absolutely fantastic!', comment: 'The UI kit is incredibly well-designed. Every component is pixel-perfect and the documentation is thorough. Saved me weeks of work!' },
    { userId: buyers[1].id, productId: products[1].id, rating: 4, title: 'Great icon set', comment: 'Beautiful 3D icons with lots of variety. The only reason I\'m not giving 5 stars is I wish there were more business-related icons.' },
    { userId: buyers[2].id, productId: products[4].id, rating: 5, title: 'Must-have for DevOps', comment: 'This CLI toolkit has streamlined our entire deployment pipeline. The scripts are well-written and easy to customize.' },
    { userId: buyers[3].id, productId: products[5].id, rating: 5, title: 'Best boilerplate I\'ve used', comment: 'Incredibly comprehensive boilerplate. Authentication, payments, database — everything just works out of the box. The code quality is top-notch.' },
    { userId: buyers[4].id, productId: products[8].id, rating: 4, title: 'Beautiful illustrations', comment: 'The watercolor illustrations are gorgeous. They add a lovely organic feel to my designs. Would love even more variety in the future.' },
    { userId: buyers[0].id, productId: products[12].id, rating: 5, title: 'Stunning craftsmanship', comment: 'This desk organizer is a work of art. The wood grain is beautiful and the carving is incredibly detailed. It\'s the centerpiece of my desk now!' },
    { userId: buyers[1].id, productId: products[9].id, rating: 5, title: 'Professional brand kit', comment: 'Complete and professional brand identity template. The logo variations and color palette are exactly what I needed for my rebranding project.' },
    { userId: buyers[2].id, productId: products[16].id, rating: 4, title: 'Great consulting session', comment: 'Priya\'s cloud architecture review was thorough and actionable. The cost optimization suggestions alone will save us thousands. Just wish the report was delivered a bit faster.' },
    { userId: buyers[3].id, productId: products[14].id, rating: 5, title: 'Perfect gift', comment: 'Bought these planters as a gift and they were a huge hit! The glazing is beautiful and each one is truly unique. Excellent packaging too — nothing was damaged.' },
    { userId: buyers[4].id, productId: products[6].id, rating: 3, title: 'Good but overpriced', comment: 'The API development service was competent and the final product works well. However, I expected more proactive communication during the project. The price feels a bit steep for what you get.' },
  ]

  // Also add some shop reviews
  const shopReviewData = [
    { userId: buyers[0].id, shopId: shops[0].id, rating: 5, title: 'My go-to design shop', comment: 'Digital Crafts Studio consistently delivers high-quality products. I\'ve purchased multiple items and have never been disappointed.' },
    { userId: buyers[2].id, shopId: shops[1].id, rating: 5, title: 'Excellent developer resources', comment: 'Code & Design Hub provides tools that actually make a difference in my workflow. The boilerplate alone saved me a month of development time.' },
    { userId: buyers[3].id, shopId: shops[3].id, rating: 5, title: 'Beautiful handmade goods', comment: 'Everything from Handmade Haven is crafted with such care and attention to detail. The sustainable materials are a big plus too!' },
  ]

  const reviews = []
  for (const r of reviewData) {
    const review = await db.review.create({
      data: {
        userId: r.userId,
        productId: r.productId,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isVerified: true,
      },
    })
    reviews.push(review)
  }

  for (const r of shopReviewData) {
    const review = await db.review.create({
      data: {
        userId: r.userId,
        shopId: r.shopId,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isVerified: true,
      },
    })
    reviews.push(review)
  }
  console.log(`  ✅ Created ${reviews.length} reviews\n`)

  // Update product average ratings based on reviews
  for (const product of products) {
    const productReviews = reviews.filter(r => r.productId === product.id)
    if (productReviews.length > 0) {
      const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
      await db.product.update({
        where: { id: product.id },
        data: {
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: productReviews.length,
        },
      })
    }
  }

  // Update shop average ratings based on reviews
  for (const shop of shops) {
    const shopReviews = reviews.filter(r => r.shopId === shop.id)
    if (shopReviews.length > 0) {
      const avgRating = shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length
      await db.shop.update({
        where: { id: shop.id },
        data: {
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: shopReviews.length,
        },
      })
    }
  }

  // =========================================================================
  // 7. Create Notifications
  // =========================================================================
  console.log('🔔 Creating notifications...')

  const allUsers = [admin, ...sellers, ...buyers]
  let notificationCount = 0

  for (const user of allUsers) {
    const notifications = [
      {
        userId: user.id,
        title: 'Welcome to Marketo!',
        message: `Welcome to Marketo, ${user.name}! We're excited to have you on board. Start exploring the marketplace or set up your shop today.`,
        type: 'info',
        isRead: true,
      },
      {
        userId: user.id,
        title: 'New feature available',
        message: 'Check out our new shop customization options! You can now add custom sections and choose from 10 beautiful color themes.',
        type: 'info',
        isRead: Math.random() > 0.5,
      },
      {
        userId: user.id,
        title: 'Your account is verified',
        message: 'Congratulations! Your account has been verified. You now have access to all marketplace features.',
        type: 'success',
        isRead: Math.random() > 0.5,
      },
    ]

    // Add order-related notifications for buyers and sellers
    if (user.role === 'buyer' || user.role === 'both') {
      notifications.push({
        userId: user.id,
        title: 'Order confirmed',
        message: 'Your order has been confirmed and is being processed. You\'ll receive another notification when it ships.',
        type: 'order',
        isRead: Math.random() > 0.5,
        link: 'orders',
      })
    }

    if (user.role === 'seller' || user.role === 'both') {
      notifications.push({
        userId: user.id,
        title: 'New order received!',
        message: 'You have a new order! Check your seller dashboard for details and start processing it.',
        type: 'order',
        isRead: false,
        link: 'seller-orders',
      })
    }

    // Add a message notification
    notifications.push({
      userId: user.id,
      title: 'New message',
      message: 'You have a new message from a marketplace user. Click to read and respond.',
      type: 'message',
      isRead: Math.random() > 0.5,
    })

    for (const n of notifications) {
      await db.notification.create({ data: n })
      notificationCount++
    }
  }
  console.log(`  ✅ Created ${notificationCount} notifications\n`)

  // =========================================================================
  // 8. Create Messages (some conversations)
  // =========================================================================
  console.log('💬 Creating messages...')

  const messageData = [
    { senderId: buyers[0].id, receiverId: sellers[0].id, content: 'Hi! I just purchased your UI Kit Pro and I\'m loving it. Quick question — do you have a Figma version available?', isRead: true },
    { senderId: sellers[0].id, receiverId: buyers[0].id, content: 'Thanks for your purchase! Yes, the Figma version is included in the download package. Check the "figma" folder!', isRead: true },
    { senderId: buyers[0].id, receiverId: sellers[0].id, content: 'Found it! The components are amazing. Will you be adding dark mode variants?', isRead: false },

    { senderId: buyers[1].id, receiverId: sellers[1].id, content: 'Hey Marcus, I\'m interested in the Full-Stack Boilerplate. Does it support PostgreSQL or just SQLite?', isRead: true },
    { senderId: sellers[1].id, receiverId: buyers[1].id, content: 'Great question! It supports both PostgreSQL and SQLite. The Prisma schema is configured for SQLite by default, but switching to PostgreSQL is just a connection string change.', isRead: false },

    { senderId: buyers[2].id, receiverId: sellers[3].id, content: 'Hi James, I love your wooden desk organizer! Do you offer custom engraving on it?', isRead: true },
    { senderId: sellers[3].id, receiverId: buyers[2].id, content: 'Thank you! Yes, we do offer custom engraving for an additional $15. I can engrave initials or a short message. Just add a note with your order!', isRead: true },
    { senderId: buyers[2].id, receiverId: sellers[3].id, content: 'Perfect! I\'ll place an order with engraving details. Thanks!', isRead: false },

    { senderId: buyers[3].id, receiverId: sellers[4].id, content: 'Hello Priya, I\'m interested in your cloud architecture consulting. Can we schedule a call to discuss our AWS setup?', isRead: true },
    { senderId: sellers[4].id, receiverId: buyers[3].id, content: 'Of course! I\'d be happy to help. You can book a free 15-minute intro call through our website, or we can start via email. What does your current AWS setup look like?', isRead: false },
  ]

  let messageCount = 0
  for (const m of messageData) {
    await db.message.create({ data: m })
    messageCount++
  }
  console.log(`  ✅ Created ${messageCount} messages\n`)

  // =========================================================================
  // 9. Create Favorites
  // =========================================================================
  console.log('❤️ Creating favorites...')

  const favoriteData = [
    { userId: buyers[0].id, productId: products[0].id },
    { userId: buyers[0].id, productId: products[5].id },
    { userId: buyers[0].id, productId: products[12].id },
    { userId: buyers[1].id, productId: products[8].id },
    { userId: buyers[1].id, productId: products[4].id },
    { userId: buyers[2].id, productId: products[14].id },
    { userId: buyers[2].id, productId: products[1].id },
    { userId: buyers[3].id, productId: products[9].id },
    { userId: buyers[3].id, productId: products[16].id },
    { userId: buyers[4].id, productId: products[6].id },
    { userId: buyers[4].id, productId: products[11].id },
    { userId: buyers[4].id, productId: products[18].id },
  ]

  let favoriteCount = 0
  for (const f of favoriteData) {
    await db.favorite.create({ data: f })
    favoriteCount++
  }
  console.log(`  ✅ Created ${favoriteCount} favorites\n`)

  // =========================================================================
  // 10. Create PlatformStats
  // =========================================================================
  console.log('📊 Creating platform stats...')

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)

  await db.platformStats.create({
    data: {
      totalUsers: allUsers.length,
      totalSellers: sellers.length + 1, // +1 for admin who is also both
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    },
  })
  console.log('  ✅ Platform stats created\n')

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('═══════════════════════════════════════════════')
  console.log('🎉 Seed completed successfully!')
  console.log('═══════════════════════════════════════════════')
  console.log(`  Users:      ${allUsers.length} (1 admin, ${sellers.length} sellers, ${buyers.length} buyers)`)
  console.log(`  Shops:      ${shops.length}`)
  console.log(`  Categories: ${categories.length}`)
  console.log(`  Products:   ${products.length}`)
  console.log(`  Orders:     ${orders.length}`)
  console.log(`  Reviews:    ${reviews.length}`)
  console.log(`  Notifications: ${notificationCount}`)
  console.log(`  Messages:   ${messageCount}`)
  console.log(`  Favorites:  ${favoriteCount}`)
  console.log('═══════════════════════════════════════════════')
  console.log('\n🔑 Login Credentials:')
  console.log('  Admin:  admin@marketo.com / admin123')
  console.log('  Seller: sarah@digitalcrafts.com / password123')
  console.log('  Seller: marcus@codedesign.com / password123')
  console.log('  Seller: elena@creativemarket.com / password123')
  console.log('  Seller: james@handmadehaven.com / password123')
  console.log('  Seller: priya@techsolutions.com / password123')
  console.log('  Buyer:  alex.thompson@email.com / password123')
  console.log('  Buyer:  mia.nakamura@email.com / password123')
  console.log('  Buyer:  david.kim@email.com / password123')
  console.log('  Buyer:  olivia.brown@email.com / password123')
  console.log('  Buyer:  ryan.obrien@email.com / password123')
  console.log('═══════════════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
