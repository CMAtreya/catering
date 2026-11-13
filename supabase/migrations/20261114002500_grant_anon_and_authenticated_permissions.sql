-- ============================================================================
-- Migration: 20261114002500_grant_anon_and_authenticated_permissions.sql
-- Description: Grants schema and table level privileges to anon and authenticated
--              roles so that RLS policies can be evaluated without 42501 errors.
-- ============================================================================

-- 1. Grant Schema Usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant Table-Level Privileges on All Public Tables to anon and authenticated
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Grant Sequence Privileges (for ID sequences and next_business_number counters)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 4. Grant Execution on All Functions and Stored Procedures (RPCs)
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 5. Set Default Privileges for any future tables created in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

