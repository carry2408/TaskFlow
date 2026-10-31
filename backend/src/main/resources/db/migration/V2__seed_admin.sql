-- V2__seed_admin.sql
-- Password is 'admin123'
INSERT INTO users (username, email, password_hash, full_name, enabled, created_at)
VALUES ('admin', 'admin@taskflow.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'System Administrator', TRUE, NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name IN ('ADMIN', 'PROJECT_MANAGER')
ON CONFLICT DO NOTHING;

