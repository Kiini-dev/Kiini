-- Add jobGroupId to employees table (add nullable first, then set default)
ALTER TABLE employees 
ADD COLUMN jobGroupId VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci AFTER position;

-- Set default value for existing records
UPDATE employees SET jobGroupId = 'jg-001' WHERE jobGroupId IS NULL;

-- Make column NOT NULL
ALTER TABLE employees 
MODIFY jobGroupId VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- Add index (ignore duplicate key errors handled by runner)
ALTER TABLE employees 
ADD INDEX job_group_idx (jobGroupId);

-- Add foreign key constraint
ALTER TABLE employees 
ADD CONSTRAINT fk_employees_jobGroupId FOREIGN KEY (jobGroupId) REFERENCES jobGroups(id) ON DELETE RESTRICT;

-- Create attendance table for tracking employee attendance
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(64) PRIMARY KEY,
    employeeId VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'leave', 'half_day', 'remote') DEFAULT 'absent' NOT NULL,
    checkInTime TIME NULL,
    checkOutTime TIME NULL,
    notes TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX employee_attendance_idx (employeeId),
    INDEX attendance_date_idx (date),
    INDEX attendance_status_idx (status),
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
