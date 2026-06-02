-- STEP 6: Gig Subcategories Part 4 - Graphic Design (remaining)
-- Paste this in Supabase SQL Editor and click Run

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

