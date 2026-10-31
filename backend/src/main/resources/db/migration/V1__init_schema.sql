-- TaskFlow Initial Database Schema
-- V1__init_schema.sql

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(100)  NOT NULL UNIQUE,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    full_name       VARCHAR(150)  NOT NULL,
    avatar_url      VARCHAR(255),
    enabled         BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP,
    last_login_at   TIMESTAMP
);

CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_username ON users (username);

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE roles (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(255)
);

INSERT INTO roles (name, description) VALUES
    ('ADMIN',           'Full system access'),
    ('PROJECT_MANAGER', 'Manages projects and teams'),
    ('DEVELOPER',       'Creates and updates issues'),
    ('QA',              'Creates bugs and verifies fixes'),
    ('MEMBER',          'General team member'),
    ('VIEWER',          'Read-only access');

-- ============================================================
-- USER_ROLES
-- ============================================================
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE teams (
    id           BIGSERIAL    PRIMARY KEY,
    name         VARCHAR(150) NOT NULL UNIQUE,
    description  TEXT,
    lead_user_id BIGINT       NOT NULL REFERENCES users(id),
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP
);

CREATE INDEX idx_teams_lead_user_id ON teams (lead_user_id);

-- ============================================================
-- TEAM_MEMBERS
-- ============================================================
CREATE TABLE team_members (
    id        BIGSERIAL PRIMARY KEY,
    team_id   BIGINT    NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id   BIGINT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (team_id, user_id)
);

CREATE INDEX idx_team_members_team_id ON team_members (team_id);
CREATE INDEX idx_team_members_user_id ON team_members (user_id);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE projects (
    id           BIGSERIAL   PRIMARY KEY,
    name         VARCHAR(150) NOT NULL,
    project_key  VARCHAR(20)  NOT NULL UNIQUE,
    description  TEXT,
    status       VARCHAR(30)  NOT NULL DEFAULT 'DRAFT',
    lead_user_id BIGINT       NOT NULL REFERENCES users(id),
    team_id      BIGINT       REFERENCES teams(id),
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP,
    CONSTRAINT chk_project_status CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED'))
);

CREATE INDEX idx_projects_project_key  ON projects (project_key);
CREATE INDEX idx_projects_team_id      ON projects (team_id);
CREATE INDEX idx_projects_lead_user_id ON projects (lead_user_id);
CREATE INDEX idx_projects_status       ON projects (status);

-- ============================================================
-- PROJECT_MEMBERS
-- ============================================================
CREATE TABLE project_members (
    id              BIGSERIAL   PRIMARY KEY,
    project_id      BIGINT      NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id         BIGINT      NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    role_in_project VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    joined_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, user_id)
);

CREATE INDEX idx_project_members_project_id ON project_members (project_id);
CREATE INDEX idx_project_members_user_id    ON project_members (user_id);

-- ============================================================
-- ISSUES
-- ============================================================
CREATE TABLE issues (
    id          BIGSERIAL    PRIMARY KEY,
    project_id  BIGINT       NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reporter_id BIGINT       NOT NULL REFERENCES users(id),
    assignee_id BIGINT       REFERENCES users(id),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    issue_type  VARCHAR(30)  NOT NULL,
    priority    VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    status      VARCHAR(30)  NOT NULL DEFAULT 'TO_DO',
    due_date    DATE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    resolved_at TIMESTAMP,
    CONSTRAINT chk_issue_type   CHECK (issue_type IN ('STORY', 'TASK', 'BUG', 'EPIC', 'SUB_TASK')),
    CONSTRAINT chk_issue_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_issue_status CHECK (status IN ('TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'))
);

CREATE INDEX idx_issues_project_id  ON issues (project_id);
CREATE INDEX idx_issues_assignee_id ON issues (assignee_id);
CREATE INDEX idx_issues_reporter_id ON issues (reporter_id);
CREATE INDEX idx_issues_status      ON issues (status);
CREATE INDEX idx_issues_due_date    ON issues (due_date);
CREATE INDEX idx_issues_created_at  ON issues (created_at);
CREATE INDEX idx_issues_project_status ON issues (project_id, status);

-- ============================================================
-- LABELS
-- ============================================================
CREATE TABLE labels (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    color      VARCHAR(20),
    created_by BIGINT       REFERENCES users(id)
);

-- ============================================================
-- ISSUE_LABELS
-- ============================================================
CREATE TABLE issue_labels (
    issue_id BIGINT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    label_id BIGINT NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY (issue_id, label_id)
);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE comments (
    id         BIGSERIAL PRIMARY KEY,
    issue_id   BIGINT    NOT NULL REFERENCES issues(id)  ON DELETE CASCADE,
    author_id  BIGINT    NOT NULL REFERENCES users(id),
    content    TEXT      NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX idx_comments_issue_id  ON comments (issue_id);
CREATE INDEX idx_comments_author_id ON comments (author_id);

-- ============================================================
-- ATTACHMENTS
-- ============================================================
CREATE TABLE attachments (
    id                 BIGSERIAL    PRIMARY KEY,
    issue_id           BIGINT       NOT NULL REFERENCES issues(id)   ON DELETE CASCADE,
    comment_id         BIGINT       REFERENCES comments(id)          ON DELETE SET NULL,
    uploaded_by        BIGINT       NOT NULL REFERENCES users(id),
    file_name          VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_path          VARCHAR(500) NOT NULL,
    file_size          BIGINT       NOT NULL,
    mime_type          VARCHAR(100),
    created_at         TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_issue_id   ON attachments (issue_id);
CREATE INDEX idx_attachments_comment_id ON attachments (comment_id);

-- ============================================================
-- ISSUE_HISTORY
-- ============================================================
CREATE TABLE issue_history (
    id         BIGSERIAL    PRIMARY KEY,
    issue_id   BIGINT       NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    changed_by BIGINT       NOT NULL REFERENCES users(id),
    field_name VARCHAR(100) NOT NULL,
    old_value  TEXT,
    new_value  TEXT,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_issue_history_issue_id   ON issue_history (issue_id);
CREATE INDEX idx_issue_history_changed_by ON issue_history (changed_by);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id           BIGSERIAL    PRIMARY KEY,
    recipient_id BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type         VARCHAR(50)  NOT NULL,
    title        VARCHAR(200) NOT NULL,
    message      TEXT         NOT NULL,
    read_at      TIMESTAMP,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_notification_type CHECK (
        type IN ('ISSUE_ASSIGNED', 'ISSUE_UPDATED', 'COMMENT_ADDED', 'DUE_DATE_REMINDER', 'PROJECT_UPDATE')
    )
);

CREATE INDEX idx_notifications_recipient_id ON notifications (recipient_id);
CREATE INDEX idx_notifications_created_at   ON notifications (created_at);

-- ============================================================
-- SPRINTS
-- ============================================================
CREATE TABLE sprints (
    id         BIGSERIAL    PRIMARY KEY,
    project_id BIGINT       NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name       VARCHAR(150) NOT NULL,
    goal       TEXT,
    start_date DATE         NOT NULL,
    end_date   DATE         NOT NULL,
    status     VARCHAR(30)  NOT NULL DEFAULT 'PLANNED',
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_sprint_status CHECK (status IN ('PLANNED', 'ACTIVE', 'CLOSED'))
);

CREATE INDEX idx_sprints_project_id ON sprints (project_id);

-- ============================================================
-- SPRINT_ISSUES
-- ============================================================
CREATE TABLE sprint_issues (
    sprint_id BIGINT NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
    issue_id  BIGINT NOT NULL REFERENCES issues(id)  ON DELETE CASCADE,
    PRIMARY KEY (sprint_id, issue_id)
);

