-- ==============================================================================
-- TaskFlow Enterprise Dummy Data & Reset Script
-- ==============================================================================
-- This script safely truncates and reseeds realistic, production-like data
-- for all entities: Users, Roles, Teams, Projects, Project Members, Issues,
-- Comments, Labels, Sprints, and Notifications.
-- 
-- Default Admin Account:
--   Email:    admin@taskflow.com
--   Password: admin123
-- ==============================================================================

BEGIN;

-- 1. CLEAN UP EXISTING DATA (Cascading)
TRUNCATE TABLE 
    notifications,
    attachments,
    issue_history,
    comments,
    issue_labels,
    sprint_issues,
    issues,
    sprints,
    project_members,
    projects,
    team_members,
    teams,
    user_roles,
    users,
    labels
RESTART IDENTITY CASCADE;

-- Ensure default roles exist
INSERT INTO roles (id, name, description) VALUES
    (1, 'ADMIN',           'Full system access'),
    (2, 'PROJECT_MANAGER', 'Manages projects and teams'),
    (3, 'DEVELOPER',       'Creates and updates issues'),
    (4, 'QA',              'Creates bugs and verifies fixes'),
    (5, 'MEMBER',          'General team member'),
    (6, 'VIEWER',          'Read-only access')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- 2. USERS (Password for all accounts is 'admin123')
-- BCrypt Hash: $2a$10$S6GTNQP2yBtRQtwUnRDxV.xASGi9sHZMmu6iz9GFVwrXGAB8XXQF2
INSERT INTO users (id, username, email, password_hash, full_name, enabled, created_at) VALUES
    (1, 'admin', 'admin@taskflow.com', '$2a$10$S6GTNQP2yBtRQtwUnRDxV.xASGi9sHZMmu6iz9GFVwrXGAB8XXQF2', 'System Administrator', TRUE, NOW() - INTERVAL '30 days'),
    (2, 'sarah.connor', 'sarah.pm@taskflow.com', '$2a$10$S6GTNQP2yBtRQtwUnRDxV.xASGi9sHZMmu6iz9GFVwrXGAB8XXQF2', 'Sarah Connor', TRUE, NOW() - INTERVAL '28 days'),
    (3, 'alex.mercer', 'alex.dev@taskflow.com', '$2a$10$S6GTNQP2yBtRQtwUnRDxV.xASGi9sHZMmu6iz9GFVwrXGAB8XXQF2', 'Alex Mercer', TRUE, NOW() - INTERVAL '25 days'),
    (4, 'elena.rostova', 'elena.dev@taskflow.com', '$2a$10$S6GTNQP2yBtRQtwUnRDxV.xASGi9sHZMmu6iz9GFVwrXGAB8XXQF2', 'Elena Rostova', TRUE, NOW() - INTERVAL '24 days'),
    (5, 'marcus.vance', 'marcus.qa@taskflow.com', '$2a$10$S6GTNQP2yBtRQtwUnRDxV.xASGi9sHZMmu6iz9GFVwrXGAB8XXQF2', 'Marcus Vance', TRUE, NOW() - INTERVAL '20 days'),
    (6, 'david.kim', 'david.kim@taskflow.com', '$2a$10$S6GTNQP2yBtRQtwUnRDxV.xASGi9sHZMmu6iz9GFVwrXGAB8XXQF2', 'David Kim', TRUE, NOW() - INTERVAL '15 days');

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 3. USER ROLES
INSERT INTO user_roles (user_id, role_id) VALUES
    (1, 1), -- Admin -> ADMIN
    (1, 2), -- Admin -> PROJECT_MANAGER
    (2, 2), -- Sarah -> PROJECT_MANAGER
    (3, 3), -- Alex -> DEVELOPER
    (4, 3), -- Elena -> DEVELOPER
    (5, 4), -- Marcus -> QA
    (6, 5); -- David -> MEMBER

-- 4. TEAMS
INSERT INTO teams (id, name, description, lead_user_id, created_at) VALUES
    (1, 'Core Platform Team', 'Responsible for backend architecture, authentication, and core database services.', 1, NOW() - INTERVAL '25 days'),
    (2, 'Frontend & Mobile Team', 'Building responsive web and mobile client interfaces with high fidelity.', 2, NOW() - INTERVAL '20 days'),
    (3, 'Quality Engineering', 'Automated testing pipelines, end-to-end verification, and performance analysis.', 5, NOW() - INTERVAL '18 days');

SELECT setval('teams_id_seq', (SELECT MAX(id) FROM teams));

-- 5. TEAM MEMBERS
INSERT INTO team_members (team_id, user_id, joined_at) VALUES
    (1, 1, NOW() - INTERVAL '25 days'),
    (1, 3, NOW() - INTERVAL '24 days'),
    (1, 4, NOW() - INTERVAL '24 days'),
    (2, 2, NOW() - INTERVAL '20 days'),
    (2, 3, NOW() - INTERVAL '19 days'),
    (2, 6, NOW() - INTERVAL '15 days'),
    (3, 5, NOW() - INTERVAL '18 days'),
    (3, 4, NOW() - INTERVAL '17 days');

-- 6. PROJECTS
INSERT INTO projects (id, name, project_key, description, status, lead_user_id, team_id, created_at) VALUES
    (1, 'TaskFlow Web Client', 'TSK', 'Enterprise React single-page application and UI component system.', 'ACTIVE', 2, 2, NOW() - INTERVAL '20 days'),
    (2, 'Cloud Gateway & Services', 'GW', 'High-throughput Spring Boot microservices, API Gateway, and Redis caching tier.', 'ACTIVE', 1, 1, NOW() - INTERVAL '25 days'),
    (3, 'Mobile Companion App', 'MOB', 'Cross-platform mobile client for real-time notifications and on-call issue triage.', 'DRAFT', 2, 2, NOW() - INTERVAL '10 days');

SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));

-- 7. PROJECT MEMBERS
INSERT INTO project_members (project_id, user_id, role_in_project, joined_at) VALUES
    (1, 1, 'OWNER', NOW() - INTERVAL '20 days'),
    (1, 2, 'MANAGER', NOW() - INTERVAL '20 days'),
    (1, 3, 'DEVELOPER', NOW() - INTERVAL '19 days'),
    (1, 4, 'DEVELOPER', NOW() - INTERVAL '19 days'),
    (1, 5, 'QA', NOW() - INTERVAL '18 days'),
    (1, 6, 'VIEWER', NOW() - INTERVAL '15 days'),
    (2, 1, 'OWNER', NOW() - INTERVAL '25 days'),
    (2, 3, 'DEVELOPER', NOW() - INTERVAL '24 days'),
    (2, 4, 'DEVELOPER', NOW() - INTERVAL '24 days'),
    (2, 5, 'QA', NOW() - INTERVAL '20 days');

-- 8. LABELS
INSERT INTO labels (id, name, color, created_by) VALUES
    (1, 'backend', '#3b82f6', 1),
    (2, 'frontend', '#8b5cf6', 2),
    (3, 'security', '#ef4444', 1),
    (4, 'bug', '#dc2626', 5),
    (5, 'performance', '#f59e0b', 3),
    (6, 'ui/ux', '#ec4899', 2),
    (7, 'database', '#10b981', 1);

SELECT setval('labels_id_seq', (SELECT MAX(id) FROM labels));

-- 9. SPRINTS
INSERT INTO sprints (id, project_id, name, goal, start_date, end_date, status, created_at) VALUES
    (1, 1, 'Sprint 1 - Foundations & Auth UI', 'Deliver responsive authentication and application shell layout.', CURRENT_DATE - 14, CURRENT_DATE - 1, 'CLOSED', NOW() - INTERVAL '15 days'),
    (2, 1, 'Sprint 2 - Issue Tracking & Kanban', 'Complete interactive Kanban board and issue filter interactions.', CURRENT_DATE, CURRENT_DATE + 14, 'ACTIVE', NOW() - INTERVAL '2 days'),
    (3, 1, 'Sprint 3 - Dashboards & Analytics', 'Executive statistics, overdue issue metrics, and reporting.', CURRENT_DATE + 15, CURRENT_DATE + 29, 'PLANNED', NOW() - INTERVAL '1 day'),
    (4, 2, 'Gateway Sprint 1 - Core Ingestion', 'Complete Redis caching and JWT validation pipeline.', CURRENT_DATE - 7, CURRENT_DATE + 7, 'ACTIVE', NOW() - INTERVAL '8 days');

SELECT setval('sprints_id_seq', (SELECT MAX(id) FROM sprints));

-- 10. ISSUES
INSERT INTO issues (id, project_id, reporter_id, assignee_id, title, description, issue_type, priority, status, due_date, created_at, updated_at, resolved_at) VALUES
    -- Project 1 Issues (TSK)
    (1, 1, 2, 3, 'Design and implement stateless JWT client interceptor', 'Configure Axios request interceptor to attach Bearer tokens and handle automatic refresh or 401 redirection.', 'STORY', 'HIGH', 'DONE', CURRENT_DATE - 3, NOW() - INTERVAL '12 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    (2, 1, 2, 4, 'Build responsive dark theme Kanban workflow board', 'Implement 5-column Kanban layout (To Do, In Progress, In Review, Done, Blocked) with badge metrics and status transitions.', 'TASK', 'CRITICAL', 'IN_PROGRESS', CURRENT_DATE + 4, NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 hours', NULL),
    (3, 1, 5, 3, 'Fix CORS preflight headers on multipart file upload', 'Uploading attachments with multipart/form-data intermittently fails preflight validation in Chrome and Firefox.', 'BUG', 'CRITICAL', 'IN_REVIEW', CURRENT_DATE + 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 hours', NULL),
    (4, 1, 2, 4, 'Implement full-text search with instant query filtering', 'Add live search input that queries issue title, description, and key without page reload.', 'STORY', 'MEDIUM', 'TO_DO', CURRENT_DATE + 10, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NULL),
    (5, 1, 5, 3, 'Resolve memory leak in unread notification badge polling', 'Component does not clear window.setInterval on unmount, causing duplicate network requests.', 'BUG', 'HIGH', 'BLOCKED', CURRENT_DATE - 2, NOW() - INTERVAL '6 days', NOW() - INTERVAL '1 day', NULL),
    (6, 1, 2, 1, 'Audit role-based UI guard on Administrative User Directory', 'Ensure only authenticated users with ROLE_ADMIN can see or route to /users.', 'TASK', 'MEDIUM', 'DONE', CURRENT_DATE - 1, NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (7, 1, 2, 6, 'Implement keyboard shortcut navigation for Kanban cards', 'Allow engineers to hit J/K to traverse issue cards and Enter to inspect details.', 'STORY', 'LOW', 'TO_DO', CURRENT_DATE + 14, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NULL),
    
    -- Project 2 Issues (GW)
    (8, 2, 1, 3, 'Optimize PostgreSQL query execution plans for issue search', 'Add composite btree index on issues(project_id, status, created_at) to accelerate dashboard summary.', 'TASK', 'HIGH', 'IN_PROGRESS', CURRENT_DATE + 3, NOW() - INTERVAL '7 days', NOW() - INTERVAL '4 hours', NULL),
    (9, 2, 1, 4, 'Implement Redis serialization for Dashboard metrics', 'Configure Jackson JSON serializer on RedisCacheManager with 10-minute TTL to relieve DB read load.', 'STORY', 'MEDIUM', 'DONE', CURRENT_DATE - 2, NOW() - INTERVAL '11 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (10, 2, 5, NULL, 'Simulate high-concurrency token expiration storm', 'Stress test JWT filter under 5,000 requests/sec with concurrent expired tokens to ensure graceful rejection.', 'TASK', 'MEDIUM', 'TO_DO', CURRENT_DATE + 8, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NULL);

SELECT setval('issues_id_seq', (SELECT MAX(id) FROM issues));

-- 11. SPRINT ISSUES
INSERT INTO sprint_issues (sprint_id, issue_id) VALUES
    (1, 1),
    (1, 6),
    (2, 2),
    (2, 3),
    (2, 4),
    (2, 5),
    (4, 8),
    (4, 9),
    (4, 10);

-- 12. ISSUE LABELS
INSERT INTO issue_labels (issue_id, label_id) VALUES
    (1, 2), -- TSK-1 -> frontend
    (1, 3), -- TSK-1 -> security
    (2, 2), -- TSK-2 -> frontend
    (2, 6), -- TSK-2 -> ui/ux
    (3, 4), -- TSK-3 -> bug
    (3, 1), -- TSK-3 -> backend
    (4, 2), -- TSK-4 -> frontend
    (5, 4), -- TSK-5 -> bug
    (5, 5), -- TSK-5 -> performance
    (8, 1), -- GW-8 -> backend
    (8, 7), -- GW-8 -> database
    (8, 5), -- GW-8 -> performance
    (9, 1), -- GW-9 -> backend
    (9, 5); -- GW-9 -> performance

-- 13. COMMENTS
INSERT INTO comments (id, issue_id, author_id, content, created_at) VALUES
    (1, 2, 2, 'Alex and Elena, please prioritize accessibility and keyboard navigation when implementing the card drag interactions.', NOW() - INTERVAL '2 days'),
    (2, 2, 4, 'Understood Sarah. Working on the column drop targets now. Column counts update dynamically via state transitions.', NOW() - INTERVAL '1 day'),
    (3, 3, 3, 'Identified the issue: Vite development proxy was omitting custom multipart content-type boundary headers. Fixing in client configuration.', NOW() - INTERVAL '6 hours'),
    (4, 3, 5, 'Verified in staging with 15MB log bundle. Looks solid now, waiting for final code review.', NOW() - INTERVAL '3 hours'),
    (5, 5, 3, 'Blocked pending clarification from DevOps on the WebSocket versus SSE migration strategy.', NOW() - INTERVAL '1 day');

SELECT setval('comments_id_seq', (SELECT MAX(id) FROM comments));

-- 14. ISSUE HISTORY (Audit Trail)
INSERT INTO issue_history (id, issue_id, changed_by, field_name, old_value, new_value, created_at) VALUES
    (1, 1, 3, 'status', 'TO_DO', 'IN_PROGRESS', NOW() - INTERVAL '10 days'),
    (2, 1, 3, 'status', 'IN_PROGRESS', 'DONE', NOW() - INTERVAL '3 days'),
    (3, 2, 4, 'status', 'TO_DO', 'IN_PROGRESS', NOW() - INTERVAL '2 days'),
    (4, 3, 5, 'status', 'TO_DO', 'IN_REVIEW', NOW() - INTERVAL '5 hours'),
    (5, 5, 3, 'status', 'IN_PROGRESS', 'BLOCKED', NOW() - INTERVAL '1 day'),
    (6, 6, 1, 'status', 'IN_PROGRESS', 'DONE', NOW() - INTERVAL '1 day');

SELECT setval('issue_history_id_seq', (SELECT MAX(id) FROM issue_history));

-- 15. NOTIFICATIONS
INSERT INTO notifications (id, recipient_id, type, title, message, read_at, created_at) VALUES
    (1, 1, 'ISSUE_ASSIGNED', 'Assigned: Audit role-based UI guard', 'Sarah Connor assigned you to issue TSK-6.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '8 days'),
    (2, 1, 'COMMENT_ADDED', 'New comment on TSK-2', 'Elena Rostova commented on Kanban workflow board.', NULL, NOW() - INTERVAL '1 day'),
    (3, 1, 'DUE_DATE_REMINDER', 'Approaching Deadline: Fix CORS preflight headers', 'Issue TSK-3 is scheduled for completion tomorrow.', NULL, NOW() - INTERVAL '4 hours'),
    (4, 3, 'ISSUE_ASSIGNED', 'Assigned: Fix CORS preflight headers', 'Marcus Vance flagged you on critical bug TSK-3.', NULL, NOW() - INTERVAL '4 days'),
    (5, 4, 'ISSUE_ASSIGNED', 'Assigned: Build responsive dark theme Kanban', 'Sarah Connor assigned you to TSK-2.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '10 days');

SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications));

COMMIT;

