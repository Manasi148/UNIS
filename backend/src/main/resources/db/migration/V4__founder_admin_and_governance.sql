-- UNIS Flyway Migration V4: Administrator Governance, Founder Designation, and Account Provisioning
-- Character set: utf8mb4

-- 1. Add is_founder and created_by_id columns to users table
ALTER TABLE users
    ADD COLUMN is_founder BOOLEAN NOT NULL DEFAULT FALSE AFTER is_active,
    ADD COLUMN created_by_id BIGINT NULL AFTER approved_by_id,
    ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL;

-- 2. Create tables for Administrator Governance (Removal Proposals & Approvals)
CREATE TABLE IF NOT EXISTS admin_removal_proposals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    target_admin_id BIGINT NOT NULL,
    proposer_admin_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    required_approvals INT NOT NULL DEFAULT 4,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    executed_at TIMESTAMP NULL,
    FOREIGN KEY (target_admin_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (proposer_admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_proposal_target (target_admin_id),
    INDEX idx_proposal_proposer (proposer_admin_id),
    INDEX idx_proposal_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_removal_approvals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    proposal_id BIGINT NOT NULL,
    admin_id BIGINT NOT NULL,
    approved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES admin_removal_proposals(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_proposal_admin (proposal_id, admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Provision Initial Administrator (Admin@hotmail.com / Administrator@123)
-- Password hash: $2a$10$04ZbmrHB0AiFxvaFzwynm.a96IwN7iGltY5kr7gAzSzTNYWPHkrEq
INSERT INTO users (id, username, email, password_hash, full_name, student_or_staff_id, phone, role, approval_status, is_active, is_founder)
VALUES (1, 'admin', 'admin@hotmail.com', '$2a$10$04ZbmrHB0AiFxvaFzwynm.a96IwN7iGltY5kr7gAzSzTNYWPHkrEq', 'System Administrator', 'EMP-ADM-001', '+91 98765 00001', 'ADMIN', 'APPROVED', 1, 1)
ON DUPLICATE KEY UPDATE
    email = 'admin@hotmail.com',
    password_hash = '$2a$10$04ZbmrHB0AiFxvaFzwynm.a96IwN7iGltY5kr7gAzSzTNYWPHkrEq',
    full_name = 'System Administrator',
    role = 'ADMIN',
    approval_status = 'APPROVED',
    is_active = 1,
    is_founder = 1;

-- 4. Provision Initial Student (Rahul@gmail.com / Rahul@123)
-- Department: Computer Engineering (ID: 7)
-- Password hash: $2a$10$0vtXS73EbWIuGc2Y1LV.4eDL58KxGHfKN0lVN3fZ73F3Mb0T0OCg6
INSERT INTO users (id, username, email, password_hash, full_name, student_or_staff_id, phone, role, approval_status, department_id, is_active, is_founder)
VALUES (6, 'rahul', 'rahul@gmail.com', '$2a$10$0vtXS73EbWIuGc2Y1LV.4eDL58KxGHfKN0lVN3fZ73F3Mb0T0OCg6', 'Rahul Sharma', 'STU-2026-0001', '+91 98765 00002', 'STUDENT', 'APPROVED', 7, 1, 0)
ON DUPLICATE KEY UPDATE
    email = 'rahul@gmail.com',
    password_hash = '$2a$10$0vtXS73EbWIuGc2Y1LV.4eDL58KxGHfKN0lVN3fZ73F3Mb0T0OCg6',
    full_name = 'Rahul Sharma',
    role = 'STUDENT',
    department_id = 7,
    approval_status = 'APPROVED',
    is_active = 1,
    is_founder = 0;

-- 5. Safely reassign foreign keys on demo records to either Admin (id=1) or Rahul (id=6)
UPDATE tickets SET created_by_id = 6 WHERE created_by_id NOT IN (1, 6);
UPDATE tickets SET assigned_to_id = 1 WHERE assigned_to_id IS NOT NULL AND assigned_to_id NOT IN (1, 6);
UPDATE ticket_history SET actor_id = 1 WHERE actor_id IS NOT NULL AND actor_id NOT IN (1, 6);
UPDATE ticket_comments SET author_id = 1 WHERE author_id NOT IN (1, 6);
DELETE FROM ticket_followers WHERE user_id NOT IN (1, 6);
UPDATE ticket_feedback SET student_id = 6 WHERE student_id NOT IN (1, 6);
UPDATE lost_found_items SET reported_by_id = 6 WHERE reported_by_id NOT IN (1, 6);
UPDATE item_claims SET claimant_id = 6 WHERE claimant_id NOT IN (1, 6);
UPDATE item_claims SET reviewer_id = 1 WHERE reviewer_id IS NOT NULL AND reviewer_id NOT IN (1, 6);
UPDATE announcements SET author_id = 1 WHERE author_id NOT IN (1, 6);
DELETE FROM announcement_bookmarks WHERE user_id NOT IN (1, 6);
DELETE FROM announcement_reads WHERE user_id NOT IN (1, 6);
UPDATE notifications SET recipient_id = 6 WHERE recipient_id NOT IN (1, 6);
UPDATE audit_logs SET actor_id = 1 WHERE actor_id IS NOT NULL AND actor_id NOT IN (1, 6);
UPDATE users SET approved_by_id = 1 WHERE approved_by_id IS NOT NULL AND approved_by_id NOT IN (1, 6);

-- 6. Clean up legacy demo accounts and test seed artifacts (excluding Admin id=1 and Rahul id=6)
DELETE FROM users WHERE id NOT IN (1, 6);
