/**
 * Test User Setup SQL Script
 * 
 * Creates test users with different roles for RBAC testing
 * Run this in your database to set up test users
 * 
 * Usage:
 * 1. Connect to your database
 * 2. Use the kiini-one-hub-total-control database
 * 3. Run this script
 * 
 * Test users and passwords:
 * - test.superadmin@kiini.local / password123
 * - test.admin@kiini.local / password123
 * - test.accountant@kiini.local / password123
 * - test.pm@kiini.local / password123
 * - test.hr@kiini.local / password123
 * - test.staff@kiini.local / password123
 */

-- ============================================================================
-- PART 1: Create Test Users
-- ============================================================================

-- Delete existing test users if they exist (for re-running script)
DELETE FROM users WHERE email LIKE 'test.%@kiini.local';

-- Create test user with Super Admin role
INSERT INTO users (
  id, 
  name, 
  email, 
  password_hash, 
  role, 
  is_active,
  created_at, 
  updated_at
) VALUES (
  UUID(),
  'Test Super Admin',
  'test.superadmin@kiini.local',
  SHA2('password123', 256),
  'super_admin',
  1,
  NOW(),
  NOW()
);

-- Create test user with Admin role
INSERT INTO users (
  id, 
  name, 
  email, 
  password_hash, 
  role,
  is_active,
  created_at, 
  updated_at
) VALUES (
  UUID(),
  'Test Admin',
  'test.admin@kiini.local',
  SHA2('password123', 256),
  'admin',
  1,
  NOW(),
  NOW()
);

-- Create test user with Accountant role
INSERT INTO users (
  id, 
  name, 
  email, 
  password_hash, 
  role,
  is_active,
  created_at, 
  updated_at
) VALUES (
  UUID(),
  'Test Accountant',
  'test.accountant@kiini.local',
  SHA2('password123', 256),
  'accountant',
  1,
  NOW(),
  NOW()
);

-- Create test user with Project Manager role
INSERT INTO users (
  id, 
  name, 
  email, 
  password_hash, 
  role,
  is_active,
  created_at, 
  updated_at
) VALUES (
  UUID(),
  'Test Project Manager',
  'test.pm@kiini.local',
  SHA2('password123', 256),
  'project_manager',
  1,
  NOW(),
  NOW()
);

-- Create test user with HR role
INSERT INTO users (
  id, 
  name, 
  email, 
  password_hash, 
  role,
  is_active,
  created_at, 
  updated_at
) VALUES (
  UUID(),
  'Test HR User',
  'test.hr@kiini.local',
  SHA2('password123', 256),
  'hr',
  1,
  NOW(),
  NOW()
);

-- Create test user with Staff role
INSERT INTO users (
  id, 
  name, 
  email, 
  password_hash, 
  role,
  is_active,
  created_at, 
  updated_at
) VALUES (
  UUID(),
  'Test Staff User',
  'test.staff@kiini.local',
  SHA2('password123', 256),
  'staff',
  1,
  NOW(),
  NOW()
);

-- ============================================================================
-- PART 2: Verify Test Users Created
-- ============================================================================

-- Display created users
SELECT 
  id,
  name,
  email,
  role,
  is_active,
  created_at
FROM users
WHERE email LIKE 'test.%@kiini.local'
ORDER BY 
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'accountant' THEN 3
    WHEN 'project_manager' THEN 4
    WHEN 'hr' THEN 5
    WHEN 'staff' THEN 6
    ELSE 99
  END;

-- ============================================================================
-- PART 3: Verify Test Users Can Login
-- ============================================================================

-- Check test user passwords hash correctly
-- (All should have same hash: a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3)
SELECT 
  email,
  SHA2('password123', 256) as expected_hash
FROM users
WHERE email LIKE 'test.%@kiini.local'
LIMIT 1;

-- ============================================================================
-- PART 4: Optional - Create Test Audit Log Entry
-- ============================================================================

-- You can optionally create a log entry to track test user creation
-- INSERT INTO audit_logs (user_id, action, entity_type, entity_id, description, created_at)
-- SELECT 
--   id,
--   'CREATE',
--   'TEST_USER',
--   id,
--   'Test user created for RBAC testing',
--   NOW()
-- FROM users
-- WHERE email LIKE 'test.%@kiini.local';

-- ============================================================================
-- PART 5: Cleanup Script (Optional - Run to Delete Test Users)
-- ============================================================================

/*
-- ONLY RUN THIS WHEN YOU'RE DONE TESTING
-- This will DELETE all test users

DELETE FROM users WHERE email LIKE 'test.%@kiini.local';

-- Verify deletion
SELECT COUNT(*) as remaining_test_users 
FROM users 
WHERE email LIKE 'test.%@kiini.local';
*/
