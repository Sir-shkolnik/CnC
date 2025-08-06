-- Super Admin System Database Schema
-- This file contains all the database changes needed for the multi-company super admin system

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
    status user_status NOT NULL DEFAULT 'ACTIVE',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES super_admin_users(id),
    updated_by UUID REFERENCES super_admin_users(id)
);

-- Super Admin Sessions Table
CREATE TABLE super_admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_admin_id UUID NOT NULL REFERENCES super_admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    current_company_id UUID REFERENCES clients(id),
    permissions_scope JSONB,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW()
);

-- Company Access Logs Table
CREATE TABLE company_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_admin_id UUID NOT NULL REFERENCES super_admin_users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    action_type access_action_type NOT NULL,
    action_details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
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
    -- This is a bcrypt hash of 'Id200633048!' - in production, use proper password hashing
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

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_super_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for super_admin_users table
CREATE TRIGGER update_super_admin_users_updated_at
    BEFORE UPDATE ON super_admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_super_admin_updated_at();

-- Create a function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM super_admin_sessions 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a function to log company access
CREATE OR REPLACE FUNCTION log_company_access(
    p_super_admin_id UUID,
    p_company_id UUID,
    p_action_type access_action_type,
    p_action_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO company_access_logs (
        super_admin_id,
        company_id,
        action_type,
        action_details,
        ip_address,
        user_agent
    ) VALUES (
        p_super_admin_id,
        p_company_id,
        p_action_type,
        p_action_details,
        p_ip_address,
        p_user_agent
    );
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON super_admin_users TO c_and_c_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON super_admin_sessions TO c_and_c_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON company_access_logs TO c_and_c_user;

GRANT USAGE ON SEQUENCE super_admin_users_id_seq TO c_and_c_user;
GRANT USAGE ON SEQUENCE super_admin_sessions_id_seq TO c_and_c_user;
GRANT USAGE ON SEQUENCE company_access_logs_id_seq TO c_and_c_user;

-- Create views for easier querying
CREATE VIEW super_admin_overview AS
SELECT 
    sau.id,
    sau.username,
    sau.email,
    sau.role,
    sau.status,
    sau.last_login,
    sau.created_at,
    COUNT(sas.id) as active_sessions,
    COUNT(cal.id) as total_actions
FROM super_admin_users sau
LEFT JOIN super_admin_sessions sas ON sau.id = sas.super_admin_id AND sas.expires_at > NOW()
LEFT JOIN company_access_logs cal ON sau.id = cal.super_admin_id
GROUP BY sau.id, sau.username, sau.email, sau.role, sau.status, sau.last_login, sau.created_at;

CREATE VIEW company_access_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    c.type as company_type,
    COUNT(cal.id) as total_accesses,
    COUNT(DISTINCT cal.super_admin_id) as unique_admins,
    MAX(cal.created_at) as last_access
FROM clients c
LEFT JOIN company_access_logs cal ON c.id = cal.company_id
GROUP BY c.id, c.name, c.type;

-- Create a function to get super admin permissions
CREATE OR REPLACE FUNCTION get_super_admin_permissions(p_username VARCHAR)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT permissions INTO result
    FROM super_admin_users
    WHERE username = p_username AND status = 'ACTIVE';
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Create a function to validate super admin session
CREATE OR REPLACE FUNCTION validate_super_admin_session(p_token VARCHAR)
RETURNS TABLE(
    is_valid BOOLEAN,
    super_admin_id UUID,
    username VARCHAR,
    role super_admin_role,
    permissions JSONB,
    current_company_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sas.expires_at > NOW() as is_valid,
        sau.id as super_admin_id,
        sau.username,
        sau.role,
        sau.permissions,
        sas.current_company_id
    FROM super_admin_sessions sas
    JOIN super_admin_users sau ON sas.super_admin_id = sau.id
    WHERE sas.session_token = p_token 
    AND sau.status = 'ACTIVE';
END;
$$ LANGUAGE plpgsql; 