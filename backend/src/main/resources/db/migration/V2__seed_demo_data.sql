-- UNIS Flyway Migration V2: Fictional Seed Data for Viva and Demonstration
-- Default Passwords:
-- admin@unis.edu           -> admin123
-- head.facilities@unis.edu -> head123
-- head.it@unis.edu         -> head123
-- staff.it@unis.edu        -> staff123
-- staff.fac@unis.edu       -> staff123
-- student@unis.edu         -> student123
-- maya.patel@unis.edu      -> student123

-- 1. Departments
INSERT INTO departments (id, name, code, description, contact_email, is_active) VALUES
(1, 'IT Support & Networking', 'ITS', 'Responsible for campus Wi-Fi, lab workstations, network infrastructure, and digital classroom displays.', 'it-support@unis.edu', 1),
(2, 'Facilities & Maintenance', 'FAC', 'Oversees HVAC, electrical infrastructure, plumbing, carpentry, and classroom furniture.', 'facilities@unis.edu', 1),
(3, 'Laboratory Services', 'LAB', 'Manages specialized engineering and scientific laboratory instruments and equipment.', 'lab-services@unis.edu', 1),
(4, 'Housekeeping & Sanitation', 'HKP', 'Maintains campus cleanliness, waste management, washroom sanitation, and hygiene.', 'housekeeping@unis.edu', 1),
(5, 'Campus Safety & Security', 'SEC', 'Handles physical security, surveillance systems, emergency alarms, and institutional access control.', 'security@unis.edu', 1),
(6, 'Student Affairs & Services', 'SAS', 'Coordinates student welfare, extracurricular spaces, lost-and-found coordination, and community notices.', 'student-affairs@unis.edu', 1);

-- 2. Campus Locations
INSERT INTO campus_locations (id, building, floor, room_number, name, description, is_active) VALUES
(1, 'Tech Park Block A', 'Floor 1', 'A-101', 'Main Institutional Auditorium', '500-capacity auditorium equipped with digital audio and dual projectors', 1),
(2, 'Tech Park Block A', 'Floor 2', 'A-204', 'Computer Lab 2 (Software Engineering)', '60 Dell Precision workstations with development environments and ceiling projector', 1),
(3, 'Tech Park Block A', 'Floor 3', 'A-310', 'Networking & IoT Lab', 'Server racks, Cisco switches, and embedded systems test benches', 1),
(4, 'Science & Engineering Block B', 'Floor 1', 'B-105', 'Physics & Electronics Lab', 'Analog oscilloscopes, breadboards, and precision measurement equipment', 1),
(5, 'Science & Engineering Block B', 'Floor 2', 'B-212', 'Smart Lecture Hall B-2', 'Tiered classroom seating for 120 students with interactive smartboard', 1),
(6, 'Central Academic Tower', 'Ground Floor', 'CAT-G02', 'Central Library & Reading Hall', 'Main student library, study cubicles, and digital research terminals', 1),
(7, 'Central Academic Tower', 'Floor 2', 'CAT-201', 'Student Cafeteria & Lounge', 'Central dining hall and student social lounge area', 1),
(8, 'Central Academic Tower', 'Floor 4', 'CAT-405', 'Executive Seminar Hall 1', 'Executive briefing room with teleconferencing and centralized climate control', 1),
(9, 'Sports & Student Complex', 'Ground Floor', 'SSC-G10', 'Indoor Sports Arena', 'Multi-purpose gymnasium, badminton courts, and recreation office', 1);

-- 3. Users
-- Passwords:
-- admin123:   $2b$10$KFUcHMCmgPMb/AUdNU7vtutjBe7gVchvRMNjnZ3qosTQp7nwBmklG
-- head123:    $2b$10$nk0rIu4Gt5PFl58iY/xXEehMv5aBicJGaHQ/2tYHXFtl/ZzEzYJMC
-- staff123:   $2b$10$gC1k1QFwycPM3fPeRJDlROrp5qxwshHLdDFpJ4fV.t1.Ja/aVjW8i
-- student123: $2b$10$YiFkQ9HofPD879ttdMen1OP1Yl00ZsX2aO0eMnzX5QACjKTHHMIj2

INSERT INTO users (id, username, email, password_hash, full_name, student_or_staff_id, phone, role, department_id, is_active) VALUES
(1, 'admin', 'admin@unis.edu', '$2b$10$KFUcHMCmgPMb/AUdNU7vtutjBe7gVchvRMNjnZ3qosTQp7nwBmklG', 'Dr. Eleanor Vance (System Admin)', 'EMP-ADM-001', '+1-555-0101', 'ADMIN', 2, 1),
(2, 'head.facilities', 'head.facilities@unis.edu', '$2b$10$nk0rIu4Gt5PFl58iY/xXEehMv5aBicJGaHQ/2tYHXFtl/ZzEzYJMC', 'Prof. Marcus Sterling', 'EMP-HOD-002', '+1-555-0102', 'DEPARTMENT_HEAD', 2, 1),
(3, 'head.it', 'head.it@unis.edu', '$2b$10$nk0rIu4Gt5PFl58iY/xXEehMv5aBicJGaHQ/2tYHXFtl/ZzEzYJMC', 'Dr. Aris Thorne', 'EMP-HOD-003', '+1-555-0103', 'DEPARTMENT_HEAD', 1, 1),
(4, 'staff.it', 'staff.it@unis.edu', '$2b$10$gC1k1QFwycPM3fPeRJDlROrp5qxwshHLdDFpJ4fV.t1.Ja/aVjW8i', 'Sarah Jenkins (IT Tech)', 'EMP-STF-014', '+1-555-0104', 'STAFF', 1, 1),
(5, 'staff.fac', 'staff.fac@unis.edu', '$2b$10$gC1k1QFwycPM3fPeRJDlROrp5qxwshHLdDFpJ4fV.t1.Ja/aVjW8i', 'David Miller (Maintenance)', 'EMP-STF-022', '+1-555-0105', 'STAFF', 2, 1),
(6, 'student', 'student@unis.edu', '$2b$10$YiFkQ9HofPD879ttdMen1OP1Yl00ZsX2aO0eMnzX5QACjKTHHMIj2', 'Alex Rivera', 'STU-2026-4401', '+1-555-0201', 'STUDENT', NULL, 1),
(7, 'student.maya', 'maya.patel@unis.edu', '$2b$10$YiFkQ9HofPD879ttdMen1OP1Yl00ZsX2aO0eMnzX5QACjKTHHMIj2', 'Maya Patel', 'STU-2026-4402', '+1-555-0202', 'STUDENT', NULL, 1);

-- 4. Initial Seed Tickets
INSERT INTO tickets (id, ticket_reference, title, description, category, priority, status, created_by_id, department_id, location_id, assigned_to_id, target_resolution_at, resolved_at, closed_at, is_overdue, escalation_level, resolution_summary, created_at, updated_at) VALUES
(1, 'UNIS-2026-0001', 'Severe Wi-Fi Signal Dropouts in Central Library', 'Students on the second floor study area lose connection every 5-10 minutes. The access point LED flashes amber repeatedly.', 'Wi-Fi & Networking', 'HIGH', 'IN_PROGRESS', 6, 1, 6, 4, DATE_ADD(NOW(), INTERVAL 12 HOUR), NULL, NULL, 0, 0, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(2, 'UNIS-2026-0002', 'Ceiling Projector Color Distortion in Computer Lab 2', 'The HDMI feed flickers intermittently and shows severe yellow tint across the projection screen during programming classes.', 'Laboratory Equipment', 'MEDIUM', 'ASSIGNED', 6, 1, 2, 4, DATE_ADD(NOW(), INTERVAL 36 HOUR), NULL, NULL, 0, 0, NULL, DATE_SUB(NOW(), INTERVAL 5 HOUR), NOW()),
(3, 'UNIS-2026-0003', 'Continuous Water Leakage under Water Cooler Tech Park Floor 2', 'Water leaking onto the corridor floor creating an active slip and fall hazard near the main staircase.', 'Plumbing', 'HIGH', 'RESOLVED', 7, 2, 2, 5, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL, 0, 0, 'Replaced cracked drainage coupling and secured pressure valve. Area cleared and sanitised.', DATE_SUB(NOW(), INTERVAL 18 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(4, 'UNIS-2026-0004', 'HVAC Controller Unit Malfunction in Executive Seminar Hall 1', 'The digital thermostat panel shows error code E-04 and will not blow cool air. The hall is scheduled for guest lectures tomorrow.', 'Electricity', 'HIGH', 'SUBMITTED', 6, 2, 8, NULL, DATE_ADD(NOW(), INTERVAL 20 HOUR), NULL, NULL, 0, 0, NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR), NOW()),
(5, 'UNIS-2026-0005', 'Damaged Whiteboard Marker Tray in Lecture Hall B-2', 'The aluminum marker shelf has fallen off the wall bracket and markers are falling on the floor.', 'Furniture & Facilities', 'LOW', 'CLOSED', 7, 2, 5, 5, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 0, 0, 'Wall bracket re-anchored with heavy-duty drywall anchors.', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 5. Ticket History
INSERT INTO ticket_history (ticket_id, actor_id, event_type, old_value, new_value, comments, created_at) VALUES
(1, 6, 'CREATED', NULL, 'SUBMITTED', 'Ticket lodged via Student Portal with suggested department ITS', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 3, 'ASSIGNED', 'UNASSIGNED', 'Sarah Jenkins (IT Tech)', 'Assigned to IT technician for on-site AP diagnosis', DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(1, 4, 'STATUS_CHANGED', 'ASSIGNED', 'IN_PROGRESS', 'Commenced diagnostic packet capture on AP-LIB-02', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(2, 6, 'CREATED', NULL, 'SUBMITTED', 'Created via Wizard. Classified as Laboratory Equipment', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(2, 3, 'ASSIGNED', 'UNASSIGNED', 'Sarah Jenkins (IT Tech)', 'Scheduled for bulb & HDMI cable replacement check', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(3, 7, 'CREATED', NULL, 'SUBMITTED', 'Reported water cooler pooling hazard', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(3, 2, 'ASSIGNED', 'UNASSIGNED', 'David Miller (Maintenance)', 'Dispatched urgently for plumbing repair', DATE_SUB(NOW(), INTERVAL 16 HOUR)),
(3, 5, 'STATUS_CHANGED', 'ASSIGNED', 'IN_PROGRESS', 'Turned off isolation valve, inspecting pipe seals', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(3, 5, 'RESOLVED', 'IN_PROGRESS', 'RESOLVED', 'Fitted new connector seal. Water pressure verified normal', DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- 6. Ticket Comments
INSERT INTO ticket_comments (ticket_id, author_id, comment_text, is_internal, created_at) VALUES
(1, 4, 'Investigating router logs. Looks like DHCP pool exhaustion on the student VLAN. Adjusting lease times.', 0, DATE_SUB(NOW(), INTERVAL 16 HOUR)),
(1, 4, 'Internal note: Replaced firmware on Cisco AP-LIB-02; need to verify radius auth cert before marking resolved.', 1, DATE_SUB(NOW(), INTERVAL 14 HOUR)),
(1, 6, 'Thank you! The signal seems somewhat stronger near the east window now.', 0, DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(3, 5, 'Internal note: Facility plumbing stock running low on 15mm PVC couplings. Reorder placed.', 1, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(3, 5, 'Plumbing repair completed and checked for zero seepage.', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- 7. Ticket Followers
INSERT INTO ticket_followers (ticket_id, user_id, followed_at) VALUES
(1, 7, DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- 8. Ticket Feedback
INSERT INTO ticket_feedback (ticket_id, student_id, rating, comments, created_at) VALUES
(3, 7, 5, 'Very quick resolution! Floor was cleaned up before lunch hour.', DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- 9. Lost & Found Items
INSERT INTO lost_found_items (id, title, description, category, color, item_type, status, location_id, location_description, date_occurred, reported_by_id, contact_info, created_at) VALUES
(1, 'Casio FX-991EX ClassWiz Scientific Calculator', 'Left behind after advanced calculus class. Has a small yellow sticker with initials AR on the slide-on protective case.', 'Electronics', 'Black', 'LOST', 'OPEN', 6, 'Library 2nd Floor Silent Study Desk 14', CURDATE() - INTERVAL 2 DAY, 6, 'alex.rivera@student.unis.edu', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'Scientific Calculator Found on Study Table', 'Found unattended Casio scientific calculator on table near Library digital catalog.', 'Electronics', 'Black', 'FOUND', 'OPEN', 6, 'Library 2nd Floor Catalog Desk', CURDATE() - INTERVAL 1 DAY, 4, 'Turned in at Library Circulation Desk', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'North Face Blue Waterproof Backpack', 'Contains spiral notebooks, mechanical pencils, and university identity badge for Maya Patel.', 'Bags', 'Blue', 'LOST', 'OPEN', 7, 'Cafeteria Booth near juice bar', CURDATE() - INTERVAL 1 DAY, 7, 'maya.patel@student.unis.edu', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 'Set of Three Brass Keys with University Lanyard', 'Keys on green UNIS branded fabric lanyard found near the indoor badminton court bleachers.', 'Accessories', 'Brass/Green', 'FOUND', 'OPEN', 9, 'Gymnasium Court 2 Bleachers', CURDATE(), 5, 'Deposited at Security Office G01', NOW());

-- 10. Announcements
INSERT INTO announcements (id, title, body, category, author_id, target_role, department_id, is_pinned, is_published, publish_at) VALUES
(1, 'Annual Campus Network Maintenance & Core Switch Upgrade', 'Please be advised that core network switches in Tech Park Block A and Central Academic Tower will undergo scheduled firmware upgrades this Saturday between 02:00 AM and 05:00 AM. Intermittent wired and Wi-Fi outages may occur during this maintenance window.', 'General Announcements', 1, 'ALL', 1, 1, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'Semester Final Examinations: Hall Guidelines and Prohibited Devices', 'All undergraduate students must report to examination halls 15 minutes before scheduled start times. Mobile devices, smartwatches, and programmable calculators are strictly prohibited inside the testing perimeter.', 'Examination Updates', 1, 'STUDENT', NULL, 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'Urgent: Water Valve Isolation Notice for Block B Sanitation Line', 'Plumbing team will temporarily shut off secondary water line for riser replacements in Block B on Thursday from 14:00 to 16:00. Restrooms on Floors 1 and 2 will remain closed during this time.', 'Urgent Notices', 2, 'ALL', 2, 0, 1, NOW());

-- 11. Initial Notifications
INSERT INTO notifications (recipient_id, notification_type, title, message, resource_type, resource_id, is_read, created_at) VALUES
(6, 'TICKET_STATUS_UPDATED', 'Ticket UNIS-2026-0001 Update', 'Your ticket regarding Wi-Fi Signal Dropouts in Central Library is now In Progress with Sarah Jenkins.', 'TICKET', 1, 0, DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(7, 'TICKET_RESOLVED', 'Ticket UNIS-2026-0003 Resolved', 'David Miller marked the water leakage ticket as Resolved. Please provide your resolution feedback.', 'TICKET', 3, 1, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(4, 'TICKET_ASSIGNED', 'New Assignment: UNIS-2026-0002', 'You have been assigned to handle Projector Color Distortion in Computer Lab 2.', 'TICKET', 2, 0, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(6, 'ITEM_MATCH_SUGGESTION', 'Possible Lost & Found Match Found', 'A found item matching your Casio Scientific Calculator was turned in at Library Circulation Desk.', 'LOST_FOUND', 2, 0, DATE_SUB(NOW(), INTERVAL 1 DAY));
