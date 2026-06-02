-- Gigs Part 2 (virtual-assistant to arch-interior)
-- Paste in Supabase SQL Editor and click Run

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
