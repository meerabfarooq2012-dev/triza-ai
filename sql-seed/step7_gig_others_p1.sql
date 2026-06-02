-- Gigs Part 1 (web-dev to data-entry)
-- Paste in Supabase SQL Editor and click Run

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
