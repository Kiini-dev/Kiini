-- Kiini Database Initialization Script
-- This script runs automatically when the MySQL container starts
-- It sets up the database with proper character encoding and collation

-- Set character encoding for the database
ALTER DATABASE kiini-one-hub-total-control CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create indexes for performance optimization
-- These will be created after Drizzle migrations run

-- Log initialization completion
SELECT 'Database initialization complete' as status;
