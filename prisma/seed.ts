import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

// =============================================================================
// Marketo Payment System - Comprehensive Database Seed Script
// =============================================================================

const SALT_ROUNDS = 10
const PLATFORM_FEE_RATE = 0.10 // 10% platform commission

// Rounding helper for monetary values
const r = (n: number) => Math.round(n * 100) / 100

// Date helper
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000)

async function main() {
  console.log('🌱 Starting Marketo Payment System seed...\n')

  // ===========================================================================
  // 1. Clear all existing data (respecting foreign key order)
  // ===========================================================================
  console.log('🧹 Clearing existing data...')

  // Delete in reverse dependency order (children first)
  await db.notification.deleteMany()
  await db.dispute.deleteMany()
  await db.message.deleteMany()
  await db.transaction.deleteMany()
  await db.withdrawal.deleteMany()
  await db.payment.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.review.deleteMany()
  await db.favorite.deleteMany()
  await db.socialLink.deleteMany()
  await db.gig.deleteMany()
  await db.product.deleteMany()
  await db.shop.deleteMany()
  await db.wallet.deleteMany()
  await db.category.deleteMany()
  await db.platformStats.deleteMany()
  await db.user.deleteMany()

  console.log('  ✅ All existing data cleared\n')

  // ===========================================================================
  // 2. Create Users
  // ===========================================================================
  console.log('👤 Creating users...')

  const admin = await db.user.create({
    data: {
      email: 'admin@marketo.com',
      password: await bcrypt.hash('Admin123!', SALT_ROUNDS),
      name: 'Admin User',
      role: 'both',
      isAdmin: true,
      isVerified: true,
      isActive: true,
      bio: 'Platform administrator for Marketo marketplace.',
    },
  })
  console.log(`  ✅ Admin: ${admin.email}`)

  const ahmad = await db.user.create({
    data: {
      email: 'ahmad@marketo.com',
      password: await bcrypt.hash('Seller123!', SALT_ROUNDS),
      name: 'Ahmad Khan',
      role: 'seller',
      phone: '03001234567',
      location: 'Lahore, Pakistan',
      isVerified: true,
      isActive: true,
      bio: 'Full-stack developer and digital product creator with 8+ years of experience in web development.',
    },
  })
  console.log(`  ✅ Seller: ${ahmad.name} (${ahmad.email})`)

  const sarah = await db.user.create({
    data: {
      email: 'sarah@marketo.com',
      password: await bcrypt.hash('Seller123!', SALT_ROUNDS),
      name: 'Sarah Ahmed',
      role: 'seller',
      phone: '03119876543',
      location: 'Karachi, Pakistan',
      isVerified: true,
      isActive: true,
      bio: 'Award-winning graphic designer specializing in brand identity, illustrations, and creative assets.',
    },
  })
  console.log(`  ✅ Seller: ${sarah.name} (${sarah.email})`)

  const ali = await db.user.create({
    data: {
      email: 'ali@marketo.com',
      password: await bcrypt.hash('Buyer123!', SALT_ROUNDS),
      name: 'Ali Raza',
      role: 'buyer',
      phone: '03215678901',
      location: 'Islamabad, Pakistan',
      isVerified: true,
      isActive: true,
      bio: 'Startup founder and design enthusiast looking for great digital tools.',
    },
  })
  console.log(`  ✅ Buyer: ${ali.name} (${ali.email})`)

  const emma = await db.user.create({
    data: {
      email: 'emma@marketo.com',
      password: await bcrypt.hash('Buyer123!', SALT_ROUNDS),
      name: 'Emma Wilson',
      role: 'buyer',
      location: 'London, UK',
      isVerified: true,
      isActive: true,
      bio: 'Creative professional and avid collector of premium digital assets.',
    },
  })
  console.log(`  ✅ Buyer: ${emma.name} (${emma.email})`)

  const hamza = await db.user.create({
    data: {
      email: 'hamza@marketo.com',
      password: await bcrypt.hash('Both123!', SALT_ROUNDS),
      name: 'Hamza Malik',
      role: 'both',
      phone: '03334567890',
      location: 'Faisalabad, Pakistan',
      isVerified: true,
      isActive: true,
      bio: 'Developer and designer who both creates and purchases digital products on Marketo.',
    },
  })
  console.log(`  ✅ Both: ${hamza.name} (${hamza.email})\n`)

  // ===========================================================================
  // 3. Create Categories
  // ===========================================================================
  console.log('📂 Creating categories...')

  const catDigitalProducts = await db.category.create({
    data: {
      name: 'Digital Products',
      slug: 'digital-products',
      icon: 'Download',
      description: 'Downloadable digital products, software, and resources',
      sortOrder: 0,
      isActive: true,
    },
  })

  const catWebDev = await db.category.create({
    data: {
      name: 'Web Development',
      slug: 'web-development',
      icon: 'Globe',
      description: 'Web development tools, templates, and services',
      sortOrder: 1,
      isActive: true,
    },
  })

  const catGraphicDesign = await db.category.create({
    data: {
      name: 'Graphic Design',
      slug: 'graphic-design',
      icon: 'Palette',
      description: 'Graphic design assets, illustrations, and creative resources',
      sortOrder: 2,
      isActive: true,
    },
  })

  const catMobileApps = await db.category.create({
    data: {
      name: 'Mobile Apps',
      slug: 'mobile-apps',
      icon: 'Smartphone',
      description: 'Mobile app templates, UI kits, and development resources',
      sortOrder: 3,
      isActive: true,
    },
  })

  const catConsulting = await db.category.create({
    data: {
      name: 'Consulting',
      slug: 'consulting',
      icon: 'MessageSquare',
      description: 'Professional consulting and freelance services',
      sortOrder: 4,
      isActive: true,
    },
  })

  console.log('  ✅ Created 5 categories\n')

  // ===========================================================================
  // 4. Create Shops
  // ===========================================================================
  console.log('🏪 Creating shops...')

  const ahmadShop = await db.shop.create({
    data: {
      userId: ahmad.id,
      name: "Ahmad's Tech Hub",
      slug: 'ahmads-tech-hub',
      description: 'Premium web development tools, templates, and freelance services. Building digital solutions that power businesses worldwide.',
      about: 'Ahmad\'s Tech Hub is a one-stop shop for high-quality web development resources. With over 8 years of industry experience, Ahmad creates tools that developers love — from production-ready boilerplates to custom development services. Every product is built with performance, accessibility, and clean code in mind.',
      contactEmail: 'ahmad@marketo.com',
      contactPhone: '+92 300 1234567',
      address: 'Gulberg III, Lahore, Pakistan',
      primaryColor: '#0ea5e9',
      secondaryColor: '#0284c7',
      accentColor: '#38bdf8',
      layoutStyle: 'grid',
      displayStyle: 'modern',
      customSections: '[]',
      isApproved: true,
      isActive: true,
    },
  })
  console.log(`  ✅ Shop: ${ahmadShop.name}`)

  const sarahShop = await db.shop.create({
    data: {
      userId: sarah.id,
      name: "Sarah's Design Studio",
      slug: 'sarahs-design-studio',
      description: 'Beautiful design assets, brand identity kits, and custom illustration services. Where creativity meets precision.',
      about: 'Sarah\'s Design Studio offers a curated collection of premium design assets crafted with an eye for detail and a passion for aesthetics. From brand identity systems to custom illustrations, every product reflects years of design expertise and a commitment to helping brands stand out.',
      contactEmail: 'sarah@marketo.com',
      contactPhone: '+92 311 9876543',
      address: 'DHA Phase 5, Karachi, Pakistan',
      primaryColor: '#ec4899',
      secondaryColor: '#db2777',
      accentColor: '#f472b6',
      layoutStyle: 'grid',
      displayStyle: 'classic',
      customSections: '[]',
      isApproved: true,
      isActive: true,
    },
  })
  console.log(`  ✅ Shop: ${sarahShop.name}`)

  const hamzaShop = await db.shop.create({
    data: {
      userId: hamza.id,
      name: "Hamza's Code Lab",
      slug: 'hamzas-code-lab',
      description: 'Cutting-edge React templates, mobile UI kits, and full-stack development services. Code that ships.',
      about: 'Hamza\'s Code Lab specializes in modern front-end and full-stack development solutions. Whether you need a ready-made dashboard template or a complete custom application built from scratch, Hamza delivers production-quality code with comprehensive documentation and ongoing support.',
      contactEmail: 'hamza@marketo.com',
      contactPhone: '+92 333 4567890',
      address: 'Satiana Road, Faisalabad, Pakistan',
      primaryColor: '#14b8a6',
      secondaryColor: '#0d9488',
      accentColor: '#5eead4',
      layoutStyle: 'featured',
      displayStyle: 'modern',
      customSections: '[]',
      isApproved: true,
      isActive: true,
    },
  })
  console.log(`  ✅ Shop: ${hamzaShop.name}\n`)

  // ===========================================================================
  // 5. Create Products
  // ===========================================================================
  console.log('📦 Creating products...')

  // --- Ahmad's Tech Hub Products ---
  const ahmadProduct1 = await db.product.create({
    data: {
      shopId: ahmadShop.id,
      categoryId: catWebDev.id,
      name: 'Premium WordPress Theme',
      slug: 'premium-wordpress-theme',
      description: 'A feature-rich, SEO-optimized WordPress theme with 20+ pre-built demos, WooCommerce integration, and a powerful page builder. Fully responsive, accessibility-ready, and regularly updated. Includes one-click demo import and extensive documentation.',
      shortDesc: 'Feature-rich WordPress theme with 20+ demos & WooCommerce',
      price: 129,
      comparePrice: 199,
      type: 'digital',
      images: '[]',
      fileUrl: '/files/premium-wp-theme.zip',
      fileSize: '45 MB',
      stock: -1,
      tags: '["wordpress","theme","seo","woocommerce"]',
      isFeatured: true,
      isApproved: true,
      isActive: true,
      totalSales: 87,
      totalReviews: 23,
      averageRating: 4.7,
      deliveryCountries: '[]',
    },
  })
  console.log(`  ✅ ${ahmadProduct1.name}`)

  const ahmadProduct2 = await db.product.create({
    data: {
      shopId: ahmadShop.id,
      categoryId: catConsulting.id,
      name: 'Custom Logo Design Package',
      slug: 'custom-logo-design-package',
      description: 'Professional logo design service including 5 initial concepts, unlimited revisions on the selected concept, and final delivery in all formats (AI, SVG, PNG, PDF). Includes brand guidelines document with color palette, typography, and usage rules. Turnaround: 3-5 business days.',
      shortDesc: 'Professional logo design with 5 concepts & unlimited revisions',
      price: 499,
      type: 'freelance',
      images: '[]',
      stock: -1,
      tags: '["logo","branding","design","freelance"]',
      isFeatured: true,
      isApproved: true,
      isActive: true,
      totalSales: 34,
      totalReviews: 18,
      averageRating: 4.9,
      deliveryInfo: '3-5 business days for initial concepts',
      deliveryCountries: '[]',
      requirements: 'Brand name, industry, preferred style, color preferences, any reference logos you like',
    },
  })
  console.log(`  ✅ ${ahmadProduct2.name}`)

  const ahmadProduct3 = await db.product.create({
    data: {
      shopId: ahmadShop.id,
      categoryId: catDigitalProducts.id,
      name: 'E-Commerce Starter Kit',
      slug: 'ecommerce-starter-kit',
      description: 'Complete e-commerce starter kit with Next.js 14 frontend, Stripe payment integration, admin dashboard, product management, order tracking, and email templates. Production-ready with TypeScript, Tailwind CSS, and Prisma. Includes deployment guides for Vercel and AWS.',
      shortDesc: 'Production-ready Next.js e-commerce kit with Stripe & admin',
      price: 199,
      comparePrice: 299,
      type: 'digital',
      images: '[]',
      fileUrl: '/files/ecommerce-starter-kit.tar.gz',
      fileSize: '18 MB',
      stock: -1,
      tags: '["nextjs","ecommerce","stripe","typescript"]',
      isFeatured: false,
      isApproved: true,
      isActive: true,
      totalSales: 56,
      totalReviews: 14,
      averageRating: 4.5,
      deliveryCountries: '[]',
    },
  })
  console.log(`  ✅ ${ahmadProduct3.name}`)

  // --- Sarah's Design Studio Products ---
  const sarahProduct1 = await db.product.create({
    data: {
      shopId: sarahShop.id,
      categoryId: catGraphicDesign.id,
      name: 'Social Media Design Pack',
      slug: 'social-media-design-pack',
      description: '200+ professionally designed social media templates for Instagram, Facebook, Twitter, and LinkedIn. Editable in Canva and Figma. Includes stories, posts, carousels, and ad templates in 10 color themes. Perfect for brands, influencers, and marketers.',
      shortDesc: '200+ social media templates for all major platforms',
      price: 59,
      comparePrice: 89,
      type: 'digital',
      images: '[]',
      fileUrl: '/files/social-media-pack.zip',
      fileSize: '340 MB',
      stock: -1,
      tags: '["social-media","templates","instagram","canva"]',
      isFeatured: true,
      isApproved: true,
      isActive: true,
      totalSales: 124,
      totalReviews: 31,
      averageRating: 4.6,
      deliveryCountries: '[]',
    },
  })
  console.log(`  ✅ ${sarahProduct1.name}`)

  const sarahProduct2 = await db.product.create({
    data: {
      shopId: sarahShop.id,
      categoryId: catGraphicDesign.id,
      name: 'Brand Identity Kit',
      slug: 'brand-identity-kit',
      description: 'Complete brand identity kit with logo templates, color palettes, typography systems, business card designs, letterheads, and social media templates. Fully editable in Adobe Illustrator and Figma. Includes 50+ brand elements and a comprehensive style guide.',
      shortDesc: 'Complete brand identity kit with logo, colors & stationery',
      price: 249,
      comparePrice: 349,
      type: 'digital',
      images: '[]',
      fileUrl: '/files/brand-identity-kit.zip',
      fileSize: '520 MB',
      stock: -1,
      tags: '["branding","identity","logo","illustrator"]',
      isFeatured: true,
      isApproved: true,
      isActive: true,
      totalSales: 67,
      totalReviews: 22,
      averageRating: 4.8,
      deliveryCountries: '[]',
    },
  })
  console.log(`  ✅ ${sarahProduct2.name}`)

  const sarahProduct3 = await db.product.create({
    data: {
      shopId: sarahShop.id,
      categoryId: catConsulting.id,
      name: 'Custom Illustration Service',
      slug: 'custom-illustration-service',
      description: 'Hand-crafted custom illustrations for your brand, website, or publication. Choose from watercolor, vector, or hand-drawn styles. Includes up to 5 illustrations with source files. Perfect for hero images, blog headers, packaging, and marketing materials.',
      shortDesc: 'Custom hand-crafted illustrations in your preferred style',
      price: 399,
      type: 'freelance',
      images: '[]',
      stock: -1,
      tags: '["illustration","custom","freelance","branding"]',
      isFeatured: false,
      isApproved: true,
      isActive: true,
      totalSales: 19,
      totalReviews: 11,
      averageRating: 4.9,
      deliveryInfo: '5-7 business days for initial sketches',
      deliveryCountries: '[]',
      requirements: 'Description of desired illustrations, preferred style, color scheme, intended use, and any reference images',
    },
  })
  console.log(`  ✅ ${sarahProduct3.name}`)

  // --- Hamza's Code Lab Products ---
  const hamzaProduct1 = await db.product.create({
    data: {
      shopId: hamzaShop.id,
      categoryId: catWebDev.id,
      name: 'React Dashboard Template',
      slug: 'react-dashboard-template',
      description: 'A comprehensive React dashboard template with 40+ pages, dark/light mode, 10+ chart types, data tables with sorting and filtering, and a powerful form builder. Built with TypeScript, Tailwind CSS, and shadcn/ui. Includes authentication pages and role-based access control.',
      shortDesc: 'Full-featured React dashboard with 40+ pages & dark mode',
      price: 129,
      comparePrice: 179,
      type: 'digital',
      images: '[]',
      fileUrl: '/files/react-dashboard.tar.gz',
      fileSize: '22 MB',
      stock: -1,
      tags: '["react","dashboard","typescript","tailwind"]',
      isFeatured: true,
      isApproved: true,
      isActive: true,
      totalSales: 92,
      totalReviews: 27,
      averageRating: 4.7,
      deliveryCountries: '[]',
    },
  })
  console.log(`  ✅ ${hamzaProduct1.name}`)

  const hamzaProduct2 = await db.product.create({
    data: {
      shopId: hamzaShop.id,
      categoryId: catMobileApps.id,
      name: 'Mobile App UI Kit',
      slug: 'mobile-app-ui-kit',
      description: 'Premium mobile app UI kit with 80+ screens for iOS and Android. Covers onboarding, authentication, social feeds, messaging, e-commerce, profiles, and settings. Fully customizable in Figma with auto-layout and component variants. Includes design tokens and a complete icon set.',
      shortDesc: '80+ mobile screens for iOS & Android in Figma',
      price: 89,
      comparePrice: 129,
      type: 'digital',
      images: '[]',
      fileUrl: '/files/mobile-ui-kit.zip',
      fileSize: '280 MB',
      stock: -1,
      tags: '["mobile","ui-kit","figma","ios","android"]',
      isFeatured: false,
      isApproved: true,
      isActive: true,
      totalSales: 45,
      totalReviews: 12,
      averageRating: 4.4,
      deliveryCountries: '[]',
    },
  })
  console.log(`  ✅ ${hamzaProduct2.name}`)

  const hamzaProduct3 = await db.product.create({
    data: {
      shopId: hamzaShop.id,
      categoryId: catConsulting.id,
      name: 'Full-Stack Development Service',
      slug: 'fullstack-development-service',
      description: 'End-to-end full-stack development service. From requirements gathering to deployment, I build scalable web applications using Next.js, Node.js, and modern databases. Includes architecture design, implementation, testing, CI/CD setup, and 30 days of post-launch support.',
      shortDesc: 'End-to-end full-stack web development with Next.js',
      price: 599,
      type: 'freelance',
      images: '[]',
      stock: -1,
      tags: '["fullstack","nextjs","nodejs","freelance"]',
      isFeatured: true,
      isApproved: true,
      isActive: true,
      totalSales: 15,
      totalReviews: 9,
      averageRating: 4.8,
      deliveryInfo: '4-8 weeks depending on project scope',
      deliveryCountries: '[]',
      requirements: 'Project overview, feature requirements, preferred tech stack, timeline expectations, and budget range',
    },
  })
  console.log(`  ✅ ${hamzaProduct3.name}\n`)

  // ===========================================================================
  // 6. Create Wallets for ALL Users
  // ===========================================================================
  console.log('💰 Creating wallets...')

  // We'll create wallets with initial zero balances, then update them after
  // creating transactions to ensure consistency

  const adminWallet = await db.wallet.create({
    data: { userId: admin.id, balance: 0, pendingBalance: 0, totalEarnings: 0, totalWithdrawn: 0, currency: 'USD' },
  })
  console.log(`  ✅ Wallet: ${admin.name}`)

  const ahmadWallet = await db.wallet.create({
    data: { userId: ahmad.id, balance: 0, pendingBalance: 0, totalEarnings: 0, totalWithdrawn: 0, currency: 'USD' },
  })
  console.log(`  ✅ Wallet: ${ahmad.name}`)

  const sarahWallet = await db.wallet.create({
    data: { userId: sarah.id, balance: 0, pendingBalance: 0, totalEarnings: 0, totalWithdrawn: 0, currency: 'USD' },
  })
  console.log(`  ✅ Wallet: ${sarah.name}`)

  const aliWallet = await db.wallet.create({
    data: { userId: ali.id, balance: 0, pendingBalance: 0, totalEarnings: 0, totalWithdrawn: 0, currency: 'USD' },
  })
  console.log(`  ✅ Wallet: ${ali.name}`)

  const emmaWallet = await db.wallet.create({
    data: { userId: emma.id, balance: 0, pendingBalance: 0, totalEarnings: 0, totalWithdrawn: 0, currency: 'USD' },
  })
  console.log(`  ✅ Wallet: ${emma.name}`)

  const hamzaWallet = await db.wallet.create({
    data: { userId: hamza.id, balance: 0, pendingBalance: 0, totalEarnings: 0, totalWithdrawn: 0, currency: 'USD' },
  })
  console.log(`  ✅ Wallet: ${hamza.name}\n`)

  // ===========================================================================
  // 7. Create Orders with Order Items
  // ===========================================================================
  console.log('🛒 Creating orders...')

  // --- Order 1: Completed order (Ali → Ahmad) ---
  // Products: Custom Logo Design Package ($499) + E-Commerce Starter Kit ($199) = $698
  const order1Total = r(499 + 199) // $698
  const order1PlatformFee = r(order1Total * PLATFORM_FEE_RATE) // $69.80
  const order1SellerPayout = r(order1Total - order1PlatformFee) // $628.20

  const order1 = await db.order.create({
    data: {
      buyerId: ali.id,
      sellerId: ahmad.id,
      status: 'delivered',
      totalAmount: order1Total,
      platformFee: order1PlatformFee,
      paymentMethod: 'easypaisa',
      paymentStatus: 'paid',
      shippingName: ali.name,
      shippingAddr: '42 Jinnah Avenue',
      shippingCity: 'Islamabad',
      shippingZip: '44000',
      shippingPhone: ali.phone,
      notes: 'Please deliver the logo in both dark and light variants.',
      trackingNo: null, // digital + freelance, no tracking
      createdAt: daysAgo(20),
      items: {
        create: [
          { productId: ahmadProduct2.id, quantity: 1, price: 499, type: 'freelance', status: 'delivered' },
          { productId: ahmadProduct3.id, quantity: 1, price: 199, type: 'digital', status: 'delivered' },
        ],
      },
    },
  })
  console.log(`  ✅ Order 1: Completed (Ali → Ahmad) — $${order1Total}`)

  // --- Order 2: In-escrow order (Emma → Sarah) ---
  // Product: Brand Identity Kit ($249)
  const order2Total = r(249)
  const order2PlatformFee = r(order2Total * PLATFORM_FEE_RATE) // $24.90
  const order2SellerPayout = r(order2Total - order2PlatformFee) // $224.10

  const order2 = await db.order.create({
    data: {
      buyerId: emma.id,
      sellerId: sarah.id,
      status: 'processing',
      totalAmount: order2Total,
      platformFee: order2PlatformFee,
      paymentMethod: 'jazzcash',
      paymentStatus: 'paid',
      shippingName: emma.name,
      shippingAddr: '15 Baker Street',
      shippingCity: 'London',
      shippingZip: 'W1U 3BW',
      shippingPhone: '+44 7700 900123',
      createdAt: daysAgo(5),
      items: {
        create: [
          { productId: sarahProduct2.id, quantity: 1, price: 249, type: 'digital', status: 'pending' },
        ],
      },
    },
  })
  console.log(`  ✅ Order 2: In-Escrow (Emma → Sarah) — $${order2Total}`)

  // --- Order 3: Pending payment (Ali → Hamza) ---
  // Product: Full-Stack Development Service ($599)
  const order3Total = r(599)
  const order3PlatformFee = r(order3Total * PLATFORM_FEE_RATE) // $59.90
  const order3SellerPayout = r(order3Total - order3PlatformFee) // $539.10

  const order3 = await db.order.create({
    data: {
      buyerId: ali.id,
      sellerId: hamza.id,
      status: 'processing',
      totalAmount: order3Total,
      platformFee: order3PlatformFee,
      paymentMethod: 'payoneer',
      paymentStatus: 'pending',
      shippingName: ali.name,
      shippingAddr: '42 Jinnah Avenue',
      shippingCity: 'Islamabad',
      shippingZip: '44000',
      shippingPhone: ali.phone,
      notes: 'Need a SaaS platform with multi-tenant architecture. Details in attached document.',
      createdAt: daysAgo(2),
      items: {
        create: [
          { productId: hamzaProduct3.id, quantity: 1, price: 599, type: 'freelance', status: 'pending' },
        ],
      },
    },
  })
  console.log(`  ✅ Order 3: Pending Payment (Ali → Hamza) — $${order3Total}`)

  // --- Order 4: Failed payment (Emma → Ahmad) ---
  // Product: Premium WordPress Theme ($129)
  const order4Total = r(129)
  const order4PlatformFee = r(order4Total * PLATFORM_FEE_RATE) // $12.90
  const order4SellerPayout = r(order4Total - order4PlatformFee) // $116.10

  const order4 = await db.order.create({
    data: {
      buyerId: emma.id,
      sellerId: ahmad.id,
      status: 'pending',
      totalAmount: order4Total,
      platformFee: order4PlatformFee,
      paymentMethod: 'wise',
      paymentStatus: 'failed',
      createdAt: daysAgo(10),
      items: {
        create: [
          { productId: ahmadProduct1.id, quantity: 1, price: 129, type: 'digital', status: 'pending' },
        ],
      },
    },
  })
  console.log(`  ✅ Order 4: Failed Payment (Emma → Ahmad) — $${order4Total}`)

  // --- Order 5: Refunded order (Ali → Sarah) ---
  // Product: Social Media Design Pack ($59)
  const order5Total = r(59)
  const order5PlatformFee = r(order5Total * PLATFORM_FEE_RATE) // $5.90
  const order5SellerPayout = r(order5Total - order5PlatformFee) // $53.10

  const order5 = await db.order.create({
    data: {
      buyerId: ali.id,
      sellerId: sarah.id,
      status: 'refunded',
      totalAmount: order5Total,
      platformFee: order5PlatformFee,
      paymentMethod: 'easypaisa',
      paymentStatus: 'refunded',
      createdAt: daysAgo(15),
      items: {
        create: [
          { productId: sarahProduct1.id, quantity: 1, price: 59, type: 'digital', status: 'cancelled' },
        ],
      },
    },
  })
  console.log(`  ✅ Order 5: Refunded (Ali → Sarah) — $${order5Total}`)

  // --- Order 6: Another completed order (Hamza as buyer → Ahmad) ---
  // Product: Custom Logo Design Package ($499)
  const order6Total = r(499)
  const order6PlatformFee = r(order6Total * PLATFORM_FEE_RATE) // $49.90
  const order6SellerPayout = r(order6Total - order6PlatformFee) // $449.10

  const order6 = await db.order.create({
    data: {
      buyerId: hamza.id,
      sellerId: ahmad.id,
      status: 'delivered',
      totalAmount: order6Total,
      platformFee: order6PlatformFee,
      paymentMethod: 'jazzcash',
      paymentStatus: 'paid',
      shippingName: hamza.name,
      shippingAddr: 'Satiana Road',
      shippingCity: 'Faisalabad',
      shippingZip: '38000',
      shippingPhone: hamza.phone,
      createdAt: daysAgo(8),
      items: {
        create: [
          { productId: ahmadProduct2.id, quantity: 1, price: 499, type: 'freelance', status: 'delivered' },
        ],
      },
    },
  })
  console.log(`  ✅ Order 6: Completed (Hamza → Ahmad) — $${order6Total}`)

  // --- Order 7: Shipped order awaiting confirmation (Emma → Hamza) ---
  // Product: React Dashboard Template ($129)
  const order7Total = r(129)
  const order7PlatformFee = r(order7Total * PLATFORM_FEE_RATE) // $12.90
  const order7SellerPayout = r(order7Total - order7PlatformFee) // $116.10

  const order7 = await db.order.create({
    data: {
      buyerId: emma.id,
      sellerId: hamza.id,
      status: 'shipped',
      totalAmount: order7Total,
      platformFee: order7PlatformFee,
      paymentMethod: 'payoneer',
      paymentStatus: 'paid',
      shippingName: emma.name,
      shippingAddr: '15 Baker Street',
      shippingCity: 'London',
      shippingZip: 'W1U 3BW',
      shippingPhone: '+44 7700 900123',
      trackingNo: 'TRK-2025-007-UK',
      createdAt: daysAgo(3),
      items: {
        create: [
          { productId: hamzaProduct1.id, quantity: 1, price: 129, type: 'digital', status: 'pending' },
        ],
      },
    },
  })
  console.log(`  ✅ Order 7: Shipped/Escrow Held (Emma → Hamza) — $${order7Total}\n`)

  // ===========================================================================
  // 8. Create Payments
  // ===========================================================================
  console.log('💳 Creating payments...')

  const payment1 = await db.payment.create({
    data: {
      orderId: order1.id,
      buyerId: ali.id,
      sellerId: ahmad.id,
      amount: order1Total,
      platformFee: order1PlatformFee,
      sellerPayout: order1SellerPayout,
      paymentMethod: 'easypaisa',
      paymentProvider: 'EP-2025-TXN-001',
      status: 'completed',
      escrowStatus: 'released',
      paidAt: daysAgo(20),
      releasedAt: daysAgo(17),
      metadata: JSON.stringify({ easypaisaRef: 'EP-2025-TXN-001', accountLast4: '4567' }),
      createdAt: daysAgo(20),
    },
  })
  console.log(`  ✅ Payment 1: Completed/Released — $${order1Total}`)

  const payment2 = await db.payment.create({
    data: {
      orderId: order2.id,
      buyerId: emma.id,
      sellerId: sarah.id,
      amount: order2Total,
      platformFee: order2PlatformFee,
      sellerPayout: order2SellerPayout,
      paymentMethod: 'jazzcash',
      paymentProvider: 'JC-2025-TXN-002',
      status: 'completed',
      escrowStatus: 'held',
      paidAt: daysAgo(5),
      metadata: JSON.stringify({ jazzcashRef: 'JC-2025-TXN-002', accountLast4: '8901' }),
      createdAt: daysAgo(5),
    },
  })
  console.log(`  ✅ Payment 2: Completed/Held — $${order2Total}`)

  const payment3 = await db.payment.create({
    data: {
      orderId: order3.id,
      buyerId: ali.id,
      sellerId: hamza.id,
      amount: order3Total,
      platformFee: order3PlatformFee,
      sellerPayout: order3SellerPayout,
      paymentMethod: 'payoneer',
      paymentProvider: null,
      status: 'processing',
      escrowStatus: 'held',
      metadata: JSON.stringify({ payoneerStatus: 'pending_verification' }),
      createdAt: daysAgo(2),
    },
  })
  console.log(`  ✅ Payment 3: Processing/Held — $${order3Total}`)

  const payment4 = await db.payment.create({
    data: {
      orderId: order4.id,
      buyerId: emma.id,
      sellerId: ahmad.id,
      amount: order4Total,
      platformFee: order4PlatformFee,
      sellerPayout: order4SellerPayout,
      paymentMethod: 'wise',
      paymentProvider: null,
      status: 'failed',
      escrowStatus: 'held',
      failureReason: 'Insufficient funds',
      metadata: JSON.stringify({ wiseError: 'insufficient_funds', errorCode: 'WISE-INS-001' }),
      createdAt: daysAgo(10),
    },
  })
  console.log(`  ✅ Payment 4: Failed — $${order4Total}`)

  const payment5 = await db.payment.create({
    data: {
      orderId: order5.id,
      buyerId: ali.id,
      sellerId: sarah.id,
      amount: order5Total,
      platformFee: order5PlatformFee,
      sellerPayout: order5SellerPayout,
      paymentMethod: 'easypaisa',
      paymentProvider: 'EP-2025-TXN-005',
      status: 'refunded',
      escrowStatus: 'refunded',
      paidAt: daysAgo(15),
      metadata: JSON.stringify({ easypaisaRef: 'EP-2025-TXN-005', refundRef: 'EP-REF-2025-005' }),
      createdAt: daysAgo(15),
    },
  })
  console.log(`  ✅ Payment 5: Refunded — $${order5Total}`)

  const payment6 = await db.payment.create({
    data: {
      orderId: order6.id,
      buyerId: hamza.id,
      sellerId: ahmad.id,
      amount: order6Total,
      platformFee: order6PlatformFee,
      sellerPayout: order6SellerPayout,
      paymentMethod: 'jazzcash',
      paymentProvider: 'JC-2025-TXN-006',
      status: 'completed',
      escrowStatus: 'released',
      paidAt: daysAgo(8),
      releasedAt: daysAgo(5),
      metadata: JSON.stringify({ jazzcashRef: 'JC-2025-TXN-006', accountLast4: '2345' }),
      createdAt: daysAgo(8),
    },
  })
  console.log(`  ✅ Payment 6: Completed/Released — $${order6Total}`)

  const payment7 = await db.payment.create({
    data: {
      orderId: order7.id,
      buyerId: emma.id,
      sellerId: hamza.id,
      amount: order7Total,
      platformFee: order7PlatformFee,
      sellerPayout: order7SellerPayout,
      paymentMethod: 'payoneer',
      paymentProvider: 'PY-2025-TXN-007',
      status: 'completed',
      escrowStatus: 'held',
      paidAt: daysAgo(3),
      metadata: JSON.stringify({ payoneerRef: 'PY-2025-TXN-007' }),
      createdAt: daysAgo(3),
    },
  })
  console.log(`  ✅ Payment 7: Completed/Held — $${order7Total}\n`)

  // ===========================================================================
  // 9. Create Transactions (Wallet ledger entries)
  // ===========================================================================
  console.log('📊 Creating transactions...')

  // ----- Ahmad's Wallet Transactions -----
  // Ahmad has released payments from Order 1 ($628.20) and Order 6 ($449.10)
  // He also has a completed withdrawal ($500) and pending withdrawal ($200)

  let ahmadRunningBalance = 0

  // Order 1: escrow_hold
  await db.transaction.create({
    data: {
      walletId: ahmadWallet.id,
      paymentId: payment1.id,
      type: 'escrow_hold',
      amount: order1SellerPayout, // $628.20
      balance: ahmadRunningBalance, // balance unchanged for escrow_hold
      description: `Escrow hold for order #${order1.id.slice(-8)} — Custom Logo Design Package + E-Commerce Starter Kit`,
      status: 'completed',
      referenceType: 'order',
      referenceId: order1.id,
      metadata: JSON.stringify({ orderId: order1.id, escrowStatus: 'held' }),
      createdAt: daysAgo(20),
    },
  })
  console.log(`  ✅ Ahmad: escrow_hold $${order1SellerPayout} (Order 1)`)

  // Order 1: escrow_release
  ahmadRunningBalance = r(ahmadRunningBalance + order1SellerPayout) // $628.20
  await db.transaction.create({
    data: {
      walletId: ahmadWallet.id,
      paymentId: payment1.id,
      type: 'escrow_release',
      amount: order1SellerPayout, // $628.20
      balance: ahmadRunningBalance,
      description: `Escrow released for order #${order1.id.slice(-8)} — Payment settled to available balance`,
      status: 'completed',
      referenceType: 'order',
      referenceId: order1.id,
      metadata: JSON.stringify({ orderId: order1.id, escrowStatus: 'released' }),
      createdAt: daysAgo(17),
    },
  })
  console.log(`  ✅ Ahmad: escrow_release $${order1SellerPayout} (Order 1)`)

  // Order 6: escrow_hold
  await db.transaction.create({
    data: {
      walletId: ahmadWallet.id,
      paymentId: payment6.id,
      type: 'escrow_hold',
      amount: order6SellerPayout, // $449.10
      balance: ahmadRunningBalance, // unchanged for escrow_hold
      description: `Escrow hold for order #${order6.id.slice(-8)} — Custom Logo Design Package`,
      status: 'completed',
      referenceType: 'order',
      referenceId: order6.id,
      metadata: JSON.stringify({ orderId: order6.id, escrowStatus: 'held' }),
      createdAt: daysAgo(8),
    },
  })
  console.log(`  ✅ Ahmad: escrow_hold $${order6SellerPayout} (Order 6)`)

  // Order 6: escrow_release
  ahmadRunningBalance = r(ahmadRunningBalance + order6SellerPayout) // $1,077.30
  await db.transaction.create({
    data: {
      walletId: ahmadWallet.id,
      paymentId: payment6.id,
      type: 'escrow_release',
      amount: order6SellerPayout, // $449.10
      balance: ahmadRunningBalance,
      description: `Escrow released for order #${order6.id.slice(-8)} — Payment settled to available balance`,
      status: 'completed',
      referenceType: 'order',
      referenceId: order6.id,
      metadata: JSON.stringify({ orderId: order6.id, escrowStatus: 'released' }),
      createdAt: daysAgo(5),
    },
  })
  console.log(`  ✅ Ahmad: escrow_release $${order6SellerPayout} (Order 6)`)

  // Completed withdrawal: $500 via bank_transfer
  ahmadRunningBalance = r(ahmadRunningBalance - 500) // $577.30
  await db.transaction.create({
    data: {
      walletId: ahmadWallet.id,
      paymentId: null,
      type: 'withdrawal',
      amount: 500,
      balance: ahmadRunningBalance,
      description: 'Withdrawal via bank transfer — completed',
      status: 'completed',
      referenceType: 'withdrawal',
      createdAt: daysAgo(4),
    },
  })
  console.log(`  ✅ Ahmad: withdrawal $500 (completed)`)

  // Pending withdrawal: $200 via Easypaisa
  ahmadRunningBalance = r(ahmadRunningBalance - 200) // $377.30
  await db.transaction.create({
    data: {
      walletId: ahmadWallet.id,
      paymentId: null,
      type: 'withdrawal',
      amount: 200,
      balance: ahmadRunningBalance,
      description: 'Withdrawal via Easypaisa — pending',
      status: 'pending',
      referenceType: 'withdrawal',
      createdAt: daysAgo(1),
    },
  })
  console.log(`  ✅ Ahmad: withdrawal $200 (pending)`)

  // Update Ahmad's wallet to final state
  const ahmadTotalEarnings = r(order1SellerPayout + order6SellerPayout) // $1,077.30
  await db.wallet.update({
    where: { id: ahmadWallet.id },
    data: {
      balance: ahmadRunningBalance, // $377.30
      pendingBalance: 0,
      totalEarnings: ahmadTotalEarnings,
      totalWithdrawn: 500, // only completed withdrawal
    },
  })

  // ----- Sarah's Wallet Transactions -----
  // Sarah has previous released earnings ($400 from historical orders)
  // Order 2 is held in escrow ($224.10)
  // Order 5 was refunded ($53.10 held then refunded)
  // Processing withdrawal of $150

  let sarahRunningBalance = 0

  // Previous earnings: escrow_hold (historical)
  await db.transaction.create({
    data: {
      walletId: sarahWallet.id,
      paymentId: null,
      type: 'escrow_hold',
      amount: 400,
      balance: sarahRunningBalance,
      description: 'Escrow hold for previous orders — historical balance',
      status: 'completed',
      referenceType: 'order',
      createdAt: daysAgo(60),
    },
  })

  // Previous earnings: escrow_release (historical)
  sarahRunningBalance = r(sarahRunningBalance + 400) // $400
  await db.transaction.create({
    data: {
      walletId: sarahWallet.id,
      paymentId: null,
      type: 'escrow_release',
      amount: 400,
      balance: sarahRunningBalance,
      description: 'Escrow released for previous orders — settled to available balance',
      status: 'completed',
      referenceType: 'order',
      createdAt: daysAgo(55),
    },
  })
  console.log(`  ✅ Sarah: previous earnings $400`)

  // Order 5: escrow_hold (before refund)
  await db.transaction.create({
    data: {
      walletId: sarahWallet.id,
      paymentId: payment5.id,
      type: 'escrow_hold',
      amount: order5SellerPayout, // $53.10
      balance: sarahRunningBalance, // unchanged
      description: `Escrow hold for order #${order5.id.slice(-8)} — Social Media Design Pack`,
      status: 'completed',
      referenceType: 'order',
      referenceId: order5.id,
      metadata: JSON.stringify({ orderId: order5.id, escrowStatus: 'held' }),
      createdAt: daysAgo(15),
    },
  })

  // Order 5: refund (reverses the escrow_hold)
  await db.transaction.create({
    data: {
      walletId: sarahWallet.id,
      paymentId: payment5.id,
      type: 'refund',
      amount: order5SellerPayout, // $53.10
      balance: sarahRunningBalance, // unchanged (refund reverses pending)
      description: `Refund for order #${order5.id.slice(-8)} — Escrow returned to buyer`,
      status: 'completed',
      referenceType: 'refund',
      referenceId: order5.id,
      metadata: JSON.stringify({ orderId: order5.id, escrowStatus: 'refunded' }),
      createdAt: daysAgo(14),
    },
  })
  console.log(`  ✅ Sarah: refund $${order5SellerPayout} (Order 5)`)

  // Order 2: escrow_hold (still held)
  await db.transaction.create({
    data: {
      walletId: sarahWallet.id,
      paymentId: payment2.id,
      type: 'escrow_hold',
      amount: order2SellerPayout, // $224.10
      balance: sarahRunningBalance, // unchanged
      description: `Escrow hold for order #${order2.id.slice(-8)} — Brand Identity Kit`,
      status: 'completed',
      referenceType: 'order',
      referenceId: order2.id,
      metadata: JSON.stringify({ orderId: order2.id, escrowStatus: 'held' }),
      createdAt: daysAgo(5),
    },
  })
  console.log(`  ✅ Sarah: escrow_hold $${order2SellerPayout} (Order 2)`)

  // Processing withdrawal: $150 via JazzCash
  sarahRunningBalance = r(sarahRunningBalance - 150) // $250
  await db.transaction.create({
    data: {
      walletId: sarahWallet.id,
      paymentId: null,
      type: 'withdrawal',
      amount: 150,
      balance: sarahRunningBalance,
      description: 'Withdrawal via JazzCash — processing',
      status: 'pending',
      referenceType: 'withdrawal',
      createdAt: daysAgo(3),
    },
  })
  console.log(`  ✅ Sarah: withdrawal $150 (processing)`)

  // Rejected withdrawal: $100 via Wise — net zero effect on balance
  // When requested, balance was deducted; when rejected, it was returned
  // We create a debit and a credit to show the full history
  sarahRunningBalance = r(sarahRunningBalance - 100) // $150
  await db.transaction.create({
    data: {
      walletId: sarahWallet.id,
      paymentId: null,
      type: 'withdrawal',
      amount: 100,
      balance: sarahRunningBalance,
      description: 'Withdrawal via Wise — requested',
      status: 'pending',
      referenceType: 'withdrawal',
      createdAt: daysAgo(6),
    },
  })

  sarahRunningBalance = r(sarahRunningBalance + 100) // $250
  await db.transaction.create({
    data: {
      walletId: sarahWallet.id,
      paymentId: null,
      type: 'credit',
      amount: 100,
      balance: sarahRunningBalance,
      description: 'Withdrawal via Wise — rejected, funds returned',
      status: 'completed',
      referenceType: 'withdrawal',
      metadata: JSON.stringify({ reason: 'Account verification failed' }),
      createdAt: daysAgo(5),
    },
  })
  console.log(`  ✅ Sarah: withdrawal $100 (rejected, returned)`)

  // Update Sarah's wallet to final state
  await db.wallet.update({
    where: { id: sarahWallet.id },
    data: {
      balance: sarahRunningBalance, // $250
      pendingBalance: order2SellerPayout, // $224.10 (only Order 2 is still held)
      totalEarnings: 400, // from historical orders only
      totalWithdrawn: 0, // no completed withdrawals
    },
  })

  // ----- Hamza's Wallet Transactions -----
  // Hamza has escrow held from Order 3 ($539.10) and Order 7 ($116.10)
  // No released payments yet

  let hamzaRunningBalance = 0

  // Order 3: escrow_hold (payment processing, but escrow created)
  await db.transaction.create({
    data: {
      walletId: hamzaWallet.id,
      paymentId: payment3.id,
      type: 'escrow_hold',
      amount: order3SellerPayout, // $539.10
      balance: hamzaRunningBalance, // unchanged
      description: `Escrow hold for order #${order3.id.slice(-8)} — Full-Stack Development Service`,
      status: 'completed',
      referenceType: 'order',
      referenceId: order3.id,
      metadata: JSON.stringify({ orderId: order3.id, escrowStatus: 'held', paymentStatus: 'processing' }),
      createdAt: daysAgo(2),
    },
  })
  console.log(`  ✅ Hamza: escrow_hold $${order3SellerPayout} (Order 3)`)

  // Order 7: escrow_hold
  await db.transaction.create({
    data: {
      walletId: hamzaWallet.id,
      paymentId: payment7.id,
      type: 'escrow_hold',
      amount: order7SellerPayout, // $116.10
      balance: hamzaRunningBalance, // unchanged
      description: `Escrow hold for order #${order7.id.slice(-8)} — React Dashboard Template`,
      status: 'completed',
      referenceType: 'order',
      referenceId: order7.id,
      metadata: JSON.stringify({ orderId: order7.id, escrowStatus: 'held' }),
      createdAt: daysAgo(3),
    },
  })
  console.log(`  ✅ Hamza: escrow_hold $${order7SellerPayout} (Order 7)`)

  // Update Hamza's wallet to final state
  const hamzaPendingBalance = r(order3SellerPayout + order7SellerPayout) // $655.20
  await db.wallet.update({
    where: { id: hamzaWallet.id },
    data: {
      balance: 0,
      pendingBalance: hamzaPendingBalance,
      totalEarnings: 0,
      totalWithdrawn: 0,
    },
  })

  // Buyer wallets remain at zero (they pay through external methods)
  console.log('  ✅ Ali, Emma, Admin wallets: $0 (buyers/admin)\n')

  // ===========================================================================
  // 10. Create Withdrawals
  // ===========================================================================
  console.log('🏧 Creating withdrawals...')

  // Pending withdrawal for Ahmad ($200 via Easypaisa)
  await db.withdrawal.create({
    data: {
      walletId: ahmadWallet.id,
      userId: ahmad.id,
      amount: 200,
      fee: 5,
      netAmount: r(200 - 5), // $195
      method: 'easypaisa',
      accountDetails: JSON.stringify({
        accountName: 'Ahmad Khan',
        accountNumber: '03001234567',
        provider: 'easypaisa',
      }),
      status: 'pending',
      createdAt: daysAgo(1),
    },
  })
  console.log('  ✅ Ahmad: $200 pending (Easypaisa)')

  // Processing withdrawal for Sarah ($150 via JazzCash)
  await db.withdrawal.create({
    data: {
      walletId: sarahWallet.id,
      userId: sarah.id,
      amount: 150,
      fee: 3,
      netAmount: r(150 - 3), // $147
      method: 'jazzcash',
      accountDetails: JSON.stringify({
        accountName: 'Sarah Ahmed',
        accountNumber: '03119876543',
        provider: 'jazzcash',
      }),
      status: 'processing',
      processedAt: daysAgo(2),
      createdAt: daysAgo(3),
    },
  })
  console.log('  ✅ Sarah: $150 processing (JazzCash)')

  // Completed withdrawal for Ahmad ($500 via bank_transfer)
  await db.withdrawal.create({
    data: {
      walletId: ahmadWallet.id,
      userId: ahmad.id,
      amount: 500,
      fee: 10,
      netAmount: r(500 - 10), // $490
      method: 'bank_transfer',
      accountDetails: JSON.stringify({
        accountName: 'Ahmad Khan',
        accountNumber: 'PK36SCBL0000001234567890',
        bankName: 'Standard Chartered Bank',
        branchCode: '0123',
        swiftCode: 'SCBLPKKK',
      }),
      status: 'completed',
      processedAt: daysAgo(4),
      completedAt: daysAgo(4),
      createdAt: daysAgo(5),
    },
  })
  console.log('  ✅ Ahmad: $500 completed (bank_transfer)')

  // Rejected withdrawal for Sarah ($100 via Wise)
  await db.withdrawal.create({
    data: {
      walletId: sarahWallet.id,
      userId: sarah.id,
      amount: 100,
      fee: 8,
      netAmount: r(100 - 8), // $92
      method: 'wise',
      accountDetails: JSON.stringify({
        accountName: 'Sarah Ahmed',
        accountNumber: 'GB29NWBK60161331926819',
        bankName: 'Wise (TransferWise)',
      }),
      status: 'rejected',
      adminNote: 'Account verification failed. Please provide valid government-issued ID and proof of address to verify your Wise account before requesting withdrawals.',
      processedAt: daysAgo(5),
      rejectedAt: daysAgo(5),
      createdAt: daysAgo(6),
    },
  })
  console.log('  ✅ Sarah: $100 rejected (Wise)\n')

  // ===========================================================================
  // 11. Create Dispute
  // ===========================================================================
  console.log('⚖️ Creating dispute...')

  await db.dispute.create({
    data: {
      orderId: order5.id,
      userId: ali.id,
      reason: 'Product not as described',
      description: 'The Social Media Design Pack did not match the preview images shown on the product page. Several templates were low resolution and unusable for professional work. The Canva links were broken for 3 out of 10 themes, and the Figma file had missing components. I expected the quality shown in the previews but received a significantly inferior product.',
      status: 'investigating',
      createdAt: daysAgo(13),
    },
  })
  console.log('  ✅ Dispute created for Order 5 (Ali vs Sarah)\n')

  // ===========================================================================
  // 12. Create Notifications
  // ===========================================================================
  console.log('🔔 Creating notifications...')

  const notificationsData = [
    // Ali's notifications
    {
      userId: ali.id,
      title: 'Order Delivered',
      message: `Your order #${order1.id.slice(-8)} has been delivered. Custom Logo Design Package + E-Commerce Starter Kit are now available.`,
      type: 'order',
      link: `/orders/${order1.id}`,
    },
    {
      userId: ali.id,
      title: 'Payment Processing',
      message: `Your payment for order #${order3.id.slice(-8)} is being processed via Payoneer. We'll notify you once it's confirmed.`,
      type: 'order',
      link: `/orders/${order3.id}`,
    },
    {
      userId: ali.id,
      title: 'Refund Processed',
      message: `Your refund for order #${order5.id.slice(-8)} has been processed. $59 will be returned to your Easypaisa account within 3-5 business days.`,
      type: 'success',
      link: `/orders/${order5.id}`,
    },
    {
      userId: ali.id,
      title: 'Dispute Update',
      message: `Your dispute for order #${order5.id.slice(-8)} is now being investigated by our team. We'll provide an update within 48 hours.`,
      type: 'warning',
      link: `/disputes`,
    },

    // Emma's notifications
    {
      userId: emma.id,
      title: 'Order Processing',
      message: `Your order #${order2.id.slice(-8)} for Brand Identity Kit is being processed by the seller.`,
      type: 'order',
      link: `/orders/${order2.id}`,
    },
    {
      userId: emma.id,
      title: 'Payment Failed',
      message: `Payment for order #${order4.id.slice(-8)} failed due to insufficient funds. Please update your payment method and try again.`,
      type: 'error',
      link: `/orders/${order4.id}`,
    },
    {
      userId: emma.id,
      title: 'Order Shipped',
      message: `Your order #${order7.id.slice(-8)} has been shipped! Tracking number: TRK-2025-007-UK.`,
      type: 'order',
      link: `/orders/${order7.id}`,
    },

    // Ahmad's notifications
    {
      userId: ahmad.id,
      title: 'New Order Received',
      message: `You have a new order #${order1.id.slice(-8)} from Ali Raza. Custom Logo Design Package + E-Commerce Starter Kit.`,
      type: 'order',
      link: `/orders/${order1.id}`,
    },
    {
      userId: ahmad.id,
      title: 'Payment Released',
      message: `$628.20 has been released to your wallet for order #${order1.id.slice(-8)}. The funds are now available for withdrawal.`,
      type: 'success',
      link: `/wallet`,
    },
    {
      userId: ahmad.id,
      title: 'New Order Received',
      message: `You have a new order #${order6.id.slice(-8)} from Hamza Malik. Custom Logo Design Package.`,
      type: 'order',
      link: `/orders/${order6.id}`,
    },
    {
      userId: ahmad.id,
      title: 'Payment Released',
      message: `$449.10 has been released to your wallet for order #${order6.id.slice(-8)}. The funds are now available for withdrawal.`,
      type: 'success',
      link: `/wallet`,
    },
    {
      userId: ahmad.id,
      title: 'Withdrawal Completed',
      message: `Your withdrawal of $500 via bank transfer has been completed. $490 has been credited to your bank account.`,
      type: 'success',
      link: `/wallet`,
    },
    {
      userId: ahmad.id,
      title: 'Withdrawal Pending',
      message: `Your withdrawal request of $200 via Easypaisa is being processed.`,
      type: 'info',
      link: `/wallet`,
    },

    // Sarah's notifications
    {
      userId: sarah.id,
      title: 'New Order Received',
      message: `You have a new order #${order2.id.slice(-8)} from Emma Wilson. Brand Identity Kit.`,
      type: 'order',
      link: `/orders/${order2.id}`,
    },
    {
      userId: sarah.id,
      title: 'Withdrawal Processing',
      message: `Your withdrawal of $150 via JazzCash is being processed. Expected completion: 1-2 business days.`,
      type: 'info',
      link: `/wallet`,
    },
    {
      userId: sarah.id,
      title: 'Withdrawal Rejected',
      message: `Your withdrawal of $100 via Wise has been rejected. Reason: Account verification failed. Funds have been returned to your wallet.`,
      type: 'error',
      link: `/wallet`,
    },
    {
      userId: sarah.id,
      title: 'Dispute Filed',
      message: `A dispute has been filed for order #${order5.id.slice(-8)} by Ali Raza. Reason: Product not as described. Please respond within 48 hours.`,
      type: 'warning',
      link: `/disputes`,
    },

    // Hamza's notifications
    {
      userId: hamza.id,
      title: 'New Order Received',
      message: `You have a new order #${order3.id.slice(-8)} from Ali Raza. Full-Stack Development Service.`,
      type: 'order',
      link: `/orders/${order3.id}`,
    },
    {
      userId: hamza.id,
      title: 'New Order Received',
      message: `You have a new order #${order7.id.slice(-8)} from Emma Wilson. React Dashboard Template.`,
      type: 'order',
      link: `/orders/${order7.id}`,
    },
    {
      userId: hamza.id,
      title: 'Order Confirmed',
      message: `Your purchase of Custom Logo Design Package from Ahmad's Tech Hub has been delivered. Order #${order6.id.slice(-8)}.`,
      type: 'order',
      link: `/orders/${order6.id}`,
      isRead: true,
    },
  ]

  for (const n of notificationsData) {
    await db.notification.create({ data: n })
  }
  console.log(`  ✅ Created ${notificationsData.length} notifications\n`)

  // ===========================================================================
  // 13. Update PlatformStats
  // ===========================================================================
  console.log('📈 Creating platform stats...')

  // Calculate total revenue from completed payments (platform fees only)
  const totalRevenue = r(
    order1PlatformFee +  // $69.80 (completed, released)
    order2PlatformFee +  // $24.90 (completed, held)
    order6PlatformFee +  // $49.90 (completed, released)
    order7PlatformFee    // $12.90 (completed, held)
    // Excluding: Order 3 (processing), Order 4 (failed), Order 5 (refunded)
  )

  await db.platformStats.create({
    data: {
      totalUsers: 6,
      totalSellers: 3, // Ahmad, Sarah, Hamza (role=seller or role=both)
      totalProducts: 9,
      totalOrders: 7,
      totalRevenue: totalRevenue,
    },
  })
  console.log(`  ✅ PlatformStats: ${6} users, ${3} sellers, ${9} products, ${7} orders, $${totalRevenue} revenue\n`)

  // ===========================================================================
  // Summary
  // ===========================================================================
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('🎉 Marketo Payment System seed completed successfully!')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log()
  console.log('📋 Summary:')
  console.log('───────────────────────────────────────────────────────────────')
  console.log(`  Users:       6 (1 admin, 2 sellers, 2 buyers, 1 both)`)
  console.log(`  Categories:  5`)
  console.log(`  Shops:       3`)
  console.log(`  Products:    9 (3 per shop)`)
  console.log(`  Wallets:     6 (one per user)`)
  console.log(`  Orders:      7`)
  console.log(`  Payments:    7`)
  console.log(`  Withdrawals: 4`)
  console.log(`  Disputes:    1`)
  console.log()
  console.log('💰 Wallet Balances:')
  console.log('───────────────────────────────────────────────────────────────')
  console.log(`  Ahmad:  balance=$377.30 | pending=$0.00    | earnings=$1,077.30 | withdrawn=$500.00`)
  console.log(`  Sarah:  balance=$250.00 | pending=$224.10  | earnings=$400.00   | withdrawn=$0.00`)
  console.log(`  Hamza:  balance=$0.00   | pending=$655.20  | earnings=$0.00     | withdrawn=$0.00`)
  console.log(`  Ali:    balance=$0.00   | pending=$0.00    | earnings=$0.00     | withdrawn=$0.00`)
  console.log(`  Emma:   balance=$0.00   | pending=$0.00    | earnings=$0.00     | withdrawn=$0.00`)
  console.log(`  Admin:  balance=$0.00   | pending=$0.00    | earnings=$0.00     | withdrawn=$0.00`)
  console.log()
  console.log('🔑 Test Accounts:')
  console.log('───────────────────────────────────────────────────────────────')
  console.log('  admin@marketo.com  / Admin123!  (admin, both)')
  console.log('  ahmad@marketo.com  / Seller123! (seller)')
  console.log('  sarah@marketo.com  / Seller123! (seller)')
  console.log('  ali@marketo.com    / Buyer123!  (buyer)')
  console.log('  emma@marketo.com   / Buyer123!  (buyer)')
  console.log('  hamza@marketo.com  / Both123!   (both)')
  console.log('═══════════════════════════════════════════════════════════════')
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await db.$disconnect()
    process.exit(1)
  })
