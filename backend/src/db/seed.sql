USE leave_tracker;

-- Roles
INSERT IGNORE INTO roles (name) VALUES ('employee'), ('manager'), ('admin');

-- Leave Types
INSERT IGNORE INTO leave_types (name, annual_allocation) VALUES
  ('Casual Leave', 12),
  ('Sick Leave', 12),
  ('Earned Leave', 15);

-- Admin
INSERT IGNORE INTO users
(name, email, password, role, roleset, manager_id)
VALUES
(
    'Arun Kumar',
    'arun.kumar@company.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    3,
    '[3]',
    NULL
);

-- Managers
INSERT IGNORE INTO users
(name, email, password, role, roleset, manager_id)
VALUES
(
    'Priya Sharma',
    'priya.sharma@company.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    2,
    '[2]',
    NULL
),
(
    'Rahul Verma',
    'rahul.verma@company.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    2,
    '[2,3]',
    NULL
),
(
    'Meena Krishnan',
    'meena.krishnan@company.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    2,
    '[2,1]',
    3
);

-- Employees under Priya Sharma (manager_id = 2)
INSERT IGNORE INTO users
(name, email, password, role, roleset, manager_id)
VALUES
(
    'Karthik Raj',
    'karthik.raj@company.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    1,
    '[1]',
    2
),
(
    'Anitha Devi',
    'anitha.devi@company.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    1,
    '[1]',
    2
);

-- Employees under Rahul Verma (manager_id = 3)
INSERT IGNORE INTO users
(name, email, password, role, roleset, manager_id)
VALUES
(
    'Vignesh Kumar',
    'vignesh.kumar@company.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    1,
    '[1]',
    NULL
),
(
    'Divya Ramesh',
    'divya.ramesh@company.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    1,
    '[1]',
    3
);

-- Employees under Meena Krishnan (manager_id = 4)
INSERT IGNORE INTO users
(name, email, password, role, roleset, manager_id)
VALUES
(
    'Suresh Babu',
    'suresh.babu@company.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    1,
    '[1]',
    4
),
(
    'Nandhini Raj',
    'nandhini.raj@company.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    1,
    '[1]',
    4
);

-- Leave balances for all users whose roleset contains employee role (1)

INSERT IGNORE INTO leave_balances
    (user_id, leave_type_id, used_days)
SELECT
    u.id,
    lt.id,
    0
FROM users u
CROSS JOIN leave_types lt
WHERE JSON_CONTAINS(u.roleset, '1', '$');

-- Seed calendar for current year (weekdays = working, weekends = non-working)
-- Seed calendar for current year
INSERT IGNORE INTO calendar
(calendar_date, is_working_day, description)
SELECT
    DATE_ADD(MAKEDATE(YEAR(CURDATE()), 1), INTERVAL seq DAY),
    IF(DAYOFWEEK(DATE_ADD(MAKEDATE(YEAR(CURDATE()), 1), INTERVAL seq DAY)) IN (1,7), 0, 1),
    IF(DAYOFWEEK(DATE_ADD(MAKEDATE(YEAR(CURDATE()), 1), INTERVAL seq DAY)) IN (1,7), 'Weekend', NULL)
FROM (
    SELECT a.n + b.n * 10 + c.n * 100 AS seq
    FROM
        (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
         UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a
    CROSS JOIN
        (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
         UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b
    CROSS JOIN
        (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
         UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) c
) numbers
WHERE DATE_ADD(MAKEDATE(YEAR(CURDATE()), 1), INTERVAL seq DAY)
      < MAKEDATE(YEAR(CURDATE()) + 1, 1);