USE leave_tracker;

-- Roles
INSERT IGNORE INTO roles (name) VALUES ('employee'), ('manager'), ('admin');

-- Leave Types
INSERT IGNORE INTO leave_types (name, annual_allocation) VALUES
  ('Casual Leave', 12),
  ('Sick Leave', 12),
  ('Earned Leave', 15);

-- Default admin user (password: Admin@123)
INSERT IGNORE INTO users (name, email, password, role, roleset) VALUES
  ('Admin User', 'admin@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '["admin"]');

-- Sample manager (password: Manager@123)
INSERT IGNORE INTO users (name, email, password, role, roleset) VALUES
  ('Jane Manager', 'manager@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', '["manager","employee"]');

-- Sample employee (password: Employee@123), mapped to manager id=2
INSERT IGNORE INTO users (name, email, password, role, roleset, manager_id) VALUES
  ('John Employee', 'employee@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', '["employee"]', 2);

-- Leave balances for employee (id=3)
INSERT IGNORE INTO leave_balances (user_id, leave_type_id, allocated_days, used_days)
SELECT 3, id, annual_allocation, 0 FROM leave_types;

-- Leave balances for manager (id=2) — manager also has employee role
INSERT IGNORE INTO leave_balances (user_id, leave_type_id, allocated_days, used_days)
SELECT 2, id, annual_allocation, 0 FROM leave_types;

-- Seed calendar for current year (weekdays = working, weekends = non-working)
-- Run the stored procedure below to populate calendar for a given year
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS seed_calendar(IN yr INT)
BEGIN
  DECLARE d DATE;
  SET d = MAKEDATE(yr, 1);
  WHILE YEAR(d) = yr DO
    INSERT IGNORE INTO calendar (calendar_date, is_working_day, description)
    VALUES (d, IF(DAYOFWEEK(d) IN (1,7), 0, 1), IF(DAYOFWEEK(d) IN (1,7), 'Weekend', NULL));
    SET d = DATE_ADD(d, INTERVAL 1 DAY);
  END WHILE;
END$$
DELIMITER ;

CALL seed_calendar(YEAR(CURDATE()));
