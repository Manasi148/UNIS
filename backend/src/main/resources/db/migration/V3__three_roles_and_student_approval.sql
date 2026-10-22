-- UNIS Flyway Migration V3: Three-Role Model, Academic Departments, and Student Approval System

-- 1. Insert Canonical Academic Departments
INSERT INTO departments (id, name, code, description, contact_email, is_active) VALUES
(7, 'Computer Engineering', 'COMP', 'Department of Computer Engineering', 'comp.dept@unis.edu', 1),
(8, 'Information Technology', 'IT', 'Department of Information Technology', 'it.dept@unis.edu', 1),
(9, 'Mechanical Engineering', 'MECH', 'Department of Mechanical Engineering', 'mech.dept@unis.edu', 1),
(10, 'Computer Technology', 'CT', 'Department of Computer Technology', 'ct.dept@unis.edu', 1),
(11, 'Electronics and Telecommunication Engineering', 'EXTC', 'Department of Electronics and Telecommunication Engineering', 'extc.dept@unis.edu', 1),
(12, 'Electrical Engineering', 'ELEC', 'Department of Electrical Engineering', 'elec.dept@unis.edu', 1),
(13, 'Civil Engineering', 'CIVIL', 'Department of Civil Engineering', 'civil.dept@unis.edu', 1),
(14, 'Artificial Intelligence and Data Science', 'AIDS', 'Department of Artificial Intelligence and Data Science', 'aids.dept@unis.edu', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Alter Users Table to add Approval & Academic fields
ALTER TABLE users
    ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED' AFTER role,
    ADD COLUMN department_requested VARCHAR(150) NULL AFTER department_id,
    ADD COLUMN institutional_email VARCHAR(150) NULL AFTER email,
    ADD COLUMN approved_by_id BIGINT NULL AFTER department_requested,
    ADD COLUMN approved_at TIMESTAMP NULL AFTER approved_by_id,
    ADD CONSTRAINT fk_users_approved_by FOREIGN KEY (approved_by_id) REFERENCES users(id) ON DELETE SET NULL,
    ADD INDEX idx_user_approval_status (approval_status);

-- 3. Migrate Users to Strictly 3 Roles: ADMIN, DEPARTMENT_HEAD, STUDENT
UPDATE users SET role = 'DEPARTMENT_HEAD' WHERE role = 'STAFF';

-- 4. Set department and approval status for default seeded accounts
UPDATE users SET approval_status = 'APPROVED' WHERE approval_status IS NULL OR approval_status = '';
UPDATE users SET department_id = 7 WHERE id = 6;
UPDATE users SET department_id = 8 WHERE id = 7;

-- 5. Seed an Academic Department Head for Computer Engineering
INSERT INTO users (id, username, email, password_hash, full_name, student_or_staff_id, phone, role, approval_status, department_id, is_active)
VALUES (8, 'head.comp', 'head.comp@unis.edu', '$2b$10$nk0rIu4Gt5PFl58iY/xXEehMv5aBicJGaHQ/2tYHXFtl/ZzEzYJMC', 'Dr. Rajesh Sharma (HOD Computer)', 'EMP-HOD-008', '+1-555-0108', 'DEPARTMENT_HEAD', 'APPROVED', 7, 1)
ON DUPLICATE KEY UPDATE role='DEPARTMENT_HEAD';
