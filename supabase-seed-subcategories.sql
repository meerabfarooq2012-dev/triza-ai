-- ============================================================
-- SUPABASE SEED: SUBCATEGORIES
-- ============================================================
-- This script seeds subcategories for all three category types:
--   Digital Products, Physical Products, and Gig Services
--
-- Total subcategories: 624
--   - Digital: 128
--   - Physical: 137
--   - Gigs: 359
--
-- Prerequisites:
--   - Parent categories must already exist in the "Category" table
--   - Parent IDs are looked up via subquery on slug
--
-- Usage:
--   Run this script in the Supabase SQL Editor
--   Re-running is safe (ON CONFLICT DO NOTHING)
-- ============================================================

BEGIN;

-- ============================================================
-- DIGITAL SUBCATEGORIES
-- ============================================================

-- ----- graphic-design-assets -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d001', 'Logo Templates', 'graphic-design-assets--logo-templates', (SELECT id FROM "Category" WHERE slug = 'graphic-design-assets'), 0, true, NOW()),
  ('subcat-d002', 'Social Media Templates', 'graphic-design-assets--social-media-templates', (SELECT id FROM "Category" WHERE slug = 'graphic-design-assets'), 1, true, NOW()),
  ('subcat-d003', 'Canva Templates', 'graphic-design-assets--canva-templates', (SELECT id FROM "Category" WHERE slug = 'graphic-design-assets'), 2, true, NOW()),
  ('subcat-d004', 'Photoshop Templates', 'graphic-design-assets--photoshop-templates', (SELECT id FROM "Category" WHERE slug = 'graphic-design-assets'), 3, true, NOW()),
  ('subcat-d005', 'Illustrator Files', 'graphic-design-assets--illustrator-files', (SELECT id FROM "Category" WHERE slug = 'graphic-design-assets'), 4, true, NOW()),
  ('subcat-d006', 'UI Kits', 'graphic-design-assets--ui-kits', (SELECT id FROM "Category" WHERE slug = 'graphic-design-assets'), 5, true, NOW()),
  ('subcat-d007', 'Icon Packs', 'graphic-design-assets--icon-packs', (SELECT id FROM "Category" WHERE slug = 'graphic-design-assets'), 6, true, NOW()),
  ('subcat-d008', 'Mockup Files', 'graphic-design-assets--mockup-files', (SELECT id FROM "Category" WHERE slug = 'graphic-design-assets'), 7, true, NOW()),
  ('subcat-d009', 'Fonts', 'graphic-design-assets--fonts', (SELECT id FROM "Category" WHERE slug = 'graphic-design-assets'), 8, true, NOW()),
  ('subcat-d010', 'Patterns & Textures', 'graphic-design-assets--patterns-textures', (SELECT id FROM "Category" WHERE slug = 'graphic-design-assets'), 9, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- website-development -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d011', 'Website Templates', 'website-development--website-templates', (SELECT id FROM "Category" WHERE slug = 'website-development'), 0, true, NOW()),
  ('subcat-d012', 'WordPress Themes', 'website-development--wordpress-themes', (SELECT id FROM "Category" WHERE slug = 'website-development'), 1, true, NOW()),
  ('subcat-d013', 'Shopify Themes', 'website-development--shopify-themes', (SELECT id FROM "Category" WHERE slug = 'website-development'), 2, true, NOW()),
  ('subcat-d014', 'HTML Templates', 'website-development--html-templates', (SELECT id FROM "Category" WHERE slug = 'website-development'), 3, true, NOW()),
  ('subcat-d015', 'React Templates', 'website-development--react-templates', (SELECT id FROM "Category" WHERE slug = 'website-development'), 4, true, NOW()),
  ('subcat-d016', 'Landing Pages', 'website-development--landing-pages', (SELECT id FROM "Category" WHERE slug = 'website-development'), 5, true, NOW()),
  ('subcat-d017', 'Plugins', 'website-development--plugins', (SELECT id FROM "Category" WHERE slug = 'website-development'), 6, true, NOW()),
  ('subcat-d018', 'Scripts & Codes', 'website-development--scripts-codes', (SELECT id FROM "Category" WHERE slug = 'website-development'), 7, true, NOW()),
  ('subcat-d019', 'Mobile App Templates', 'website-development--mobile-app-templates', (SELECT id FROM "Category" WHERE slug = 'website-development'), 8, true, NOW()),
  ('subcat-d020', 'Admin Dashboards', 'website-development--admin-dashboards', (SELECT id FROM "Category" WHERE slug = 'website-development'), 9, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- courses-education -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d021', 'Online Courses', 'courses-education--online-courses', (SELECT id FROM "Category" WHERE slug = 'courses-education'), 0, true, NOW()),
  ('subcat-d022', 'Programming Courses', 'courses-education--programming-courses', (SELECT id FROM "Category" WHERE slug = 'courses-education'), 1, true, NOW()),
  ('subcat-d023', 'Graphic Design Courses', 'courses-education--graphic-design-courses', (SELECT id FROM "Category" WHERE slug = 'courses-education'), 2, true, NOW()),
  ('subcat-d024', 'Marketing Courses', 'courses-education--marketing-courses', (SELECT id FROM "Category" WHERE slug = 'courses-education'), 3, true, NOW()),
  ('subcat-d025', 'Business Courses', 'courses-education--business-courses', (SELECT id FROM "Category" WHERE slug = 'courses-education'), 4, true, NOW()),
  ('subcat-d026', 'Language Courses', 'courses-education--language-courses', (SELECT id FROM "Category" WHERE slug = 'courses-education'), 5, true, NOW()),
  ('subcat-d027', 'PDF Notes', 'courses-education--pdf-notes', (SELECT id FROM "Category" WHERE slug = 'courses-education'), 6, true, NOW()),
  ('subcat-d028', 'Study Guides', 'courses-education--study-guides', (SELECT id FROM "Category" WHERE slug = 'courses-education'), 7, true, NOW()),
  ('subcat-d029', 'Exam Preparation Material', 'courses-education--exam-preparation-material', (SELECT id FROM "Category" WHERE slug = 'courses-education'), 8, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- digital-books-learning-materials -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d030', 'Ebooks', 'digital-books-learning-materials--ebooks', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 0, true, NOW()),
  ('subcat-d031', 'PDF Books', 'digital-books-learning-materials--pdf-books', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 1, true, NOW()),
  ('subcat-d032', 'Audiobooks', 'digital-books-learning-materials--audiobooks', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 2, true, NOW()),
  ('subcat-d033', 'Study Notes', 'digital-books-learning-materials--study-notes', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 3, true, NOW()),
  ('subcat-d034', 'Research Papers', 'digital-books-learning-materials--research-papers', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 4, true, NOW()),
  ('subcat-d035', 'Digital Magazines', 'digital-books-learning-materials--digital-magazines', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 5, true, NOW()),
  ('subcat-d036', 'Digital Comics', 'digital-books-learning-materials--digital-comics', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 6, true, NOW()),
  ('subcat-d037', 'Manga PDFs', 'digital-books-learning-materials--manga-pdfs', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 7, true, NOW()),
  ('subcat-d038', 'Educational Guides', 'digital-books-learning-materials--educational-guides', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 8, true, NOW()),
  ('subcat-d039', 'Programming Ebooks', 'digital-books-learning-materials--programming-ebooks', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 9, true, NOW()),
  ('subcat-d040', 'Business Ebooks', 'digital-books-learning-materials--business-ebooks', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 10, true, NOW()),
  ('subcat-d041', 'Self-Help Ebooks', 'digital-books-learning-materials--self-help-ebooks', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 11, true, NOW()),
  ('subcat-d042', 'Islamic Ebooks', 'digital-books-learning-materials--islamic-ebooks', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 12, true, NOW()),
  ('subcat-d043', 'Kids Digital Books', 'digital-books-learning-materials--kids-digital-books', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 13, true, NOW()),
  ('subcat-d044', 'Printable Worksheets', 'digital-books-learning-materials--printable-worksheets', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 14, true, NOW()),
  ('subcat-d045', 'Exam Preparation PDFs', 'digital-books-learning-materials--exam-preparation-pdfs', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 15, true, NOW()),
  ('subcat-d046', 'Language Learning PDFs', 'digital-books-learning-materials--language-learning-pdfs', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 16, true, NOW()),
  ('subcat-d047', 'Recipe Ebooks', 'digital-books-learning-materials--recipe-ebooks', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 17, true, NOW()),
  ('subcat-d048', 'Digital Planners', 'digital-books-learning-materials--digital-planners', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 18, true, NOW()),
  ('subcat-d049', 'Journals & Templates', 'digital-books-learning-materials--journals-templates', (SELECT id FROM "Category" WHERE slug = 'digital-books-learning-materials'), 19, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- video-animation -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d050', 'Video Templates', 'video-animation--video-templates', (SELECT id FROM "Category" WHERE slug = 'video-animation'), 0, true, NOW()),
  ('subcat-d051', 'Intro & Outro Videos', 'video-animation--intro-outro-videos', (SELECT id FROM "Category" WHERE slug = 'video-animation'), 1, true, NOW()),
  ('subcat-d052', 'Motion Graphics', 'video-animation--motion-graphics', (SELECT id FROM "Category" WHERE slug = 'video-animation'), 2, true, NOW()),
  ('subcat-d053', 'Animated Explainers', 'video-animation--animated-explainers', (SELECT id FROM "Category" WHERE slug = 'video-animation'), 3, true, NOW()),
  ('subcat-d054', 'Video Presets', 'video-animation--video-presets', (SELECT id FROM "Category" WHERE slug = 'video-animation'), 4, true, NOW()),
  ('subcat-d055', 'LUTs & Color Presets', 'video-animation--luts-color-presets', (SELECT id FROM "Category" WHERE slug = 'video-animation'), 5, true, NOW()),
  ('subcat-d056', 'Green Screen Effects', 'video-animation--green-screen-effects', (SELECT id FROM "Category" WHERE slug = 'video-animation'), 6, true, NOW()),
  ('subcat-d057', 'Transitions', 'video-animation--transitions', (SELECT id FROM "Category" WHERE slug = 'video-animation'), 7, true, NOW()),
  ('subcat-d058', 'Stock Videos', 'video-animation--stock-videos', (SELECT id FROM "Category" WHERE slug = 'video-animation'), 8, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- music-audio -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d059', 'Beats', 'music-audio--beats', (SELECT id FROM "Category" WHERE slug = 'music-audio'), 0, true, NOW()),
  ('subcat-d060', 'Instrumentals', 'music-audio--instrumentals', (SELECT id FROM "Category" WHERE slug = 'music-audio'), 1, true, NOW()),
  ('subcat-d061', 'Sound Effects', 'music-audio--sound-effects', (SELECT id FROM "Category" WHERE slug = 'music-audio'), 2, true, NOW()),
  ('subcat-d062', 'Background Music', 'music-audio--background-music', (SELECT id FROM "Category" WHERE slug = 'music-audio'), 3, true, NOW()),
  ('subcat-d063', 'Podcast Intros', 'music-audio--podcast-intros', (SELECT id FROM "Category" WHERE slug = 'music-audio'), 4, true, NOW()),
  ('subcat-d064', 'Voice Overs', 'music-audio--voice-overs', (SELECT id FROM "Category" WHERE slug = 'music-audio'), 5, true, NOW()),
  ('subcat-d065', 'Audio Loops', 'music-audio--audio-loops', (SELECT id FROM "Category" WHERE slug = 'music-audio'), 6, true, NOW()),
  ('subcat-d066', 'Music Packs', 'music-audio--music-packs', (SELECT id FROM "Category" WHERE slug = 'music-audio'), 7, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- photography -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d067', 'Stock Photos', 'photography--stock-photos', (SELECT id FROM "Category" WHERE slug = 'photography'), 0, true, NOW()),
  ('subcat-d068', 'Lightroom Presets', 'photography--lightroom-presets', (SELECT id FROM "Category" WHERE slug = 'photography'), 1, true, NOW()),
  ('subcat-d069', 'Photoshop Actions', 'photography--photoshop-actions', (SELECT id FROM "Category" WHERE slug = 'photography'), 2, true, NOW()),
  ('subcat-d070', 'Photo Filters', 'photography--photo-filters', (SELECT id FROM "Category" WHERE slug = 'photography'), 3, true, NOW()),
  ('subcat-d071', 'Wallpapers', 'photography--wallpapers', (SELECT id FROM "Category" WHERE slug = 'photography'), 4, true, NOW()),
  ('subcat-d072', 'Digital Art Prints', 'photography--digital-art-prints', (SELECT id FROM "Category" WHERE slug = 'photography'), 5, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- ai-tech-products -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d073', 'AI Prompts', 'ai-tech-products--ai-prompts', (SELECT id FROM "Category" WHERE slug = 'ai-tech-products'), 0, true, NOW()),
  ('subcat-d074', 'Chatbot Templates', 'ai-tech-products--chatbot-templates', (SELECT id FROM "Category" WHERE slug = 'ai-tech-products'), 1, true, NOW()),
  ('subcat-d075', 'Automation Systems', 'ai-tech-products--automation-systems', (SELECT id FROM "Category" WHERE slug = 'ai-tech-products'), 2, true, NOW()),
  ('subcat-d076', 'AI Tools', 'ai-tech-products--ai-tools', (SELECT id FROM "Category" WHERE slug = 'ai-tech-products'), 3, true, NOW()),
  ('subcat-d077', 'SaaS Products', 'ai-tech-products--saas-products', (SELECT id FROM "Category" WHERE slug = 'ai-tech-products'), 4, true, NOW()),
  ('subcat-d078', 'Chrome Extensions', 'ai-tech-products--chrome-extensions', (SELECT id FROM "Category" WHERE slug = 'ai-tech-products'), 5, true, NOW()),
  ('subcat-d079', 'Mobile Apps', 'ai-tech-products--mobile-apps', (SELECT id FROM "Category" WHERE slug = 'ai-tech-products'), 6, true, NOW()),
  ('subcat-d080', 'Software Tools', 'ai-tech-products--software-tools', (SELECT id FROM "Category" WHERE slug = 'ai-tech-products'), 7, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- nfts-blockchain -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d081', 'NFT Art', 'nfts-blockchain--nft-art', (SELECT id FROM "Category" WHERE slug = 'nfts-blockchain'), 0, true, NOW()),
  ('subcat-d082', 'NFT Collections', 'nfts-blockchain--nft-collections', (SELECT id FROM "Category" WHERE slug = 'nfts-blockchain'), 1, true, NOW()),
  ('subcat-d083', 'Smart Contracts', 'nfts-blockchain--smart-contracts', (SELECT id FROM "Category" WHERE slug = 'nfts-blockchain'), 2, true, NOW()),
  ('subcat-d084', 'Crypto Bots', 'nfts-blockchain--crypto-bots', (SELECT id FROM "Category" WHERE slug = 'nfts-blockchain'), 3, true, NOW()),
  ('subcat-d085', 'Blockchain Scripts', 'nfts-blockchain--blockchain-scripts', (SELECT id FROM "Category" WHERE slug = 'nfts-blockchain'), 4, true, NOW()),
  ('subcat-d086', 'Web3 Templates', 'nfts-blockchain--web3-templates', (SELECT id FROM "Category" WHERE slug = 'nfts-blockchain'), 5, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- marketing-products -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d087', 'Social Media Packs', 'marketing-products--social-media-packs', (SELECT id FROM "Category" WHERE slug = 'marketing-products'), 0, true, NOW()),
  ('subcat-d088', 'Ad Templates', 'marketing-products--ad-templates', (SELECT id FROM "Category" WHERE slug = 'marketing-products'), 1, true, NOW()),
  ('subcat-d089', 'Email Templates', 'marketing-products--email-templates', (SELECT id FROM "Category" WHERE slug = 'marketing-products'), 2, true, NOW()),
  ('subcat-d090', 'Sales Funnels', 'marketing-products--sales-funnels', (SELECT id FROM "Category" WHERE slug = 'marketing-products'), 3, true, NOW()),
  ('subcat-d091', 'SEO Tools', 'marketing-products--seo-tools', (SELECT id FROM "Category" WHERE slug = 'marketing-products'), 4, true, NOW()),
  ('subcat-d092', 'Marketing Planners', 'marketing-products--marketing-planners', (SELECT id FROM "Category" WHERE slug = 'marketing-products'), 5, true, NOW()),
  ('subcat-d093', 'Content Calendars', 'marketing-products--content-calendars', (SELECT id FROM "Category" WHERE slug = 'marketing-products'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- gaming-products -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d094', 'Game Assets', 'gaming-products--game-assets', (SELECT id FROM "Category" WHERE slug = 'gaming-products'), 0, true, NOW()),
  ('subcat-d095', '2D Sprites', 'gaming-products--2d-sprites', (SELECT id FROM "Category" WHERE slug = 'gaming-products'), 1, true, NOW()),
  ('subcat-d096', '3D Models', 'gaming-products--3d-models', (SELECT id FROM "Category" WHERE slug = 'gaming-products'), 2, true, NOW()),
  ('subcat-d097', 'Gaming Overlays', 'gaming-products--gaming-overlays', (SELECT id FROM "Category" WHERE slug = 'gaming-products'), 3, true, NOW()),
  ('subcat-d098', 'Stream Packages', 'gaming-products--stream-packages', (SELECT id FROM "Category" WHERE slug = 'gaming-products'), 4, true, NOW()),
  ('subcat-d099', 'Discord Templates', 'gaming-products--discord-templates', (SELECT id FROM "Category" WHERE slug = 'gaming-products'), 5, true, NOW()),
  ('subcat-d100', 'Minecraft Assets', 'gaming-products--minecraft-assets', (SELECT id FROM "Category" WHERE slug = 'gaming-products'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- business-productivity -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d101', 'Notion Templates', 'business-productivity--notion-templates', (SELECT id FROM "Category" WHERE slug = 'business-productivity'), 0, true, NOW()),
  ('subcat-d102', 'Spreadsheet Templates', 'business-productivity--spreadsheet-templates', (SELECT id FROM "Category" WHERE slug = 'business-productivity'), 1, true, NOW()),
  ('subcat-d103', 'Invoice Templates', 'business-productivity--invoice-templates', (SELECT id FROM "Category" WHERE slug = 'business-productivity'), 2, true, NOW()),
  ('subcat-d104', 'Finance Trackers', 'business-productivity--finance-trackers', (SELECT id FROM "Category" WHERE slug = 'business-productivity'), 3, true, NOW()),
  ('subcat-d105', 'Budget Planners', 'business-productivity--budget-planners', (SELECT id FROM "Category" WHERE slug = 'business-productivity'), 4, true, NOW()),
  ('subcat-d106', 'CRM Templates', 'business-productivity--crm-templates', (SELECT id FROM "Category" WHERE slug = 'business-productivity'), 5, true, NOW()),
  ('subcat-d107', 'Project Management Templates', 'business-productivity--project-management-templates', (SELECT id FROM "Category" WHERE slug = 'business-productivity'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- art-illustration -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d108', 'Digital Illustrations', 'art-illustration--digital-illustrations', (SELECT id FROM "Category" WHERE slug = 'art-illustration'), 0, true, NOW()),
  ('subcat-d109', 'Character Designs', 'art-illustration--character-designs', (SELECT id FROM "Category" WHERE slug = 'art-illustration'), 1, true, NOW()),
  ('subcat-d110', 'Anime Art', 'art-illustration--anime-art', (SELECT id FROM "Category" WHERE slug = 'art-illustration'), 2, true, NOW()),
  ('subcat-d111', 'NFT Illustrations', 'art-illustration--nft-illustrations', (SELECT id FROM "Category" WHERE slug = 'art-illustration'), 3, true, NOW()),
  ('subcat-d112', 'Tattoo Designs', 'art-illustration--tattoo-designs', (SELECT id FROM "Category" WHERE slug = 'art-illustration'), 4, true, NOW()),
  ('subcat-d113', 'Coloring Pages', 'art-illustration--coloring-pages', (SELECT id FROM "Category" WHERE slug = 'art-illustration'), 5, true, NOW()),
  ('subcat-d114', 'Printable Art', 'art-illustration--printable-art', (SELECT id FROM "Category" WHERE slug = 'art-illustration'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- printable-products -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d115', 'Printable Planners', 'printable-products--printable-planners', (SELECT id FROM "Category" WHERE slug = 'printable-products'), 0, true, NOW()),
  ('subcat-d116', 'Printable Calendars', 'printable-products--printable-calendars', (SELECT id FROM "Category" WHERE slug = 'printable-products'), 1, true, NOW()),
  ('subcat-d117', 'Wedding Invitations', 'printable-products--wedding-invitations', (SELECT id FROM "Category" WHERE slug = 'printable-products'), 2, true, NOW()),
  ('subcat-d118', 'Greeting Cards', 'printable-products--greeting-cards', (SELECT id FROM "Category" WHERE slug = 'printable-products'), 3, true, NOW()),
  ('subcat-d119', 'Wall Art Prints', 'printable-products--wall-art-prints', (SELECT id FROM "Category" WHERE slug = 'printable-products'), 4, true, NOW()),
  ('subcat-d120', 'Kids Activity Sheets', 'printable-products--kids-activity-sheets', (SELECT id FROM "Category" WHERE slug = 'printable-products'), 5, true, NOW()),
  ('subcat-d121', 'Printable Stickers', 'printable-products--printable-stickers', (SELECT id FROM "Category" WHERE slug = 'printable-products'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- fashion-textile-design -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-d122', 'Fabric Patterns', 'fashion-textile-design--fabric-patterns', (SELECT id FROM "Category" WHERE slug = 'fashion-textile-design'), 0, true, NOW()),
  ('subcat-d123', 'Embroidery Files', 'fashion-textile-design--embroidery-files', (SELECT id FROM "Category" WHERE slug = 'fashion-textile-design'), 1, true, NOW()),
  ('subcat-d124', 'Sewing Patterns', 'fashion-textile-design--sewing-patterns', (SELECT id FROM "Category" WHERE slug = 'fashion-textile-design'), 2, true, NOW()),
  ('subcat-d125', 'Fashion Sketches', 'fashion-textile-design--fashion-sketches', (SELECT id FROM "Category" WHERE slug = 'fashion-textile-design'), 3, true, NOW()),
  ('subcat-d126', 'Jewelry CAD Files', 'fashion-textile-design--jewelry-cad-files', (SELECT id FROM "Category" WHERE slug = 'fashion-textile-design'), 4, true, NOW()),
  ('subcat-d127', 'T-Shirt Print Designs', 'fashion-textile-design--t-shirt-print-designs', (SELECT id FROM "Category" WHERE slug = 'fashion-textile-design'), 5, true, NOW()),
  ('subcat-d128', 'Textile Prints', 'fashion-textile-design--textile-prints', (SELECT id FROM "Category" WHERE slug = 'fashion-textile-design'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- PHYSICAL SUBCATEGORIES
-- ============================================================

-- ----- fashion-clothing -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p001', 'Men Clothing', 'fashion-clothing--men-clothing', (SELECT id FROM "Category" WHERE slug = 'fashion-clothing'), 0, true, NOW()),
  ('subcat-p002', 'Women Clothing', 'fashion-clothing--women-clothing', (SELECT id FROM "Category" WHERE slug = 'fashion-clothing'), 1, true, NOW()),
  ('subcat-p003', 'Kids Clothing', 'fashion-clothing--kids-clothing', (SELECT id FROM "Category" WHERE slug = 'fashion-clothing'), 2, true, NOW()),
  ('subcat-p004', 'Hoodies', 'fashion-clothing--hoodies', (SELECT id FROM "Category" WHERE slug = 'fashion-clothing'), 3, true, NOW()),
  ('subcat-p005', 'T-Shirts', 'fashion-clothing--t-shirts', (SELECT id FROM "Category" WHERE slug = 'fashion-clothing'), 4, true, NOW()),
  ('subcat-p006', 'Jeans', 'fashion-clothing--jeans', (SELECT id FROM "Category" WHERE slug = 'fashion-clothing'), 5, true, NOW()),
  ('subcat-p007', 'Jackets', 'fashion-clothing--jackets', (SELECT id FROM "Category" WHERE slug = 'fashion-clothing'), 6, true, NOW()),
  ('subcat-p008', 'Traditional Wear', 'fashion-clothing--traditional-wear', (SELECT id FROM "Category" WHERE slug = 'fashion-clothing'), 7, true, NOW()),
  ('subcat-p009', 'Sportswear', 'fashion-clothing--sportswear', (SELECT id FROM "Category" WHERE slug = 'fashion-clothing'), 8, true, NOW()),
  ('subcat-p010', 'Shoes & Footwear', 'fashion-clothing--shoes-footwear', (SELECT id FROM "Category" WHERE slug = 'fashion-clothing'), 9, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- jewelry-accessories -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p011', 'Rings', 'jewelry-accessories--rings', (SELECT id FROM "Category" WHERE slug = 'jewelry-accessories'), 0, true, NOW()),
  ('subcat-p012', 'Necklaces', 'jewelry-accessories--necklaces', (SELECT id FROM "Category" WHERE slug = 'jewelry-accessories'), 1, true, NOW()),
  ('subcat-p013', 'Bracelets', 'jewelry-accessories--bracelets', (SELECT id FROM "Category" WHERE slug = 'jewelry-accessories'), 2, true, NOW()),
  ('subcat-p014', 'Earrings', 'jewelry-accessories--earrings', (SELECT id FROM "Category" WHERE slug = 'jewelry-accessories'), 3, true, NOW()),
  ('subcat-p015', 'Watches', 'jewelry-accessories--watches', (SELECT id FROM "Category" WHERE slug = 'jewelry-accessories'), 4, true, NOW()),
  ('subcat-p016', 'Handbags', 'jewelry-accessories--handbags', (SELECT id FROM "Category" WHERE slug = 'jewelry-accessories'), 5, true, NOW()),
  ('subcat-p017', 'Wallets', 'jewelry-accessories--wallets', (SELECT id FROM "Category" WHERE slug = 'jewelry-accessories'), 6, true, NOW()),
  ('subcat-p018', 'Sunglasses', 'jewelry-accessories--sunglasses', (SELECT id FROM "Category" WHERE slug = 'jewelry-accessories'), 7, true, NOW()),
  ('subcat-p019', 'Hair Accessories', 'jewelry-accessories--hair-accessories', (SELECT id FROM "Category" WHERE slug = 'jewelry-accessories'), 8, true, NOW()),
  ('subcat-p020', 'Luxury Accessories', 'jewelry-accessories--luxury-accessories', (SELECT id FROM "Category" WHERE slug = 'jewelry-accessories'), 9, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- beauty-personal-care -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p021', 'Makeup Products', 'beauty-personal-care--makeup-products', (SELECT id FROM "Category" WHERE slug = 'beauty-personal-care'), 0, true, NOW()),
  ('subcat-p022', 'Skincare', 'beauty-personal-care--skincare', (SELECT id FROM "Category" WHERE slug = 'beauty-personal-care'), 1, true, NOW()),
  ('subcat-p023', 'Hair Care', 'beauty-personal-care--hair-care', (SELECT id FROM "Category" WHERE slug = 'beauty-personal-care'), 2, true, NOW()),
  ('subcat-p024', 'Perfumes', 'beauty-personal-care--perfumes', (SELECT id FROM "Category" WHERE slug = 'beauty-personal-care'), 3, true, NOW()),
  ('subcat-p025', 'Nail Products', 'beauty-personal-care--nail-products', (SELECT id FROM "Category" WHERE slug = 'beauty-personal-care'), 4, true, NOW()),
  ('subcat-p026', 'Beauty Tools', 'beauty-personal-care--beauty-tools', (SELECT id FROM "Category" WHERE slug = 'beauty-personal-care'), 5, true, NOW()),
  ('subcat-p027', 'Organic Beauty Products', 'beauty-personal-care--organic-beauty-products', (SELECT id FROM "Category" WHERE slug = 'beauty-personal-care'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- electronics -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p028', 'Mobile Phones', 'electronics--mobile-phones', (SELECT id FROM "Category" WHERE slug = 'electronics'), 0, true, NOW()),
  ('subcat-p029', 'Laptops', 'electronics--laptops', (SELECT id FROM "Category" WHERE slug = 'electronics'), 1, true, NOW()),
  ('subcat-p030', 'Headphones', 'electronics--headphones', (SELECT id FROM "Category" WHERE slug = 'electronics'), 2, true, NOW()),
  ('subcat-p031', 'Smart Watches', 'electronics--smart-watches', (SELECT id FROM "Category" WHERE slug = 'electronics'), 3, true, NOW()),
  ('subcat-p032', 'Gaming Accessories', 'electronics--gaming-accessories', (SELECT id FROM "Category" WHERE slug = 'electronics'), 4, true, NOW()),
  ('subcat-p033', 'Cameras', 'electronics--cameras', (SELECT id FROM "Category" WHERE slug = 'electronics'), 5, true, NOW()),
  ('subcat-p034', 'Computer Accessories', 'electronics--computer-accessories', (SELECT id FROM "Category" WHERE slug = 'electronics'), 6, true, NOW()),
  ('subcat-p035', 'Speakers', 'electronics--speakers', (SELECT id FROM "Category" WHERE slug = 'electronics'), 7, true, NOW()),
  ('subcat-p036', 'Chargers & Cables', 'electronics--chargers-cables', (SELECT id FROM "Category" WHERE slug = 'electronics'), 8, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- home-living -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p037', 'Furniture', 'home-living--furniture', (SELECT id FROM "Category" WHERE slug = 'home-living'), 0, true, NOW()),
  ('subcat-p038', 'Home Decor', 'home-living--home-decor', (SELECT id FROM "Category" WHERE slug = 'home-living'), 1, true, NOW()),
  ('subcat-p039', 'Kitchen Accessories', 'home-living--kitchen-accessories', (SELECT id FROM "Category" WHERE slug = 'home-living'), 2, true, NOW()),
  ('subcat-p040', 'Bedsheets', 'home-living--bedsheets', (SELECT id FROM "Category" WHERE slug = 'home-living'), 3, true, NOW()),
  ('subcat-p041', 'Curtains', 'home-living--curtains', (SELECT id FROM "Category" WHERE slug = 'home-living'), 4, true, NOW()),
  ('subcat-p042', 'Lighting', 'home-living--lighting', (SELECT id FROM "Category" WHERE slug = 'home-living'), 5, true, NOW()),
  ('subcat-p043', 'Storage Products', 'home-living--storage-products', (SELECT id FROM "Category" WHERE slug = 'home-living'), 6, true, NOW()),
  ('subcat-p044', 'Wall Art', 'home-living--wall-art', (SELECT id FROM "Category" WHERE slug = 'home-living'), 7, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- handmade-products -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p045', 'Handmade Jewelry', 'handmade-products--handmade-jewelry', (SELECT id FROM "Category" WHERE slug = 'handmade-products'), 0, true, NOW()),
  ('subcat-p046', 'Handmade Crafts', 'handmade-products--handmade-crafts', (SELECT id FROM "Category" WHERE slug = 'handmade-products'), 1, true, NOW()),
  ('subcat-p047', 'Handmade Bags', 'handmade-products--handmade-bags', (SELECT id FROM "Category" WHERE slug = 'handmade-products'), 2, true, NOW()),
  ('subcat-p048', 'Handmade Decor', 'handmade-products--handmade-decor', (SELECT id FROM "Category" WHERE slug = 'handmade-products'), 3, true, NOW()),
  ('subcat-p049', 'Crochet Products', 'handmade-products--crochet-products', (SELECT id FROM "Category" WHERE slug = 'handmade-products'), 4, true, NOW()),
  ('subcat-p050', 'Resin Art', 'handmade-products--resin-art', (SELECT id FROM "Category" WHERE slug = 'handmade-products'), 5, true, NOW()),
  ('subcat-p051', 'Pottery', 'handmade-products--pottery', (SELECT id FROM "Category" WHERE slug = 'handmade-products'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- art-crafts -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p052', 'Paintings', 'art-crafts--paintings', (SELECT id FROM "Category" WHERE slug = 'art-crafts'), 0, true, NOW()),
  ('subcat-p053', 'Sketches', 'art-crafts--sketches', (SELECT id FROM "Category" WHERE slug = 'art-crafts'), 1, true, NOW()),
  ('subcat-p054', 'Canvas Art', 'art-crafts--canvas-art', (SELECT id FROM "Category" WHERE slug = 'art-crafts'), 2, true, NOW()),
  ('subcat-p055', 'Craft Supplies', 'art-crafts--craft-supplies', (SELECT id FROM "Category" WHERE slug = 'art-crafts'), 3, true, NOW()),
  ('subcat-p056', 'DIY Kits', 'art-crafts--diy-kits', (SELECT id FROM "Category" WHERE slug = 'art-crafts'), 4, true, NOW()),
  ('subcat-p057', 'Calligraphy Products', 'art-crafts--calligraphy-products', (SELECT id FROM "Category" WHERE slug = 'art-crafts'), 5, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- textile-fabric -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p058', 'Fabric Materials', 'textile-fabric--fabric-materials', (SELECT id FROM "Category" WHERE slug = 'textile-fabric'), 0, true, NOW()),
  ('subcat-p059', 'Printed Fabric', 'textile-fabric--printed-fabric', (SELECT id FROM "Category" WHERE slug = 'textile-fabric'), 1, true, NOW()),
  ('subcat-p060', 'Embroidered Fabric', 'textile-fabric--embroidered-fabric', (SELECT id FROM "Category" WHERE slug = 'textile-fabric'), 2, true, NOW()),
  ('subcat-p061', 'Lawn Fabric', 'textile-fabric--lawn-fabric', (SELECT id FROM "Category" WHERE slug = 'textile-fabric'), 3, true, NOW()),
  ('subcat-p062', 'Cotton Fabric', 'textile-fabric--cotton-fabric', (SELECT id FROM "Category" WHERE slug = 'textile-fabric'), 4, true, NOW()),
  ('subcat-p063', 'Silk Fabric', 'textile-fabric--silk-fabric', (SELECT id FROM "Category" WHERE slug = 'textile-fabric'), 5, true, NOW()),
  ('subcat-p064', 'Textile Patterns', 'textile-fabric--textile-patterns', (SELECT id FROM "Category" WHERE slug = 'textile-fabric'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- food-beverages -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p065', 'Snacks', 'food-beverages--snacks', (SELECT id FROM "Category" WHERE slug = 'food-beverages'), 0, true, NOW()),
  ('subcat-p066', 'Bakery Items', 'food-beverages--bakery-items', (SELECT id FROM "Category" WHERE slug = 'food-beverages'), 1, true, NOW()),
  ('subcat-p067', 'Organic Food', 'food-beverages--organic-food', (SELECT id FROM "Category" WHERE slug = 'food-beverages'), 2, true, NOW()),
  ('subcat-p068', 'Dry Fruits', 'food-beverages--dry-fruits', (SELECT id FROM "Category" WHERE slug = 'food-beverages'), 3, true, NOW()),
  ('subcat-p069', 'Chocolates', 'food-beverages--chocolates', (SELECT id FROM "Category" WHERE slug = 'food-beverages'), 4, true, NOW()),
  ('subcat-p070', 'Beverages', 'food-beverages--beverages', (SELECT id FROM "Category" WHERE slug = 'food-beverages'), 5, true, NOW()),
  ('subcat-p071', 'Homemade Food', 'food-beverages--homemade-food', (SELECT id FROM "Category" WHERE slug = 'food-beverages'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- health-fitness -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p072', 'Gym Equipment', 'health-fitness--gym-equipment', (SELECT id FROM "Category" WHERE slug = 'health-fitness'), 0, true, NOW()),
  ('subcat-p073', 'Yoga Products', 'health-fitness--yoga-products', (SELECT id FROM "Category" WHERE slug = 'health-fitness'), 1, true, NOW()),
  ('subcat-p074', 'Fitness Accessories', 'health-fitness--fitness-accessories', (SELECT id FROM "Category" WHERE slug = 'health-fitness'), 2, true, NOW()),
  ('subcat-p075', 'Protein Shakers', 'health-fitness--protein-shakers', (SELECT id FROM "Category" WHERE slug = 'health-fitness'), 3, true, NOW()),
  ('subcat-p076', 'Sports Equipment', 'health-fitness--sports-equipment', (SELECT id FROM "Category" WHERE slug = 'health-fitness'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- toys-games -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p077', 'Kids Toys', 'toys-games--kids-toys', (SELECT id FROM "Category" WHERE slug = 'toys-games'), 0, true, NOW()),
  ('subcat-p078', 'Educational Toys', 'toys-games--educational-toys', (SELECT id FROM "Category" WHERE slug = 'toys-games'), 1, true, NOW()),
  ('subcat-p079', 'Board Games', 'toys-games--board-games', (SELECT id FROM "Category" WHERE slug = 'toys-games'), 2, true, NOW()),
  ('subcat-p080', 'Remote Control Toys', 'toys-games--remote-control-toys', (SELECT id FROM "Category" WHERE slug = 'toys-games'), 3, true, NOW()),
  ('subcat-p081', 'Action Figures', 'toys-games--action-figures', (SELECT id FROM "Category" WHERE slug = 'toys-games'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- pet-supplies -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p082', 'Pet Food', 'pet-supplies--pet-food', (SELECT id FROM "Category" WHERE slug = 'pet-supplies'), 0, true, NOW()),
  ('subcat-p083', 'Pet Toys', 'pet-supplies--pet-toys', (SELECT id FROM "Category" WHERE slug = 'pet-supplies'), 1, true, NOW()),
  ('subcat-p084', 'Pet Clothes', 'pet-supplies--pet-clothes', (SELECT id FROM "Category" WHERE slug = 'pet-supplies'), 2, true, NOW()),
  ('subcat-p085', 'Pet Accessories', 'pet-supplies--pet-accessories', (SELECT id FROM "Category" WHERE slug = 'pet-supplies'), 3, true, NOW()),
  ('subcat-p086', 'Pet Beds', 'pet-supplies--pet-beds', (SELECT id FROM "Category" WHERE slug = 'pet-supplies'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- automotive -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p087', 'Car Accessories', 'automotive--car-accessories', (SELECT id FROM "Category" WHERE slug = 'automotive'), 0, true, NOW()),
  ('subcat-p088', 'Bike Accessories', 'automotive--bike-accessories', (SELECT id FROM "Category" WHERE slug = 'automotive'), 1, true, NOW()),
  ('subcat-p089', 'Car Care Products', 'automotive--car-care-products', (SELECT id FROM "Category" WHERE slug = 'automotive'), 2, true, NOW()),
  ('subcat-p090', 'Helmets', 'automotive--helmets', (SELECT id FROM "Category" WHERE slug = 'automotive'), 3, true, NOW()),
  ('subcat-p091', 'Seat Covers', 'automotive--seat-covers', (SELECT id FROM "Category" WHERE slug = 'automotive'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- books -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p092', 'Academic Books', 'books--academic-books', (SELECT id FROM "Category" WHERE slug = 'books'), 0, true, NOW()),
  ('subcat-p093', 'School Books', 'books--school-books', (SELECT id FROM "Category" WHERE slug = 'books'), 1, true, NOW()),
  ('subcat-p094', 'College Books', 'books--college-books', (SELECT id FROM "Category" WHERE slug = 'books'), 2, true, NOW()),
  ('subcat-p095', 'University Books', 'books--university-books', (SELECT id FROM "Category" WHERE slug = 'books'), 3, true, NOW()),
  ('subcat-p096', 'Novels', 'books--novels', (SELECT id FROM "Category" WHERE slug = 'books'), 4, true, NOW()),
  ('subcat-p097', 'Story Books', 'books--story-books', (SELECT id FROM "Category" WHERE slug = 'books'), 5, true, NOW()),
  ('subcat-p098', 'Islamic Books', 'books--islamic-books', (SELECT id FROM "Category" WHERE slug = 'books'), 6, true, NOW()),
  ('subcat-p099', 'Kids Books', 'books--kids-books', (SELECT id FROM "Category" WHERE slug = 'books'), 7, true, NOW()),
  ('subcat-p100', 'Comics & Manga', 'books--comics-manga', (SELECT id FROM "Category" WHERE slug = 'books'), 8, true, NOW()),
  ('subcat-p101', 'Poetry Books', 'books--poetry-books', (SELECT id FROM "Category" WHERE slug = 'books'), 9, true, NOW()),
  ('subcat-p102', 'Self-Help Books', 'books--self-help-books', (SELECT id FROM "Category" WHERE slug = 'books'), 10, true, NOW()),
  ('subcat-p103', 'Business Books', 'books--business-books', (SELECT id FROM "Category" WHERE slug = 'books'), 11, true, NOW()),
  ('subcat-p104', 'Programming Books', 'books--programming-books', (SELECT id FROM "Category" WHERE slug = 'books'), 12, true, NOW()),
  ('subcat-p105', 'Medical Books', 'books--medical-books', (SELECT id FROM "Category" WHERE slug = 'books'), 13, true, NOW()),
  ('subcat-p106', 'Engineering Books', 'books--engineering-books', (SELECT id FROM "Category" WHERE slug = 'books'), 14, true, NOW()),
  ('subcat-p107', 'Fashion Books', 'books--fashion-books', (SELECT id FROM "Category" WHERE slug = 'books'), 15, true, NOW()),
  ('subcat-p108', 'Art & Design Books', 'books--art-design-books', (SELECT id FROM "Category" WHERE slug = 'books'), 16, true, NOW()),
  ('subcat-p109', 'Cooking Books', 'books--cooking-books', (SELECT id FROM "Category" WHERE slug = 'books'), 17, true, NOW()),
  ('subcat-p110', 'Language Learning Books', 'books--language-learning-books', (SELECT id FROM "Category" WHERE slug = 'books'), 18, true, NOW()),
  ('subcat-p111', 'Motivational Books', 'books--motivational-books', (SELECT id FROM "Category" WHERE slug = 'books'), 19, true, NOW()),
  ('subcat-p112', 'History Books', 'books--history-books', (SELECT id FROM "Category" WHERE slug = 'books'), 20, true, NOW()),
  ('subcat-p113', 'Science Books', 'books--science-books', (SELECT id FROM "Category" WHERE slug = 'books'), 21, true, NOW()),
  ('subcat-p114', 'Biography Books', 'books--biography-books', (SELECT id FROM "Category" WHERE slug = 'books'), 22, true, NOW()),
  ('subcat-p115', 'Entrance Exam Books', 'books--entrance-exam-books', (SELECT id FROM "Category" WHERE slug = 'books'), 23, true, NOW()),
  ('subcat-p116', 'Stationery Sets', 'books--stationery-sets', (SELECT id FROM "Category" WHERE slug = 'books'), 24, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- furniture -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p117', 'Sofas', 'furniture--sofas', (SELECT id FROM "Category" WHERE slug = 'furniture'), 0, true, NOW()),
  ('subcat-p118', 'Chairs', 'furniture--chairs', (SELECT id FROM "Category" WHERE slug = 'furniture'), 1, true, NOW()),
  ('subcat-p119', 'Tables', 'furniture--tables', (SELECT id FROM "Category" WHERE slug = 'furniture'), 2, true, NOW()),
  ('subcat-p120', 'Office Furniture', 'furniture--office-furniture', (SELECT id FROM "Category" WHERE slug = 'furniture'), 3, true, NOW()),
  ('subcat-p121', 'Bedroom Furniture', 'furniture--bedroom-furniture', (SELECT id FROM "Category" WHERE slug = 'furniture'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- baby-products -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p122', 'Baby Clothes', 'baby-products--baby-clothes', (SELECT id FROM "Category" WHERE slug = 'baby-products'), 0, true, NOW()),
  ('subcat-p123', 'Baby Toys', 'baby-products--baby-toys', (SELECT id FROM "Category" WHERE slug = 'baby-products'), 1, true, NOW()),
  ('subcat-p124', 'Baby Care Products', 'baby-products--baby-care-products', (SELECT id FROM "Category" WHERE slug = 'baby-products'), 2, true, NOW()),
  ('subcat-p125', 'Baby Feeding Products', 'baby-products--baby-feeding-products', (SELECT id FROM "Category" WHERE slug = 'baby-products'), 3, true, NOW()),
  ('subcat-p126', 'Baby Furniture', 'baby-products--baby-furniture', (SELECT id FROM "Category" WHERE slug = 'baby-products'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- sports-outdoor -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p127', 'Camping Gear', 'sports-outdoor--camping-gear', (SELECT id FROM "Category" WHERE slug = 'sports-outdoor'), 0, true, NOW()),
  ('subcat-p128', 'Sportswear', 'sports-outdoor--sportswear', (SELECT id FROM "Category" WHERE slug = 'sports-outdoor'), 1, true, NOW()),
  ('subcat-p129', 'Outdoor Equipment', 'sports-outdoor--outdoor-equipment', (SELECT id FROM "Category" WHERE slug = 'sports-outdoor'), 2, true, NOW()),
  ('subcat-p130', 'Cycling Products', 'sports-outdoor--cycling-products', (SELECT id FROM "Category" WHERE slug = 'sports-outdoor'), 3, true, NOW()),
  ('subcat-p131', 'Hiking Accessories', 'sports-outdoor--hiking-accessories', (SELECT id FROM "Category" WHERE slug = 'sports-outdoor'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- gifts-custom-products -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-p132', 'Personalized Gifts', 'gifts-custom-products--personalized-gifts', (SELECT id FROM "Category" WHERE slug = 'gifts-custom-products'), 0, true, NOW()),
  ('subcat-p133', 'Custom Mugs', 'gifts-custom-products--custom-mugs', (SELECT id FROM "Category" WHERE slug = 'gifts-custom-products'), 1, true, NOW()),
  ('subcat-p134', 'Photo Frames', 'gifts-custom-products--photo-frames', (SELECT id FROM "Category" WHERE slug = 'gifts-custom-products'), 2, true, NOW()),
  ('subcat-p135', 'Gift Boxes', 'gifts-custom-products--gift-boxes', (SELECT id FROM "Category" WHERE slug = 'gifts-custom-products'), 3, true, NOW()),
  ('subcat-p136', 'Customized T-Shirts', 'gifts-custom-products--customized-t-shirts', (SELECT id FROM "Category" WHERE slug = 'gifts-custom-products'), 4, true, NOW()),
  ('subcat-p137', 'Customized Jewelry', 'gifts-custom-products--customized-jewelry', (SELECT id FROM "Category" WHERE slug = 'gifts-custom-products'), 5, true, NOW())
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- GIG SUBCATEGORIES
-- ============================================================

-- ----- graphic-design -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g001', 'Logo Design', 'graphic-design--logo-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 0, true, NOW()),
  ('subcat-g002', 'Minimalist Logo Design', 'graphic-design--minimalist-logo-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 1, true, NOW()),
  ('subcat-g003', '3D Logo Design', 'graphic-design--3d-logo-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 2, true, NOW()),
  ('subcat-g004', 'Mascot Logo Design', 'graphic-design--mascot-logo-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 3, true, NOW()),
  ('subcat-g005', 'Signature Logo Design', 'graphic-design--signature-logo-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 4, true, NOW()),
  ('subcat-g006', 'Vintage Logo Design', 'graphic-design--vintage-logo-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 5, true, NOW()),
  ('subcat-g007', 'Gaming Logo Design', 'graphic-design--gaming-logo-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 6, true, NOW()),
  ('subcat-g008', 'Esports Logo Design', 'graphic-design--esports-logo-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 7, true, NOW()),
  ('subcat-g009', 'Brand Identity Design', 'graphic-design--brand-identity-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 8, true, NOW()),
  ('subcat-g010', 'Brand Guidelines', 'graphic-design--brand-guidelines', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 9, true, NOW()),
  ('subcat-g011', 'Social Media Post Design', 'graphic-design--social-media-post-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 10, true, NOW()),
  ('subcat-g012', 'Instagram Post Design', 'graphic-design--instagram-post-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 11, true, NOW()),
  ('subcat-g013', 'Facebook Cover Design', 'graphic-design--facebook-cover-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 12, true, NOW()),
  ('subcat-g014', 'YouTube Thumbnail Design', 'graphic-design--youtube-thumbnail-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 13, true, NOW()),
  ('subcat-g015', 'Twitch Banner Design', 'graphic-design--twitch-banner-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 14, true, NOW()),
  ('subcat-g016', 'LinkedIn Banner Design', 'graphic-design--linkedin-banner-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 15, true, NOW()),
  ('subcat-g017', 'Poster Design', 'graphic-design--poster-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 16, true, NOW()),
  ('subcat-g018', 'Flyer Design', 'graphic-design--flyer-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 17, true, NOW()),
  ('subcat-g019', 'Brochure Design', 'graphic-design--brochure-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 18, true, NOW()),
  ('subcat-g020', 'Menu Design', 'graphic-design--menu-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 19, true, NOW()),
  ('subcat-g021', 'Catalog Design', 'graphic-design--catalog-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 20, true, NOW()),
  ('subcat-g022', 'Magazine Design', 'graphic-design--magazine-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 21, true, NOW()),
  ('subcat-g023', 'Book Cover Design', 'graphic-design--book-cover-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 22, true, NOW()),
  ('subcat-g024', 'Ebook Cover Design', 'graphic-design--ebook-cover-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 23, true, NOW()),
  ('subcat-g025', 'Album Cover Design', 'graphic-design--album-cover-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 24, true, NOW()),
  ('subcat-g026', 'Podcast Cover Design', 'graphic-design--podcast-cover-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 25, true, NOW()),
  ('subcat-g027', 'Packaging Design', 'graphic-design--packaging-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 26, true, NOW()),
  ('subcat-g028', 'Label Design', 'graphic-design--label-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 27, true, NOW()),
  ('subcat-g029', 'Product Packaging Design', 'graphic-design--product-packaging-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 28, true, NOW()),
  ('subcat-g030', 'Mockup Design', 'graphic-design--mockup-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 29, true, NOW()),
  ('subcat-g031', 'Business Card Design', 'graphic-design--business-card-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 30, true, NOW()),
  ('subcat-g032', 'Letterhead Design', 'graphic-design--letterhead-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 31, true, NOW()),
  ('subcat-g033', 'Invoice Design', 'graphic-design--invoice-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 32, true, NOW()),
  ('subcat-g034', 'Stationery Design', 'graphic-design--stationery-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 33, true, NOW()),
  ('subcat-g035', 'Presentation Design', 'graphic-design--presentation-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 34, true, NOW()),
  ('subcat-g036', 'PowerPoint Design', 'graphic-design--powerpoint-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 35, true, NOW()),
  ('subcat-g037', 'Pitch Deck Design', 'graphic-design--pitch-deck-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 36, true, NOW()),
  ('subcat-g038', 'Infographic Design', 'graphic-design--infographic-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 37, true, NOW()),
  ('subcat-g039', 'Resume/CV Design', 'graphic-design--resumecv-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 38, true, NOW()),
  ('subcat-g040', 'UI Design', 'graphic-design--ui-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 39, true, NOW()),
  ('subcat-g041', 'Web Banner Design', 'graphic-design--web-banner-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 40, true, NOW()),
  ('subcat-g042', 'Landing Page Design', 'graphic-design--landing-page-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 41, true, NOW()),
  ('subcat-g043', 'App Interface Design', 'graphic-design--app-interface-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 42, true, NOW()),
  ('subcat-g044', 'Icon Design', 'graphic-design--icon-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 43, true, NOW()),
  ('subcat-g045', 'Sticker Design', 'graphic-design--sticker-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 44, true, NOW()),
  ('subcat-g046', 'Emoji Design', 'graphic-design--emoji-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 45, true, NOW()),
  ('subcat-g047', 'Illustration Design', 'graphic-design--illustration-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 46, true, NOW()),
  ('subcat-g048', 'Character Illustration', 'graphic-design--character-illustration', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 47, true, NOW()),
  ('subcat-g049', 'Cartoon Design', 'graphic-design--cartoon-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 48, true, NOW()),
  ('subcat-g050', 'Anime Art', 'graphic-design--anime-art', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 49, true, NOW()),
  ('subcat-g051', 'NFT Art', 'graphic-design--nft-art', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 50, true, NOW()),
  ('subcat-g052', 'Digital Painting', 'graphic-design--digital-painting', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 51, true, NOW()),
  ('subcat-g053', 'Vector Tracing', 'graphic-design--vector-tracing', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 52, true, NOW()),
  ('subcat-g054', 'Photo Manipulation', 'graphic-design--photo-manipulation', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 53, true, NOW()),
  ('subcat-g055', 'Photo Retouching', 'graphic-design--photo-retouching', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 54, true, NOW()),
  ('subcat-g056', 'Background Removal', 'graphic-design--background-removal', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 55, true, NOW()),
  ('subcat-g057', 'Color Correction', 'graphic-design--color-correction', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 56, true, NOW()),
  ('subcat-g058', 'Photoshop Editing', 'graphic-design--photoshop-editing', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 57, true, NOW()),
  ('subcat-g059', 'Canva Design', 'graphic-design--canva-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 58, true, NOW()),
  ('subcat-g060', 'Adobe Illustrator Design', 'graphic-design--adobe-illustrator-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 59, true, NOW()),
  ('subcat-g061', 'Adobe Photoshop Work', 'graphic-design--adobe-photoshop-work', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 60, true, NOW()),
  ('subcat-g062', 'Figma Design', 'graphic-design--figma-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 61, true, NOW()),
  ('subcat-g063', 'Textile Pattern Design', 'graphic-design--textile-pattern-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 62, true, NOW()),
  ('subcat-g064', 'Fabric Print Design', 'graphic-design--fabric-print-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 63, true, NOW()),
  ('subcat-g065', 'Embroidery Design', 'graphic-design--embroidery-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 64, true, NOW()),
  ('subcat-g066', 'Fashion Illustration', 'graphic-design--fashion-illustration', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 65, true, NOW()),
  ('subcat-g067', 'T-Shirt Design', 'graphic-design--t-shirt-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 66, true, NOW()),
  ('subcat-g068', 'Hoodie Design', 'graphic-design--hoodie-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 67, true, NOW()),
  ('subcat-g069', 'Merchandise Design', 'graphic-design--merchandise-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 68, true, NOW()),
  ('subcat-g070', 'Mug Design', 'graphic-design--mug-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 69, true, NOW()),
  ('subcat-g071', 'Tote Bag Design', 'graphic-design--tote-bag-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 70, true, NOW()),
  ('subcat-g072', 'Jewelry Design', 'graphic-design--jewelry-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 71, true, NOW()),
  ('subcat-g073', 'Ring Design', 'graphic-design--ring-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 72, true, NOW()),
  ('subcat-g074', 'Necklace Design', 'graphic-design--necklace-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 73, true, NOW()),
  ('subcat-g075', 'Bracelet Design', 'graphic-design--bracelet-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 74, true, NOW()),
  ('subcat-g076', 'Earrings Design', 'graphic-design--earrings-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 75, true, NOW()),
  ('subcat-g077', 'Pendant Design', 'graphic-design--pendant-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 76, true, NOW()),
  ('subcat-g078', 'Luxury Jewelry Design', 'graphic-design--luxury-jewelry-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 77, true, NOW()),
  ('subcat-g079', 'Bridal Jewelry Design', 'graphic-design--bridal-jewelry-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 78, true, NOW()),
  ('subcat-g080', 'Handmade Jewelry Design', 'graphic-design--handmade-jewelry-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 79, true, NOW()),
  ('subcat-g081', 'Jewelry Rendering', 'graphic-design--jewelry-rendering', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 80, true, NOW()),
  ('subcat-g082', '3D Jewelry Modeling', 'graphic-design--3d-jewelry-modeling', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 81, true, NOW()),
  ('subcat-g083', 'CAD Jewelry Design', 'graphic-design--cad-jewelry-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 82, true, NOW()),
  ('subcat-g084', 'Jewelry Packaging Design', 'graphic-design--jewelry-packaging-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 83, true, NOW()),
  ('subcat-g085', 'Gold Jewelry Design', 'graphic-design--gold-jewelry-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 84, true, NOW()),
  ('subcat-g086', 'Silver Jewelry Design', 'graphic-design--silver-jewelry-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 85, true, NOW()),
  ('subcat-g087', 'Gemstone Jewelry Design', 'graphic-design--gemstone-jewelry-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 86, true, NOW()),
  ('subcat-g088', 'Tattoo Design', 'graphic-design--tattoo-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 87, true, NOW()),
  ('subcat-g089', 'Calligraphy Design', 'graphic-design--calligraphy-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 88, true, NOW()),
  ('subcat-g090', 'Arabic Calligraphy', 'graphic-design--arabic-calligraphy', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 89, true, NOW()),
  ('subcat-g091', 'Urdu Typography', 'graphic-design--urdu-typography', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 90, true, NOW()),
  ('subcat-g092', 'Custom Typography', 'graphic-design--custom-typography', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 91, true, NOW()),
  ('subcat-g093', 'Invitation Card Design', 'graphic-design--invitation-card-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 92, true, NOW()),
  ('subcat-g094', 'Wedding Card Design', 'graphic-design--wedding-card-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 93, true, NOW()),
  ('subcat-g095', 'Birthday Card Design', 'graphic-design--birthday-card-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 94, true, NOW()),
  ('subcat-g096', 'Certificate Design', 'graphic-design--certificate-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 95, true, NOW()),
  ('subcat-g097', 'ID Card Design', 'graphic-design--id-card-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 96, true, NOW()),
  ('subcat-g098', 'Event Banner Design', 'graphic-design--event-banner-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 97, true, NOW()),
  ('subcat-g099', 'Billboard Design', 'graphic-design--billboard-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 98, true, NOW()),
  ('subcat-g100', 'Vehicle Wrap Design', 'graphic-design--vehicle-wrap-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 99, true, NOW()),
  ('subcat-g101', 'Signboard Design', 'graphic-design--signboard-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 100, true, NOW()),
  ('subcat-g102', 'Stream Overlay Design', 'graphic-design--stream-overlay-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 101, true, NOW()),
  ('subcat-g103', 'Discord Server Graphics', 'graphic-design--discord-server-graphics', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 102, true, NOW()),
  ('subcat-g104', 'Gaming Graphics', 'graphic-design--gaming-graphics', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 103, true, NOW()),
  ('subcat-g105', 'Esports Social Media Design', 'graphic-design--esports-social-media-design', (SELECT id FROM "Category" WHERE slug = 'graphic-design'), 104, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- web-development -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g106', 'Frontend Development', 'web-development--frontend-development', (SELECT id FROM "Category" WHERE slug = 'web-development'), 0, true, NOW()),
  ('subcat-g107', 'Backend Development', 'web-development--backend-development', (SELECT id FROM "Category" WHERE slug = 'web-development'), 1, true, NOW()),
  ('subcat-g108', 'Full Stack Development', 'web-development--full-stack-development', (SELECT id FROM "Category" WHERE slug = 'web-development'), 2, true, NOW()),
  ('subcat-g109', 'Custom Website Development', 'web-development--custom-website-development', (SELECT id FROM "Category" WHERE slug = 'web-development'), 3, true, NOW()),
  ('subcat-g110', 'Portfolio Websites', 'web-development--portfolio-websites', (SELECT id FROM "Category" WHERE slug = 'web-development'), 4, true, NOW()),
  ('subcat-g111', 'Business Websites', 'web-development--business-websites', (SELECT id FROM "Category" WHERE slug = 'web-development'), 5, true, NOW()),
  ('subcat-g112', 'Landing Pages', 'web-development--landing-pages', (SELECT id FROM "Category" WHERE slug = 'web-development'), 6, true, NOW()),
  ('subcat-g113', 'Website Bug Fixing', 'web-development--website-bug-fixing', (SELECT id FROM "Category" WHERE slug = 'web-development'), 7, true, NOW()),
  ('subcat-g114', 'API Integration', 'web-development--api-integration', (SELECT id FROM "Category" WHERE slug = 'web-development'), 8, true, NOW()),
  ('subcat-g115', 'Website Optimization', 'web-development--website-optimization', (SELECT id FROM "Category" WHERE slug = 'web-development'), 9, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- app-development -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g116', 'Android App Development', 'app-development--android-app-development', (SELECT id FROM "Category" WHERE slug = 'app-development'), 0, true, NOW()),
  ('subcat-g117', 'iOS App Development', 'app-development--ios-app-development', (SELECT id FROM "Category" WHERE slug = 'app-development'), 1, true, NOW()),
  ('subcat-g118', 'Flutter Development', 'app-development--flutter-development', (SELECT id FROM "Category" WHERE slug = 'app-development'), 2, true, NOW()),
  ('subcat-g119', 'React Native Development', 'app-development--react-native-development', (SELECT id FROM "Category" WHERE slug = 'app-development'), 3, true, NOW()),
  ('subcat-g120', 'Hybrid Apps', 'app-development--hybrid-apps', (SELECT id FROM "Category" WHERE slug = 'app-development'), 4, true, NOW()),
  ('subcat-g121', 'Mobile UI Design', 'app-development--mobile-ui-design', (SELECT id FROM "Category" WHERE slug = 'app-development'), 5, true, NOW()),
  ('subcat-g122', 'App Testing', 'app-development--app-testing', (SELECT id FROM "Category" WHERE slug = 'app-development'), 6, true, NOW()),
  ('subcat-g123', 'App Maintenance', 'app-development--app-maintenance', (SELECT id FROM "Category" WHERE slug = 'app-development'), 7, true, NOW()),
  ('subcat-g124', 'App Deployment', 'app-development--app-deployment', (SELECT id FROM "Category" WHERE slug = 'app-development'), 8, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- ui-ux-design -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g125', 'Mobile App UI', 'ui-ux-design--mobile-app-ui', (SELECT id FROM "Category" WHERE slug = 'ui-ux-design'), 0, true, NOW()),
  ('subcat-g126', 'Website UI', 'ui-ux-design--website-ui', (SELECT id FROM "Category" WHERE slug = 'ui-ux-design'), 1, true, NOW()),
  ('subcat-g127', 'Wireframing', 'ui-ux-design--wireframing', (SELECT id FROM "Category" WHERE slug = 'ui-ux-design'), 2, true, NOW()),
  ('subcat-g128', 'Prototyping', 'ui-ux-design--prototyping', (SELECT id FROM "Category" WHERE slug = 'ui-ux-design'), 3, true, NOW()),
  ('subcat-g129', 'User Research', 'ui-ux-design--user-research', (SELECT id FROM "Category" WHERE slug = 'ui-ux-design'), 4, true, NOW()),
  ('subcat-g130', 'Dashboard Design', 'ui-ux-design--dashboard-design', (SELECT id FROM "Category" WHERE slug = 'ui-ux-design'), 5, true, NOW()),
  ('subcat-g131', 'SaaS UI Design', 'ui-ux-design--saas-ui-design', (SELECT id FROM "Category" WHERE slug = 'ui-ux-design'), 6, true, NOW()),
  ('subcat-g132', 'Figma Design', 'ui-ux-design--figma-design', (SELECT id FROM "Category" WHERE slug = 'ui-ux-design'), 7, true, NOW()),
  ('subcat-g133', 'Adobe XD Design', 'ui-ux-design--adobe-xd-design', (SELECT id FROM "Category" WHERE slug = 'ui-ux-design'), 8, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- video-editing -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g134', 'YouTube Video Editing', 'video-editing--youtube-video-editing', (SELECT id FROM "Category" WHERE slug = 'video-editing'), 0, true, NOW()),
  ('subcat-g135', 'Shorts/Reels Editing', 'video-editing--shortsreels-editing', (SELECT id FROM "Category" WHERE slug = 'video-editing'), 1, true, NOW()),
  ('subcat-g136', 'TikTok Editing', 'video-editing--tiktok-editing', (SELECT id FROM "Category" WHERE slug = 'video-editing'), 2, true, NOW()),
  ('subcat-g137', 'Cinematic Editing', 'video-editing--cinematic-editing', (SELECT id FROM "Category" WHERE slug = 'video-editing'), 3, true, NOW()),
  ('subcat-g138', 'Color Grading', 'video-editing--color-grading', (SELECT id FROM "Category" WHERE slug = 'video-editing'), 4, true, NOW()),
  ('subcat-g139', 'Subtitle Adding', 'video-editing--subtitle-adding', (SELECT id FROM "Category" WHERE slug = 'video-editing'), 5, true, NOW()),
  ('subcat-g140', 'Podcast Editing', 'video-editing--podcast-editing', (SELECT id FROM "Category" WHERE slug = 'video-editing'), 6, true, NOW()),
  ('subcat-g141', 'Green Screen Editing', 'video-editing--green-screen-editing', (SELECT id FROM "Category" WHERE slug = 'video-editing'), 7, true, NOW()),
  ('subcat-g142', 'Intro & Outro Videos', 'video-editing--intro-outro-videos', (SELECT id FROM "Category" WHERE slug = 'video-editing'), 8, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- animation-motion-graphics -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g143', '2D Animation', 'animation-motion-graphics--2d-animation', (SELECT id FROM "Category" WHERE slug = 'animation-motion-graphics'), 0, true, NOW()),
  ('subcat-g144', '3D Animation', 'animation-motion-graphics--3d-animation', (SELECT id FROM "Category" WHERE slug = 'animation-motion-graphics'), 1, true, NOW()),
  ('subcat-g145', 'Motion Graphics', 'animation-motion-graphics--motion-graphics', (SELECT id FROM "Category" WHERE slug = 'animation-motion-graphics'), 2, true, NOW()),
  ('subcat-g146', 'Explainer Videos', 'animation-motion-graphics--explainer-videos', (SELECT id FROM "Category" WHERE slug = 'animation-motion-graphics'), 3, true, NOW()),
  ('subcat-g147', 'Whiteboard Animation', 'animation-motion-graphics--whiteboard-animation', (SELECT id FROM "Category" WHERE slug = 'animation-motion-graphics'), 4, true, NOW()),
  ('subcat-g148', 'Character Animation', 'animation-motion-graphics--character-animation', (SELECT id FROM "Category" WHERE slug = 'animation-motion-graphics'), 5, true, NOW()),
  ('subcat-g149', 'Logo Animation', 'animation-motion-graphics--logo-animation', (SELECT id FROM "Category" WHERE slug = 'animation-motion-graphics'), 6, true, NOW()),
  ('subcat-g150', 'VFX Effects', 'animation-motion-graphics--vfx-effects', (SELECT id FROM "Category" WHERE slug = 'animation-motion-graphics'), 7, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- content-writing -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g151', 'Blog Writing', 'content-writing--blog-writing', (SELECT id FROM "Category" WHERE slug = 'content-writing'), 0, true, NOW()),
  ('subcat-g152', 'Article Writing', 'content-writing--article-writing', (SELECT id FROM "Category" WHERE slug = 'content-writing'), 1, true, NOW()),
  ('subcat-g153', 'Website Content', 'content-writing--website-content', (SELECT id FROM "Category" WHERE slug = 'content-writing'), 2, true, NOW()),
  ('subcat-g154', 'Script Writing', 'content-writing--script-writing', (SELECT id FROM "Category" WHERE slug = 'content-writing'), 3, true, NOW()),
  ('subcat-g155', 'Technical Writing', 'content-writing--technical-writing', (SELECT id FROM "Category" WHERE slug = 'content-writing'), 4, true, NOW()),
  ('subcat-g156', 'Product Descriptions', 'content-writing--product-descriptions', (SELECT id FROM "Category" WHERE slug = 'content-writing'), 5, true, NOW()),
  ('subcat-g157', 'Ghostwriting', 'content-writing--ghostwriting', (SELECT id FROM "Category" WHERE slug = 'content-writing'), 6, true, NOW()),
  ('subcat-g158', 'Story Writing', 'content-writing--story-writing', (SELECT id FROM "Category" WHERE slug = 'content-writing'), 7, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- copywriting -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g159', 'Sales Copy', 'copywriting--sales-copy', (SELECT id FROM "Category" WHERE slug = 'copywriting'), 0, true, NOW()),
  ('subcat-g160', 'Ad Copy', 'copywriting--ad-copy', (SELECT id FROM "Category" WHERE slug = 'copywriting'), 1, true, NOW()),
  ('subcat-g161', 'Email Copywriting', 'copywriting--email-copywriting', (SELECT id FROM "Category" WHERE slug = 'copywriting'), 2, true, NOW()),
  ('subcat-g162', 'Landing Page Copy', 'copywriting--landing-page-copy', (SELECT id FROM "Category" WHERE slug = 'copywriting'), 3, true, NOW()),
  ('subcat-g163', 'Product Copy', 'copywriting--product-copy', (SELECT id FROM "Category" WHERE slug = 'copywriting'), 4, true, NOW()),
  ('subcat-g164', 'Social Media Captions', 'copywriting--social-media-captions', (SELECT id FROM "Category" WHERE slug = 'copywriting'), 5, true, NOW()),
  ('subcat-g165', 'Brand Messaging', 'copywriting--brand-messaging', (SELECT id FROM "Category" WHERE slug = 'copywriting'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- translation -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g166', 'English to Urdu', 'translation--english-to-urdu', (SELECT id FROM "Category" WHERE slug = 'translation'), 0, true, NOW()),
  ('subcat-g167', 'Urdu to English', 'translation--urdu-to-english', (SELECT id FROM "Category" WHERE slug = 'translation'), 1, true, NOW()),
  ('subcat-g168', 'Arabic Translation', 'translation--arabic-translation', (SELECT id FROM "Category" WHERE slug = 'translation'), 2, true, NOW()),
  ('subcat-g169', 'French Translation', 'translation--french-translation', (SELECT id FROM "Category" WHERE slug = 'translation'), 3, true, NOW()),
  ('subcat-g170', 'Subtitle Translation', 'translation--subtitle-translation', (SELECT id FROM "Category" WHERE slug = 'translation'), 4, true, NOW()),
  ('subcat-g171', 'Document Translation', 'translation--document-translation', (SELECT id FROM "Category" WHERE slug = 'translation'), 5, true, NOW()),
  ('subcat-g172', 'Website Translation', 'translation--website-translation', (SELECT id FROM "Category" WHERE slug = 'translation'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- digital-marketing -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g173', 'Facebook Marketing', 'digital-marketing--facebook-marketing', (SELECT id FROM "Category" WHERE slug = 'digital-marketing'), 0, true, NOW()),
  ('subcat-g174', 'Instagram Marketing', 'digital-marketing--instagram-marketing', (SELECT id FROM "Category" WHERE slug = 'digital-marketing'), 1, true, NOW()),
  ('subcat-g175', 'TikTok Marketing', 'digital-marketing--tiktok-marketing', (SELECT id FROM "Category" WHERE slug = 'digital-marketing'), 2, true, NOW()),
  ('subcat-g176', 'Google Ads', 'digital-marketing--google-ads', (SELECT id FROM "Category" WHERE slug = 'digital-marketing'), 3, true, NOW()),
  ('subcat-g177', 'Influencer Marketing', 'digital-marketing--influencer-marketing', (SELECT id FROM "Category" WHERE slug = 'digital-marketing'), 4, true, NOW()),
  ('subcat-g178', 'Affiliate Marketing', 'digital-marketing--affiliate-marketing', (SELECT id FROM "Category" WHERE slug = 'digital-marketing'), 5, true, NOW()),
  ('subcat-g179', 'Marketing Strategy', 'digital-marketing--marketing-strategy', (SELECT id FROM "Category" WHERE slug = 'digital-marketing'), 6, true, NOW()),
  ('subcat-g180', 'Email Campaigns', 'digital-marketing--email-campaigns', (SELECT id FROM "Category" WHERE slug = 'digital-marketing'), 7, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- social-media-management -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g181', 'Instagram Management', 'social-media-management--instagram-management', (SELECT id FROM "Category" WHERE slug = 'social-media-management'), 0, true, NOW()),
  ('subcat-g182', 'Facebook Page Management', 'social-media-management--facebook-page-management', (SELECT id FROM "Category" WHERE slug = 'social-media-management'), 1, true, NOW()),
  ('subcat-g183', 'LinkedIn Management', 'social-media-management--linkedin-management', (SELECT id FROM "Category" WHERE slug = 'social-media-management'), 2, true, NOW()),
  ('subcat-g184', 'Content Scheduling', 'social-media-management--content-scheduling', (SELECT id FROM "Category" WHERE slug = 'social-media-management'), 3, true, NOW()),
  ('subcat-g185', 'Community Management', 'social-media-management--community-management', (SELECT id FROM "Category" WHERE slug = 'social-media-management'), 4, true, NOW()),
  ('subcat-g186', 'Hashtag Research', 'social-media-management--hashtag-research', (SELECT id FROM "Category" WHERE slug = 'social-media-management'), 5, true, NOW()),
  ('subcat-g187', 'Social Media Growth', 'social-media-management--social-media-growth', (SELECT id FROM "Category" WHERE slug = 'social-media-management'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- seo-services -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g188', 'On-Page SEO', 'seo-services--on-page-seo', (SELECT id FROM "Category" WHERE slug = 'seo-services'), 0, true, NOW()),
  ('subcat-g189', 'Off-Page SEO', 'seo-services--off-page-seo', (SELECT id FROM "Category" WHERE slug = 'seo-services'), 1, true, NOW()),
  ('subcat-g190', 'Technical SEO', 'seo-services--technical-seo', (SELECT id FROM "Category" WHERE slug = 'seo-services'), 2, true, NOW()),
  ('subcat-g191', 'Keyword Research', 'seo-services--keyword-research', (SELECT id FROM "Category" WHERE slug = 'seo-services'), 3, true, NOW()),
  ('subcat-g192', 'Backlink Building', 'seo-services--backlink-building', (SELECT id FROM "Category" WHERE slug = 'seo-services'), 4, true, NOW()),
  ('subcat-g193', 'Local SEO', 'seo-services--local-seo', (SELECT id FROM "Category" WHERE slug = 'seo-services'), 5, true, NOW()),
  ('subcat-g194', 'YouTube SEO', 'seo-services--youtube-seo', (SELECT id FROM "Category" WHERE slug = 'seo-services'), 6, true, NOW()),
  ('subcat-g195', 'Shopify SEO', 'seo-services--shopify-seo', (SELECT id FROM "Category" WHERE slug = 'seo-services'), 7, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- ai-machine-learning -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g196', 'AI Chatbots', 'ai-machine-learning--ai-chatbots', (SELECT id FROM "Category" WHERE slug = 'ai-machine-learning'), 0, true, NOW()),
  ('subcat-g197', 'Machine Learning Models', 'ai-machine-learning--machine-learning-models', (SELECT id FROM "Category" WHERE slug = 'ai-machine-learning'), 1, true, NOW()),
  ('subcat-g198', 'AI Automation', 'ai-machine-learning--ai-automation', (SELECT id FROM "Category" WHERE slug = 'ai-machine-learning'), 2, true, NOW()),
  ('subcat-g199', 'Prompt Engineering', 'ai-machine-learning--prompt-engineering', (SELECT id FROM "Category" WHERE slug = 'ai-machine-learning'), 3, true, NOW()),
  ('subcat-g200', 'Computer Vision', 'ai-machine-learning--computer-vision', (SELECT id FROM "Category" WHERE slug = 'ai-machine-learning'), 4, true, NOW()),
  ('subcat-g201', 'NLP Projects', 'ai-machine-learning--nlp-projects', (SELECT id FROM "Category" WHERE slug = 'ai-machine-learning'), 5, true, NOW()),
  ('subcat-g202', 'Data Training', 'ai-machine-learning--data-training', (SELECT id FROM "Category" WHERE slug = 'ai-machine-learning'), 6, true, NOW()),
  ('subcat-g203', 'AI Integrations', 'ai-machine-learning--ai-integrations', (SELECT id FROM "Category" WHERE slug = 'ai-machine-learning'), 7, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- data-entry -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g204', 'Copy Paste Work', 'data-entry--copy-paste-work', (SELECT id FROM "Category" WHERE slug = 'data-entry'), 0, true, NOW()),
  ('subcat-g205', 'Excel Data Entry', 'data-entry--excel-data-entry', (SELECT id FROM "Category" WHERE slug = 'data-entry'), 1, true, NOW()),
  ('subcat-g206', 'Web Research', 'data-entry--web-research', (SELECT id FROM "Category" WHERE slug = 'data-entry'), 2, true, NOW()),
  ('subcat-g207', 'PDF to Word', 'data-entry--pdf-to-word', (SELECT id FROM "Category" WHERE slug = 'data-entry'), 3, true, NOW()),
  ('subcat-g208', 'Typing Work', 'data-entry--typing-work', (SELECT id FROM "Category" WHERE slug = 'data-entry'), 4, true, NOW()),
  ('subcat-g209', 'CRM Data Entry', 'data-entry--crm-data-entry', (SELECT id FROM "Category" WHERE slug = 'data-entry'), 5, true, NOW()),
  ('subcat-g210', 'Data Collection', 'data-entry--data-collection', (SELECT id FROM "Category" WHERE slug = 'data-entry'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- virtual-assistant -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g211', 'Email Management', 'virtual-assistant--email-management', (SELECT id FROM "Category" WHERE slug = 'virtual-assistant'), 0, true, NOW()),
  ('subcat-g212', 'Calendar Management', 'virtual-assistant--calendar-management', (SELECT id FROM "Category" WHERE slug = 'virtual-assistant'), 1, true, NOW()),
  ('subcat-g213', 'Customer Support', 'virtual-assistant--customer-support', (SELECT id FROM "Category" WHERE slug = 'virtual-assistant'), 2, true, NOW()),
  ('subcat-g214', 'Admin Support', 'virtual-assistant--admin-support', (SELECT id FROM "Category" WHERE slug = 'virtual-assistant'), 3, true, NOW()),
  ('subcat-g215', 'Research Assistance', 'virtual-assistant--research-assistance', (SELECT id FROM "Category" WHERE slug = 'virtual-assistant'), 4, true, NOW()),
  ('subcat-g216', 'Appointment Scheduling', 'virtual-assistant--appointment-scheduling', (SELECT id FROM "Category" WHERE slug = 'virtual-assistant'), 5, true, NOW()),
  ('subcat-g217', 'File Organization', 'virtual-assistant--file-organization', (SELECT id FROM "Category" WHERE slug = 'virtual-assistant'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- cyber-security -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g218', 'Website Security', 'cyber-security--website-security', (SELECT id FROM "Category" WHERE slug = 'cyber-security'), 0, true, NOW()),
  ('subcat-g219', 'Ethical Hacking', 'cyber-security--ethical-hacking', (SELECT id FROM "Category" WHERE slug = 'cyber-security'), 1, true, NOW()),
  ('subcat-g220', 'Penetration Testing', 'cyber-security--penetration-testing', (SELECT id FROM "Category" WHERE slug = 'cyber-security'), 2, true, NOW()),
  ('subcat-g221', 'Malware Removal', 'cyber-security--malware-removal', (SELECT id FROM "Category" WHERE slug = 'cyber-security'), 3, true, NOW()),
  ('subcat-g222', 'Security Audits', 'cyber-security--security-audits', (SELECT id FROM "Category" WHERE slug = 'cyber-security'), 4, true, NOW()),
  ('subcat-g223', 'Network Security', 'cyber-security--network-security', (SELECT id FROM "Category" WHERE slug = 'cyber-security'), 5, true, NOW()),
  ('subcat-g224', 'Data Protection', 'cyber-security--data-protection', (SELECT id FROM "Category" WHERE slug = 'cyber-security'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- cloud-computing -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g225', 'AWS Services', 'cloud-computing--aws-services', (SELECT id FROM "Category" WHERE slug = 'cloud-computing'), 0, true, NOW()),
  ('subcat-g226', 'Google Cloud', 'cloud-computing--google-cloud', (SELECT id FROM "Category" WHERE slug = 'cloud-computing'), 1, true, NOW()),
  ('subcat-g227', 'Microsoft Azure', 'cloud-computing--microsoft-azure', (SELECT id FROM "Category" WHERE slug = 'cloud-computing'), 2, true, NOW()),
  ('subcat-g228', 'Cloud Deployment', 'cloud-computing--cloud-deployment', (SELECT id FROM "Category" WHERE slug = 'cloud-computing'), 3, true, NOW()),
  ('subcat-g229', 'Server Management', 'cloud-computing--server-management', (SELECT id FROM "Category" WHERE slug = 'cloud-computing'), 4, true, NOW()),
  ('subcat-g230', 'DevOps', 'cloud-computing--devops', (SELECT id FROM "Category" WHERE slug = 'cloud-computing'), 5, true, NOW()),
  ('subcat-g231', 'Cloud Security', 'cloud-computing--cloud-security', (SELECT id FROM "Category" WHERE slug = 'cloud-computing'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- game-development -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g232', 'Unity Development', 'game-development--unity-development', (SELECT id FROM "Category" WHERE slug = 'game-development'), 0, true, NOW()),
  ('subcat-g233', 'Unreal Engine', 'game-development--unreal-engine', (SELECT id FROM "Category" WHERE slug = 'game-development'), 1, true, NOW()),
  ('subcat-g234', '2D Games', 'game-development--2d-games', (SELECT id FROM "Category" WHERE slug = 'game-development'), 2, true, NOW()),
  ('subcat-g235', '3D Games', 'game-development--3d-games', (SELECT id FROM "Category" WHERE slug = 'game-development'), 3, true, NOW()),
  ('subcat-g236', 'Multiplayer Games', 'game-development--multiplayer-games', (SELECT id FROM "Category" WHERE slug = 'game-development'), 4, true, NOW()),
  ('subcat-g237', 'Mobile Games', 'game-development--mobile-games', (SELECT id FROM "Category" WHERE slug = 'game-development'), 5, true, NOW()),
  ('subcat-g238', 'Game UI Design', 'game-development--game-ui-design', (SELECT id FROM "Category" WHERE slug = 'game-development'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- e-commerce-services -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g239', 'Product Uploading', 'e-commerce-services--product-uploading', (SELECT id FROM "Category" WHERE slug = 'e-commerce-services'), 0, true, NOW()),
  ('subcat-g240', 'Store Management', 'e-commerce-services--store-management', (SELECT id FROM "Category" WHERE slug = 'e-commerce-services'), 1, true, NOW()),
  ('subcat-g241', 'Product Listings', 'e-commerce-services--product-listings', (SELECT id FROM "Category" WHERE slug = 'e-commerce-services'), 2, true, NOW()),
  ('subcat-g242', 'Order Management', 'e-commerce-services--order-management', (SELECT id FROM "Category" WHERE slug = 'e-commerce-services'), 3, true, NOW()),
  ('subcat-g243', 'Inventory Management', 'e-commerce-services--inventory-management', (SELECT id FROM "Category" WHERE slug = 'e-commerce-services'), 4, true, NOW()),
  ('subcat-g244', 'Dropshipping Setup', 'e-commerce-services--dropshipping-setup', (SELECT id FROM "Category" WHERE slug = 'e-commerce-services'), 5, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- shopify-development -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g245', 'Shopify Store Setup', 'shopify-development--shopify-store-setup', (SELECT id FROM "Category" WHERE slug = 'shopify-development'), 0, true, NOW()),
  ('subcat-g246', 'Shopify Customization', 'shopify-development--shopify-customization', (SELECT id FROM "Category" WHERE slug = 'shopify-development'), 1, true, NOW()),
  ('subcat-g247', 'Theme Development', 'shopify-development--theme-development', (SELECT id FROM "Category" WHERE slug = 'shopify-development'), 2, true, NOW()),
  ('subcat-g248', 'Shopify SEO', 'shopify-development--shopify-seo', (SELECT id FROM "Category" WHERE slug = 'shopify-development'), 3, true, NOW()),
  ('subcat-g249', 'App Integration', 'shopify-development--app-integration', (SELECT id FROM "Category" WHERE slug = 'shopify-development'), 4, true, NOW()),
  ('subcat-g250', 'Product Pages', 'shopify-development--product-pages', (SELECT id FROM "Category" WHERE slug = 'shopify-development'), 5, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- wordpress-development -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g251', 'WordPress Website', 'wordpress-development--wordpress-website', (SELECT id FROM "Category" WHERE slug = 'wordpress-development'), 0, true, NOW()),
  ('subcat-g252', 'Elementor Design', 'wordpress-development--elementor-design', (SELECT id FROM "Category" WHERE slug = 'wordpress-development'), 1, true, NOW()),
  ('subcat-g253', 'WooCommerce', 'wordpress-development--woocommerce', (SELECT id FROM "Category" WHERE slug = 'wordpress-development'), 2, true, NOW()),
  ('subcat-g254', 'Plugin Development', 'wordpress-development--plugin-development', (SELECT id FROM "Category" WHERE slug = 'wordpress-development'), 3, true, NOW()),
  ('subcat-g255', 'Theme Customization', 'wordpress-development--theme-customization', (SELECT id FROM "Category" WHERE slug = 'wordpress-development'), 4, true, NOW()),
  ('subcat-g256', 'Website Migration', 'wordpress-development--website-migration', (SELECT id FROM "Category" WHERE slug = 'wordpress-development'), 5, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- photography-photo-editing -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g257', 'Photo Retouching', 'photography-photo-editing--photo-retouching', (SELECT id FROM "Category" WHERE slug = 'photography-photo-editing'), 0, true, NOW()),
  ('subcat-g258', 'Background Removal', 'photography-photo-editing--background-removal', (SELECT id FROM "Category" WHERE slug = 'photography-photo-editing'), 1, true, NOW()),
  ('subcat-g259', 'Product Photography', 'photography-photo-editing--product-photography', (SELECT id FROM "Category" WHERE slug = 'photography-photo-editing'), 2, true, NOW()),
  ('subcat-g260', 'Event Photography', 'photography-photo-editing--event-photography', (SELECT id FROM "Category" WHERE slug = 'photography-photo-editing'), 3, true, NOW()),
  ('subcat-g261', 'Lightroom Editing', 'photography-photo-editing--lightroom-editing', (SELECT id FROM "Category" WHERE slug = 'photography-photo-editing'), 4, true, NOW()),
  ('subcat-g262', 'Photoshop Editing', 'photography-photo-editing--photoshop-editing', (SELECT id FROM "Category" WHERE slug = 'photography-photo-editing'), 5, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- music-audio-production -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g263', 'Beat Making', 'music-audio-production--beat-making', (SELECT id FROM "Category" WHERE slug = 'music-audio-production'), 0, true, NOW()),
  ('subcat-g264', 'Mixing & Mastering', 'music-audio-production--mixing-mastering', (SELECT id FROM "Category" WHERE slug = 'music-audio-production'), 1, true, NOW()),
  ('subcat-g265', 'Podcast Production', 'music-audio-production--podcast-production', (SELECT id FROM "Category" WHERE slug = 'music-audio-production'), 2, true, NOW()),
  ('subcat-g266', 'Audio Editing', 'music-audio-production--audio-editing', (SELECT id FROM "Category" WHERE slug = 'music-audio-production'), 3, true, NOW()),
  ('subcat-g267', 'Sound Effects', 'music-audio-production--sound-effects', (SELECT id FROM "Category" WHERE slug = 'music-audio-production'), 4, true, NOW()),
  ('subcat-g268', 'Background Music', 'music-audio-production--background-music', (SELECT id FROM "Category" WHERE slug = 'music-audio-production'), 5, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- voice-over -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g269', 'English Voice Over', 'voice-over--english-voice-over', (SELECT id FROM "Category" WHERE slug = 'voice-over'), 0, true, NOW()),
  ('subcat-g270', 'Urdu Voice Over', 'voice-over--urdu-voice-over', (SELECT id FROM "Category" WHERE slug = 'voice-over'), 1, true, NOW()),
  ('subcat-g271', 'Character Voice', 'voice-over--character-voice', (SELECT id FROM "Category" WHERE slug = 'voice-over'), 2, true, NOW()),
  ('subcat-g272', 'Narration', 'voice-over--narration', (SELECT id FROM "Category" WHERE slug = 'voice-over'), 3, true, NOW()),
  ('subcat-g273', 'Commercial Voice', 'voice-over--commercial-voice', (SELECT id FROM "Category" WHERE slug = 'voice-over'), 4, true, NOW()),
  ('subcat-g274', 'Audiobook Recording', 'voice-over--audiobook-recording', (SELECT id FROM "Category" WHERE slug = 'voice-over'), 5, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- business-consulting -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g275', 'Startup Consulting', 'business-consulting--startup-consulting', (SELECT id FROM "Category" WHERE slug = 'business-consulting'), 0, true, NOW()),
  ('subcat-g276', 'Business Plans', 'business-consulting--business-plans', (SELECT id FROM "Category" WHERE slug = 'business-consulting'), 1, true, NOW()),
  ('subcat-g277', 'Market Research', 'business-consulting--market-research', (SELECT id FROM "Category" WHERE slug = 'business-consulting'), 2, true, NOW()),
  ('subcat-g278', 'Financial Planning', 'business-consulting--financial-planning', (SELECT id FROM "Category" WHERE slug = 'business-consulting'), 3, true, NOW()),
  ('subcat-g279', 'Growth Strategy', 'business-consulting--growth-strategy', (SELECT id FROM "Category" WHERE slug = 'business-consulting'), 4, true, NOW()),
  ('subcat-g280', 'HR Consulting', 'business-consulting--hr-consulting', (SELECT id FROM "Category" WHERE slug = 'business-consulting'), 5, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- accounting-finance -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g281', 'Bookkeeping', 'accounting-finance--bookkeeping', (SELECT id FROM "Category" WHERE slug = 'accounting-finance'), 0, true, NOW()),
  ('subcat-g282', 'Tax Filing', 'accounting-finance--tax-filing', (SELECT id FROM "Category" WHERE slug = 'accounting-finance'), 1, true, NOW()),
  ('subcat-g283', 'Financial Analysis', 'accounting-finance--financial-analysis', (SELECT id FROM "Category" WHERE slug = 'accounting-finance'), 2, true, NOW()),
  ('subcat-g284', 'Payroll Management', 'accounting-finance--payroll-management', (SELECT id FROM "Category" WHERE slug = 'accounting-finance'), 3, true, NOW()),
  ('subcat-g285', 'QuickBooks', 'accounting-finance--quickbooks', (SELECT id FROM "Category" WHERE slug = 'accounting-finance'), 4, true, NOW()),
  ('subcat-g286', 'Budget Planning', 'accounting-finance--budget-planning', (SELECT id FROM "Category" WHERE slug = 'accounting-finance'), 5, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- customer-support -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g287', 'Live Chat Support', 'customer-support--live-chat-support', (SELECT id FROM "Category" WHERE slug = 'customer-support'), 0, true, NOW()),
  ('subcat-g288', 'Email Support', 'customer-support--email-support', (SELECT id FROM "Category" WHERE slug = 'customer-support'), 1, true, NOW()),
  ('subcat-g289', 'Call Support', 'customer-support--call-support', (SELECT id FROM "Category" WHERE slug = 'customer-support'), 2, true, NOW()),
  ('subcat-g290', 'Technical Support', 'customer-support--technical-support', (SELECT id FROM "Category" WHERE slug = 'customer-support'), 3, true, NOW()),
  ('subcat-g291', 'Ticket Handling', 'customer-support--ticket-handling', (SELECT id FROM "Category" WHERE slug = 'customer-support'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- architecture-interior-design -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g292', 'House Plans', 'architecture-interior-design--house-plans', (SELECT id FROM "Category" WHERE slug = 'architecture-interior-design'), 0, true, NOW()),
  ('subcat-g293', 'Interior Design', 'architecture-interior-design--interior-design', (SELECT id FROM "Category" WHERE slug = 'architecture-interior-design'), 1, true, NOW()),
  ('subcat-g294', 'Landscape Design', 'architecture-interior-design--landscape-design', (SELECT id FROM "Category" WHERE slug = 'architecture-interior-design'), 2, true, NOW()),
  ('subcat-g295', 'AutoCAD Drafting', 'architecture-interior-design--autocad-drafting', (SELECT id FROM "Category" WHERE slug = 'architecture-interior-design'), 3, true, NOW()),
  ('subcat-g296', '3D Floor Plans', 'architecture-interior-design--3d-floor-plans', (SELECT id FROM "Category" WHERE slug = 'architecture-interior-design'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- 3d-modeling-rendering -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g297', 'Product Rendering', '3d-modeling-rendering--product-rendering', (SELECT id FROM "Category" WHERE slug = '3d-modeling-rendering'), 0, true, NOW()),
  ('subcat-g298', 'Character Modeling', '3d-modeling-rendering--character-modeling', (SELECT id FROM "Category" WHERE slug = '3d-modeling-rendering'), 1, true, NOW()),
  ('subcat-g299', 'Architectural Rendering', '3d-modeling-rendering--architectural-rendering', (SELECT id FROM "Category" WHERE slug = '3d-modeling-rendering'), 2, true, NOW()),
  ('subcat-g300', 'Blender Modeling', '3d-modeling-rendering--blender-modeling', (SELECT id FROM "Category" WHERE slug = '3d-modeling-rendering'), 3, true, NOW()),
  ('subcat-g301', '3D Texturing', '3d-modeling-rendering--3d-texturing', (SELECT id FROM "Category" WHERE slug = '3d-modeling-rendering'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- programming-software-engineering -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g302', 'Python Development', 'programming-software-engineering--python-development', (SELECT id FROM "Category" WHERE slug = 'programming-software-engineering'), 0, true, NOW()),
  ('subcat-g303', 'JavaScript Development', 'programming-software-engineering--javascript-development', (SELECT id FROM "Category" WHERE slug = 'programming-software-engineering'), 1, true, NOW()),
  ('subcat-g304', 'Java Development', 'programming-software-engineering--java-development', (SELECT id FROM "Category" WHERE slug = 'programming-software-engineering'), 2, true, NOW()),
  ('subcat-g305', 'C++ Programming', 'programming-software-engineering--c-programming', (SELECT id FROM "Category" WHERE slug = 'programming-software-engineering'), 3, true, NOW()),
  ('subcat-g306', 'C# Development', 'programming-software-engineering--c-development', (SELECT id FROM "Category" WHERE slug = 'programming-software-engineering'), 4, true, NOW()),
  ('subcat-g307', 'PHP Development', 'programming-software-engineering--php-development', (SELECT id FROM "Category" WHERE slug = 'programming-software-engineering'), 5, true, NOW()),
  ('subcat-g308', 'Software Debugging', 'programming-software-engineering--software-debugging', (SELECT id FROM "Category" WHERE slug = 'programming-software-engineering'), 6, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- online-tutoring -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g309', 'Math Tutoring', 'online-tutoring--math-tutoring', (SELECT id FROM "Category" WHERE slug = 'online-tutoring'), 0, true, NOW()),
  ('subcat-g310', 'English Tutoring', 'online-tutoring--english-tutoring', (SELECT id FROM "Category" WHERE slug = 'online-tutoring'), 1, true, NOW()),
  ('subcat-g311', 'Science Tutoring', 'online-tutoring--science-tutoring', (SELECT id FROM "Category" WHERE slug = 'online-tutoring'), 2, true, NOW()),
  ('subcat-g312', 'Quran Teaching', 'online-tutoring--quran-teaching', (SELECT id FROM "Category" WHERE slug = 'online-tutoring'), 3, true, NOW()),
  ('subcat-g313', 'Coding Lessons', 'online-tutoring--coding-lessons', (SELECT id FROM "Category" WHERE slug = 'online-tutoring'), 4, true, NOW()),
  ('subcat-g314', 'IELTS Preparation', 'online-tutoring--ielts-preparation', (SELECT id FROM "Category" WHERE slug = 'online-tutoring'), 5, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- resume-cv-writing -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g315', 'CV Design', 'resume-cv-writing--cv-design', (SELECT id FROM "Category" WHERE slug = 'resume-cv-writing'), 0, true, NOW()),
  ('subcat-g316', 'Resume Writing', 'resume-cv-writing--resume-writing', (SELECT id FROM "Category" WHERE slug = 'resume-cv-writing'), 1, true, NOW()),
  ('subcat-g317', 'LinkedIn Optimization', 'resume-cv-writing--linkedin-optimization', (SELECT id FROM "Category" WHERE slug = 'resume-cv-writing'), 2, true, NOW()),
  ('subcat-g318', 'Cover Letter Writing', 'resume-cv-writing--cover-letter-writing', (SELECT id FROM "Category" WHERE slug = 'resume-cv-writing'), 3, true, NOW()),
  ('subcat-g319', 'Job Application Help', 'resume-cv-writing--job-application-help', (SELECT id FROM "Category" WHERE slug = 'resume-cv-writing'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- email-marketing -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g320', 'Mailchimp Setup', 'email-marketing--mailchimp-setup', (SELECT id FROM "Category" WHERE slug = 'email-marketing'), 0, true, NOW()),
  ('subcat-g321', 'Newsletter Design', 'email-marketing--newsletter-design', (SELECT id FROM "Category" WHERE slug = 'email-marketing'), 1, true, NOW()),
  ('subcat-g322', 'Campaign Management', 'email-marketing--campaign-management', (SELECT id FROM "Category" WHERE slug = 'email-marketing'), 2, true, NOW()),
  ('subcat-g323', 'Automation Emails', 'email-marketing--automation-emails', (SELECT id FROM "Category" WHERE slug = 'email-marketing'), 3, true, NOW()),
  ('subcat-g324', 'Email Templates', 'email-marketing--email-templates', (SELECT id FROM "Category" WHERE slug = 'email-marketing'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- branding-identity -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g325', 'Brand Guidelines', 'branding-identity--brand-guidelines', (SELECT id FROM "Category" WHERE slug = 'branding-identity'), 0, true, NOW()),
  ('subcat-g326', 'Company Identity', 'branding-identity--company-identity', (SELECT id FROM "Category" WHERE slug = 'branding-identity'), 1, true, NOW()),
  ('subcat-g327', 'Packaging Branding', 'branding-identity--packaging-branding', (SELECT id FROM "Category" WHERE slug = 'branding-identity'), 2, true, NOW()),
  ('subcat-g328', 'Brand Strategy', 'branding-identity--brand-strategy', (SELECT id FROM "Category" WHERE slug = 'branding-identity'), 3, true, NOW()),
  ('subcat-g329', 'Typography Design', 'branding-identity--typography-design', (SELECT id FROM "Category" WHERE slug = 'branding-identity'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- nft-blockchain -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g330', 'NFT Art', 'nft-blockchain--nft-art', (SELECT id FROM "Category" WHERE slug = 'nft-blockchain'), 0, true, NOW()),
  ('subcat-g331', 'Smart Contracts', 'nft-blockchain--smart-contracts', (SELECT id FROM "Category" WHERE slug = 'nft-blockchain'), 1, true, NOW()),
  ('subcat-g332', 'Crypto Wallets', 'nft-blockchain--crypto-wallets', (SELECT id FROM "Category" WHERE slug = 'nft-blockchain'), 2, true, NOW()),
  ('subcat-g333', 'Blockchain Apps', 'nft-blockchain--blockchain-apps', (SELECT id FROM "Category" WHERE slug = 'nft-blockchain'), 3, true, NOW()),
  ('subcat-g334', 'Web3 Development', 'nft-blockchain--web3-development', (SELECT id FROM "Category" WHERE slug = 'nft-blockchain'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- chatbot-development -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g335', 'AI Chatbots', 'chatbot-development--ai-chatbots', (SELECT id FROM "Category" WHERE slug = 'chatbot-development'), 0, true, NOW()),
  ('subcat-g336', 'WhatsApp Bots', 'chatbot-development--whatsapp-bots', (SELECT id FROM "Category" WHERE slug = 'chatbot-development'), 1, true, NOW()),
  ('subcat-g337', 'Telegram Bots', 'chatbot-development--telegram-bots', (SELECT id FROM "Category" WHERE slug = 'chatbot-development'), 2, true, NOW()),
  ('subcat-g338', 'Customer Support Bots', 'chatbot-development--customer-support-bots', (SELECT id FROM "Category" WHERE slug = 'chatbot-development'), 3, true, NOW()),
  ('subcat-g339', 'Website Chatbots', 'chatbot-development--website-chatbots', (SELECT id FROM "Category" WHERE slug = 'chatbot-development'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- script-writing -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g340', 'YouTube Scripts', 'script-writing--youtube-scripts', (SELECT id FROM "Category" WHERE slug = 'script-writing'), 0, true, NOW()),
  ('subcat-g341', 'Movie Scripts', 'script-writing--movie-scripts', (SELECT id FROM "Category" WHERE slug = 'script-writing'), 1, true, NOW()),
  ('subcat-g342', 'Ad Scripts', 'script-writing--ad-scripts', (SELECT id FROM "Category" WHERE slug = 'script-writing'), 2, true, NOW()),
  ('subcat-g343', 'Story Scripts', 'script-writing--story-scripts', (SELECT id FROM "Category" WHERE slug = 'script-writing'), 3, true, NOW()),
  ('subcat-g344', 'Podcast Scripts', 'script-writing--podcast-scripts', (SELECT id FROM "Category" WHERE slug = 'script-writing'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- presentation-design -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g345', 'PowerPoint Design', 'presentation-design--powerpoint-design', (SELECT id FROM "Category" WHERE slug = 'presentation-design'), 0, true, NOW()),
  ('subcat-g346', 'Pitch Decks', 'presentation-design--pitch-decks', (SELECT id FROM "Category" WHERE slug = 'presentation-design'), 1, true, NOW()),
  ('subcat-g347', 'Business Presentations', 'presentation-design--business-presentations', (SELECT id FROM "Category" WHERE slug = 'presentation-design'), 2, true, NOW()),
  ('subcat-g348', 'Investor Decks', 'presentation-design--investor-decks', (SELECT id FROM "Category" WHERE slug = 'presentation-design'), 3, true, NOW()),
  ('subcat-g349', 'Google Slides Design', 'presentation-design--google-slides-design', (SELECT id FROM "Category" WHERE slug = 'presentation-design'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- product-design -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g350', 'Prototype Design', 'product-design--prototype-design', (SELECT id FROM "Category" WHERE slug = 'product-design'), 0, true, NOW()),
  ('subcat-g351', 'Industrial Design', 'product-design--industrial-design', (SELECT id FROM "Category" WHERE slug = 'product-design'), 1, true, NOW()),
  ('subcat-g352', 'Packaging Concepts', 'product-design--packaging-concepts', (SELECT id FROM "Category" WHERE slug = 'product-design'), 2, true, NOW()),
  ('subcat-g353', 'Product Sketches', 'product-design--product-sketches', (SELECT id FROM "Category" WHERE slug = 'product-design'), 3, true, NOW()),
  ('subcat-g354', '3D Product Design', 'product-design--3d-product-design', (SELECT id FROM "Category" WHERE slug = 'product-design'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ----- legal-services -----
INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt")
VALUES
  ('subcat-g355', 'Contract Writing', 'legal-services--contract-writing', (SELECT id FROM "Category" WHERE slug = 'legal-services'), 0, true, NOW()),
  ('subcat-g356', 'Legal Consulting', 'legal-services--legal-consulting', (SELECT id FROM "Category" WHERE slug = 'legal-services'), 1, true, NOW()),
  ('subcat-g357', 'Privacy Policies', 'legal-services--privacy-policies', (SELECT id FROM "Category" WHERE slug = 'legal-services'), 2, true, NOW()),
  ('subcat-g358', 'Terms & Conditions', 'legal-services--terms-conditions', (SELECT id FROM "Category" WHERE slug = 'legal-services'), 3, true, NOW()),
  ('subcat-g359', 'Trademark Help', 'legal-services--trademark-help', (SELECT id FROM "Category" WHERE slug = 'legal-services'), 4, true, NOW())
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- VERIFICATION QUERIES (run these separately to check results)
-- ============================================================
-- SELECT COUNT(*) AS total_subcategories FROM "Category" WHERE "parentId" IS NOT NULL;
-- SELECT c.name AS parent, COUNT(sc.id) AS subcategory_count
--   FROM "Category" c
--   LEFT JOIN "Category" sc ON sc."parentId" = c.id
--   WHERE c."parentId" IS NULL
--   GROUP BY c.name
--   ORDER BY subcategory_count DESC;

COMMIT;
