-- STEP 2: Physical Product Subcategories (137)
-- Paste this in Supabase SQL Editor and click Run

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p001-s01', 'Men Clothing', 'fashion-clothing--men-clothing', NULL, NULL, 'cat-p001', 0, true, NOW()),
  ('cat-p001-s02', 'Women Clothing', 'fashion-clothing--women-clothing', NULL, NULL, 'cat-p001', 1, true, NOW()),
  ('cat-p001-s03', 'Kids Clothing', 'fashion-clothing--kids-clothing', NULL, NULL, 'cat-p001', 2, true, NOW()),
  ('cat-p001-s04', 'Hoodies', 'fashion-clothing--hoodies', NULL, NULL, 'cat-p001', 3, true, NOW()),
  ('cat-p001-s05', 'T-Shirts', 'fashion-clothing--t-shirts', NULL, NULL, 'cat-p001', 4, true, NOW()),
  ('cat-p001-s06', 'Jeans', 'fashion-clothing--jeans', NULL, NULL, 'cat-p001', 5, true, NOW()),
  ('cat-p001-s07', 'Jackets', 'fashion-clothing--jackets', NULL, NULL, 'cat-p001', 6, true, NOW()),
  ('cat-p001-s08', 'Traditional Wear', 'fashion-clothing--traditional-wear', NULL, NULL, 'cat-p001', 7, true, NOW()),
  ('cat-p001-s09', 'Sportswear', 'fashion-clothing--sportswear', NULL, NULL, 'cat-p001', 8, true, NOW()),
  ('cat-p001-s10', 'Shoes & Footwear', 'fashion-clothing--shoes-footwear', NULL, NULL, 'cat-p001', 9, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p002-s01', 'Rings', 'jewelry-accessories--rings', NULL, NULL, 'cat-p002', 0, true, NOW()),
  ('cat-p002-s02', 'Necklaces', 'jewelry-accessories--necklaces', NULL, NULL, 'cat-p002', 1, true, NOW()),
  ('cat-p002-s03', 'Bracelets', 'jewelry-accessories--bracelets', NULL, NULL, 'cat-p002', 2, true, NOW()),
  ('cat-p002-s04', 'Earrings', 'jewelry-accessories--earrings', NULL, NULL, 'cat-p002', 3, true, NOW()),
  ('cat-p002-s05', 'Watches', 'jewelry-accessories--watches', NULL, NULL, 'cat-p002', 4, true, NOW()),
  ('cat-p002-s06', 'Handbags', 'jewelry-accessories--handbags', NULL, NULL, 'cat-p002', 5, true, NOW()),
  ('cat-p002-s07', 'Wallets', 'jewelry-accessories--wallets', NULL, NULL, 'cat-p002', 6, true, NOW()),
  ('cat-p002-s08', 'Sunglasses', 'jewelry-accessories--sunglasses', NULL, NULL, 'cat-p002', 7, true, NOW()),
  ('cat-p002-s09', 'Hair Accessories', 'jewelry-accessories--hair-accessories', NULL, NULL, 'cat-p002', 8, true, NOW()),
  ('cat-p002-s10', 'Luxury Accessories', 'jewelry-accessories--luxury-accessories', NULL, NULL, 'cat-p002', 9, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p003-s01', 'Makeup Products', 'beauty-personal-care--makeup-products', NULL, NULL, 'cat-p003', 0, true, NOW()),
  ('cat-p003-s02', 'Skincare', 'beauty-personal-care--skincare', NULL, NULL, 'cat-p003', 1, true, NOW()),
  ('cat-p003-s03', 'Hair Care', 'beauty-personal-care--hair-care', NULL, NULL, 'cat-p003', 2, true, NOW()),
  ('cat-p003-s04', 'Perfumes', 'beauty-personal-care--perfumes', NULL, NULL, 'cat-p003', 3, true, NOW()),
  ('cat-p003-s05', 'Nail Products', 'beauty-personal-care--nail-products', NULL, NULL, 'cat-p003', 4, true, NOW()),
  ('cat-p003-s06', 'Beauty Tools', 'beauty-personal-care--beauty-tools', NULL, NULL, 'cat-p003', 5, true, NOW()),
  ('cat-p003-s07', 'Organic Beauty Products', 'beauty-personal-care--organic-beauty-products', NULL, NULL, 'cat-p003', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p004-s01', 'Mobile Phones', 'electronics--mobile-phones', NULL, NULL, 'cat-p004', 0, true, NOW()),
  ('cat-p004-s02', 'Laptops', 'electronics--laptops', NULL, NULL, 'cat-p004', 1, true, NOW()),
  ('cat-p004-s03', 'Headphones', 'electronics--headphones', NULL, NULL, 'cat-p004', 2, true, NOW()),
  ('cat-p004-s04', 'Smart Watches', 'electronics--smart-watches', NULL, NULL, 'cat-p004', 3, true, NOW()),
  ('cat-p004-s05', 'Gaming Accessories', 'electronics--gaming-accessories', NULL, NULL, 'cat-p004', 4, true, NOW()),
  ('cat-p004-s06', 'Cameras', 'electronics--cameras', NULL, NULL, 'cat-p004', 5, true, NOW()),
  ('cat-p004-s07', 'Computer Accessories', 'electronics--computer-accessories', NULL, NULL, 'cat-p004', 6, true, NOW()),
  ('cat-p004-s08', 'Speakers', 'electronics--speakers', NULL, NULL, 'cat-p004', 7, true, NOW()),
  ('cat-p004-s09', 'Chargers & Cables', 'electronics--chargers-cables', NULL, NULL, 'cat-p004', 8, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p005-s01', 'Furniture', 'home-living--furniture', NULL, NULL, 'cat-p005', 0, true, NOW()),
  ('cat-p005-s02', 'Home Decor', 'home-living--home-decor', NULL, NULL, 'cat-p005', 1, true, NOW()),
  ('cat-p005-s03', 'Kitchen Accessories', 'home-living--kitchen-accessories', NULL, NULL, 'cat-p005', 2, true, NOW()),
  ('cat-p005-s04', 'Bedsheets', 'home-living--bedsheets', NULL, NULL, 'cat-p005', 3, true, NOW()),
  ('cat-p005-s05', 'Curtains', 'home-living--curtains', NULL, NULL, 'cat-p005', 4, true, NOW()),
  ('cat-p005-s06', 'Lighting', 'home-living--lighting', NULL, NULL, 'cat-p005', 5, true, NOW()),
  ('cat-p005-s07', 'Storage Products', 'home-living--storage-products', NULL, NULL, 'cat-p005', 6, true, NOW()),
  ('cat-p005-s08', 'Wall Art', 'home-living--wall-art', NULL, NULL, 'cat-p005', 7, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p006-s01', 'Handmade Jewelry', 'handmade-products--handmade-jewelry', NULL, NULL, 'cat-p006', 0, true, NOW()),
  ('cat-p006-s02', 'Handmade Crafts', 'handmade-products--handmade-crafts', NULL, NULL, 'cat-p006', 1, true, NOW()),
  ('cat-p006-s03', 'Handmade Bags', 'handmade-products--handmade-bags', NULL, NULL, 'cat-p006', 2, true, NOW()),
  ('cat-p006-s04', 'Handmade Decor', 'handmade-products--handmade-decor', NULL, NULL, 'cat-p006', 3, true, NOW()),
  ('cat-p006-s05', 'Crochet Products', 'handmade-products--crochet-products', NULL, NULL, 'cat-p006', 4, true, NOW()),
  ('cat-p006-s06', 'Resin Art', 'handmade-products--resin-art', NULL, NULL, 'cat-p006', 5, true, NOW()),
  ('cat-p006-s07', 'Pottery', 'handmade-products--pottery', NULL, NULL, 'cat-p006', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p007-s01', 'Paintings', 'art-crafts--paintings', NULL, NULL, 'cat-p007', 0, true, NOW()),
  ('cat-p007-s02', 'Sketches', 'art-crafts--sketches', NULL, NULL, 'cat-p007', 1, true, NOW()),
  ('cat-p007-s03', 'Canvas Art', 'art-crafts--canvas-art', NULL, NULL, 'cat-p007', 2, true, NOW()),
  ('cat-p007-s04', 'Craft Supplies', 'art-crafts--craft-supplies', NULL, NULL, 'cat-p007', 3, true, NOW()),
  ('cat-p007-s05', 'DIY Kits', 'art-crafts--diy-kits', NULL, NULL, 'cat-p007', 4, true, NOW()),
  ('cat-p007-s06', 'Calligraphy Products', 'art-crafts--calligraphy-products', NULL, NULL, 'cat-p007', 5, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p008-s01', 'Fabric Materials', 'textile-fabric--fabric-materials', NULL, NULL, 'cat-p008', 0, true, NOW()),
  ('cat-p008-s02', 'Printed Fabric', 'textile-fabric--printed-fabric', NULL, NULL, 'cat-p008', 1, true, NOW()),
  ('cat-p008-s03', 'Embroidered Fabric', 'textile-fabric--embroidered-fabric', NULL, NULL, 'cat-p008', 2, true, NOW()),
  ('cat-p008-s04', 'Lawn Fabric', 'textile-fabric--lawn-fabric', NULL, NULL, 'cat-p008', 3, true, NOW()),
  ('cat-p008-s05', 'Cotton Fabric', 'textile-fabric--cotton-fabric', NULL, NULL, 'cat-p008', 4, true, NOW()),
  ('cat-p008-s06', 'Silk Fabric', 'textile-fabric--silk-fabric', NULL, NULL, 'cat-p008', 5, true, NOW()),
  ('cat-p008-s07', 'Textile Patterns', 'textile-fabric--textile-patterns', NULL, NULL, 'cat-p008', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p009-s01', 'Snacks', 'food-beverages--snacks', NULL, NULL, 'cat-p009', 0, true, NOW()),
  ('cat-p009-s02', 'Bakery Items', 'food-beverages--bakery-items', NULL, NULL, 'cat-p009', 1, true, NOW()),
  ('cat-p009-s03', 'Organic Food', 'food-beverages--organic-food', NULL, NULL, 'cat-p009', 2, true, NOW()),
  ('cat-p009-s04', 'Dry Fruits', 'food-beverages--dry-fruits', NULL, NULL, 'cat-p009', 3, true, NOW()),
  ('cat-p009-s05', 'Chocolates', 'food-beverages--chocolates', NULL, NULL, 'cat-p009', 4, true, NOW()),
  ('cat-p009-s06', 'Beverages', 'food-beverages--beverages', NULL, NULL, 'cat-p009', 5, true, NOW()),
  ('cat-p009-s07', 'Homemade Food', 'food-beverages--homemade-food', NULL, NULL, 'cat-p009', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p010-s01', 'Gym Equipment', 'health-fitness--gym-equipment', NULL, NULL, 'cat-p010', 0, true, NOW()),
  ('cat-p010-s02', 'Yoga Products', 'health-fitness--yoga-products', NULL, NULL, 'cat-p010', 1, true, NOW()),
  ('cat-p010-s03', 'Fitness Accessories', 'health-fitness--fitness-accessories', NULL, NULL, 'cat-p010', 2, true, NOW()),
  ('cat-p010-s04', 'Protein Shakers', 'health-fitness--protein-shakers', NULL, NULL, 'cat-p010', 3, true, NOW()),
  ('cat-p010-s05', 'Sports Equipment', 'health-fitness--sports-equipment', NULL, NULL, 'cat-p010', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p011-s01', 'Kids Toys', 'toys-games--kids-toys', NULL, NULL, 'cat-p011', 0, true, NOW()),
  ('cat-p011-s02', 'Educational Toys', 'toys-games--educational-toys', NULL, NULL, 'cat-p011', 1, true, NOW()),
  ('cat-p011-s03', 'Board Games', 'toys-games--board-games', NULL, NULL, 'cat-p011', 2, true, NOW()),
  ('cat-p011-s04', 'Remote Control Toys', 'toys-games--remote-control-toys', NULL, NULL, 'cat-p011', 3, true, NOW()),
  ('cat-p011-s05', 'Action Figures', 'toys-games--action-figures', NULL, NULL, 'cat-p011', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p012-s01', 'Pet Food', 'pet-supplies--pet-food', NULL, NULL, 'cat-p012', 0, true, NOW()),
  ('cat-p012-s02', 'Pet Toys', 'pet-supplies--pet-toys', NULL, NULL, 'cat-p012', 1, true, NOW()),
  ('cat-p012-s03', 'Pet Clothes', 'pet-supplies--pet-clothes', NULL, NULL, 'cat-p012', 2, true, NOW()),
  ('cat-p012-s04', 'Pet Accessories', 'pet-supplies--pet-accessories', NULL, NULL, 'cat-p012', 3, true, NOW()),
  ('cat-p012-s05', 'Pet Beds', 'pet-supplies--pet-beds', NULL, NULL, 'cat-p012', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p013-s01', 'Car Accessories', 'automotive--car-accessories', NULL, NULL, 'cat-p013', 0, true, NOW()),
  ('cat-p013-s02', 'Bike Accessories', 'automotive--bike-accessories', NULL, NULL, 'cat-p013', 1, true, NOW()),
  ('cat-p013-s03', 'Car Care Products', 'automotive--car-care-products', NULL, NULL, 'cat-p013', 2, true, NOW()),
  ('cat-p013-s04', 'Helmets', 'automotive--helmets', NULL, NULL, 'cat-p013', 3, true, NOW()),
  ('cat-p013-s05', 'Seat Covers', 'automotive--seat-covers', NULL, NULL, 'cat-p013', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p014-s01', 'Academic Books', 'books--academic-books', NULL, NULL, 'cat-p014', 0, true, NOW()),
  ('cat-p014-s02', 'School Books', 'books--school-books', NULL, NULL, 'cat-p014', 1, true, NOW()),
  ('cat-p014-s03', 'College Books', 'books--college-books', NULL, NULL, 'cat-p014', 2, true, NOW()),
  ('cat-p014-s04', 'University Books', 'books--university-books', NULL, NULL, 'cat-p014', 3, true, NOW()),
  ('cat-p014-s05', 'Novels', 'books--novels', NULL, NULL, 'cat-p014', 4, true, NOW()),
  ('cat-p014-s06', 'Story Books', 'books--story-books', NULL, NULL, 'cat-p014', 5, true, NOW()),
  ('cat-p014-s07', 'Islamic Books', 'books--islamic-books', NULL, NULL, 'cat-p014', 6, true, NOW()),
  ('cat-p014-s08', 'Kids Books', 'books--kids-books', NULL, NULL, 'cat-p014', 7, true, NOW()),
  ('cat-p014-s09', 'Comics & Manga', 'books--comics-manga', NULL, NULL, 'cat-p014', 8, true, NOW()),
  ('cat-p014-s10', 'Poetry Books', 'books--poetry-books', NULL, NULL, 'cat-p014', 9, true, NOW()),
  ('cat-p014-s11', 'Self-Help Books', 'books--self-help-books', NULL, NULL, 'cat-p014', 10, true, NOW()),
  ('cat-p014-s12', 'Business Books', 'books--business-books', NULL, NULL, 'cat-p014', 11, true, NOW()),
  ('cat-p014-s13', 'Programming Books', 'books--programming-books', NULL, NULL, 'cat-p014', 12, true, NOW()),
  ('cat-p014-s14', 'Medical Books', 'books--medical-books', NULL, NULL, 'cat-p014', 13, true, NOW()),
  ('cat-p014-s15', 'Engineering Books', 'books--engineering-books', NULL, NULL, 'cat-p014', 14, true, NOW()),
  ('cat-p014-s16', 'Fashion Books', 'books--fashion-books', NULL, NULL, 'cat-p014', 15, true, NOW()),
  ('cat-p014-s17', 'Art & Design Books', 'books--art-design-books', NULL, NULL, 'cat-p014', 16, true, NOW()),
  ('cat-p014-s18', 'Cooking Books', 'books--cooking-books', NULL, NULL, 'cat-p014', 17, true, NOW()),
  ('cat-p014-s19', 'Language Learning Books', 'books--language-learning-books', NULL, NULL, 'cat-p014', 18, true, NOW()),
  ('cat-p014-s20', 'Motivational Books', 'books--motivational-books', NULL, NULL, 'cat-p014', 19, true, NOW()),
  ('cat-p014-s21', 'History Books', 'books--history-books', NULL, NULL, 'cat-p014', 20, true, NOW()),
  ('cat-p014-s22', 'Science Books', 'books--science-books', NULL, NULL, 'cat-p014', 21, true, NOW()),
  ('cat-p014-s23', 'Biography Books', 'books--biography-books', NULL, NULL, 'cat-p014', 22, true, NOW()),
  ('cat-p014-s24', 'Entrance Exam Books', 'books--entrance-exam-books', NULL, NULL, 'cat-p014', 23, true, NOW()),
  ('cat-p014-s25', 'Stationery Sets', 'books--stationery-sets', NULL, NULL, 'cat-p014', 24, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p015-s01', 'Sofas', 'furniture--sofas', NULL, NULL, 'cat-p015', 0, true, NOW()),
  ('cat-p015-s02', 'Chairs', 'furniture--chairs', NULL, NULL, 'cat-p015', 1, true, NOW()),
  ('cat-p015-s03', 'Tables', 'furniture--tables', NULL, NULL, 'cat-p015', 2, true, NOW()),
  ('cat-p015-s04', 'Office Furniture', 'furniture--office-furniture', NULL, NULL, 'cat-p015', 3, true, NOW()),
  ('cat-p015-s05', 'Bedroom Furniture', 'furniture--bedroom-furniture', NULL, NULL, 'cat-p015', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p016-s01', 'Baby Clothes', 'baby-products--baby-clothes', NULL, NULL, 'cat-p016', 0, true, NOW()),
  ('cat-p016-s02', 'Baby Toys', 'baby-products--baby-toys', NULL, NULL, 'cat-p016', 1, true, NOW()),
  ('cat-p016-s03', 'Baby Care Products', 'baby-products--baby-care-products', NULL, NULL, 'cat-p016', 2, true, NOW()),
  ('cat-p016-s04', 'Baby Feeding Products', 'baby-products--baby-feeding-products', NULL, NULL, 'cat-p016', 3, true, NOW()),
  ('cat-p016-s05', 'Baby Furniture', 'baby-products--baby-furniture', NULL, NULL, 'cat-p016', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p017-s01', 'Camping Gear', 'sports-outdoor--camping-gear', NULL, NULL, 'cat-p017', 0, true, NOW()),
  ('cat-p017-s02', 'Sportswear', 'sports-outdoor--sportswear', NULL, NULL, 'cat-p017', 1, true, NOW()),
  ('cat-p017-s03', 'Outdoor Equipment', 'sports-outdoor--outdoor-equipment', NULL, NULL, 'cat-p017', 2, true, NOW()),
  ('cat-p017-s04', 'Cycling Products', 'sports-outdoor--cycling-products', NULL, NULL, 'cat-p017', 3, true, NOW()),
  ('cat-p017-s05', 'Hiking Accessories', 'sports-outdoor--hiking-accessories', NULL, NULL, 'cat-p017', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-p018-s01', 'Personalized Gifts', 'gifts-custom-products--personalized-gifts', NULL, NULL, 'cat-p018', 0, true, NOW()),
  ('cat-p018-s02', 'Custom Mugs', 'gifts-custom-products--custom-mugs', NULL, NULL, 'cat-p018', 1, true, NOW()),
  ('cat-p018-s03', 'Photo Frames', 'gifts-custom-products--photo-frames', NULL, NULL, 'cat-p018', 2, true, NOW()),
  ('cat-p018-s04', 'Gift Boxes', 'gifts-custom-products--gift-boxes', NULL, NULL, 'cat-p018', 3, true, NOW()),
  ('cat-p018-s05', 'Customized T-Shirts', 'gifts-custom-products--customized-t-shirts', NULL, NULL, 'cat-p018', 4, true, NOW()),
  ('cat-p018-s06', 'Customized Jewelry', 'gifts-custom-products--customized-jewelry', NULL, NULL, 'cat-p018', 5, true, NOW());

