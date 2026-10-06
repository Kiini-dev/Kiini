UPDATE users SET passwordHash = '$2b$10$a3T7drjcl2FfrFau2hguFuU4v/M6b5QEizmsVgVDEvJG9DjuB6TTa' WHERE email = 'info@kiini.africa';
SELECT email, CHAR_LENGTH(passwordHash) as hashLen, SUBSTRING(passwordHash, 1, 50) as hashStart FROM users WHERE email='info@kiini.africa' LIMIT 1;
