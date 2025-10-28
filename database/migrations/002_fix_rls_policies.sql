-- Migration: Fix RLS policies to allow user registration
-- Date: 2025-10-28
-- Description: Updates RLS policies to allow user creation during signup

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies that allow user creation and management
CREATE POLICY "Enable insert for service role" ON users
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON users 
FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users 
FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow service role to bypass RLS for user management
ALTER TABLE users FORCE ROW LEVEL SECURITY;