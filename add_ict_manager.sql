-- Add ICT Manager Test User
-- This is a test user for the ICT Manager role

INSERT INTO users (
  id,
  name,
  email,
  emailVerified,
  loginMethod,
  passwordHash,
  role,
  createdAt,
  lastSignedIn,
  department,
  isActive,
  requiresPasswordChange
) VALUES (
  UUID(),
  'Test ICT Manager',
  'test.ictmanager@kiini.local',
  NOW(),
  'password',
  '$2b$10$JAKZgso2VghsZan0tVkOK1VVHF5wJvFx/C28VK7YfUZe7eOjZBwji',
  'ict_manager',
  NOW(),
  NOW(),
  'ICT',
  1,
  0
);

-- Verify the user was created
SELECT id, name, email, role FROM users WHERE email = 'test.ictmanager@kiini.local';
