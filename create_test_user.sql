-- Delete test users if they exist
DELETE FROM users WHERE email IN ('admin@kiini.com', 'super@kiini.com');

-- Insert test super_admin user
INSERT INTO users (id, email, name, role, password, createdAt) 
VALUES (UUID(), 'super@kiini.com', 'Super Admin', 'super_admin', '$2b$10$ZLqHWxYJNDJpC0PzZEBWt.E2/XJBW8pRN5Lsqx8L1D2JxQW2T3vFm', NOW());

-- Insert test admin user  
INSERT INTO users (id, email, name, role, password, createdAt)
VALUES (UUID(), 'admin@kiini.com', 'Admin User', 'admin', '$2b$10$ZLqHWxYJNDJpC0PzZEBWt.E2/XJBW8pRN5Lsqx8L1D2JxQW2T3vFm', NOW());

SELECT id, email, name, role FROM users WHERE email IN ('admin@kiini.com', 'super@kiini.com');
