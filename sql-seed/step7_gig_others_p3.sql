-- Gigs Part 3 (3d-modeling to legal)
-- Paste in Supabase SQL Editor and click Run

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
