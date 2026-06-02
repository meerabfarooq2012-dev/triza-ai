-- =============================================================================
-- Marketo - Complete Subcategories Seed SQL for Supabase
-- =============================================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard → SQL Editor
-- 2. Paste EACH STEP one at a time and click "Run"
-- 3. Wait for "Success" before pasting the next step
-- 4. Do NOT paste everything at once (it will timeout)
--
-- Total: 624 subcategories across 7 steps
-- Digital: 128 | Physical: 137 | Gigs: 359
-- =============================================================================


-- STEP 1 OF 7: Digital Product Subcategories (128)
-- Run this first, wait for Success, then proceed to Step 2


INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d001-s01', 'Logo Templates', 'graphic-design-assets--logo-templates', NULL, NULL, 'cat-d001', 0, true, NOW()),
  ('cat-d001-s02', 'Social Media Templates', 'graphic-design-assets--social-media-templates', NULL, NULL, 'cat-d001', 1, true, NOW()),
  ('cat-d001-s03', 'Canva Templates', 'graphic-design-assets--canva-templates', NULL, NULL, 'cat-d001', 2, true, NOW()),
  ('cat-d001-s04', 'Photoshop Templates', 'graphic-design-assets--photoshop-templates', NULL, NULL, 'cat-d001', 3, true, NOW()),
  ('cat-d001-s05', 'Illustrator Files', 'graphic-design-assets--illustrator-files', NULL, NULL, 'cat-d001', 4, true, NOW()),
  ('cat-d001-s06', 'UI Kits', 'graphic-design-assets--ui-kits', NULL, NULL, 'cat-d001', 5, true, NOW()),
  ('cat-d001-s07', 'Icon Packs', 'graphic-design-assets--icon-packs', NULL, NULL, 'cat-d001', 6, true, NOW()),
  ('cat-d001-s08', 'Mockup Files', 'graphic-design-assets--mockup-files', NULL, NULL, 'cat-d001', 7, true, NOW()),
  ('cat-d001-s09', 'Fonts', 'graphic-design-assets--fonts', NULL, NULL, 'cat-d001', 8, true, NOW()),
  ('cat-d001-s10', 'Patterns & Textures', 'graphic-design-assets--patterns-textures', NULL, NULL, 'cat-d001', 9, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d002-s01', 'Website Templates', 'website-development--website-templates', NULL, NULL, 'cat-d002', 0, true, NOW()),
  ('cat-d002-s02', 'WordPress Themes', 'website-development--wordpress-themes', NULL, NULL, 'cat-d002', 1, true, NOW()),
  ('cat-d002-s03', 'Shopify Themes', 'website-development--shopify-themes', NULL, NULL, 'cat-d002', 2, true, NOW()),
  ('cat-d002-s04', 'HTML Templates', 'website-development--html-templates', NULL, NULL, 'cat-d002', 3, true, NOW()),
  ('cat-d002-s05', 'React Templates', 'website-development--react-templates', NULL, NULL, 'cat-d002', 4, true, NOW()),
  ('cat-d002-s06', 'Landing Pages', 'website-development--landing-pages', NULL, NULL, 'cat-d002', 5, true, NOW()),
  ('cat-d002-s07', 'Plugins', 'website-development--plugins', NULL, NULL, 'cat-d002', 6, true, NOW()),
  ('cat-d002-s08', 'Scripts & Codes', 'website-development--scripts-codes', NULL, NULL, 'cat-d002', 7, true, NOW()),
  ('cat-d002-s09', 'Mobile App Templates', 'website-development--mobile-app-templates', NULL, NULL, 'cat-d002', 8, true, NOW()),
  ('cat-d002-s10', 'Admin Dashboards', 'website-development--admin-dashboards', NULL, NULL, 'cat-d002', 9, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d003-s01', 'Online Courses', 'courses-education--online-courses', NULL, NULL, 'cat-d003', 0, true, NOW()),
  ('cat-d003-s02', 'Programming Courses', 'courses-education--programming-courses', NULL, NULL, 'cat-d003', 1, true, NOW()),
  ('cat-d003-s03', 'Graphic Design Courses', 'courses-education--graphic-design-courses', NULL, NULL, 'cat-d003', 2, true, NOW()),
  ('cat-d003-s04', 'Marketing Courses', 'courses-education--marketing-courses', NULL, NULL, 'cat-d003', 3, true, NOW()),
  ('cat-d003-s05', 'Business Courses', 'courses-education--business-courses', NULL, NULL, 'cat-d003', 4, true, NOW()),
  ('cat-d003-s06', 'Language Courses', 'courses-education--language-courses', NULL, NULL, 'cat-d003', 5, true, NOW()),
  ('cat-d003-s07', 'PDF Notes', 'courses-education--pdf-notes', NULL, NULL, 'cat-d003', 6, true, NOW()),
  ('cat-d003-s08', 'Study Guides', 'courses-education--study-guides', NULL, NULL, 'cat-d003', 7, true, NOW()),
  ('cat-d003-s09', 'Exam Preparation Material', 'courses-education--exam-preparation-material', NULL, NULL, 'cat-d003', 8, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d004-s01', 'Ebooks', 'digital-books-learning-materials--ebooks', NULL, NULL, 'cat-d004', 0, true, NOW()),
  ('cat-d004-s02', 'PDF Books', 'digital-books-learning-materials--pdf-books', NULL, NULL, 'cat-d004', 1, true, NOW()),
  ('cat-d004-s03', 'Audiobooks', 'digital-books-learning-materials--audiobooks', NULL, NULL, 'cat-d004', 2, true, NOW()),
  ('cat-d004-s04', 'Study Notes', 'digital-books-learning-materials--study-notes', NULL, NULL, 'cat-d004', 3, true, NOW()),
  ('cat-d004-s05', 'Research Papers', 'digital-books-learning-materials--research-papers', NULL, NULL, 'cat-d004', 4, true, NOW()),
  ('cat-d004-s06', 'Digital Magazines', 'digital-books-learning-materials--digital-magazines', NULL, NULL, 'cat-d004', 5, true, NOW()),
  ('cat-d004-s07', 'Digital Comics', 'digital-books-learning-materials--digital-comics', NULL, NULL, 'cat-d004', 6, true, NOW()),
  ('cat-d004-s08', 'Manga PDFs', 'digital-books-learning-materials--manga-pdfs', NULL, NULL, 'cat-d004', 7, true, NOW()),
  ('cat-d004-s09', 'Educational Guides', 'digital-books-learning-materials--educational-guides', NULL, NULL, 'cat-d004', 8, true, NOW()),
  ('cat-d004-s10', 'Programming Ebooks', 'digital-books-learning-materials--programming-ebooks', NULL, NULL, 'cat-d004', 9, true, NOW()),
  ('cat-d004-s11', 'Business Ebooks', 'digital-books-learning-materials--business-ebooks', NULL, NULL, 'cat-d004', 10, true, NOW()),
  ('cat-d004-s12', 'Self-Help Ebooks', 'digital-books-learning-materials--self-help-ebooks', NULL, NULL, 'cat-d004', 11, true, NOW()),
  ('cat-d004-s13', 'Islamic Ebooks', 'digital-books-learning-materials--islamic-ebooks', NULL, NULL, 'cat-d004', 12, true, NOW()),
  ('cat-d004-s14', 'Kids Digital Books', 'digital-books-learning-materials--kids-digital-books', NULL, NULL, 'cat-d004', 13, true, NOW()),
  ('cat-d004-s15', 'Printable Worksheets', 'digital-books-learning-materials--printable-worksheets', NULL, NULL, 'cat-d004', 14, true, NOW()),
  ('cat-d004-s16', 'Exam Preparation PDFs', 'digital-books-learning-materials--exam-preparation-pdfs', NULL, NULL, 'cat-d004', 15, true, NOW()),
  ('cat-d004-s17', 'Language Learning PDFs', 'digital-books-learning-materials--language-learning-pdfs', NULL, NULL, 'cat-d004', 16, true, NOW()),
  ('cat-d004-s18', 'Recipe Ebooks', 'digital-books-learning-materials--recipe-ebooks', NULL, NULL, 'cat-d004', 17, true, NOW()),
  ('cat-d004-s19', 'Digital Planners', 'digital-books-learning-materials--digital-planners', NULL, NULL, 'cat-d004', 18, true, NOW()),
  ('cat-d004-s20', 'Journals & Templates', 'digital-books-learning-materials--journals-templates', NULL, NULL, 'cat-d004', 19, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d005-s01', 'Video Templates', 'video-animation--video-templates', NULL, NULL, 'cat-d005', 0, true, NOW()),
  ('cat-d005-s02', 'Intro & Outro Videos', 'video-animation--intro-outro-videos', NULL, NULL, 'cat-d005', 1, true, NOW()),
  ('cat-d005-s03', 'Motion Graphics', 'video-animation--motion-graphics', NULL, NULL, 'cat-d005', 2, true, NOW()),
  ('cat-d005-s04', 'Animated Explainers', 'video-animation--animated-explainers', NULL, NULL, 'cat-d005', 3, true, NOW()),
  ('cat-d005-s05', 'Video Presets', 'video-animation--video-presets', NULL, NULL, 'cat-d005', 4, true, NOW()),
  ('cat-d005-s06', 'LUTs & Color Presets', 'video-animation--luts-color-presets', NULL, NULL, 'cat-d005', 5, true, NOW()),
  ('cat-d005-s07', 'Green Screen Effects', 'video-animation--green-screen-effects', NULL, NULL, 'cat-d005', 6, true, NOW()),
  ('cat-d005-s08', 'Transitions', 'video-animation--transitions', NULL, NULL, 'cat-d005', 7, true, NOW()),
  ('cat-d005-s09', 'Stock Videos', 'video-animation--stock-videos', NULL, NULL, 'cat-d005', 8, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d006-s01', 'Beats', 'music-audio--beats', NULL, NULL, 'cat-d006', 0, true, NOW()),
  ('cat-d006-s02', 'Instrumentals', 'music-audio--instrumentals', NULL, NULL, 'cat-d006', 1, true, NOW()),
  ('cat-d006-s03', 'Sound Effects', 'music-audio--sound-effects', NULL, NULL, 'cat-d006', 2, true, NOW()),
  ('cat-d006-s04', 'Background Music', 'music-audio--background-music', NULL, NULL, 'cat-d006', 3, true, NOW()),
  ('cat-d006-s05', 'Podcast Intros', 'music-audio--podcast-intros', NULL, NULL, 'cat-d006', 4, true, NOW()),
  ('cat-d006-s06', 'Voice Overs', 'music-audio--voice-overs', NULL, NULL, 'cat-d006', 5, true, NOW()),
  ('cat-d006-s07', 'Audio Loops', 'music-audio--audio-loops', NULL, NULL, 'cat-d006', 6, true, NOW()),
  ('cat-d006-s08', 'Music Packs', 'music-audio--music-packs', NULL, NULL, 'cat-d006', 7, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d007-s01', 'Stock Photos', 'photography--stock-photos', NULL, NULL, 'cat-d007', 0, true, NOW()),
  ('cat-d007-s02', 'Lightroom Presets', 'photography--lightroom-presets', NULL, NULL, 'cat-d007', 1, true, NOW()),
  ('cat-d007-s03', 'Photoshop Actions', 'photography--photoshop-actions', NULL, NULL, 'cat-d007', 2, true, NOW()),
  ('cat-d007-s04', 'Photo Filters', 'photography--photo-filters', NULL, NULL, 'cat-d007', 3, true, NOW()),
  ('cat-d007-s05', 'Wallpapers', 'photography--wallpapers', NULL, NULL, 'cat-d007', 4, true, NOW()),
  ('cat-d007-s06', 'Digital Art Prints', 'photography--digital-art-prints', NULL, NULL, 'cat-d007', 5, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d008-s01', 'AI Prompts', 'ai-tech-products--ai-prompts', NULL, NULL, 'cat-d008', 0, true, NOW()),
  ('cat-d008-s02', 'Chatbot Templates', 'ai-tech-products--chatbot-templates', NULL, NULL, 'cat-d008', 1, true, NOW()),
  ('cat-d008-s03', 'Automation Systems', 'ai-tech-products--automation-systems', NULL, NULL, 'cat-d008', 2, true, NOW()),
  ('cat-d008-s04', 'AI Tools', 'ai-tech-products--ai-tools', NULL, NULL, 'cat-d008', 3, true, NOW()),
  ('cat-d008-s05', 'SaaS Products', 'ai-tech-products--saas-products', NULL, NULL, 'cat-d008', 4, true, NOW()),
  ('cat-d008-s06', 'Chrome Extensions', 'ai-tech-products--chrome-extensions', NULL, NULL, 'cat-d008', 5, true, NOW()),
  ('cat-d008-s07', 'Mobile Apps', 'ai-tech-products--mobile-apps', NULL, NULL, 'cat-d008', 6, true, NOW()),
  ('cat-d008-s08', 'Software Tools', 'ai-tech-products--software-tools', NULL, NULL, 'cat-d008', 7, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d009-s01', 'NFT Art', 'nfts-blockchain--nft-art', NULL, NULL, 'cat-d009', 0, true, NOW()),
  ('cat-d009-s02', 'NFT Collections', 'nfts-blockchain--nft-collections', NULL, NULL, 'cat-d009', 1, true, NOW()),
  ('cat-d009-s03', 'Smart Contracts', 'nfts-blockchain--smart-contracts', NULL, NULL, 'cat-d009', 2, true, NOW()),
  ('cat-d009-s04', 'Crypto Bots', 'nfts-blockchain--crypto-bots', NULL, NULL, 'cat-d009', 3, true, NOW()),
  ('cat-d009-s05', 'Blockchain Scripts', 'nfts-blockchain--blockchain-scripts', NULL, NULL, 'cat-d009', 4, true, NOW()),
  ('cat-d009-s06', 'Web3 Templates', 'nfts-blockchain--web3-templates', NULL, NULL, 'cat-d009', 5, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d010-s01', 'Social Media Packs', 'marketing-products--social-media-packs', NULL, NULL, 'cat-d010', 0, true, NOW()),
  ('cat-d010-s02', 'Ad Templates', 'marketing-products--ad-templates', NULL, NULL, 'cat-d010', 1, true, NOW()),
  ('cat-d010-s03', 'Email Templates', 'marketing-products--email-templates', NULL, NULL, 'cat-d010', 2, true, NOW()),
  ('cat-d010-s04', 'Sales Funnels', 'marketing-products--sales-funnels', NULL, NULL, 'cat-d010', 3, true, NOW()),
  ('cat-d010-s05', 'SEO Tools', 'marketing-products--seo-tools', NULL, NULL, 'cat-d010', 4, true, NOW()),
  ('cat-d010-s06', 'Marketing Planners', 'marketing-products--marketing-planners', NULL, NULL, 'cat-d010', 5, true, NOW()),
  ('cat-d010-s07', 'Content Calendars', 'marketing-products--content-calendars', NULL, NULL, 'cat-d010', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d011-s01', 'Game Assets', 'gaming-products--game-assets', NULL, NULL, 'cat-d011', 0, true, NOW()),
  ('cat-d011-s02', '2D Sprites', 'gaming-products--2d-sprites', NULL, NULL, 'cat-d011', 1, true, NOW()),
  ('cat-d011-s03', '3D Models', 'gaming-products--3d-models', NULL, NULL, 'cat-d011', 2, true, NOW()),
  ('cat-d011-s04', 'Gaming Overlays', 'gaming-products--gaming-overlays', NULL, NULL, 'cat-d011', 3, true, NOW()),
  ('cat-d011-s05', 'Stream Packages', 'gaming-products--stream-packages', NULL, NULL, 'cat-d011', 4, true, NOW()),
  ('cat-d011-s06', 'Discord Templates', 'gaming-products--discord-templates', NULL, NULL, 'cat-d011', 5, true, NOW()),
  ('cat-d011-s07', 'Minecraft Assets', 'gaming-products--minecraft-assets', NULL, NULL, 'cat-d011', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d012-s01', 'Notion Templates', 'business-productivity--notion-templates', NULL, NULL, 'cat-d012', 0, true, NOW()),
  ('cat-d012-s02', 'Spreadsheet Templates', 'business-productivity--spreadsheet-templates', NULL, NULL, 'cat-d012', 1, true, NOW()),
  ('cat-d012-s03', 'Invoice Templates', 'business-productivity--invoice-templates', NULL, NULL, 'cat-d012', 2, true, NOW()),
  ('cat-d012-s04', 'Finance Trackers', 'business-productivity--finance-trackers', NULL, NULL, 'cat-d012', 3, true, NOW()),
  ('cat-d012-s05', 'Budget Planners', 'business-productivity--budget-planners', NULL, NULL, 'cat-d012', 4, true, NOW()),
  ('cat-d012-s06', 'CRM Templates', 'business-productivity--crm-templates', NULL, NULL, 'cat-d012', 5, true, NOW()),
  ('cat-d012-s07', 'Project Management Templates', 'business-productivity--project-management-templates', NULL, NULL, 'cat-d012', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d013-s01', 'Digital Illustrations', 'art-illustration--digital-illustrations', NULL, NULL, 'cat-d013', 0, true, NOW()),
  ('cat-d013-s02', 'Character Designs', 'art-illustration--character-designs', NULL, NULL, 'cat-d013', 1, true, NOW()),
  ('cat-d013-s03', 'Anime Art', 'art-illustration--anime-art', NULL, NULL, 'cat-d013', 2, true, NOW()),
  ('cat-d013-s04', 'NFT Illustrations', 'art-illustration--nft-illustrations', NULL, NULL, 'cat-d013', 3, true, NOW()),
  ('cat-d013-s05', 'Tattoo Designs', 'art-illustration--tattoo-designs', NULL, NULL, 'cat-d013', 4, true, NOW()),
  ('cat-d013-s06', 'Coloring Pages', 'art-illustration--coloring-pages', NULL, NULL, 'cat-d013', 5, true, NOW()),
  ('cat-d013-s07', 'Printable Art', 'art-illustration--printable-art', NULL, NULL, 'cat-d013', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d014-s01', 'Printable Planners', 'printable-products--printable-planners', NULL, NULL, 'cat-d014', 0, true, NOW()),
  ('cat-d014-s02', 'Printable Calendars', 'printable-products--printable-calendars', NULL, NULL, 'cat-d014', 1, true, NOW()),
  ('cat-d014-s03', 'Wedding Invitations', 'printable-products--wedding-invitations', NULL, NULL, 'cat-d014', 2, true, NOW()),
  ('cat-d014-s04', 'Greeting Cards', 'printable-products--greeting-cards', NULL, NULL, 'cat-d014', 3, true, NOW()),
  ('cat-d014-s05', 'Wall Art Prints', 'printable-products--wall-art-prints', NULL, NULL, 'cat-d014', 4, true, NOW()),
  ('cat-d014-s06', 'Kids Activity Sheets', 'printable-products--kids-activity-sheets', NULL, NULL, 'cat-d014', 5, true, NOW()),
  ('cat-d014-s07', 'Printable Stickers', 'printable-products--printable-stickers', NULL, NULL, 'cat-d014', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-d015-s01', 'Fabric Patterns', 'fashion-textile-design--fabric-patterns', NULL, NULL, 'cat-d015', 0, true, NOW()),
  ('cat-d015-s02', 'Embroidery Files', 'fashion-textile-design--embroidery-files', NULL, NULL, 'cat-d015', 1, true, NOW()),
  ('cat-d015-s03', 'Sewing Patterns', 'fashion-textile-design--sewing-patterns', NULL, NULL, 'cat-d015', 2, true, NOW()),
  ('cat-d015-s04', 'Fashion Sketches', 'fashion-textile-design--fashion-sketches', NULL, NULL, 'cat-d015', 3, true, NOW()),
  ('cat-d015-s05', 'Jewelry CAD Files', 'fashion-textile-design--jewelry-cad-files', NULL, NULL, 'cat-d015', 4, true, NOW()),
  ('cat-d015-s06', 'T-Shirt Print Designs', 'fashion-textile-design--t-shirt-print-designs', NULL, NULL, 'cat-d015', 5, true, NOW()),
  ('cat-d015-s07', 'Textile Prints', 'fashion-textile-design--textile-prints', NULL, NULL, 'cat-d015', 6, true, NOW());


-- STEP 2 OF 7: Physical Product Subcategories (137)
-- Run this after Step 1 succeeds


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


-- STEP 3 OF 7: Gig - Graphic Design Part 1 (first 30)

-- STEP 3: Gig Subcategories Part 1 - Graphic Design (first 30)

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g001-s01', 'Logo Design', 'graphic-design--logo-design', NULL, NULL, 'cat-g001', 0, true, NOW()),
  ('cat-g001-s02', 'Minimalist Logo Design', 'graphic-design--minimalist-logo-design', NULL, NULL, 'cat-g001', 1, true, NOW()),
  ('cat-g001-s03', '3D Logo Design', 'graphic-design--3d-logo-design', NULL, NULL, 'cat-g001', 2, true, NOW()),
  ('cat-g001-s04', 'Mascot Logo Design', 'graphic-design--mascot-logo-design', NULL, NULL, 'cat-g001', 3, true, NOW()),
  ('cat-g001-s05', 'Signature Logo Design', 'graphic-design--signature-logo-design', NULL, NULL, 'cat-g001', 4, true, NOW()),
  ('cat-g001-s06', 'Vintage Logo Design', 'graphic-design--vintage-logo-design', NULL, NULL, 'cat-g001', 5, true, NOW()),
  ('cat-g001-s07', 'Gaming Logo Design', 'graphic-design--gaming-logo-design', NULL, NULL, 'cat-g001', 6, true, NOW()),
  ('cat-g001-s08', 'Esports Logo Design', 'graphic-design--esports-logo-design', NULL, NULL, 'cat-g001', 7, true, NOW()),
  ('cat-g001-s09', 'Brand Identity Design', 'graphic-design--brand-identity-design', NULL, NULL, 'cat-g001', 8, true, NOW()),
  ('cat-g001-s10', 'Brand Guidelines', 'graphic-design--brand-guidelines', NULL, NULL, 'cat-g001', 9, true, NOW()),
  ('cat-g001-s11', 'Social Media Post Design', 'graphic-design--social-media-post-design', NULL, NULL, 'cat-g001', 10, true, NOW()),
  ('cat-g001-s12', 'Instagram Post Design', 'graphic-design--instagram-post-design', NULL, NULL, 'cat-g001', 11, true, NOW()),
  ('cat-g001-s13', 'Facebook Cover Design', 'graphic-design--facebook-cover-design', NULL, NULL, 'cat-g001', 12, true, NOW()),
  ('cat-g001-s14', 'YouTube Thumbnail Design', 'graphic-design--youtube-thumbnail-design', NULL, NULL, 'cat-g001', 13, true, NOW()),
  ('cat-g001-s15', 'Twitch Banner Design', 'graphic-design--twitch-banner-design', NULL, NULL, 'cat-g001', 14, true, NOW()),
  ('cat-g001-s16', 'LinkedIn Banner Design', 'graphic-design--linkedin-banner-design', NULL, NULL, 'cat-g001', 15, true, NOW()),
  ('cat-g001-s17', 'Poster Design', 'graphic-design--poster-design', NULL, NULL, 'cat-g001', 16, true, NOW()),
  ('cat-g001-s18', 'Flyer Design', 'graphic-design--flyer-design', NULL, NULL, 'cat-g001', 17, true, NOW()),
  ('cat-g001-s19', 'Brochure Design', 'graphic-design--brochure-design', NULL, NULL, 'cat-g001', 18, true, NOW()),
  ('cat-g001-s20', 'Menu Design', 'graphic-design--menu-design', NULL, NULL, 'cat-g001', 19, true, NOW()),
  ('cat-g001-s21', 'Catalog Design', 'graphic-design--catalog-design', NULL, NULL, 'cat-g001', 20, true, NOW()),
  ('cat-g001-s22', 'Magazine Design', 'graphic-design--magazine-design', NULL, NULL, 'cat-g001', 21, true, NOW()),
  ('cat-g001-s23', 'Book Cover Design', 'graphic-design--book-cover-design', NULL, NULL, 'cat-g001', 22, true, NOW()),
  ('cat-g001-s24', 'Ebook Cover Design', 'graphic-design--ebook-cover-design', NULL, NULL, 'cat-g001', 23, true, NOW()),
  ('cat-g001-s25', 'Album Cover Design', 'graphic-design--album-cover-design', NULL, NULL, 'cat-g001', 24, true, NOW()),
  ('cat-g001-s26', 'Podcast Cover Design', 'graphic-design--podcast-cover-design', NULL, NULL, 'cat-g001', 25, true, NOW()),
  ('cat-g001-s27', 'Packaging Design', 'graphic-design--packaging-design', NULL, NULL, 'cat-g001', 26, true, NOW()),
  ('cat-g001-s28', 'Label Design', 'graphic-design--label-design', NULL, NULL, 'cat-g001', 27, true, NOW()),
  ('cat-g001-s29', 'Product Packaging Design', 'graphic-design--product-packaging-design', NULL, NULL, 'cat-g001', 28, true, NOW()),
  ('cat-g001-s30', 'Mockup Design', 'graphic-design--mockup-design', NULL, NULL, 'cat-g001', 29, true, NOW());


-- STEP 4 OF 7: Gig - Graphic Design Part 2 (next 30)

-- STEP 4: Gig Subcategories Part 2 - Graphic Design (next 30)

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g001-s31', 'Business Card Design', 'graphic-design--business-card-design', NULL, NULL, 'cat-g001', 30, true, NOW()),
  ('cat-g001-s32', 'Letterhead Design', 'graphic-design--letterhead-design', NULL, NULL, 'cat-g001', 31, true, NOW()),
  ('cat-g001-s33', 'Invoice Design', 'graphic-design--invoice-design', NULL, NULL, 'cat-g001', 32, true, NOW()),
  ('cat-g001-s34', 'Stationery Design', 'graphic-design--stationery-design', NULL, NULL, 'cat-g001', 33, true, NOW()),
  ('cat-g001-s35', 'Presentation Design', 'graphic-design--presentation-design', NULL, NULL, 'cat-g001', 34, true, NOW()),
  ('cat-g001-s36', 'PowerPoint Design', 'graphic-design--powerpoint-design', NULL, NULL, 'cat-g001', 35, true, NOW()),
  ('cat-g001-s37', 'Pitch Deck Design', 'graphic-design--pitch-deck-design', NULL, NULL, 'cat-g001', 36, true, NOW()),
  ('cat-g001-s38', 'Infographic Design', 'graphic-design--infographic-design', NULL, NULL, 'cat-g001', 37, true, NOW()),
  ('cat-g001-s39', 'Resume/CV Design', 'graphic-design--resumecv-design', NULL, NULL, 'cat-g001', 38, true, NOW()),
  ('cat-g001-s40', 'UI Design', 'graphic-design--ui-design', NULL, NULL, 'cat-g001', 39, true, NOW()),
  ('cat-g001-s41', 'Web Banner Design', 'graphic-design--web-banner-design', NULL, NULL, 'cat-g001', 40, true, NOW()),
  ('cat-g001-s42', 'Landing Page Design', 'graphic-design--landing-page-design', NULL, NULL, 'cat-g001', 41, true, NOW()),
  ('cat-g001-s43', 'App Interface Design', 'graphic-design--app-interface-design', NULL, NULL, 'cat-g001', 42, true, NOW()),
  ('cat-g001-s44', 'Icon Design', 'graphic-design--icon-design', NULL, NULL, 'cat-g001', 43, true, NOW()),
  ('cat-g001-s45', 'Sticker Design', 'graphic-design--sticker-design', NULL, NULL, 'cat-g001', 44, true, NOW()),
  ('cat-g001-s46', 'Emoji Design', 'graphic-design--emoji-design', NULL, NULL, 'cat-g001', 45, true, NOW()),
  ('cat-g001-s47', 'Illustration Design', 'graphic-design--illustration-design', NULL, NULL, 'cat-g001', 46, true, NOW()),
  ('cat-g001-s48', 'Character Illustration', 'graphic-design--character-illustration', NULL, NULL, 'cat-g001', 47, true, NOW()),
  ('cat-g001-s49', 'Cartoon Design', 'graphic-design--cartoon-design', NULL, NULL, 'cat-g001', 48, true, NOW()),
  ('cat-g001-s50', 'Anime Art', 'graphic-design--anime-art', NULL, NULL, 'cat-g001', 49, true, NOW()),
  ('cat-g001-s51', 'NFT Art', 'graphic-design--nft-art', NULL, NULL, 'cat-g001', 50, true, NOW()),
  ('cat-g001-s52', 'Digital Painting', 'graphic-design--digital-painting', NULL, NULL, 'cat-g001', 51, true, NOW()),
  ('cat-g001-s53', 'Vector Tracing', 'graphic-design--vector-tracing', NULL, NULL, 'cat-g001', 52, true, NOW()),
  ('cat-g001-s54', 'Photo Manipulation', 'graphic-design--photo-manipulation', NULL, NULL, 'cat-g001', 53, true, NOW()),
  ('cat-g001-s55', 'Photo Retouching', 'graphic-design--photo-retouching', NULL, NULL, 'cat-g001', 54, true, NOW()),
  ('cat-g001-s56', 'Background Removal', 'graphic-design--background-removal', NULL, NULL, 'cat-g001', 55, true, NOW()),
  ('cat-g001-s57', 'Color Correction', 'graphic-design--color-correction', NULL, NULL, 'cat-g001', 56, true, NOW()),
  ('cat-g001-s58', 'Photoshop Editing', 'graphic-design--photoshop-editing', NULL, NULL, 'cat-g001', 57, true, NOW()),
  ('cat-g001-s59', 'Canva Design', 'graphic-design--canva-design', NULL, NULL, 'cat-g001', 58, true, NOW()),
  ('cat-g001-s60', 'Adobe Illustrator Design', 'graphic-design--adobe-illustrator-design', NULL, NULL, 'cat-g001', 59, true, NOW());


-- STEP 5 OF 7: Gig - Graphic Design Part 3 (next 30)

-- STEP 5: Gig Subcategories Part 3 - Graphic Design (next 30)

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g001-s61', 'Adobe Photoshop Work', 'graphic-design--adobe-photoshop-work', NULL, NULL, 'cat-g001', 60, true, NOW()),
  ('cat-g001-s62', 'Figma Design', 'graphic-design--figma-design', NULL, NULL, 'cat-g001', 61, true, NOW()),
  ('cat-g001-s63', 'Textile Pattern Design', 'graphic-design--textile-pattern-design', NULL, NULL, 'cat-g001', 62, true, NOW()),
  ('cat-g001-s64', 'Fabric Print Design', 'graphic-design--fabric-print-design', NULL, NULL, 'cat-g001', 63, true, NOW()),
  ('cat-g001-s65', 'Embroidery Design', 'graphic-design--embroidery-design', NULL, NULL, 'cat-g001', 64, true, NOW()),
  ('cat-g001-s66', 'Fashion Illustration', 'graphic-design--fashion-illustration', NULL, NULL, 'cat-g001', 65, true, NOW()),
  ('cat-g001-s67', 'T-Shirt Design', 'graphic-design--t-shirt-design', NULL, NULL, 'cat-g001', 66, true, NOW()),
  ('cat-g001-s68', 'Hoodie Design', 'graphic-design--hoodie-design', NULL, NULL, 'cat-g001', 67, true, NOW()),
  ('cat-g001-s69', 'Merchandise Design', 'graphic-design--merchandise-design', NULL, NULL, 'cat-g001', 68, true, NOW()),
  ('cat-g001-s70', 'Mug Design', 'graphic-design--mug-design', NULL, NULL, 'cat-g001', 69, true, NOW()),
  ('cat-g001-s71', 'Tote Bag Design', 'graphic-design--tote-bag-design', NULL, NULL, 'cat-g001', 70, true, NOW()),
  ('cat-g001-s72', 'Jewelry Design', 'graphic-design--jewelry-design', NULL, NULL, 'cat-g001', 71, true, NOW()),
  ('cat-g001-s73', 'Ring Design', 'graphic-design--ring-design', NULL, NULL, 'cat-g001', 72, true, NOW()),
  ('cat-g001-s74', 'Necklace Design', 'graphic-design--necklace-design', NULL, NULL, 'cat-g001', 73, true, NOW()),
  ('cat-g001-s75', 'Bracelet Design', 'graphic-design--bracelet-design', NULL, NULL, 'cat-g001', 74, true, NOW()),
  ('cat-g001-s76', 'Earrings Design', 'graphic-design--earrings-design', NULL, NULL, 'cat-g001', 75, true, NOW()),
  ('cat-g001-s77', 'Pendant Design', 'graphic-design--pendant-design', NULL, NULL, 'cat-g001', 76, true, NOW()),
  ('cat-g001-s78', 'Luxury Jewelry Design', 'graphic-design--luxury-jewelry-design', NULL, NULL, 'cat-g001', 77, true, NOW()),
  ('cat-g001-s79', 'Bridal Jewelry Design', 'graphic-design--bridal-jewelry-design', NULL, NULL, 'cat-g001', 78, true, NOW()),
  ('cat-g001-s80', 'Handmade Jewelry Design', 'graphic-design--handmade-jewelry-design', NULL, NULL, 'cat-g001', 79, true, NOW()),
  ('cat-g001-s81', 'Jewelry Rendering', 'graphic-design--jewelry-rendering', NULL, NULL, 'cat-g001', 80, true, NOW()),
  ('cat-g001-s82', '3D Jewelry Modeling', 'graphic-design--3d-jewelry-modeling', NULL, NULL, 'cat-g001', 81, true, NOW()),
  ('cat-g001-s83', 'CAD Jewelry Design', 'graphic-design--cad-jewelry-design', NULL, NULL, 'cat-g001', 82, true, NOW()),
  ('cat-g001-s84', 'Jewelry Packaging Design', 'graphic-design--jewelry-packaging-design', NULL, NULL, 'cat-g001', 83, true, NOW()),
  ('cat-g001-s85', 'Gold Jewelry Design', 'graphic-design--gold-jewelry-design', NULL, NULL, 'cat-g001', 84, true, NOW()),
  ('cat-g001-s86', 'Silver Jewelry Design', 'graphic-design--silver-jewelry-design', NULL, NULL, 'cat-g001', 85, true, NOW()),
  ('cat-g001-s87', 'Gemstone Jewelry Design', 'graphic-design--gemstone-jewelry-design', NULL, NULL, 'cat-g001', 86, true, NOW()),
  ('cat-g001-s88', 'Tattoo Design', 'graphic-design--tattoo-design', NULL, NULL, 'cat-g001', 87, true, NOW()),
  ('cat-g001-s89', 'Calligraphy Design', 'graphic-design--calligraphy-design', NULL, NULL, 'cat-g001', 88, true, NOW()),
  ('cat-g001-s90', 'Arabic Calligraphy', 'graphic-design--arabic-calligraphy', NULL, NULL, 'cat-g001', 89, true, NOW());


-- STEP 6 OF 7: Gig - Graphic Design Part 4 (remaining 15)

-- STEP 6: Gig Subcategories Part 4 - Graphic Design (remaining)

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g001-s91', 'Urdu Typography', 'graphic-design--urdu-typography', NULL, NULL, 'cat-g001', 90, true, NOW()),
  ('cat-g001-s92', 'Custom Typography', 'graphic-design--custom-typography', NULL, NULL, 'cat-g001', 91, true, NOW()),
  ('cat-g001-s93', 'Invitation Card Design', 'graphic-design--invitation-card-design', NULL, NULL, 'cat-g001', 92, true, NOW()),
  ('cat-g001-s94', 'Wedding Card Design', 'graphic-design--wedding-card-design', NULL, NULL, 'cat-g001', 93, true, NOW()),
  ('cat-g001-s95', 'Birthday Card Design', 'graphic-design--birthday-card-design', NULL, NULL, 'cat-g001', 94, true, NOW()),
  ('cat-g001-s96', 'Certificate Design', 'graphic-design--certificate-design', NULL, NULL, 'cat-g001', 95, true, NOW()),
  ('cat-g001-s97', 'ID Card Design', 'graphic-design--id-card-design', NULL, NULL, 'cat-g001', 96, true, NOW()),
  ('cat-g001-s98', 'Event Banner Design', 'graphic-design--event-banner-design', NULL, NULL, 'cat-g001', 97, true, NOW()),
  ('cat-g001-s99', 'Billboard Design', 'graphic-design--billboard-design', NULL, NULL, 'cat-g001', 98, true, NOW()),
  ('cat-g001-s100', 'Vehicle Wrap Design', 'graphic-design--vehicle-wrap-design', NULL, NULL, 'cat-g001', 99, true, NOW()),
  ('cat-g001-s101', 'Signboard Design', 'graphic-design--signboard-design', NULL, NULL, 'cat-g001', 100, true, NOW()),
  ('cat-g001-s102', 'Stream Overlay Design', 'graphic-design--stream-overlay-design', NULL, NULL, 'cat-g001', 101, true, NOW()),
  ('cat-g001-s103', 'Discord Server Graphics', 'graphic-design--discord-server-graphics', NULL, NULL, 'cat-g001', 102, true, NOW()),
  ('cat-g001-s104', 'Gaming Graphics', 'graphic-design--gaming-graphics', NULL, NULL, 'cat-g001', 103, true, NOW()),
  ('cat-g001-s105', 'Esports Social Media Design', 'graphic-design--esports-social-media-design', NULL, NULL, 'cat-g001', 104, true, NOW());


-- STEP 7A OF 7: Gig - Other Categories Part 1 (web-dev to data-entry, 105 subs)

-- Gigs Part 1 (web-dev to data-entry)

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g002-s01', 'Frontend Development', 'web-development--frontend-development', NULL, NULL, 'cat-g002', 0, true, NOW()),
  ('cat-g002-s02', 'Backend Development', 'web-development--backend-development', NULL, NULL, 'cat-g002', 1, true, NOW()),
  ('cat-g002-s03', 'Full Stack Development', 'web-development--full-stack-development', NULL, NULL, 'cat-g002', 2, true, NOW()),
  ('cat-g002-s04', 'Custom Website Development', 'web-development--custom-website-development', NULL, NULL, 'cat-g002', 3, true, NOW()),
  ('cat-g002-s05', 'Portfolio Websites', 'web-development--portfolio-websites', NULL, NULL, 'cat-g002', 4, true, NOW()),
  ('cat-g002-s06', 'Business Websites', 'web-development--business-websites', NULL, NULL, 'cat-g002', 5, true, NOW()),
  ('cat-g002-s07', 'Landing Pages', 'web-development--landing-pages', NULL, NULL, 'cat-g002', 6, true, NOW()),
  ('cat-g002-s08', 'Website Bug Fixing', 'web-development--website-bug-fixing', NULL, NULL, 'cat-g002', 7, true, NOW()),
  ('cat-g002-s09', 'API Integration', 'web-development--api-integration', NULL, NULL, 'cat-g002', 8, true, NOW()),
  ('cat-g002-s10', 'Website Optimization', 'web-development--website-optimization', NULL, NULL, 'cat-g002', 9, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g003-s01', 'Android App Development', 'app-development--android-app-development', NULL, NULL, 'cat-g003', 0, true, NOW()),
  ('cat-g003-s02', 'iOS App Development', 'app-development--ios-app-development', NULL, NULL, 'cat-g003', 1, true, NOW()),
  ('cat-g003-s03', 'Flutter Development', 'app-development--flutter-development', NULL, NULL, 'cat-g003', 2, true, NOW()),
  ('cat-g003-s04', 'React Native Development', 'app-development--react-native-development', NULL, NULL, 'cat-g003', 3, true, NOW()),
  ('cat-g003-s05', 'Hybrid Apps', 'app-development--hybrid-apps', NULL, NULL, 'cat-g003', 4, true, NOW()),
  ('cat-g003-s06', 'Mobile UI Design', 'app-development--mobile-ui-design', NULL, NULL, 'cat-g003', 5, true, NOW()),
  ('cat-g003-s07', 'App Testing', 'app-development--app-testing', NULL, NULL, 'cat-g003', 6, true, NOW()),
  ('cat-g003-s08', 'App Maintenance', 'app-development--app-maintenance', NULL, NULL, 'cat-g003', 7, true, NOW()),
  ('cat-g003-s09', 'App Deployment', 'app-development--app-deployment', NULL, NULL, 'cat-g003', 8, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g004-s01', 'Mobile App UI', 'ui-ux-design--mobile-app-ui', NULL, NULL, 'cat-g004', 0, true, NOW()),
  ('cat-g004-s02', 'Website UI', 'ui-ux-design--website-ui', NULL, NULL, 'cat-g004', 1, true, NOW()),
  ('cat-g004-s03', 'Wireframing', 'ui-ux-design--wireframing', NULL, NULL, 'cat-g004', 2, true, NOW()),
  ('cat-g004-s04', 'Prototyping', 'ui-ux-design--prototyping', NULL, NULL, 'cat-g004', 3, true, NOW()),
  ('cat-g004-s05', 'User Research', 'ui-ux-design--user-research', NULL, NULL, 'cat-g004', 4, true, NOW()),
  ('cat-g004-s06', 'Dashboard Design', 'ui-ux-design--dashboard-design', NULL, NULL, 'cat-g004', 5, true, NOW()),
  ('cat-g004-s07', 'SaaS UI Design', 'ui-ux-design--saas-ui-design', NULL, NULL, 'cat-g004', 6, true, NOW()),
  ('cat-g004-s08', 'Figma Design', 'ui-ux-design--figma-design', NULL, NULL, 'cat-g004', 7, true, NOW()),
  ('cat-g004-s09', 'Adobe XD Design', 'ui-ux-design--adobe-xd-design', NULL, NULL, 'cat-g004', 8, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g005-s01', 'YouTube Video Editing', 'video-editing--youtube-video-editing', NULL, NULL, 'cat-g005', 0, true, NOW()),
  ('cat-g005-s02', 'Shorts/Reels Editing', 'video-editing--shortsreels-editing', NULL, NULL, 'cat-g005', 1, true, NOW()),
  ('cat-g005-s03', 'TikTok Editing', 'video-editing--tiktok-editing', NULL, NULL, 'cat-g005', 2, true, NOW()),
  ('cat-g005-s04', 'Cinematic Editing', 'video-editing--cinematic-editing', NULL, NULL, 'cat-g005', 3, true, NOW()),
  ('cat-g005-s05', 'Color Grading', 'video-editing--color-grading', NULL, NULL, 'cat-g005', 4, true, NOW()),
  ('cat-g005-s06', 'Subtitle Adding', 'video-editing--subtitle-adding', NULL, NULL, 'cat-g005', 5, true, NOW()),
  ('cat-g005-s07', 'Podcast Editing', 'video-editing--podcast-editing', NULL, NULL, 'cat-g005', 6, true, NOW()),
  ('cat-g005-s08', 'Green Screen Editing', 'video-editing--green-screen-editing', NULL, NULL, 'cat-g005', 7, true, NOW()),
  ('cat-g005-s09', 'Intro & Outro Videos', 'video-editing--intro-outro-videos', NULL, NULL, 'cat-g005', 8, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g006-s01', '2D Animation', 'animation-motion-graphics--2d-animation', NULL, NULL, 'cat-g006', 0, true, NOW()),
  ('cat-g006-s02', '3D Animation', 'animation-motion-graphics--3d-animation', NULL, NULL, 'cat-g006', 1, true, NOW()),
  ('cat-g006-s03', 'Motion Graphics', 'animation-motion-graphics--motion-graphics', NULL, NULL, 'cat-g006', 2, true, NOW()),
  ('cat-g006-s04', 'Explainer Videos', 'animation-motion-graphics--explainer-videos', NULL, NULL, 'cat-g006', 3, true, NOW()),
  ('cat-g006-s05', 'Whiteboard Animation', 'animation-motion-graphics--whiteboard-animation', NULL, NULL, 'cat-g006', 4, true, NOW()),
  ('cat-g006-s06', 'Character Animation', 'animation-motion-graphics--character-animation', NULL, NULL, 'cat-g006', 5, true, NOW()),
  ('cat-g006-s07', 'Logo Animation', 'animation-motion-graphics--logo-animation', NULL, NULL, 'cat-g006', 6, true, NOW()),
  ('cat-g006-s08', 'VFX Effects', 'animation-motion-graphics--vfx-effects', NULL, NULL, 'cat-g006', 7, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g007-s01', 'Blog Writing', 'content-writing--blog-writing', NULL, NULL, 'cat-g007', 0, true, NOW()),
  ('cat-g007-s02', 'Article Writing', 'content-writing--article-writing', NULL, NULL, 'cat-g007', 1, true, NOW()),
  ('cat-g007-s03', 'Website Content', 'content-writing--website-content', NULL, NULL, 'cat-g007', 2, true, NOW()),
  ('cat-g007-s04', 'Script Writing', 'content-writing--script-writing', NULL, NULL, 'cat-g007', 3, true, NOW()),
  ('cat-g007-s05', 'Technical Writing', 'content-writing--technical-writing', NULL, NULL, 'cat-g007', 4, true, NOW()),
  ('cat-g007-s06', 'Product Descriptions', 'content-writing--product-descriptions', NULL, NULL, 'cat-g007', 5, true, NOW()),
  ('cat-g007-s07', 'Ghostwriting', 'content-writing--ghostwriting', NULL, NULL, 'cat-g007', 6, true, NOW()),
  ('cat-g007-s08', 'Story Writing', 'content-writing--story-writing', NULL, NULL, 'cat-g007', 7, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g008-s01', 'Sales Copy', 'copywriting--sales-copy', NULL, NULL, 'cat-g008', 0, true, NOW()),
  ('cat-g008-s02', 'Ad Copy', 'copywriting--ad-copy', NULL, NULL, 'cat-g008', 1, true, NOW()),
  ('cat-g008-s03', 'Email Copywriting', 'copywriting--email-copywriting', NULL, NULL, 'cat-g008', 2, true, NOW()),
  ('cat-g008-s04', 'Landing Page Copy', 'copywriting--landing-page-copy', NULL, NULL, 'cat-g008', 3, true, NOW()),
  ('cat-g008-s05', 'Product Copy', 'copywriting--product-copy', NULL, NULL, 'cat-g008', 4, true, NOW()),
  ('cat-g008-s06', 'Social Media Captions', 'copywriting--social-media-captions', NULL, NULL, 'cat-g008', 5, true, NOW()),
  ('cat-g008-s07', 'Brand Messaging', 'copywriting--brand-messaging', NULL, NULL, 'cat-g008', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g009-s01', 'English to Urdu', 'translation--english-to-urdu', NULL, NULL, 'cat-g009', 0, true, NOW()),
  ('cat-g009-s02', 'Urdu to English', 'translation--urdu-to-english', NULL, NULL, 'cat-g009', 1, true, NOW()),
  ('cat-g009-s03', 'Arabic Translation', 'translation--arabic-translation', NULL, NULL, 'cat-g009', 2, true, NOW()),
  ('cat-g009-s04', 'French Translation', 'translation--french-translation', NULL, NULL, 'cat-g009', 3, true, NOW()),
  ('cat-g009-s05', 'Subtitle Translation', 'translation--subtitle-translation', NULL, NULL, 'cat-g009', 4, true, NOW()),
  ('cat-g009-s06', 'Document Translation', 'translation--document-translation', NULL, NULL, 'cat-g009', 5, true, NOW()),
  ('cat-g009-s07', 'Website Translation', 'translation--website-translation', NULL, NULL, 'cat-g009', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g010-s01', 'Facebook Marketing', 'digital-marketing--facebook-marketing', NULL, NULL, 'cat-g010', 0, true, NOW()),
  ('cat-g010-s02', 'Instagram Marketing', 'digital-marketing--instagram-marketing', NULL, NULL, 'cat-g010', 1, true, NOW()),
  ('cat-g010-s03', 'TikTok Marketing', 'digital-marketing--tiktok-marketing', NULL, NULL, 'cat-g010', 2, true, NOW()),
  ('cat-g010-s04', 'Google Ads', 'digital-marketing--google-ads', NULL, NULL, 'cat-g010', 3, true, NOW()),
  ('cat-g010-s05', 'Influencer Marketing', 'digital-marketing--influencer-marketing', NULL, NULL, 'cat-g010', 4, true, NOW()),
  ('cat-g010-s06', 'Affiliate Marketing', 'digital-marketing--affiliate-marketing', NULL, NULL, 'cat-g010', 5, true, NOW()),
  ('cat-g010-s07', 'Marketing Strategy', 'digital-marketing--marketing-strategy', NULL, NULL, 'cat-g010', 6, true, NOW()),
  ('cat-g010-s08', 'Email Campaigns', 'digital-marketing--email-campaigns', NULL, NULL, 'cat-g010', 7, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g011-s01', 'Instagram Management', 'social-media-management--instagram-management', NULL, NULL, 'cat-g011', 0, true, NOW()),
  ('cat-g011-s02', 'Facebook Page Management', 'social-media-management--facebook-page-management', NULL, NULL, 'cat-g011', 1, true, NOW()),
  ('cat-g011-s03', 'LinkedIn Management', 'social-media-management--linkedin-management', NULL, NULL, 'cat-g011', 2, true, NOW()),
  ('cat-g011-s04', 'Content Scheduling', 'social-media-management--content-scheduling', NULL, NULL, 'cat-g011', 3, true, NOW()),
  ('cat-g011-s05', 'Community Management', 'social-media-management--community-management', NULL, NULL, 'cat-g011', 4, true, NOW()),
  ('cat-g011-s06', 'Hashtag Research', 'social-media-management--hashtag-research', NULL, NULL, 'cat-g011', 5, true, NOW()),
  ('cat-g011-s07', 'Social Media Growth', 'social-media-management--social-media-growth', NULL, NULL, 'cat-g011', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g012-s01', 'On-Page SEO', 'seo-services--on-page-seo', NULL, NULL, 'cat-g012', 0, true, NOW()),
  ('cat-g012-s02', 'Off-Page SEO', 'seo-services--off-page-seo', NULL, NULL, 'cat-g012', 1, true, NOW()),
  ('cat-g012-s03', 'Technical SEO', 'seo-services--technical-seo', NULL, NULL, 'cat-g012', 2, true, NOW()),
  ('cat-g012-s04', 'Keyword Research', 'seo-services--keyword-research', NULL, NULL, 'cat-g012', 3, true, NOW()),
  ('cat-g012-s05', 'Backlink Building', 'seo-services--backlink-building', NULL, NULL, 'cat-g012', 4, true, NOW()),
  ('cat-g012-s06', 'Local SEO', 'seo-services--local-seo', NULL, NULL, 'cat-g012', 5, true, NOW()),
  ('cat-g012-s07', 'YouTube SEO', 'seo-services--youtube-seo', NULL, NULL, 'cat-g012', 6, true, NOW()),
  ('cat-g012-s08', 'Shopify SEO', 'seo-services--shopify-seo', NULL, NULL, 'cat-g012', 7, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g013-s01', 'AI Chatbots', 'ai-machine-learning--ai-chatbots', NULL, NULL, 'cat-g013', 0, true, NOW()),
  ('cat-g013-s02', 'Machine Learning Models', 'ai-machine-learning--machine-learning-models', NULL, NULL, 'cat-g013', 1, true, NOW()),
  ('cat-g013-s03', 'AI Automation', 'ai-machine-learning--ai-automation', NULL, NULL, 'cat-g013', 2, true, NOW()),
  ('cat-g013-s04', 'Prompt Engineering', 'ai-machine-learning--prompt-engineering', NULL, NULL, 'cat-g013', 3, true, NOW()),
  ('cat-g013-s05', 'Computer Vision', 'ai-machine-learning--computer-vision', NULL, NULL, 'cat-g013', 4, true, NOW()),
  ('cat-g013-s06', 'NLP Projects', 'ai-machine-learning--nlp-projects', NULL, NULL, 'cat-g013', 5, true, NOW()),
  ('cat-g013-s07', 'Data Training', 'ai-machine-learning--data-training', NULL, NULL, 'cat-g013', 6, true, NOW()),
  ('cat-g013-s08', 'AI Integrations', 'ai-machine-learning--ai-integrations', NULL, NULL, 'cat-g013', 7, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g014-s01', 'Copy Paste Work', 'data-entry--copy-paste-work', NULL, NULL, 'cat-g014', 0, true, NOW()),
  ('cat-g014-s02', 'Excel Data Entry', 'data-entry--excel-data-entry', NULL, NULL, 'cat-g014', 1, true, NOW()),
  ('cat-g014-s03', 'Web Research', 'data-entry--web-research', NULL, NULL, 'cat-g014', 2, true, NOW()),
  ('cat-g014-s04', 'PDF to Word', 'data-entry--pdf-to-word', NULL, NULL, 'cat-g014', 3, true, NOW()),
  ('cat-g014-s05', 'Typing Work', 'data-entry--typing-work', NULL, NULL, 'cat-g014', 4, true, NOW()),
  ('cat-g014-s06', 'CRM Data Entry', 'data-entry--crm-data-entry', NULL, NULL, 'cat-g014', 5, true, NOW()),
  ('cat-g014-s07', 'Data Collection', 'data-entry--data-collection', NULL, NULL, 'cat-g014', 6, true, NOW());

-- Total: 105 subcategories

-- STEP 7B OF 7: Gig - Other Categories Part 2 (virtual-assistant to arch-interior, 81 subs)

-- Gigs Part 2 (virtual-assistant to arch-interior)

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g015-s01', 'Email Management', 'virtual-assistant--email-management', NULL, NULL, 'cat-g015', 0, true, NOW()),
  ('cat-g015-s02', 'Calendar Management', 'virtual-assistant--calendar-management', NULL, NULL, 'cat-g015', 1, true, NOW()),
  ('cat-g015-s03', 'Customer Support', 'virtual-assistant--customer-support', NULL, NULL, 'cat-g015', 2, true, NOW()),
  ('cat-g015-s04', 'Admin Support', 'virtual-assistant--admin-support', NULL, NULL, 'cat-g015', 3, true, NOW()),
  ('cat-g015-s05', 'Research Assistance', 'virtual-assistant--research-assistance', NULL, NULL, 'cat-g015', 4, true, NOW()),
  ('cat-g015-s06', 'Appointment Scheduling', 'virtual-assistant--appointment-scheduling', NULL, NULL, 'cat-g015', 5, true, NOW()),
  ('cat-g015-s07', 'File Organization', 'virtual-assistant--file-organization', NULL, NULL, 'cat-g015', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g016-s01', 'Website Security', 'cyber-security--website-security', NULL, NULL, 'cat-g016', 0, true, NOW()),
  ('cat-g016-s02', 'Ethical Hacking', 'cyber-security--ethical-hacking', NULL, NULL, 'cat-g016', 1, true, NOW()),
  ('cat-g016-s03', 'Penetration Testing', 'cyber-security--penetration-testing', NULL, NULL, 'cat-g016', 2, true, NOW()),
  ('cat-g016-s04', 'Malware Removal', 'cyber-security--malware-removal', NULL, NULL, 'cat-g016', 3, true, NOW()),
  ('cat-g016-s05', 'Security Audits', 'cyber-security--security-audits', NULL, NULL, 'cat-g016', 4, true, NOW()),
  ('cat-g016-s06', 'Network Security', 'cyber-security--network-security', NULL, NULL, 'cat-g016', 5, true, NOW()),
  ('cat-g016-s07', 'Data Protection', 'cyber-security--data-protection', NULL, NULL, 'cat-g016', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g017-s01', 'AWS Services', 'cloud-computing--aws-services', NULL, NULL, 'cat-g017', 0, true, NOW()),
  ('cat-g017-s02', 'Google Cloud', 'cloud-computing--google-cloud', NULL, NULL, 'cat-g017', 1, true, NOW()),
  ('cat-g017-s03', 'Microsoft Azure', 'cloud-computing--microsoft-azure', NULL, NULL, 'cat-g017', 2, true, NOW()),
  ('cat-g017-s04', 'Cloud Deployment', 'cloud-computing--cloud-deployment', NULL, NULL, 'cat-g017', 3, true, NOW()),
  ('cat-g017-s05', 'Server Management', 'cloud-computing--server-management', NULL, NULL, 'cat-g017', 4, true, NOW()),
  ('cat-g017-s06', 'DevOps', 'cloud-computing--devops', NULL, NULL, 'cat-g017', 5, true, NOW()),
  ('cat-g017-s07', 'Cloud Security', 'cloud-computing--cloud-security', NULL, NULL, 'cat-g017', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g018-s01', 'Unity Development', 'game-development--unity-development', NULL, NULL, 'cat-g018', 0, true, NOW()),
  ('cat-g018-s02', 'Unreal Engine', 'game-development--unreal-engine', NULL, NULL, 'cat-g018', 1, true, NOW()),
  ('cat-g018-s03', '2D Games', 'game-development--2d-games', NULL, NULL, 'cat-g018', 2, true, NOW()),
  ('cat-g018-s04', '3D Games', 'game-development--3d-games', NULL, NULL, 'cat-g018', 3, true, NOW()),
  ('cat-g018-s05', 'Multiplayer Games', 'game-development--multiplayer-games', NULL, NULL, 'cat-g018', 4, true, NOW()),
  ('cat-g018-s06', 'Mobile Games', 'game-development--mobile-games', NULL, NULL, 'cat-g018', 5, true, NOW()),
  ('cat-g018-s07', 'Game UI Design', 'game-development--game-ui-design', NULL, NULL, 'cat-g018', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g019-s01', 'Product Uploading', 'e-commerce-services--product-uploading', NULL, NULL, 'cat-g019', 0, true, NOW()),
  ('cat-g019-s02', 'Store Management', 'e-commerce-services--store-management', NULL, NULL, 'cat-g019', 1, true, NOW()),
  ('cat-g019-s03', 'Product Listings', 'e-commerce-services--product-listings', NULL, NULL, 'cat-g019', 2, true, NOW()),
  ('cat-g019-s04', 'Order Management', 'e-commerce-services--order-management', NULL, NULL, 'cat-g019', 3, true, NOW()),
  ('cat-g019-s05', 'Inventory Management', 'e-commerce-services--inventory-management', NULL, NULL, 'cat-g019', 4, true, NOW()),
  ('cat-g019-s06', 'Dropshipping Setup', 'e-commerce-services--dropshipping-setup', NULL, NULL, 'cat-g019', 5, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g020-s01', 'Shopify Store Setup', 'shopify-development--shopify-store-setup', NULL, NULL, 'cat-g020', 0, true, NOW()),
  ('cat-g020-s02', 'Shopify Customization', 'shopify-development--shopify-customization', NULL, NULL, 'cat-g020', 1, true, NOW()),
  ('cat-g020-s03', 'Theme Development', 'shopify-development--theme-development', NULL, NULL, 'cat-g020', 2, true, NOW()),
  ('cat-g020-s04', 'Shopify SEO', 'shopify-development--shopify-seo', NULL, NULL, 'cat-g020', 3, true, NOW()),
  ('cat-g020-s05', 'App Integration', 'shopify-development--app-integration', NULL, NULL, 'cat-g020', 4, true, NOW()),
  ('cat-g020-s06', 'Product Pages', 'shopify-development--product-pages', NULL, NULL, 'cat-g020', 5, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g021-s01', 'WordPress Website', 'wordpress-development--wordpress-website', NULL, NULL, 'cat-g021', 0, true, NOW()),
  ('cat-g021-s02', 'Elementor Design', 'wordpress-development--elementor-design', NULL, NULL, 'cat-g021', 1, true, NOW()),
  ('cat-g021-s03', 'WooCommerce', 'wordpress-development--woocommerce', NULL, NULL, 'cat-g021', 2, true, NOW()),
  ('cat-g021-s04', 'Plugin Development', 'wordpress-development--plugin-development', NULL, NULL, 'cat-g021', 3, true, NOW()),
  ('cat-g021-s05', 'Theme Customization', 'wordpress-development--theme-customization', NULL, NULL, 'cat-g021', 4, true, NOW()),
  ('cat-g021-s06', 'Website Migration', 'wordpress-development--website-migration', NULL, NULL, 'cat-g021', 5, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g022-s01', 'Photo Retouching', 'photography-photo-editing--photo-retouching', NULL, NULL, 'cat-g022', 0, true, NOW()),
  ('cat-g022-s02', 'Background Removal', 'photography-photo-editing--background-removal', NULL, NULL, 'cat-g022', 1, true, NOW()),
  ('cat-g022-s03', 'Product Photography', 'photography-photo-editing--product-photography', NULL, NULL, 'cat-g022', 2, true, NOW()),
  ('cat-g022-s04', 'Event Photography', 'photography-photo-editing--event-photography', NULL, NULL, 'cat-g022', 3, true, NOW()),
  ('cat-g022-s05', 'Lightroom Editing', 'photography-photo-editing--lightroom-editing', NULL, NULL, 'cat-g022', 4, true, NOW()),
  ('cat-g022-s06', 'Photoshop Editing', 'photography-photo-editing--photoshop-editing', NULL, NULL, 'cat-g022', 5, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g023-s01', 'Beat Making', 'music-audio-production--beat-making', NULL, NULL, 'cat-g023', 0, true, NOW()),
  ('cat-g023-s02', 'Mixing & Mastering', 'music-audio-production--mixing-mastering', NULL, NULL, 'cat-g023', 1, true, NOW()),
  ('cat-g023-s03', 'Podcast Production', 'music-audio-production--podcast-production', NULL, NULL, 'cat-g023', 2, true, NOW()),
  ('cat-g023-s04', 'Audio Editing', 'music-audio-production--audio-editing', NULL, NULL, 'cat-g023', 3, true, NOW()),
  ('cat-g023-s05', 'Sound Effects', 'music-audio-production--sound-effects', NULL, NULL, 'cat-g023', 4, true, NOW()),
  ('cat-g023-s06', 'Background Music', 'music-audio-production--background-music', NULL, NULL, 'cat-g023', 5, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g024-s01', 'English Voice Over', 'voice-over--english-voice-over', NULL, NULL, 'cat-g024', 0, true, NOW()),
  ('cat-g024-s02', 'Urdu Voice Over', 'voice-over--urdu-voice-over', NULL, NULL, 'cat-g024', 1, true, NOW()),
  ('cat-g024-s03', 'Character Voice', 'voice-over--character-voice', NULL, NULL, 'cat-g024', 2, true, NOW()),
  ('cat-g024-s04', 'Narration', 'voice-over--narration', NULL, NULL, 'cat-g024', 3, true, NOW()),
  ('cat-g024-s05', 'Commercial Voice', 'voice-over--commercial-voice', NULL, NULL, 'cat-g024', 4, true, NOW()),
  ('cat-g024-s06', 'Audiobook Recording', 'voice-over--audiobook-recording', NULL, NULL, 'cat-g024', 5, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g025-s01', 'Startup Consulting', 'business-consulting--startup-consulting', NULL, NULL, 'cat-g025', 0, true, NOW()),
  ('cat-g025-s02', 'Business Plans', 'business-consulting--business-plans', NULL, NULL, 'cat-g025', 1, true, NOW()),
  ('cat-g025-s03', 'Market Research', 'business-consulting--market-research', NULL, NULL, 'cat-g025', 2, true, NOW()),
  ('cat-g025-s04', 'Financial Planning', 'business-consulting--financial-planning', NULL, NULL, 'cat-g025', 3, true, NOW()),
  ('cat-g025-s05', 'Growth Strategy', 'business-consulting--growth-strategy', NULL, NULL, 'cat-g025', 4, true, NOW()),
  ('cat-g025-s06', 'HR Consulting', 'business-consulting--hr-consulting', NULL, NULL, 'cat-g025', 5, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g026-s01', 'Bookkeeping', 'accounting-finance--bookkeeping', NULL, NULL, 'cat-g026', 0, true, NOW()),
  ('cat-g026-s02', 'Tax Filing', 'accounting-finance--tax-filing', NULL, NULL, 'cat-g026', 1, true, NOW()),
  ('cat-g026-s03', 'Financial Analysis', 'accounting-finance--financial-analysis', NULL, NULL, 'cat-g026', 2, true, NOW()),
  ('cat-g026-s04', 'Payroll Management', 'accounting-finance--payroll-management', NULL, NULL, 'cat-g026', 3, true, NOW()),
  ('cat-g026-s05', 'QuickBooks', 'accounting-finance--quickbooks', NULL, NULL, 'cat-g026', 4, true, NOW()),
  ('cat-g026-s06', 'Budget Planning', 'accounting-finance--budget-planning', NULL, NULL, 'cat-g026', 5, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g027-s01', 'Live Chat Support', 'customer-support--live-chat-support', NULL, NULL, 'cat-g027', 0, true, NOW()),
  ('cat-g027-s02', 'Email Support', 'customer-support--email-support', NULL, NULL, 'cat-g027', 1, true, NOW()),
  ('cat-g027-s03', 'Call Support', 'customer-support--call-support', NULL, NULL, 'cat-g027', 2, true, NOW()),
  ('cat-g027-s04', 'Technical Support', 'customer-support--technical-support', NULL, NULL, 'cat-g027', 3, true, NOW()),
  ('cat-g027-s05', 'Ticket Handling', 'customer-support--ticket-handling', NULL, NULL, 'cat-g027', 4, true, NOW());

-- Total: 81 subcategories

-- STEP 7C OF 7: Gig - Other Categories Part 3 (3d-modeling to legal, 68 subs)

-- Gigs Part 3 (3d-modeling to legal)

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g028-s01', 'House Plans', 'architecture-interior-design--house-plans', NULL, NULL, 'cat-g028', 0, true, NOW()),
  ('cat-g028-s02', 'Interior Design', 'architecture-interior-design--interior-design', NULL, NULL, 'cat-g028', 1, true, NOW()),
  ('cat-g028-s03', 'Landscape Design', 'architecture-interior-design--landscape-design', NULL, NULL, 'cat-g028', 2, true, NOW()),
  ('cat-g028-s04', 'AutoCAD Drafting', 'architecture-interior-design--autocad-drafting', NULL, NULL, 'cat-g028', 3, true, NOW()),
  ('cat-g028-s05', '3D Floor Plans', 'architecture-interior-design--3d-floor-plans', NULL, NULL, 'cat-g028', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g029-s01', 'Product Rendering', '3d-modeling-rendering--product-rendering', NULL, NULL, 'cat-g029', 0, true, NOW()),
  ('cat-g029-s02', 'Character Modeling', '3d-modeling-rendering--character-modeling', NULL, NULL, 'cat-g029', 1, true, NOW()),
  ('cat-g029-s03', 'Architectural Rendering', '3d-modeling-rendering--architectural-rendering', NULL, NULL, 'cat-g029', 2, true, NOW()),
  ('cat-g029-s04', 'Blender Modeling', '3d-modeling-rendering--blender-modeling', NULL, NULL, 'cat-g029', 3, true, NOW()),
  ('cat-g029-s05', '3D Texturing', '3d-modeling-rendering--3d-texturing', NULL, NULL, 'cat-g029', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g030-s01', 'Python Development', 'programming-software-engineering--python-development', NULL, NULL, 'cat-g030', 0, true, NOW()),
  ('cat-g030-s02', 'JavaScript Development', 'programming-software-engineering--javascript-development', NULL, NULL, 'cat-g030', 1, true, NOW()),
  ('cat-g030-s03', 'Java Development', 'programming-software-engineering--java-development', NULL, NULL, 'cat-g030', 2, true, NOW()),
  ('cat-g030-s04', 'C++ Programming', 'programming-software-engineering--c-programming', NULL, NULL, 'cat-g030', 3, true, NOW()),
  ('cat-g030-s05', 'C# Development', 'programming-software-engineering--c-development', NULL, NULL, 'cat-g030', 4, true, NOW()),
  ('cat-g030-s06', 'PHP Development', 'programming-software-engineering--php-development', NULL, NULL, 'cat-g030', 5, true, NOW()),
  ('cat-g030-s07', 'Software Debugging', 'programming-software-engineering--software-debugging', NULL, NULL, 'cat-g030', 6, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g031-s01', 'Math Tutoring', 'online-tutoring--math-tutoring', NULL, NULL, 'cat-g031', 0, true, NOW()),
  ('cat-g031-s02', 'English Tutoring', 'online-tutoring--english-tutoring', NULL, NULL, 'cat-g031', 1, true, NOW()),
  ('cat-g031-s03', 'Science Tutoring', 'online-tutoring--science-tutoring', NULL, NULL, 'cat-g031', 2, true, NOW()),
  ('cat-g031-s04', 'Quran Teaching', 'online-tutoring--quran-teaching', NULL, NULL, 'cat-g031', 3, true, NOW()),
  ('cat-g031-s05', 'Coding Lessons', 'online-tutoring--coding-lessons', NULL, NULL, 'cat-g031', 4, true, NOW()),
  ('cat-g031-s06', 'IELTS Preparation', 'online-tutoring--ielts-preparation', NULL, NULL, 'cat-g031', 5, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g032-s01', 'CV Design', 'resume-cv-writing--cv-design', NULL, NULL, 'cat-g032', 0, true, NOW()),
  ('cat-g032-s02', 'Resume Writing', 'resume-cv-writing--resume-writing', NULL, NULL, 'cat-g032', 1, true, NOW()),
  ('cat-g032-s03', 'LinkedIn Optimization', 'resume-cv-writing--linkedin-optimization', NULL, NULL, 'cat-g032', 2, true, NOW()),
  ('cat-g032-s04', 'Cover Letter Writing', 'resume-cv-writing--cover-letter-writing', NULL, NULL, 'cat-g032', 3, true, NOW()),
  ('cat-g032-s05', 'Job Application Help', 'resume-cv-writing--job-application-help', NULL, NULL, 'cat-g032', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g033-s01', 'Mailchimp Setup', 'email-marketing--mailchimp-setup', NULL, NULL, 'cat-g033', 0, true, NOW()),
  ('cat-g033-s02', 'Newsletter Design', 'email-marketing--newsletter-design', NULL, NULL, 'cat-g033', 1, true, NOW()),
  ('cat-g033-s03', 'Campaign Management', 'email-marketing--campaign-management', NULL, NULL, 'cat-g033', 2, true, NOW()),
  ('cat-g033-s04', 'Automation Emails', 'email-marketing--automation-emails', NULL, NULL, 'cat-g033', 3, true, NOW()),
  ('cat-g033-s05', 'Email Templates', 'email-marketing--email-templates', NULL, NULL, 'cat-g033', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g034-s01', 'Brand Guidelines', 'branding-identity--brand-guidelines', NULL, NULL, 'cat-g034', 0, true, NOW()),
  ('cat-g034-s02', 'Company Identity', 'branding-identity--company-identity', NULL, NULL, 'cat-g034', 1, true, NOW()),
  ('cat-g034-s03', 'Packaging Branding', 'branding-identity--packaging-branding', NULL, NULL, 'cat-g034', 2, true, NOW()),
  ('cat-g034-s04', 'Brand Strategy', 'branding-identity--brand-strategy', NULL, NULL, 'cat-g034', 3, true, NOW()),
  ('cat-g034-s05', 'Typography Design', 'branding-identity--typography-design', NULL, NULL, 'cat-g034', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g035-s01', 'NFT Art', 'nft-blockchain--nft-art', NULL, NULL, 'cat-g035', 0, true, NOW()),
  ('cat-g035-s02', 'Smart Contracts', 'nft-blockchain--smart-contracts', NULL, NULL, 'cat-g035', 1, true, NOW()),
  ('cat-g035-s03', 'Crypto Wallets', 'nft-blockchain--crypto-wallets', NULL, NULL, 'cat-g035', 2, true, NOW()),
  ('cat-g035-s04', 'Blockchain Apps', 'nft-blockchain--blockchain-apps', NULL, NULL, 'cat-g035', 3, true, NOW()),
  ('cat-g035-s05', 'Web3 Development', 'nft-blockchain--web3-development', NULL, NULL, 'cat-g035', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g036-s01', 'AI Chatbots', 'chatbot-development--ai-chatbots', NULL, NULL, 'cat-g036', 0, true, NOW()),
  ('cat-g036-s02', 'WhatsApp Bots', 'chatbot-development--whatsapp-bots', NULL, NULL, 'cat-g036', 1, true, NOW()),
  ('cat-g036-s03', 'Telegram Bots', 'chatbot-development--telegram-bots', NULL, NULL, 'cat-g036', 2, true, NOW()),
  ('cat-g036-s04', 'Customer Support Bots', 'chatbot-development--customer-support-bots', NULL, NULL, 'cat-g036', 3, true, NOW()),
  ('cat-g036-s05', 'Website Chatbots', 'chatbot-development--website-chatbots', NULL, NULL, 'cat-g036', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g037-s01', 'YouTube Scripts', 'script-writing--youtube-scripts', NULL, NULL, 'cat-g037', 0, true, NOW()),
  ('cat-g037-s02', 'Movie Scripts', 'script-writing--movie-scripts', NULL, NULL, 'cat-g037', 1, true, NOW()),
  ('cat-g037-s03', 'Ad Scripts', 'script-writing--ad-scripts', NULL, NULL, 'cat-g037', 2, true, NOW()),
  ('cat-g037-s04', 'Story Scripts', 'script-writing--story-scripts', NULL, NULL, 'cat-g037', 3, true, NOW()),
  ('cat-g037-s05', 'Podcast Scripts', 'script-writing--podcast-scripts', NULL, NULL, 'cat-g037', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g038-s01', 'PowerPoint Design', 'presentation-design--powerpoint-design', NULL, NULL, 'cat-g038', 0, true, NOW()),
  ('cat-g038-s02', 'Pitch Decks', 'presentation-design--pitch-decks', NULL, NULL, 'cat-g038', 1, true, NOW()),
  ('cat-g038-s03', 'Business Presentations', 'presentation-design--business-presentations', NULL, NULL, 'cat-g038', 2, true, NOW()),
  ('cat-g038-s04', 'Investor Decks', 'presentation-design--investor-decks', NULL, NULL, 'cat-g038', 3, true, NOW()),
  ('cat-g038-s05', 'Google Slides Design', 'presentation-design--google-slides-design', NULL, NULL, 'cat-g038', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g039-s01', 'Prototype Design', 'product-design--prototype-design', NULL, NULL, 'cat-g039', 0, true, NOW()),
  ('cat-g039-s02', 'Industrial Design', 'product-design--industrial-design', NULL, NULL, 'cat-g039', 1, true, NOW()),
  ('cat-g039-s03', 'Packaging Concepts', 'product-design--packaging-concepts', NULL, NULL, 'cat-g039', 2, true, NOW()),
  ('cat-g039-s04', 'Product Sketches', 'product-design--product-sketches', NULL, NULL, 'cat-g039', 3, true, NOW()),
  ('cat-g039-s05', '3D Product Design', 'product-design--3d-product-design', NULL, NULL, 'cat-g039', 4, true, NOW());

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "parentId", "sortOrder", "isActive", "createdAt") VALUES
  ('cat-g040-s01', 'Contract Writing', 'legal-services--contract-writing', NULL, NULL, 'cat-g040', 0, true, NOW()),
  ('cat-g040-s02', 'Legal Consulting', 'legal-services--legal-consulting', NULL, NULL, 'cat-g040', 1, true, NOW()),
  ('cat-g040-s03', 'Privacy Policies', 'legal-services--privacy-policies', NULL, NULL, 'cat-g040', 2, true, NOW()),
  ('cat-g040-s04', 'Terms & Conditions', 'legal-services--terms-conditions', NULL, NULL, 'cat-g040', 3, true, NOW()),
  ('cat-g040-s05', 'Trademark Help', 'legal-services--trademark-help', NULL, NULL, 'cat-g040', 4, true, NOW());

-- Total: 68 subcategories

-- =============================================================================
-- ALL DONE! You should now have 624 subcategories in your database.
-- Verify by running: SELECT COUNT(*) FROM "Category" WHERE "parentId" IS NOT NULL;
-- =============================================================================
