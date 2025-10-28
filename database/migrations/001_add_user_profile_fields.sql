-- Migration: Add age and occupation fields to users table
-- Date: 2025-10-28
-- Description: Adds optional age and occupation fields to support enhanced user profiles

-- Add age column (optional, integer between 13-120)
ALTER TABLE users 
ADD COLUMN age INTEGER CHECK (age >= 13 AND age <= 120);

-- Add occupation column (optional, varchar)
ALTER TABLE users 
ADD COLUMN occupation VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN users.age IS 'User age (optional, must be between 13-120)';
COMMENT ON COLUMN users.occupation IS 'User occupation/job title (optional)';