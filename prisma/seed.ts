import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

// =============================================================================
// Thiora - Minimal Seed Script
// Creates only: Admin user + Categories
// No fake products, shops, gigs, orders, or transactions
// =============================================================================

const SALT_ROUNDS = 10

async function main() {
  console.log('🌱 Starting Thiora minimal seed...\n')

  // ===========================================================================
  // 1. Clear all existing data (respecting foreign key order)
  // ===========================================================================
  console.log('🧹 Clearing existing data...')

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
  // 2. Create Admin User
  // ===========================================================================
  console.log('👤 Creating admin user...')

  const admin = await db.user.create({
    data: {
      email: 'admin@thiora.com',
      password: await bcrypt.hash('Admin123!', SALT_ROUNDS),
      name: 'Admin User',
      role: 'both',
      isAdmin: true,
      isVerified: true,
      isActive: true,
      bio: 'Platform administrator for Thiora marketplace.',
    },
  })

  // Create admin wallet
  await db.wallet.create({
    data: {
      userId: admin.id,
      balance: 0,
      pendingBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      currency: 'USD',
    },
  })

  console.log(`  ✅ Admin: ${admin.email}`)
  console.log(`  ✅ Admin wallet created\n`)

  // ===========================================================================
  // 3. Create Categories
  // ===========================================================================
  console.log('📂 Creating categories...')

  const categories = [
    {
      name: 'Digital Products',
      slug: 'digital-products',
      icon: 'Download',
      description: 'Downloadable digital products, software, and resources',
      sortOrder: 0,
    },
    {
      name: 'Web Development',
      slug: 'web-development',
      icon: 'Globe',
      description: 'Web development tools, templates, and services',
      sortOrder: 1,
    },
    {
      name: 'Graphic Design',
      slug: 'graphic-design',
      icon: 'Palette',
      description: 'Graphic design assets, illustrations, and creative resources',
      sortOrder: 2,
    },
    {
      name: 'Mobile Apps',
      slug: 'mobile-apps',
      icon: 'Smartphone',
      description: 'Mobile app templates, UI kits, and development resources',
      sortOrder: 3,
    },
    {
      name: 'Consulting',
      slug: 'consulting',
      icon: 'MessageSquare',
      description: 'Professional consulting and freelance services',
      sortOrder: 4,
    },
    {
      name: 'Writing & Translation',
      slug: 'writing-translation',
      icon: 'FileText',
      description: 'Content writing, copywriting, and translation services',
      sortOrder: 5,
    },
    {
      name: 'Video & Animation',
      slug: 'video-animation',
      icon: 'Film',
      description: 'Video editing, animation, and motion graphics',
      sortOrder: 6,
    },
    {
      name: 'Marketing',
      slug: 'marketing',
      icon: 'Megaphone',
      description: 'Digital marketing, SEO, and social media management',
      sortOrder: 7,
    },
    {
      name: 'AI & Data',
      slug: 'ai-data',
      icon: 'Brain',
      description: 'AI solutions, machine learning, and data science',
      sortOrder: 8,
    },
  ]

  for (const cat of categories) {
    await db.category.create({
      data: {
        ...cat,
        isActive: true,
      },
    })
  }

  console.log(`  ✅ Created ${categories.length} categories\n`)

  // ===========================================================================
  // Done!
  // ===========================================================================
  console.log('🎉 Seed complete!\n')
  console.log('Summary:')
  console.log('  - 1 admin user (admin@thiora.com / Admin123!)')
  console.log(`  - ${categories.length} categories`)
  console.log('  - No fake products, shops, gigs, orders, or transactions')
  console.log('\nThe marketplace is ready for real users to sign up and create content.\n')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
