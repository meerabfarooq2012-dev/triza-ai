// =============================================================================
// TRIZA - Physical Product Subcategories
// Maps each physical category slug to its list of subcategories (with name + slug)
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

const rawPhysicalSubcategories: Record<string, string[]> = {
  'fashion-clothing': [
    'Men Clothing',
    'Women Clothing',
    'Kids Clothing',
    'Hoodies',
    'T-Shirts',
    'Jeans',
    'Jackets',
    'Traditional Wear',
    'Sportswear',
    'Shoes & Footwear',
  ],

  'jewelry-accessories': [
    'Rings',
    'Necklaces',
    'Bracelets',
    'Earrings',
    'Watches',
    'Handbags',
    'Wallets',
    'Sunglasses',
    'Hair Accessories',
    'Luxury Accessories',
  ],

  'beauty-personal-care': [
    'Makeup Products',
    'Skincare',
    'Hair Care',
    'Perfumes',
    'Nail Products',
    'Beauty Tools',
    'Organic Beauty Products',
  ],

  'electronics': [
    'Mobile Phones',
    'Laptops',
    'Headphones',
    'Smart Watches',
    'Gaming Accessories',
    'Cameras',
    'Computer Accessories',
    'Speakers',
    'Chargers & Cables',
  ],

  'home-living': [
    'Furniture',
    'Home Decor',
    'Kitchen Accessories',
    'Bedsheets',
    'Curtains',
    'Lighting',
    'Storage Products',
    'Wall Art',
  ],

  'handmade-products': [
    'Handmade Jewelry',
    'Handmade Crafts',
    'Handmade Bags',
    'Handmade Decor',
    'Crochet Products',
    'Resin Art',
    'Pottery',
  ],

  'art-crafts': [
    'Paintings',
    'Sketches',
    'Canvas Art',
    'Craft Supplies',
    'DIY Kits',
    'Calligraphy Products',
  ],

  'textile-fabric': [
    'Fabric Materials',
    'Printed Fabric',
    'Embroidered Fabric',
    'Lawn Fabric',
    'Cotton Fabric',
    'Silk Fabric',
    'Textile Patterns',
  ],

  'food-beverages': [
    'Snacks',
    'Bakery Items',
    'Organic Food',
    'Dry Fruits',
    'Chocolates',
    'Beverages',
    'Homemade Food',
  ],

  'health-fitness': [
    'Gym Equipment',
    'Yoga Products',
    'Fitness Accessories',
    'Protein Shakers',
    'Sports Equipment',
  ],

  'toys-games': [
    'Kids Toys',
    'Educational Toys',
    'Board Games',
    'Remote Control Toys',
    'Action Figures',
  ],

  'pet-supplies': [
    'Pet Food',
    'Pet Toys',
    'Pet Clothes',
    'Pet Accessories',
    'Pet Beds',
  ],

  'automotive': [
    'Car Accessories',
    'Bike Accessories',
    'Car Care Products',
    'Helmets',
    'Seat Covers',
  ],

  'books': [
    'Academic Books',
    'School Books',
    'College Books',
    'University Books',
    'Novels',
    'Story Books',
    'Islamic Books',
    'Kids Books',
    'Comics & Manga',
    'Poetry Books',
    'Self-Help Books',
    'Business Books',
    'Programming Books',
    'Medical Books',
    'Engineering Books',
    'Fashion Books',
    'Art & Design Books',
    'Cooking Books',
    'Language Learning Books',
    'Motivational Books',
    'History Books',
    'Science Books',
    'Biography Books',
    'Entrance Exam Books',
    'Stationery Sets',
  ],

  'furniture': [
    'Sofas',
    'Chairs',
    'Tables',
    'Office Furniture',
    'Bedroom Furniture',
  ],

  'baby-products': [
    'Baby Clothes',
    'Baby Toys',
    'Baby Care Products',
    'Baby Feeding Products',
    'Baby Furniture',
  ],

  'sports-outdoor': [
    'Camping Gear',
    'Sportswear',
    'Outdoor Equipment',
    'Cycling Products',
    'Hiking Accessories',
  ],

  'gifts-custom-products': [
    'Personalized Gifts',
    'Custom Mugs',
    'Photo Frames',
    'Gift Boxes',
    'Customized T-Shirts',
    'Customized Jewelry',
  ],
}

// Build the exported PHYSICAL_SUBCATEGORIES with {name, slug} objects
export const PHYSICAL_SUBCATEGORIES: Record<string, { name: string; slug: string }[]> = {}
for (const [parentSlug, names] of Object.entries(rawPhysicalSubcategories)) {
  PHYSICAL_SUBCATEGORIES[parentSlug] = buildSubcategories(parentSlug, names)
}

// Also export the raw data for seeding (just names)
export { rawPhysicalSubcategories }
export { toSlug }
