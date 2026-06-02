-- STEP 1: Digital Product Subcategories (128)
-- Paste this in Supabase SQL Editor and click Run

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

