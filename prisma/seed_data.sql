-- C&C CRM Seed Data for Demo Company
-- This creates a complete demo environment with multiple companies, locations, and users

-- ===== DEMO COMPANY 1: LGM CORPORATE =====
INSERT INTO "Client" ("id", "name", "industry", "isFranchise", "settings", "createdAt", "updatedAt") VALUES
('clm_lgm_corp_001', 'LGM Corporate', 'Moving & Logistics', false, '{"branding": {"primaryColor": "#00C2FF", "logo": "lgm-corp-logo.png"}, "features": {"auditTrail": true, "aiFeatures": true, "crmSync": true}}', NOW(), NOW());

-- ===== LGM CORPORATE LOCATIONS =====
INSERT INTO "Location" ("id", "clientId", "name", "timezone", "address", "createdAt", "updatedAt") VALUES
('loc_lgm_toronto_001', 'clm_lgm_corp_001', 'LGM Toronto Central', 'America/Toronto', '123 Queen Street West, Toronto, ON M5H 2M9', NOW(), NOW()),
('loc_lgm_mississauga_002', 'clm_lgm_corp_001', 'LGM Mississauga', 'America/Toronto', '456 Hurontario Street, Mississauga, ON L5B 2N9', NOW(), NOW()),
('loc_lgm_vancouver_003', 'clm_lgm_corp_001', 'LGM Vancouver', 'America/Vancouver', '789 Robson Street, Vancouver, BC V6Z 2H6', NOW(), NOW()),
('loc_lgm_calgary_004', 'clm_lgm_corp_001', 'LGM Calgary', 'America/Edmonton', '321 8th Avenue SW, Calgary, AB T2P 1H5', NOW(), NOW()),
('loc_lgm_montreal_005', 'clm_lgm_corp_001', 'LGM Montreal', 'America/Montreal', '654 Sainte-Catherine Street, Montreal, QC H3B 1B8', NOW(), NOW());
