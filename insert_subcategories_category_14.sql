-- SQL script to insert subcategories for category ID 14
-- Make sure category with ID 14 exists before running this script

-- Insert subcategories for category ID 14 (Video & Photography)
INSERT INTO subcategories (name, slug, category_id, type, is_active, created_at, updated_at) VALUES
-- Video Subcategories
('Professional Camcorders', 'professional-camcorders', 14, 'both', 1, NOW(), NOW()),
('Digital Cinematography Cameras', 'digital-cinematography-cameras', 14, 'both', 1, NOW(), NOW()),
('RED DIGITAL CINEMA', 'red-digital-cinema', 14, 'both', 1, NOW(), NOW()),
('Studio & System Cameras', 'studio-system-cameras', 14, 'both', 1, NOW(), NOW()),
('PTZ Cameras & Controllers', 'ptz-cameras-controllers', 14, 'both', 1, NOW(), NOW()),
('Action & 360 Video Cameras', 'action-360-video-cameras', 14, 'both', 1, NOW(), NOW()),
('Timelapse Cameras', 'timelapse-cameras', 14, 'both', 1, NOW(), NOW()),
('Video Conferencing', 'video-conferencing', 14, 'both', 1, NOW(), NOW()),
-- Photography Subcategories
('Digital Camera', 'digital-camera', 14, 'both', 1, NOW(), NOW()),
('Medium Format Cameras', 'medium-format-cameras', 14, 'both', 1, NOW(), NOW()),
('Aerial Photography', 'aerial-photography', 14, 'both', 1, NOW(), NOW());

-- Notes:
-- 1. Make sure category with ID 14 exists in the categories table
-- 2. Adjust the category_id if needed
-- 3. The 'type' field is set to 'both' - change if needed
-- 4. All subcategories are set as active (is_active = 1)
-- 5. Slugs are URL-friendly versions of the names

-- To run this script:
-- mysql -u username -p database_name < insert_subcategories_category_14.sql