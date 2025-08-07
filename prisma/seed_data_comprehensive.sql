-- C&C CRM Comprehensive Seed Data
-- Aligned with application design, colors, and functionality
-- Version: 3.0.0 - Production Ready

-- ===== DEMO COMPANY 1: LGM CORPORATE =====
INSERT INTO "Client" ("id", "name", "industry", "isFranchise", "contactEmail", "contactPhone", "website", "logo", "timezone", "currency", "language", "settings", "features", "limits", "status", "createdAt", "updatedAt") VALUES
('clm_lgm_corp_001', 'LGM Corporate', 'Moving & Logistics', false, 'info@lgm.com', '+1-416-555-0100', 'https://lgm.com', 'lgm-corp-logo.png', 'America/Toronto', 'CAD', 'en', 
'{"branding": {"primaryColor": "#00C2FF", "secondaryColor": "#19FFA5", "logo": "lgm-corp-logo.png"}, "features": {"auditTrail": true, "aiFeatures": true, "crmSync": true, "mobileOps": true, "storageSystem": true}}',
'{"auditTrail": true, "aiFeatures": true, "crmSync": true, "mobileOps": true, "storageSystem": true, "superAdmin": true}',
'{"maxUsers": 1000, "maxLocations": 100, "maxJourneys": 10000, "storageLimit": "1TB"}',
'ACTIVE', NOW(), NOW());

-- ===== LGM CORPORATE LOCATIONS =====
INSERT INTO "Location" ("id", "clientId", "name", "timezone", "address", "city", "province", "postalCode", "country", "contactName", "contactPhone", "contactEmail", "businessHours", "services", "storageType", "storageCapacity", "isActive", "isCorporate", "maxTrucks", "createdAt", "updatedAt") VALUES
('loc_lgm_toronto_001', 'clm_lgm_corp_001', 'LGM Toronto Central', 'America/Toronto', '123 Queen Street West, Toronto, ON M5H 2M9', 'Toronto', 'ON', 'M5H 2M9', 'Canada', 'John Smith', '+1-416-555-0101', 'toronto@lgm.com', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "17:00"}, "sunday": {"open": "10:00", "close": "16:00"}}', '["residential_moving", "commercial_moving", "storage_services", "packing_services"]', 'WAREHOUSE', 500, true, true, 25, NOW(), NOW()),

('loc_lgm_mississauga_002', 'clm_lgm_corp_001', 'LGM Mississauga', 'America/Toronto', '456 Hurontario Street, Mississauga, ON L5B 2N9', 'Mississauga', 'ON', 'L5B 2N9', 'Canada', 'Sarah Johnson', '+1-905-555-0102', 'mississauga@lgm.com', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "17:00"}, "sunday": {"open": "10:00", "close": "16:00"}}', '["residential_moving", "commercial_moving", "storage_services"]', 'WAREHOUSE', 300, true, false, 15, NOW(), NOW()),

('loc_lgm_vancouver_003', 'clm_lgm_corp_001', 'LGM Vancouver', 'America/Vancouver', '789 Robson Street, Vancouver, BC V6Z 2H6', 'Vancouver', 'BC', 'V6Z 2H6', 'Canada', 'Mike Chen', '+1-604-555-0103', 'vancouver@lgm.com', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "17:00"}, "sunday": {"open": "10:00", "close": "16:00"}}', '["residential_moving", "commercial_moving", "storage_services", "packing_services"]', 'WAREHOUSE', 400, true, false, 20, NOW(), NOW()),

('loc_lgm_calgary_004', 'clm_lgm_corp_001', 'LGM Calgary', 'America/Edmonton', '321 8th Avenue SW, Calgary, AB T2P 1H5', 'Calgary', 'AB', 'T2P 1H5', 'Canada', 'Lisa Brown', '+1-403-555-0104', 'calgary@lgm.com', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "17:00"}, "sunday": {"open": "10:00", "close": "16:00"}}', '["residential_moving", "commercial_moving", "storage_services"]', 'WAREHOUSE', 250, true, false, 12, NOW(), NOW()),

('loc_lgm_montreal_005', 'clm_lgm_corp_001', 'LGM Montreal', 'America/Montreal', '654 Sainte-Catherine Street, Montreal, QC H3B 1B8', 'Montreal', 'QC', 'H3B 1B8', 'Canada', 'Pierre Dubois', '+1-514-555-0105', 'montreal@lgm.com', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "17:00"}, "sunday": {"open": "10:00", "close": "16:00"}}', '["residential_moving", "commercial_moving", "storage_services", "packing_services"]', 'WAREHOUSE', 350, true, false, 18, NOW(), NOW());

-- ===== DEMO COMPANY 2: MOVING PROS =====
INSERT INTO "Client" ("id", "name", "industry", "isFranchise", "contactEmail", "contactPhone", "website", "logo", "timezone", "currency", "language", "settings", "features", "limits", "status", "createdAt", "updatedAt") VALUES
('clm_moving_pros_002', 'Moving Pros', 'Moving & Logistics', true, 'info@movingpros.com', '+1-416-555-0200', 'https://movingpros.com', 'moving-pros-logo.png', 'America/Toronto', 'CAD', 'en',
'{"branding": {"primaryColor": "#FF6B35", "secondaryColor": "#F7931E", "logo": "moving-pros-logo.png"}, "features": {"auditTrail": true, "mobileOps": true}}',
'{"auditTrail": true, "mobileOps": true, "storageSystem": false}',
'{"maxUsers": 100, "maxLocations": 10, "maxJourneys": 1000, "storageLimit": "100GB"}',
'ACTIVE', NOW(), NOW());

-- ===== MOVING PROS LOCATIONS =====
INSERT INTO "Location" ("id", "clientId", "name", "timezone", "address", "city", "province", "postalCode", "country", "contactName", "contactPhone", "contactEmail", "businessHours", "services", "storageType", "storageCapacity", "isActive", "isCorporate", "maxTrucks", "createdAt", "updatedAt") VALUES
('loc_moving_pros_toronto_001', 'clm_moving_pros_002', 'Moving Pros Toronto', 'America/Toronto', '789 Yonge Street, Toronto, ON M4W 2G8', 'Toronto', 'ON', 'M4W 2G8', 'Canada', 'David Wilson', '+1-416-555-0201', 'toronto@movingpros.com', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "17:00"}, "sunday": {"open": "10:00", "close": "16:00"}}', '["residential_moving", "commercial_moving"]', 'NO_STORAGE', 0, true, false, 8, NOW(), NOW());

-- ===== DEMO COMPANY 3: STORAGE EXPRESS =====
INSERT INTO "Client" ("id", "name", "industry", "isFranchise", "contactEmail", "contactPhone", "website", "logo", "timezone", "currency", "language", "settings", "features", "limits", "status", "createdAt", "updatedAt") VALUES
('clm_storage_express_003', 'Storage Express', 'Storage & Logistics', false, 'info@storageexpress.com', '+1-416-555-0300', 'https://storageexpress.com', 'storage-express-logo.png', 'America/Toronto', 'CAD', 'en',
'{"branding": {"primaryColor": "#4CAF50", "secondaryColor": "#8BC34A", "logo": "storage-express-logo.png"}, "features": {"auditTrail": true, "storageSystem": true}}',
'{"auditTrail": true, "storageSystem": true, "mobileOps": false}',
'{"maxUsers": 50, "maxLocations": 5, "maxJourneys": 500, "storageLimit": "500GB"}',
'ACTIVE', NOW(), NOW());

-- ===== STORAGE EXPRESS LOCATIONS =====
INSERT INTO "Location" ("id", "clientId", "name", "timezone", "address", "city", "province", "postalCode", "country", "contactName", "contactPhone", "contactEmail", "businessHours", "services", "storageType", "storageCapacity", "isActive", "isCorporate", "maxTrucks", "createdAt", "updatedAt") VALUES
('loc_storage_express_toronto_001', 'clm_storage_express_003', 'Storage Express Toronto', 'America/Toronto', '456 King Street West, Toronto, ON M5V 1L8', 'Toronto', 'ON', 'M5V 1L8', 'Canada', 'Emma Davis', '+1-416-555-0301', 'toronto@storageexpress.com', '{"monday": {"open": "07:00", "close": "22:00"}, "tuesday": {"open": "07:00", "close": "22:00"}, "wednesday": {"open": "07:00", "close": "22:00"}, "thursday": {"open": "07:00", "close": "22:00"}, "friday": {"open": "07:00", "close": "22:00"}, "saturday": {"open": "08:00", "close": "20:00"}, "sunday": {"open": "08:00", "close": "20:00"}}', '["storage_services", "delivery_services"]', 'WAREHOUSE', 1000, true, true, 5, NOW(), NOW());

-- ===== LGM USERS =====
INSERT INTO "User" ("id", "name", "email", "role", "locationId", "clientId", "status", "phone", "avatar", "lastLogin", "preferences", "apiKey", "twoFactorEnabled", "createdAt", "updatedAt") VALUES
-- Toronto Users
('usr_lgm_toronto_admin_001', 'John Smith', 'john.smith@lgm.com', 'ADMIN', 'loc_lgm_toronto_001', 'clm_lgm_corp_001', 'ACTIVE', '+1-416-555-0101', 'john-smith-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": true, "push": true}, "dashboard": {"defaultView": "journeys"}}', 'lgm_api_key_001', false, NOW(), NOW()),
('usr_lgm_toronto_dispatcher_002', 'Sarah Johnson', 'sarah.johnson@lgm.com', 'DISPATCHER', 'loc_lgm_toronto_001', 'clm_lgm_corp_001', 'ACTIVE', '+1-416-555-0102', 'sarah-johnson-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": true, "push": true}, "dashboard": {"defaultView": "dispatch"}}', 'lgm_api_key_002', false, NOW(), NOW()),
('usr_lgm_toronto_driver_003', 'Mike Chen', 'mike.chen@lgm.com', 'DRIVER', 'loc_lgm_toronto_001', 'clm_lgm_corp_001', 'ACTIVE', '+1-416-555-0103', 'mike-chen-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": false, "push": true}, "mobile": {"gpsTracking": true}}', 'lgm_api_key_003', false, NOW(), NOW()),
('usr_lgm_toronto_mover_004', 'Lisa Brown', 'lisa.brown@lgm.com', 'MOVER', 'loc_lgm_toronto_001', 'clm_lgm_corp_001', 'ACTIVE', '+1-416-555-0104', 'lisa-brown-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": false, "push": true}, "mobile": {"gpsTracking": true}}', 'lgm_api_key_004', false, NOW(), NOW()),

-- Mississauga Users
('usr_lgm_mississauga_manager_005', 'David Wilson', 'david.wilson@lgm.com', 'MANAGER', 'loc_lgm_mississauga_002', 'clm_lgm_corp_001', 'ACTIVE', '+1-905-555-0102', 'david-wilson-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": true, "push": true}, "dashboard": {"defaultView": "analytics"}}', 'lgm_api_key_005', false, NOW(), NOW()),
('usr_lgm_mississauga_driver_006', 'Emma Davis', 'emma.davis@lgm.com', 'DRIVER', 'loc_lgm_mississauga_002', 'clm_lgm_corp_001', 'ACTIVE', '+1-905-555-0103', 'emma-davis-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": false, "push": true}, "mobile": {"gpsTracking": true}}', 'lgm_api_key_006', false, NOW(), NOW()),

-- Vancouver Users
('usr_lgm_vancouver_manager_007', 'Alex Thompson', 'alex.thompson@lgm.com', 'MANAGER', 'loc_lgm_vancouver_003', 'clm_lgm_corp_001', 'ACTIVE', '+1-604-555-0103', 'alex-thompson-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": true, "push": true}, "dashboard": {"defaultView": "analytics"}}', 'lgm_api_key_007', false, NOW(), NOW()),
('usr_lgm_vancouver_driver_008', 'Rachel Green', 'rachel.green@lgm.com', 'DRIVER', 'loc_lgm_vancouver_003', 'clm_lgm_corp_001', 'ACTIVE', '+1-604-555-0104', 'rachel-green-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": false, "push": true}, "mobile": {"gpsTracking": true}}', 'lgm_api_key_008', false, NOW(), NOW()),

-- Calgary Users
('usr_lgm_calgary_manager_009', 'Chris Lee', 'chris.lee@lgm.com', 'MANAGER', 'loc_lgm_calgary_004', 'clm_lgm_corp_001', 'ACTIVE', '+1-403-555-0104', 'chris-lee-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": true, "push": true}, "dashboard": {"defaultView": "analytics"}}', 'lgm_api_key_009', false, NOW(), NOW()),
('usr_lgm_calgary_driver_010', 'Maria Garcia', 'maria.garcia@lgm.com', 'DRIVER', 'loc_lgm_calgary_004', 'clm_lgm_corp_001', 'ACTIVE', '+1-403-555-0105', 'maria-garcia-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": false, "push": true}, "mobile": {"gpsTracking": true}}', 'lgm_api_key_010', false, NOW(), NOW()),

-- Montreal Users
('usr_lgm_montreal_manager_011', 'Pierre Dubois', 'pierre.dubois@lgm.com', 'MANAGER', 'loc_lgm_montreal_005', 'clm_lgm_corp_001', 'ACTIVE', '+1-514-555-0105', 'pierre-dubois-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": true, "push": true}, "dashboard": {"defaultView": "analytics"}}', 'lgm_api_key_011', false, NOW(), NOW()),
('usr_lgm_montreal_driver_012', 'Sophie Martin', 'sophie.martin@lgm.com', 'DRIVER', 'loc_lgm_montreal_005', 'clm_lgm_corp_001', 'ACTIVE', '+1-514-555-0106', 'sophie-martin-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": false, "push": true}, "mobile": {"gpsTracking": true}}', 'lgm_api_key_012', false, NOW(), NOW());

-- ===== MOVING PROS USERS =====
INSERT INTO "User" ("id", "name", "email", "role", "locationId", "clientId", "status", "phone", "avatar", "lastLogin", "preferences", "apiKey", "twoFactorEnabled", "createdAt", "updatedAt") VALUES
('usr_moving_pros_admin_013', 'David Wilson', 'david.wilson@movingpros.com', 'ADMIN', 'loc_moving_pros_toronto_001', 'clm_moving_pros_002', 'ACTIVE', '+1-416-555-0201', 'david-wilson-mp-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": true, "push": true}, "dashboard": {"defaultView": "journeys"}}', 'mp_api_key_001', false, NOW(), NOW()),
('usr_moving_pros_driver_014', 'Emma Davis', 'emma.davis@movingpros.com', 'DRIVER', 'loc_moving_pros_toronto_001', 'clm_moving_pros_002', 'ACTIVE', '+1-416-555-0202', 'emma-davis-mp-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": false, "push": true}, "mobile": {"gpsTracking": true}}', 'mp_api_key_002', false, NOW(), NOW());

-- ===== STORAGE EXPRESS USERS =====
INSERT INTO "User" ("id", "name", "email", "role", "locationId", "clientId", "status", "phone", "avatar", "lastLogin", "preferences", "apiKey", "twoFactorEnabled", "createdAt", "updatedAt") VALUES
('usr_storage_express_admin_015', 'Emma Davis', 'emma.davis@storageexpress.com', 'ADMIN', 'loc_storage_express_toronto_001', 'clm_storage_express_003', 'ACTIVE', '+1-416-555-0301', 'emma-davis-se-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": true, "push": true}, "dashboard": {"defaultView": "storage"}}', 'se_api_key_001', false, NOW(), NOW()),
('usr_storage_express_manager_016', 'Alex Thompson', 'alex.thompson@storageexpress.com', 'MANAGER', 'loc_storage_express_toronto_001', 'clm_storage_express_003', 'ACTIVE', '+1-416-555-0302', 'alex-thompson-se-avatar.jpg', NOW(), '{"theme": "dark", "notifications": {"email": true, "push": true}, "dashboard": {"defaultView": "storage"}}', 'se_api_key_002', false, NOW(), NOW());

-- ===== SUPER ADMIN USERS =====
INSERT INTO "SuperAdminUser" ("id", "username", "email", "password", "role", "firstName", "lastName", "phone", "avatar", "lastLogin", "isActive", "twoFactorEnabled", "failedLoginAttempts", "lockedUntil", "createdAt", "updatedAt") VALUES
('sau_udi_shkolnik_001', 'udi.shkolnik', 'udi.shkolnik@lgm.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq', 'SUPER_ADMIN', 'Udi', 'Shkolnik', '+1-416-555-0001', 'udi-shkolnik-avatar.jpg', NOW(), true, false, 0, null, NOW(), NOW()),
('sau_admin_support_002', 'admin.support', 'admin.support@lgm.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq', 'SUPER_ADMIN', 'Admin', 'Support', '+1-416-555-0002', 'admin-support-avatar.jpg', NOW(), true, false, 0, null, NOW(), NOW());

-- ===== SAMPLE JOURNEYS =====
INSERT INTO "TruckJourney" ("id", "locationId", "clientId", "date", "status", "truckNumber", "moveSourceId", "startTime", "endTime", "estimatedDuration", "actualDuration", "notes", "priority", "tags", "estimatedCost", "actualCost", "billingStatus", "startLocation", "endLocation", "routeData", "createdBy", "createdAt", "updatedAt") VALUES
-- LGM Toronto Journeys
('jour_lgm_toronto_001', 'loc_lgm_toronto_001', 'clm_lgm_corp_001', CURRENT_DATE, 'MORNING_PREP', 'T-001', null, CURRENT_DATE + INTERVAL '8 hours', null, 240, null, 'Residential move from downtown to suburbs', 'HIGH', ARRAY['residential', 'furniture', 'delicate'], 1200.00, null, 'PENDING', '{"lat": 43.6532, "lng": -79.3832}', '{"lat": 43.5890, "lng": -79.6441}', '{"route": "QEW West", "distance": "25km", "estimatedTime": "45min"}', 'usr_lgm_toronto_dispatcher_002', NOW(), NOW()),

('jour_lgm_toronto_002', 'loc_lgm_toronto_001', 'clm_lgm_corp_001', CURRENT_DATE, 'EN_ROUTE', 'T-002', null, CURRENT_DATE + INTERVAL '9 hours', null, 180, 120, 'Commercial office relocation', 'NORMAL', ARRAY['commercial', 'office', 'equipment'], 800.00, 750.00, 'INVOICED', '{"lat": 43.6532, "lng": -79.3832}', '{"lat": 43.5890, "lng": -79.6441}', '{"route": "Gardiner Expressway", "distance": "15km", "estimatedTime": "30min"}', 'usr_lgm_toronto_dispatcher_002', NOW(), NOW()),

('jour_lgm_toronto_003', 'loc_lgm_toronto_001', 'clm_lgm_corp_001', CURRENT_DATE, 'COMPLETED', 'T-003', null, CURRENT_DATE + INTERVAL '7 hours', CURRENT_DATE + INTERVAL '11 hours', 240, 240, 'Storage unit delivery and pickup', 'LOW', ARRAY['storage', 'delivery', 'pickup'], 600.00, 600.00, 'PAID', '{"lat": 43.6532, "lng": -79.3832}', '{"lat": 43.5890, "lng": -79.6441}', '{"route": "DVP", "distance": "20km", "estimatedTime": "35min"}', 'usr_lgm_toronto_dispatcher_002', NOW(), NOW()),

-- LGM Mississauga Journeys
('jour_lgm_mississauga_001', 'loc_lgm_mississauga_002', 'clm_lgm_corp_001', CURRENT_DATE, 'ONSITE', 'T-004', null, CURRENT_DATE + INTERVAL '8 hours', null, 300, 180, 'Large residential move with piano', 'URGENT', ARRAY['residential', 'piano', 'large'], 1500.00, null, 'PENDING', '{"lat": 43.5890, "lng": -79.6441}', '{"lat": 43.6532, "lng": -79.3832}', '{"route": "QEW East", "distance": "30km", "estimatedTime": "50min"}', 'usr_lgm_mississauga_manager_005', NOW(), NOW()),

-- Moving Pros Journeys
('jour_moving_pros_001', 'loc_moving_pros_toronto_001', 'clm_moving_pros_002', CURRENT_DATE, 'MORNING_PREP', 'MP-001', null, CURRENT_DATE + INTERVAL '9 hours', null, 180, null, 'Small apartment move', 'NORMAL', ARRAY['residential', 'apartment', 'small'], 400.00, null, 'PENDING', '{"lat": 43.6532, "lng": -79.3832}', '{"lat": 43.5890, "lng": -79.6441}', '{"route": "Yonge Street", "distance": "10km", "estimatedTime": "25min"}', 'usr_moving_pros_admin_013', NOW(), NOW());

-- ===== SAMPLE CREW ASSIGNMENTS =====
INSERT INTO "AssignedCrew" ("id", "journeyId", "userId", "role", "assignedAt", "status", "notes", "startTime", "endTime", "createdAt", "updatedAt") VALUES
-- LGM Toronto Crew
('crew_lgm_toronto_001', 'jour_lgm_toronto_001', 'usr_lgm_toronto_driver_003', 'DRIVER', NOW(), 'ASSIGNED', 'Primary driver for residential move', CURRENT_DATE + INTERVAL '8 hours', null, NOW(), NOW()),
('crew_lgm_toronto_002', 'jour_lgm_toronto_001', 'usr_lgm_toronto_mover_004', 'MOVER', NOW(), 'ASSIGNED', 'Experienced mover for delicate items', CURRENT_DATE + INTERVAL '8 hours', null, NOW(), NOW()),

-- LGM Toronto Crew 2
('crew_lgm_toronto_003', 'jour_lgm_toronto_002', 'usr_lgm_toronto_driver_003', 'DRIVER', NOW(), 'ON_SITE', 'Commercial move specialist', CURRENT_DATE + INTERVAL '9 hours', null, NOW(), NOW()),

-- LGM Mississauga Crew
('crew_lgm_mississauga_001', 'jour_lgm_mississauga_001', 'usr_lgm_mississauga_driver_006', 'DRIVER', NOW(), 'ON_SITE', 'Piano moving specialist', CURRENT_DATE + INTERVAL '8 hours', null, NOW(), NOW()),

-- Moving Pros Crew
('crew_moving_pros_001', 'jour_moving_pros_001', 'usr_moving_pros_driver_014', 'DRIVER', NOW(), 'ASSIGNED', 'Small move specialist', CURRENT_DATE + INTERVAL '9 hours', null, NOW(), NOW());

-- ===== SAMPLE STORAGE UNITS =====
INSERT INTO "StorageUnit" ("id", "locationId", "clientId", "unitNumber", "unitType", "size", "status", "monthlyRate", "currency", "features", "notes", "createdAt", "updatedAt") VALUES
-- LGM Toronto Storage Units
('unit_lgm_toronto_001', 'loc_lgm_toronto_001', 'clm_lgm_corp_001', 'A-101', 'SMALL', 50, 'AVAILABLE', 150.00, 'CAD', ARRAY['climate_controlled', 'security'], 'Climate controlled small unit', NOW(), NOW()),
('unit_lgm_toronto_002', 'loc_lgm_toronto_001', 'clm_lgm_corp_001', 'A-102', 'MEDIUM', 100, 'OCCUPIED', 250.00, 'CAD', ARRAY['climate_controlled', 'security'], 'Climate controlled medium unit', NOW(), NOW()),
('unit_lgm_toronto_003', 'loc_lgm_toronto_001', 'clm_lgm_corp_001', 'A-103', 'LARGE', 200, 'AVAILABLE', 400.00, 'CAD', ARRAY['climate_controlled', 'security', 'drive_up'], 'Climate controlled large unit with drive-up access', NOW(), NOW()),

-- Storage Express Units
('unit_storage_express_001', 'loc_storage_express_toronto_001', 'clm_storage_express_003', 'SE-001', 'SMALL', 50, 'AVAILABLE', 120.00, 'CAD', ARRAY['security'], 'Standard small unit', NOW(), NOW()),
('unit_storage_express_002', 'loc_storage_express_toronto_001', 'clm_storage_express_003', 'SE-002', 'MEDIUM', 100, 'AVAILABLE', 200.00, 'CAD', ARRAY['security'], 'Standard medium unit', NOW(), NOW()),
('unit_storage_express_003', 'loc_storage_express_toronto_001', 'clm_storage_express_003', 'SE-003', 'LARGE', 200, 'OCCUPIED', 350.00, 'CAD', ARRAY['security', 'drive_up'], 'Large unit with drive-up access', NOW(), NOW());

-- ===== SAMPLE STORAGE BOOKINGS =====
INSERT INTO "StorageBooking" ("id", "storageUnitId", "journeyId", "clientId", "startDate", "endDate", "status", "totalCost", "currency", "createdAt", "updatedAt") VALUES
('booking_lgm_toronto_001', 'unit_lgm_toronto_002', 'jour_lgm_toronto_003', 'clm_lgm_corp_001', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days', 'ACTIVE', 500.00, 'CAD', NOW(), NOW()),
('booking_storage_express_001', 'unit_storage_express_003', null, 'clm_storage_express_003', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '60 days', 'ACTIVE', 700.00, 'CAD', NOW(), NOW());

-- ===== SAMPLE BILLING PLANS =====
INSERT INTO "BillingPlan" ("id", "clientId", "name", "description", "planType", "monthlyRate", "currency", "features", "limits", "status", "createdAt", "updatedAt") VALUES
('plan_lgm_enterprise_001', 'clm_lgm_corp_001', 'LGM Enterprise', 'Full-featured enterprise plan for large moving companies', 'ENTERPRISE', 999.00, 'CAD', '{"auditTrail": true, "aiFeatures": true, "crmSync": true, "mobileOps": true, "storageSystem": true, "superAdmin": true}', '{"maxUsers": 1000, "maxLocations": 100, "maxJourneys": 10000, "storageLimit": "1TB"}', 'ACTIVE', NOW(), NOW()),
('plan_moving_pros_standard_002', 'clm_moving_pros_002', 'Moving Pros Standard', 'Standard plan for small to medium moving companies', 'STANDARD', 299.00, 'CAD', '{"auditTrail": true, "mobileOps": true}', '{"maxUsers": 100, "maxLocations": 10, "maxJourneys": 1000, "storageLimit": "100GB"}', 'ACTIVE', NOW(), NOW()),
('plan_storage_express_basic_003', 'clm_storage_express_003', 'Storage Express Basic', 'Basic plan for storage companies', 'BASIC', 199.00, 'CAD', '{"auditTrail": true, "storageSystem": true}', '{"maxUsers": 50, "maxLocations": 5, "maxJourneys": 500, "storageLimit": "500GB"}', 'ACTIVE', NOW(), NOW());

-- ===== SAMPLE AUDIT ENTRIES =====
INSERT INTO "AuditEntry" ("id", "clientId", "locationId", "userId", "action", "entity", "entityId", "diff", "ipAddress", "userAgent", "sessionId", "severity", "timestamp") VALUES
('audit_lgm_toronto_001', 'clm_lgm_corp_001', 'loc_lgm_toronto_001', 'usr_lgm_toronto_admin_001', 'CREATE', 'TruckJourney', 'jour_lgm_toronto_001', '{"status": "MORNING_PREP", "priority": "HIGH"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'session_001', 'INFO', NOW()),
('audit_lgm_toronto_002', 'clm_lgm_corp_001', 'loc_lgm_toronto_001', 'usr_lgm_toronto_dispatcher_002', 'UPDATE', 'TruckJourney', 'jour_lgm_toronto_002', '{"status": "EN_ROUTE"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'session_002', 'INFO', NOW()),
('audit_moving_pros_001', 'clm_moving_pros_002', 'loc_moving_pros_toronto_001', 'usr_moving_pros_admin_013', 'CREATE', 'TruckJourney', 'jour_moving_pros_001', '{"status": "MORNING_PREP", "priority": "NORMAL"}', '192.168.1.200', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'session_003', 'INFO', NOW());

-- ===== SAMPLE MOVE SOURCES =====
INSERT INTO "MoveSource" ("id", "clientId", "name", "description", "externalId", "address", "phone", "email", "website", "price", "currency", "status", "isActive", "createdAt", "updatedAt") VALUES
('source_lgm_website_001', 'clm_lgm_corp_001', 'LGM Website', 'Direct website inquiries', 'WEB-001', null, null, 'info@lgm.com', 'https://lgm.com', null, 'CAD', 'ACTIVE', true, NOW(), NOW()),
('source_lgm_referral_002', 'clm_lgm_corp_001', 'Customer Referral', 'Word of mouth referrals', 'REF-001', null, null, null, null, null, 'CAD', 'ACTIVE', true, NOW(), NOW()),
('source_moving_pros_google_003', 'clm_moving_pros_002', 'Google Ads', 'Google advertising campaigns', 'GOOGLE-001', null, null, null, null, null, 'CAD', 'ACTIVE', true, NOW(), NOW());

-- Log successful seed data creation
INSERT INTO "AuditEntry" ("clientId", "locationId", "userId", "action", "entity", "entityId", "diff", "severity", "timestamp") VALUES
('system', 'system', 'system', 'SEED_DATA', 'DATABASE', 'comprehensive_seed', '{"version": "3.0.0", "companies": 3, "locations": 7, "users": 16, "journeys": 5, "storageUnits": 6, "billingPlans": 3}', 'INFO', NOW()); 