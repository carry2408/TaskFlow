# Database Design for TaskFlow

## 1. Overview

TaskFlow is a Jira-like issue and project tracking system. The database is designed to support:
- user authentication and role management
- team and project structure
- issue creation, tracking, and updates
- comments, attachments, audit history, and notifications
- project dashboards and reporting

The design prioritizes:
- relational integrity
- query performance for dashboards and issue filters
- extensibility for future sprint and workflow features

---

## 2. Core Design Principles

- Use a relational database such as PostgreSQL.
- Store each domain entity in its own table.
- Use foreign keys to enforce relationships.
- Add indexes on frequently filtered fields.
- Keep audit fields for traceability.
- Use UUID or BIGINT as primary keys.
- Keep file metadata in DB and actual files in object storage or local storage.

---

## 3. Entity List

1. users
2. roles
3. user_roles
4. teams
5. team_members
6. projects
7. project_members
8. issues
9. labels
10. issue_labels
11. comments
12. attachments
13. issue_history
14. notifications
15. sprints
16. sprint_issues

---

## 4. Table Definitions

## 4.1 users

Purpose:
Store application users and authentication data.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT / UUID | PK | User identifier |
| username | VARCHAR(100) | UNIQUE, NOT NULL | Login username |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Email address |
| password_hash | VARCHAR(255) | NOT NULL | Encrypted password |
| full_name | VARCHAR(150) | NOT NULL | Display name |
| avatar_url | VARCHAR(255) | NULL | Profile image URL |
| enabled | BOOLEAN | NOT NULL DEFAULT TRUE | Account active status |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NULL | Last update timestamp |
| last_login_at | TIMESTAMP | NULL | Last login |

Indexes:
- idx_users_email on email
- idx_users_username on username

---

## 4.2 roles

Purpose:
Store available roles in the application.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | Role identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Role name |
| description | VARCHAR(255) | NULL | Role explanation |

Possible values:
- ADMIN
- PROJECT_MANAGER
- DEVELOPER
- QA
- MEMBER
- VIEWER

---

## 4.3 user_roles

Purpose:
Many-to-many mapping between users and roles.

| Column | Type | Constraints | Description |
|---|---|---|---|
| user_id | BIGINT | FK -> users.id | User ID |
| role_id | BIGINT | FK -> roles.id | Role ID |

Primary key:
- (user_id, role_id)

---

## 4.4 teams

Purpose:
Represent groups or departments.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | Team identifier |
| name | VARCHAR(150) | UNIQUE, NOT NULL | Team name |
| description | TEXT | NULL | Team description |
| lead_user_id | BIGINT | FK -> users.id, NOT NULL | Team lead |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NULL | Last modification |

Indexes:
- idx_teams_lead_user_id on lead_user_id

---

## 4.5 team_members

Purpose:
Represent members belonging to a team.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | Membership record ID |
| team_id | BIGINT | FK -> teams.id, NOT NULL | Team ID |
| user_id | BIGINT | FK -> users.id, NOT NULL | User ID |
| joined_at | TIMESTAMP | NOT NULL | Join timestamp |

Unique constraint:
- (team_id, user_id)

---

## 4.6 projects

Purpose:
Represent a project container for work and issues.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | Project identifier |
| name | VARCHAR(150) | NOT NULL | Project name |
| project_key | VARCHAR(20) | UNIQUE, NOT NULL | Short code such as TSK |
| description | TEXT | NULL | Project details |
| status | VARCHAR(30) | NOT NULL | Project status |
| lead_user_id | BIGINT | FK -> users.id, NOT NULL | Project lead |
| team_id | BIGINT | FK -> teams.id, NULL | Related team |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NULL | Last modification |

Possible status values:
- DRAFT
- ACTIVE
- ARCHIVED

Indexes:
- idx_projects_project_key on project_key
- idx_projects_team_id on team_id
- idx_projects_lead_user_id on lead_user_id

---

## 4.7 project_members

Purpose:
Users assigned to a project.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | Record ID |
| project_id | BIGINT | FK -> projects.id, NOT NULL | Project ID |
| user_id | BIGINT | FK -> users.id, NOT NULL | User ID |
| role_in_project | VARCHAR(50) | NOT NULL | Role within project |
| joined_at | TIMESTAMP | NOT NULL | Joined timestamp |

Unique constraint:
- (project_id, user_id)

Example values for role_in_project:
- OWNER
- MANAGER
- DEVELOPER
- QA
- VIEWER

---

## 4.8 issues

Purpose:
Core work item entity.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | Issue identifier |
| project_id | BIGINT | FK -> projects.id, NOT NULL | Parent project |
| reporter_id | BIGINT | FK -> users.id, NOT NULL | Issue creator |
| assignee_id | BIGINT | FK -> users.id, NULL | Current assignee |
| title | VARCHAR(255) | NOT NULL | Issue title |
| description | TEXT | NULL | Detailed description |
| issue_type | VARCHAR(30) | NOT NULL | Story, Bug, Task, etc. |
| priority | VARCHAR(20) | NOT NULL | Low, Medium, High, Critical |
| status | VARCHAR(30) | NOT NULL | To Do, In Progress, Done |
| due_date | DATE | NULL | Due date |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NULL | Last updated |
| resolved_at | TIMESTAMP | NULL | Resolution timestamp |

Possible values:
- issue_type: STORY, TASK, BUG, EPIC, SUB_TASK
- priority: LOW, MEDIUM, HIGH, CRITICAL
- status: TO_DO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED

Indexes:
- idx_issues_project_id on project_id
- idx_issues_assignee_id on assignee_id
- idx_issues_reporter_id on reporter_id
- idx_issues_status on status
- idx_issues_due_date on due_date
- idx_issues_created_at on created_at

---

## 4.9 labels

Purpose:
Reusable labels for classification.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | Label ID |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Label name |
| color | VARCHAR(20) | NULL | UI badge color |
| created_by | BIGINT | FK -> users.id, NULL | Creator |

---

## 4.10 issue_labels

Purpose:
Many-to-many mapping between issues and labels.

| Column | Type | Constraints | Description |
|---|---|---|---|
| issue_id | BIGINT | FK -> issues.id, NOT NULL | Issue ID |
| label_id | BIGINT | FK -> labels.id, NOT NULL | Label ID |

Primary key:
- (issue_id, label_id)

---

## 4.11 comments

Purpose:
Issue discussion comments.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | Comment ID |
| issue_id | BIGINT | FK -> issues.id, NOT NULL | Related issue |
| author_id | BIGINT | FK -> users.id, NOT NULL | Comment author |
| content | TEXT | NOT NULL | Comment body |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NULL | Last update |

Indexes:
- idx_comments_issue_id on issue_id
- idx_comments_author_id on author_id

---

## 4.12 attachments

Purpose:
Store uploaded file metadata for issues and comments.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | Attachment ID |
| issue_id | BIGINT | FK -> issues.id, NOT NULL | Issue reference |
| comment_id | BIGINT | FK -> comments.id, NULL | Comment reference |
| uploaded_by | BIGINT | FK -> users.id, NOT NULL | Uploading user |
| file_name | VARCHAR(255) | NOT NULL | Saved filename |
| original_file_name | VARCHAR(255) | NOT NULL | Client-side file name |
| file_path | VARCHAR(500) | NOT NULL | Storage path |
| file_size | BIGINT | NOT NULL | File size in bytes |
| mime_type | VARCHAR(100) | NULL | MIME type |
| created_at | TIMESTAMP | NOT NULL | Upload timestamp |

Indexes:
- idx_attachments_issue_id on issue_id
- idx_attachments_comment_id on comment_id

---

## 4.13 issue_history

Purpose:
Audit log for issue modification history.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | History entry ID |
| issue_id | BIGINT | FK -> issues.id, NOT NULL | Related issue |
| changed_by | BIGINT | FK -> users.id, NOT NULL | User who changed it |
| field_name | VARCHAR(100) | NOT NULL | Field name changed |
| old_value | TEXT | NULL | Previous value |
| new_value | TEXT | NULL | New value |
| created_at | TIMESTAMP | NOT NULL | Change timestamp |

Indexes:
- idx_issue_history_issue_id on issue_id
- idx_issue_history_changed_by on changed_by

---

## 4.14 notifications

Purpose:
In-app or email notification records.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | Notification ID |
| recipient_id | BIGINT | FK -> users.id, NOT NULL | Target user |
| type | VARCHAR(50) | NOT NULL | Notification type |
| title | VARCHAR(200) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification content |
| read_at | TIMESTAMP | NULL | Read timestamp |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

Possible notification type values:
- ISSUE_ASSIGNED
- ISSUE_UPDATED
- COMMENT_ADDED
- DUE_DATE_REMINDER
- PROJECT_UPDATE

Indexes:
- idx_notifications_recipient_id on recipient_id
- idx_notifications_created_at on created_at

---

## 4.15 sprints

Purpose:
Support sprint planning and iteration tracking.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | BIGINT | PK | Sprint ID |
| project_id | BIGINT | FK -> projects.id, NOT NULL | Parent project |
| name | VARCHAR(150) | NOT NULL | Sprint name |
| goal | TEXT | NULL | Sprint objective |
| start_date | DATE | NOT NULL | Sprint start |
| end_date | DATE | NOT NULL | Sprint end |
| status | VARCHAR(30) | NOT NULL | Planned, Active, Closed |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

Possible status values:
- PLANNED
- ACTIVE
- CLOSED

---

## 4.16 sprint_issues

Purpose:
Relationship between issues and sprints.

| Column | Type | Constraints | Description |
|---|---|---|---|
| sprint_id | BIGINT | FK -> sprints.id, NOT NULL | Sprint ID |
| issue_id | BIGINT | FK -> issues.id, NOT NULL | Issue ID |

Primary key:
- (sprint_id, issue_id)

---

## 5. Relationship Summary

- users to roles: many-to-many
- teams to users: many-to-many via team_members
- projects to users: many-to-many via project_members
- projects to issues: one-to-many
- issues to comments: one-to-many
- issues to attachments: one-to-many
- issues to issue_history: one-to-many
- issues to labels: many-to-many
- users to notifications: one-to-many
- projects to sprints: one-to-many
- sprints to issues: many-to-many

---

## 6. Index Strategy

Critical indexes:
- users.email
- users.username
- projects.project_key
- issues.project_id
- issues.assignee_id
- issues.status
- issues.due_date
- comments.issue_id
- notifications.recipient_id
- issue_history.issue_id

Additional indexes:
- team_members(team_id, user_id)
- project_members(project_id, user_id)
- sprint_issues(sprint_id, issue_id)

---

## 7. Recommended Data Types

For PostgreSQL:
- use BIGINT for identifiers
- use VARCHAR for short strings
- use TEXT for long descriptions
- use TIMESTAMP WITH TIME ZONE if timezone consistency is required
- use DATE for due dates and sprint dates

---

## 8. Normalization Level

The schema is normalized to:
- avoid duplication of user, team, project, and issue metadata
- keep relationships explicit
- support flexible role assignments and dashboard queries

---

## 9. Notes

- Store large binary files outside the database when possible.
- Use soft delete if you want future archival without data loss.
- Add `created_at` and `updated_at` to all mutable root entities.
- Use audit trail tables for issue field history.
- Keep `notifications` separate from `issue_history` because they serve different purposes.

---

## 10. Minimum Viable Schema

For the initial MVP, the most essential tables are:

- users
- roles
- user_roles
- teams
- team_members
- projects
- project_members
- issues
- comments
- issue_history
- notifications

Optional advanced tables:
- labels
- issue_labels
- attachments
- sprints
- sprint_issues

This is the recommended schema for a strong Jira-like Spring Boot project.
