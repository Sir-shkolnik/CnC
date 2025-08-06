-- Simplified Super Admin System Database Schema
-- This file contains a basic super admin setup that works with existing database

-- Create enums for super admin system
CREATE TYPE super_admin_role AS ENUM (
    'SUPER_ADMIN',
    'COMPANY_ADMIN', 
    'AUDITOR',
    'SUPPORT_ADMIN'
);

CREATE TYPE access_action_type AS ENUM (
    'LOGIN',
    'LOGOUT',
    'COMPANY_SWITCH',
    'USER_VIEW',
    'USER_CREATE',
    'USER_UPDATE',
    'USER_DELETE',
    'JOURNEY_VIEW',
    'JOURNEY_CREATE',
    'JOURNEY_UPDATE',
    'JOURNEY_DELETE',
    'LOCATION_VIEW',
    'LOCATION_CREATE',
    'LOCATION_UPDATE',
    'LOCATION_DELETE',
    'AUDIT_VIEW',
    'SETTINGS_UPDATE'
);

-- Super Admin Users Table
CREATE TABLE super_admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role super_admin_role NOT NULL DEFAULT 'SUPER_ADMIN',
    permissions JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Super Admin Sessions Table
CREATE TABLE super_admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_admin_id UUID NOT NULL REFERENCES super_admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    current_company_id TEXT,
    permissions_scope JSONB,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW()
);

-- Company Access Logs Table
CREATE TABLE company_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_admin_id UUID NOT NULL REFERENCES super_admin_users(id) ON DELETE CASCADE,
    company_id TEXT,
    action_type access_action_type NOT NULL,
    action_details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_super_admin_users_username ON super_admin_users(username);
CREATE INDEX idx_super_admin_users_email ON super_admin_users(email);
CREATE INDEX idx_super_admin_users_role ON super_admin_users(role);
CREATE INDEX idx_super_admin_users_status ON super_admin_users(status);

CREATE INDEX idx_super_admin_sessions_token ON super_admin_sessions(session_token);
CREATE INDEX idx_super_admin_sessions_admin_id ON super_admin_sessions(super_admin_id);
CREATE INDEX idx_super_admin_sessions_expires ON super_admin_sessions(expires_at);
CREATE INDEX idx_super_admin_sessions_company ON super_admin_sessions(current_company_id);

CREATE INDEX idx_company_access_logs_admin_id ON company_access_logs(super_admin_id);
CREATE INDEX idx_company_access_logs_company_id ON company_access_logs(company_id);
CREATE INDEX idx_company_access_logs_action_type ON company_access_logs(action_type);
CREATE INDEX idx_company_access_logs_created_at ON company_access_logs(created_at);

-- Insert the primary super admin user (udi.shkolnik)
INSERT INTO super_admin_users (
    username,
    email,
    password_hash,
    role,
    permissions,
    status,
    created_at
) VALUES (
    'udi.shkolnik',
    'udi.shkolnik@lgm.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq',
    'SUPER_ADMIN',
    '[
        "VIEW_ALL_COMPANIES",
        "CREATE_COMPANIES", 
        "UPDATE_COMPANIES",
        "DELETE_COMPANIES",
        "VIEW_ALL_USERS",
        "CREATE_USERS",
        "UPDATE_USERS", 
        "DELETE_USERS",
        "VIEW_ALL_LOCATIONS",
        "CREATE_LOCATIONS",
        "UPDATE_LOCATIONS",
        "DELETE_LOCATIONS", 
        "VIEW_ALL_JOURNEYS",
        "CREATE_JOURNEYS",
        "UPDATE_JOURNEYS",
        "DELETE_JOURNEYS",
        "MANAGE_SYSTEM_SETTINGS",
        "VIEW_AUDIT_LOGS",
        "EXPORT_DATA"
    ]'::jsonb,
    'ACTIVE',
    NOW()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON super_admin_users TO c_and_c_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON super_admin_sessions TO c_and_c_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON company_access_logs TO c_and_c_user;
