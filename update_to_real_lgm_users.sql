-- Update existing demo users to real LGM users
-- Based on the LGM locations data

-- Update existing users to real LGM users
UPDATE "User" SET 
    name = 'Ankit',
    email = 'ankit@lgm.com',
    role = 'MANAGER'
WHERE id = 'usr_super_admin';

UPDATE "User" SET 
    name = 'Shahbaz',
    email = 'shahbaz@lgm.com',
    role = 'MANAGER'
WHERE id = 'usr_demo_admin';

UPDATE "User" SET 
    name = 'Arshdeep',
    email = 'arshdeep@lgm.com',
    role = 'MANAGER'
WHERE id = 'usr_demo_dispatcher';

UPDATE "User" SET 
    name = 'Danylo',
    email = 'danylo@lgm.com',
    role = 'MANAGER'
WHERE id = 'usr_demo_driver';

UPDATE "User" SET 
    name = 'Hakam',
    email = 'hakam@lgm.com',
    role = 'MANAGER'
WHERE id = 'usr_manager_john';

UPDATE "User" SET 
    name = 'Bhanu',
    email = 'bhanu@lgm.com',
    role = 'MANAGER'
WHERE id = 'usr_mover_1';

UPDATE "User" SET 
    name = 'Anees Aps',
    email = 'anees.aps@lgm.com',
    role = 'MANAGER'
WHERE id = 'usr_dispatcher_mike';

UPDATE "User" SET 
    name = 'Andrew',
    email = 'andrew@lgm.com',
    role = 'MANAGER'
WHERE id = 'usr_driver_1';

UPDATE "User" SET 
    name = 'Parsa',
    email = 'parsa@lgm.com',
    role = 'MANAGER'
WHERE id = 'usr_dispatcher_sarah';

UPDATE "User" SET 
    name = 'Aerish',
    email = 'aerish@lgm.com',
    role = 'MANAGER'
WHERE id = 'usr_dispatcher_manager';

UPDATE "User" SET 
    name = 'Akshit',
    email = 'akshit@lgm.com',
    role = 'MANAGER'
WHERE id = 'usr_udi_admin';

-- Add more real LGM users
INSERT INTO "User" (id, name, email, role, "locationId", "clientId", status, "createdAt", "updatedAt") VALUES
('usr_harsh_brantford', 'Harsh', 'harsh@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_simranjit_burlington', 'Simranjit', 'simranjit@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_jasdeep_calgary', 'Jasdeep', 'jasdeep@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_todd_coquitlam', 'Todd', 'todd@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_kambiz_fredericton', 'Kambiz', 'kambiz@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_mahmoud_halifax', 'Mahmoud', 'mahmoud@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_anirudh_kingston', 'Anirudh', 'anirudh@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_promise_lethbridge', 'Promise', 'promise@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_kyle_london', 'Kyle', 'kyle@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_hanze_ottawa', 'Hanze', 'hanze@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_jay_ottawa', 'Jay', 'jay@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_ralph_regina', 'Ralph', 'ralph@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_isabella_regina', 'Isabella', 'isabella@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_rasoul_richmond', 'Rasoul', 'rasoul@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_camellia_saint_john', 'Camellia', 'camellia@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_kelvin_scarborough', 'Kelvin', 'kelvin@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_aswin_scarborough', 'Aswin', 'aswin@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_danil_surrey', 'Danil', 'danil@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_fahim_vaughan', 'Fahim', 'fahim@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_success_victoria', 'Success', 'success@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_sadur_waterloo', 'Sadur', 'sadur@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW()),
('usr_wayne_winnipeg', 'Wayne', 'wayne@lgm.com', 'ADMIN', 'loc_12345678_abcd_efgh_ijkl_mnopqrstuvwx', 'clm_f55e13de_a5c4_4990_ad02_34bb07187daa', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
