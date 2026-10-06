UPDATE users SET passwordHash = '40adead6c61fb473e3f7a1d03fdd863d:759eb8cfe3e0fd05241bbe90026c4f4e9248365410e8959a1dbcaeb99834d95b:100000' WHERE email LIKE 'test.%@kiini.local';

SELECT COUNT(*) as updated_count FROM users WHERE email LIKE 'test.%@kiini.local' AND passwordHash = '40adead6c61fb473e3f7a1d03fdd863d:759eb8cfe3e0fd05241bbe90026c4f4e9248365410e8959a1dbcaeb99834d95b:100000';
