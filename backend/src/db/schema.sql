-- Leave Tracker Database Schema

CREATE DATABASE IF NOT EXISTS leave_tracker;
USE leave_tracker;

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('employee','manager','admin') NOT NULL DEFAULT 'employee',
  roleset JSON NOT NULL DEFAULT ('["employee"]'),
  manager_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL,
  CONSTRAINT fk_users_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS leave_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  annual_allocation INT NOT NULL DEFAULT 12,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS leave_balances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  leave_type_id INT NOT NULL,
  allocated_days INT NOT NULL DEFAULT 0,
  used_days INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_leave_type (user_id, leave_type_id),
  CONSTRAINT fk_lb_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_lb_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id)
);

CREATE TABLE IF NOT EXISTS calendar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  calendar_date DATE NOT NULL UNIQUE,
  is_working_day TINYINT(1) NOT NULL DEFAULT 1,
  description VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_number VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  assigned_manager_id INT DEFAULT NULL,
  leave_type_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_days INT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  reviewed_by INT DEFAULT NULL,
  reviewed_at TIMESTAMP DEFAULT NULL,
  rejection_reason TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_lr_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_lr_manager FOREIGN KEY (assigned_manager_id) REFERENCES users(id),
  CONSTRAINT fk_lr_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
  CONSTRAINT fk_lr_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS leave_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  leave_request_id INT NOT NULL,
  action ENUM('CREATED','APPROVED','REJECTED','CANCELLED') NOT NULL,
  performed_by INT NOT NULL,
  remarks TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_la_request FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id),
  CONSTRAINT fk_la_user FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Indexes for frequently queried fields
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_manager_id ON users(manager_id);
CREATE INDEX idx_lr_user_id ON leave_requests(user_id);
CREATE INDEX idx_lr_assigned_manager ON leave_requests(assigned_manager_id);
CREATE INDEX idx_lr_status ON leave_requests(status);
CREATE INDEX idx_lr_start_date ON leave_requests(start_date);
CREATE INDEX idx_calendar_date ON calendar(calendar_date);
