-- Update existing demo users to real LGM users with proper location assignments
-- This script will replace demo users with real LGM users

-- First, let's update the existing users to real LGM users
UPDATE "User" SET
    name = 'Shahbaz',
    email = 'shahbaz@lgm.com',
    role = 'MANAGER',
    "locationId" = 'loc_lgm_burnaby_corporate_001'
WHERE id = 'usr_super_admin';

UPDATE "User" SET
    name = 'Arshdeep',
    email = 'arshdeep@lgm.com',
    role = 'MANAGER',
    "locationId" = 'loc_lgm_downtown_toronto_corporate_002'
WHERE id = 'usr_admin';

UPDATE "User" SET
    name = 'Danylo',
    email = 'danylo@lgm.com',
    role = 'MANAGER',
    "locationId" = 'loc_lgm_edmonton_corporate_003'
WHERE id = 'usr_dispatcher';

UPDATE "User" SET
    name = 'Hakam',
    email = 'hakam@lgm.com',
    role = 'MANAGER',
    "locationId" = 'loc_lgm_hamilton_corporate_004'
WHERE id = 'usr_driver';

UPDATE "User" SET
    name = 'Bhanu',
    email = 'bhanu@lgm.com',
    role = 'MANAGER',
    "locationId" = 'loc_lgm_montreal_corporate_006'
WHERE id = 'usr_mover';

UPDATE "User" SET
    name = 'Ankit',
    email = 'ankit@lgm.com',
    role = 'MANAGER',
    "locationId" = 'loc_lgm_north_york_corporate_007'
WHERE id = 'usr_manager';

UPDATE "User" SET
    name = 'Rasoul',
    email = 'rasoul@lgm.com',
    role = 'MANAGER',
    "locationId" = 'loc_lgm_vancouver_corporate_008'
WHERE id = 'usr_auditor';

UPDATE "User" SET
    name = 'Anees Aps',
    email = 'anees.aps@lgm.com',
    role = 'MANAGER',
    "locationId" = 'loc_lgm_abbotsford_franchise_009'
WHERE id = 'usr_storage_manager';

UPDATE "User" SET
    name = 'Andrew',
    email = 'andrew@lgm.com',
    role = 'MANAGER',
    "locationId" = 'loc_lgm_ajax_franchise_010'
WHERE id = 'usr_super_admin_2';

UPDATE "User" SET
    name = 'Parsa',
    email = 'parsa@lgm.com',
    role = 'MANAGER',
    "locationId" = 'loc_lgm_aurora_franchise_011'
WHERE id = 'usr_admin_2';

UPDATE "User" SET
    name = 'Aerish',
    email = 'aerish@lgm.com',
    role = 'MANAGER',
    "locationId" = 'loc_lgm_brampton_franchise_012'
WHERE id = 'usr_dispatcher_2';

-- Now let's add more real LGM users
INSERT INTO "User" (id, name, email, role, "locationId", "clientId", status, "createdAt", "updatedAt") VALUES
('usr_akshit_brampton', 'Akshit', 'akshit@lgm.com', 'MANAGER', 'loc_lgm_brampton_franchise_012', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_harsh_brantford', 'Harsh', 'harsh@lgm.com', 'MANAGER', 'loc_lgm_brantford_franchise_013', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_simranjit_burlington', 'Simranjit', 'simranjit@lgm.com', 'MANAGER', 'loc_lgm_burlington_franchise_014', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_jasdeep_calgary', 'Jasdeep', 'jasdeep@lgm.com', 'MANAGER', 'loc_lgm_calgary_franchise_015', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_todd_coquitlam', 'Todd', 'todd@lgm.com', 'MANAGER', 'loc_lgm_coquitlam_franchise_016', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_kambiz_fredericton', 'Kambiz', 'kambiz@lgm.com', 'MANAGER', 'loc_lgm_fredericton_franchise_017', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_mahmoud_halifax', 'Mahmoud', 'mahmoud@lgm.com', 'MANAGER', 'loc_lgm_halifax_franchise_018', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_anirudh_kingston', 'Anirudh', 'anirudh@lgm.com', 'MANAGER', 'loc_lgm_kingston_franchise_019', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_promise_lethbridge', 'Promise', 'promise@lgm.com', 'MANAGER', 'loc_lgm_lethbridge_franchise_020', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_kyle_london', 'Kyle', 'kyle@lgm.com', 'MANAGER', 'loc_lgm_london_franchise_021', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_hanze_ottawa', 'Hanze', 'hanze@lgm.com', 'MANAGER', 'loc_lgm_ottawa_franchise_022', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_jay_ottawa', 'Jay', 'jay@lgm.com', 'MANAGER', 'loc_lgm_ottawa_franchise_022', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_ralph_regina', 'Ralph', 'ralph@lgm.com', 'MANAGER', 'loc_lgm_regina_franchise_023', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_isabella_regina', 'Isabella', 'isabella@lgm.com', 'MANAGER', 'loc_lgm_regina_franchise_023', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_rasoul_richmond', 'Rasoul', 'rasoul@lgm.com', 'MANAGER', 'loc_lgm_richmond_franchise_024', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_camellia_saint_john', 'Camellia', 'camellia@lgm.com', 'MANAGER', 'loc_lgm_saint_john_franchise_025', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_kelvin_scarborough', 'Kelvin', 'kelvin@lgm.com', 'MANAGER', 'loc_lgm_scarborough_franchise_026', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_aswin_scarborough', 'Aswin', 'aswin@lgm.com', 'MANAGER', 'loc_lgm_scarborough_franchise_026', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_danil_surrey', 'Danil', 'danil@lgm.com', 'MANAGER', 'loc_lgm_surrey_franchise_027', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_fahim_vaughan', 'Fahim', 'fahim@lgm.com', 'MANAGER', 'loc_lgm_vaughan_franchise_028', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_success_victoria', 'Success', 'success@lgm.com', 'MANAGER', 'loc_lgm_victoria_franchise_029', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_sadur_waterloo', 'Sadur', 'sadur@lgm.com', 'MANAGER', 'loc_lgm_waterloo_franchise_030', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_wayne_winnipeg', 'Wayne', 'wayne@lgm.com', 'MANAGER', 'loc_lgm_winnipeg_franchise_031', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Also make sure we have the LGM locations
INSERT INTO "Location" (id, "clientId", name, timezone, address, "createdAt", "updatedAt") VALUES
('loc_lgm_burnaby_corporate_001', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'BURNABY', 'America/Toronto', 'BURNABY CORPORATE Office', NOW(), NOW()),
('loc_lgm_downtown_toronto_corporate_002', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'DOWNTOWN TORONTO', 'America/Toronto', 'DOWNTOWN TORONTO CORPORATE Office', NOW(), NOW()),
('loc_lgm_edmonton_corporate_003', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'EDMONTON', 'America/Toronto', 'EDMONTON CORPORATE Office', NOW(), NOW()),
('loc_lgm_hamilton_corporate_004', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'HAMILTON', 'America/Toronto', 'HAMILTON CORPORATE Office', NOW(), NOW()),
('loc_lgm_mississauga_corporate_005', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'MISSISSAUGA', 'America/Toronto', 'MISSISSAUGA CORPORATE Office', NOW(), NOW()),
('loc_lgm_montreal_corporate_006', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'MONTREAL', 'America/Toronto', 'MONTREAL CORPORATE Office', NOW(), NOW()),
('loc_lgm_north_york_corporate_007', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'NORTH YORK', 'America/Toronto', 'NORTH YORK CORPORATE Office', NOW(), NOW()),
('loc_lgm_vancouver_corporate_008', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'VANCOUVER', 'America/Toronto', 'VANCOUVER CORPORATE Office', NOW(), NOW()),
('loc_lgm_abbotsford_franchise_009', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ABBOTSFORD', 'America/Toronto', 'ABBOTSFORD FRANCHISE Office', NOW(), NOW()),
('loc_lgm_ajax_franchise_010', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'AJAX', 'America/Toronto', 'AJAX FRANCHISE Office', NOW(), NOW()),
('loc_lgm_aurora_franchise_011', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'AURORA', 'America/Toronto', 'AURORA FRANCHISE Office', NOW(), NOW()),
('loc_lgm_brampton_franchise_012', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'BRAMPTON', 'America/Toronto', 'BRAMPTON FRANCHISE Office', NOW(), NOW()),
('loc_lgm_brantford_franchise_013', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'BRANTFORD', 'America/Toronto', 'BRANTFORD FRANCHISE Office', NOW(), NOW()),
('loc_lgm_burlington_franchise_014', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'BURLINGTON', 'America/Toronto', 'BURLINGTON FRANCHISE Office', NOW(), NOW()),
('loc_lgm_calgary_franchise_015', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'CALGARY', 'America/Toronto', 'CALGARY FRANCHISE Office', NOW(), NOW()),
('loc_lgm_coquitlam_franchise_016', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'COQUITLAM', 'America/Toronto', 'COQUITLAM FRANCHISE Office', NOW(), NOW()),
('loc_lgm_fredericton_franchise_017', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'FREDERICTON', 'America/Toronto', 'FREDERICTON FRANCHISE Office', NOW(), NOW()),
('loc_lgm_halifax_franchise_018', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'HALIFAX', 'America/Toronto', 'HALIFAX FRANCHISE Office', NOW(), NOW()),
('loc_lgm_kingston_franchise_019', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'KINGSTON', 'America/Toronto', 'KINGSTON FRANCHISE Office', NOW(), NOW()),
('loc_lgm_lethbridge_franchise_020', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'LETHBRIDGE', 'America/Toronto', 'LETHBRIDGE FRANCHISE Office', NOW(), NOW()),
('loc_lgm_london_franchise_021', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'LONDON', 'America/Toronto', 'LONDON FRANCHISE Office', NOW(), NOW()),
('loc_lgm_ottawa_franchise_022', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'OTTAWA', 'America/Toronto', 'OTTAWA FRANCHISE Office', NOW(), NOW()),
('loc_lgm_regina_franchise_023', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'REGINA', 'America/Toronto', 'REGINA FRANCHISE Office', NOW(), NOW()),
('loc_lgm_richmond_franchise_024', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'RICHMOND', 'America/Toronto', 'RICHMOND FRANCHISE Office', NOW(), NOW()),
('loc_lgm_saint_john_franchise_025', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'SAINT JOHN', 'America/Toronto', 'SAINT JOHN FRANCHISE Office', NOW(), NOW()),
('loc_lgm_scarborough_franchise_026', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'SCARBOROUGH', 'America/Toronto', 'SCARBOROUGH FRANCHISE Office', NOW(), NOW()),
('loc_lgm_surrey_franchise_027', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'SURREY', 'America/Toronto', 'SURREY FRANCHISE Office', NOW(), NOW()),
('loc_lgm_vaughan_franchise_028', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'VAUGHAN', 'America/Toronto', 'VAUGHAN FRANCHISE Office', NOW(), NOW()),
('loc_lgm_victoria_franchise_029', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'VICTORIA', 'America/Toronto', 'VICTORIA FRANCHISE Office', NOW(), NOW()),
('loc_lgm_waterloo_franchise_030', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'WATERLOO', 'America/Toronto', 'WATERLOO FRANCHISE Office', NOW(), NOW()),
('loc_lgm_winnipeg_franchise_031', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'WINNIPEG', 'America/Toronto', 'WINNIPEG FRANCHISE Office', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
