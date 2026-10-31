# TaskFlow - Jira-like Project Management System

## 1. Project Overview

TaskFlow is a project and issue tracking platform for software and IT teams. It supports team collaboration, sprint planning, issue lifecycle management, role-based access control, and dashboard reporting.

The application should enable:
- project creation and team assignment
- issue tracking across workflows
- task prioritization and assignment
- comments, activity history, and file attachments
- project-level and team-level reporting
- secure access for different user roles

## 2. Business Objective

The system should provide a simplified Jira-like experience with clear workflows and scalable backend architecture. It must support:
- structured issue management
- collaboration between engineering, QA, and management
- multi-project visibility
- traceable changes and audit history

## 3. Target Users

- Admin
- Project Manager
- Developer
- QA Engineer
- Team Member
- Viewer

## 4. Core Functional Requirements

### 4.1 Authentication and User Management
- Users must register and log in securely.
- Passwords must be encrypted.
- Users must be able to update profile information.
- Users must have one or more roles.
- User status must support active/inactive states.

### 4.2 Team Management
- Admins or managers must create teams.
- Teams must contain multiple members.
- Each team must have a lead.
- Team members must be assigned to projects.

### 4.3 Project Management
- Users must create projects.
- Each project must have:
  - name
  - key
  - description
  - status
  - lead
  - team association
- Project members must be assigned explicitly.
- Projects must support filtering by status and team.

### 4.4 Issue Management
- Users must create issues under projects.
- Supported issue types:
  - Story
  - Task
  - Bug
  - Epic
  - Sub-task
- Each issue must have:
  - title
  - description
  - type
  - priority
  - status
  - reporter
  - assignee
  - due date
  - project
- Issues must support:
  - status transition
  - reassignment
  - comments
  - labels
  - attachments
  - related issues

### 4.5 Workflow and Status Handling
- Issue lifecycle must support:
  - To Do
  - In Progress
  - In Review
  - Done
  - Blocked
- Status transitions must be controlled by role and project rules.
- Status history must be stored for traceability.

### 4.6 Comments and Activity Tracking
- Users must add comments to issues.
- Each comment must store author and timestamp.
- Issue change history must be retained.
- Activity logs must capture:
  - issue creation
  - assignment changes
  - status changes
  - priority changes
  - due date updates
  - comment creation

### 4.7 Search and Filtering
- Users must search issues by:
  - title
  - description
  - type
  - status
  - assignee
  - project
  - label
- Filters must support:
  - assignee
  - priority
  - status
  - project
  - date range

### 4.8 Dashboard and Reporting
- Dashboard must show:
  - total open issues
  - issues by status
  - issues by assignee
  - overdue issues
  - project progress
  - team workload
- Reports should summarize:
  - project health
  - issue resolution trends
  - team productivity
  - backlog volume

### 4.9 Notifications
- Users must receive notifications for:
  - issue assignment
  - issue status change
  - mention in comment
  - due date reminders
  - project updates
- Notification channels may include in-app and email.

### 4.10 Attachments
- Users may upload files to issues and comments.
- Files must be stored with metadata:
  - file name
  - size
  - upload time
  - uploaded by
  - issue association

## 5. Role-Based Permissions

### Admin
- create and delete teams
- manage users
- create projects
- manage global settings
- access all projects

### Project Manager
- create and manage project details
- assign users to projects
- manage issue workflows
- view team dashboard

### Developer
- create and update assigned issues
- comment on issues
- move issues through workflow based on permission

### QA Engineer
- create bug issues
- update issue status
- verify fix status

### Team Member
- view assigned projects
- create and update issues
- comment on issues

### Viewer
- read-only access to allowed projects

## 6. Non-Functional Requirements

### 6.1 Security
- use JWT-based authentication
- use role-based access control
- validate all incoming input
- enforce secure password storage
- protect APIs against common attacks

### 6.2 Performance
- response time for list APIs should be acceptable under moderate load
- search and filter APIs must support pagination
- database queries must avoid N+1 issues
- support caching for frequently queried data

### 6.3 Scalability
- modular backend design
- support future service split into modules or microservices
- database structure should support growth in users, projects, and issues

### 6.4 Reliability
- handle database failures and validation errors gracefully
- provide structured error responses
- support retry-safe workflows where required

### 6.5 Maintainability
- clear package layering
- domain-driven design for project modules
- reusable service logic
- clean DTO boundaries

### 6.6 Observability
- structured logging
- request tracing
- metrics for issue creation, updates, and failures
- health endpoints for service monitoring

## 7. Technical Constraints

- Java 21 or 17
- Spring Boot 3.x
- Spring Security
- Spring Data JPA
- PostgreSQL
- Redis for cache and session optimization
- Swagger/OpenAPI for API documentation
- Maven or Gradle
- Docker for local environment setup

## 8. Out of Scope

The initial version should not include:
- enterprise SSO
- complex BI dashboards
- real-time collaboration via WebSockets
- advanced analytics engine
- cross-tenant multi-organization billing
- full plugin marketplace

## 9. Acceptance Criteria

The project is complete when:
- users can register and authenticate
- teams and projects are created and managed
- issues can be created, assigned, and updated
- workflows and comments work correctly
- permissions enforce access rules
- dashboard metrics show project status
- APIs are documented and testable
- application runs through Docker Compose or local setup

## 10. Suggested MVP Scope

Phase 1:
- authentication
- user and team management
- project creation
- issue CRUD
- workflow states
- comments
- dashboard summary

Phase 2:
- search/filter
- attachments
- notifications
- sprint concept
- reporting

Phase 3:
- advanced analytics
- activity streams
- integrations
- optimization and scaling

## 11. Summary

TaskFlow is a practical, production-like Jira-inspired system suitable for a strong Spring Boot portfolio project. It balances business realism, technical depth, and implementation scope while remaining achievable in a staged roadmap.

```markdown name=02-database-schema.md
# Database Schema Design for TaskFlow

## 1. Design Principles

- each entity must have a primary key
- foreign keys must enforce referential integrity
- statuses and priorities should use enums or lookup tables
- audit fields should be stored on entities
- indexes must support project and issue lookup patterns
- comments and activity history must remain append-only for traceability

## 2. Core Entities

### 2.1 users
Purpose: store authentication and profile data.

Required fields:
- id: UUID or BIGINT
- username: unique
- email: unique
- password_hash
- full_name
- avatar_url
- enabled
- created_at
- updated_at
- last_login_at

Notes:
- use UUID if you want portability and easier data migration
- add index on email and username

### 2.2 roles
Purpose: mapping for application roles.

Required fields:
- id
- name
- description

Example values:
- ADMIN
- PROJECT_MANAGER
- DEVELOPER
- QA
- MEMBER
- VIEWER

### 2.3 user_roles
Purpose: many-to-many mapping between users and roles.

Required fields:
- user_id
- role_id

Constraints:
- composite primary key on user_id + role_id

### 2.4 teams
Purpose: represent project groups or departments.

Required fields:
- id
- name
- description
- lead_user_id
- created_at
- updated_at

Foreign key:
- lead_user_id -> users.id

### 2.5 team_members
Purpose: many-to-many user-to-team mapping.

Required fields:
- id
- team_id
- user_id
- joined_at

Constraints:
- unique(team_id, user_id)

### 2.6 projects
Purpose: represent the project container.

Required fields:
- id
- name
- project_key
- description
- status
- lead_user_id
- team_id
- created_at
- updated_at

Foreign keys:
- lead_user_id -> users.id
- team_id -> teams.id

Indexes:
- project_key unique
- team_id
- lead_user_id

### 2.7 project_members
Purpose: user membership in a project.

Required fields:
- id
- project_id
- user_id
- role_in_project
- joined_at

Constraints:
- unique(project_id, user_id)

### 2.8 issues
Purpose: core ticket/task entity.

Required fields:
- id
- project_id
- reporter_id
- assignee_id
- title
- description
- issue_type
- priority
- status
- due_date
- created_at
- updated_at
- resolved_at

Foreign keys:
- project_id -> projects.id
- reporter_id -> users.id
- assignee_id -> users.id

Indexes:
- project_id + status
- assignee_id
- reporter_id
- due_date
- created_at

### 2.9 issue_labels
Purpose: labels assigned to issues.

Required fields:
- id
- name
- color
- created_by

### 2.10 issue_label_mapping
Purpose: join table between issues and labels.

Required fields:
- issue_id
- label_id

Constraints:
- composite primary key on issue_id + label_id

### 2.11 comments
Purpose: issue discussion thread.

Required fields:
- id
- issue_id
- author_id
- content
- created_at
- updated_at

Foreign keys:
- issue_id -> issues.id
- author_id -> users.id

### 2.12 attachments
Purpose: uploaded files associated with issues or comments.

Required fields:
- id
- issue_id
- comment_id
- uploaded_by
- file_name
- original_file_name
- file_path
- file_size
- mime_type
- created_at

Foreign keys:
- issue_id -> issues.id
- comment_id -> comments.id
- uploaded_by -> users.id

### 2.13 issue_history
Purpose: audit trail for issue changes.

Required fields:
- id
- issue_id
- changed_by
- field_name
- old_value
- new_value
- created_at

Foreign keys:
- issue_id -> issues.id
- changed_by -> users.id

### 2.14 notifications
Purpose: user-facing alerts.

Required fields:
- id
- recipient_id
- type
- title
- message
- read_at
- created_at

Foreign keys:
- recipient_id -> users.id

### 2.15 sprints
Purpose: sprint planning support.

Required fields:
- id
- project_id
- name
- goal
- start_date
- end_date
- status
- created_at

Foreign keys:
- project_id -> projects.id

### 2.16 sprint_issues
Purpose: relationship between issues and sprints.

Required fields:
- sprint_id
- issue_id

Constraints:
- composite primary key on sprint_id + issue_id

## 3. Enum and Lookup Values

### Issue Type
- STORY
- TASK
- BUG
- EPIC
- SUB_TASK

### Priority
- LOW
- MEDIUM
- HIGH
- CRITICAL

### Issue Status
- TO_DO
- IN_PROGRESS
- IN_REVIEW
- DONE
- BLOCKED

### Project Status
- ACTIVE
- ARCHIVED
- DRAFT

## 4. Relationships Summary

- user -> many roles
- team -> many members
- project -> many members
- project -> many issues
- issue -> many comments
- issue -> many attachments
- issue -> many issue history entries
- issue -> many labels
- sprint -> many issues
- user -> many notifications

## 5. Index Recommendations

Add indexes for:
- users.email
- users.username
- projects.project_key
- projects.team_id
- issues.project_id
- issues.assignee_id
- issues.status
- issues.due_date
- comments.issue_id
- notifications.recipient_id
- issue_history.issue_id

## 6. Schema Notes

- use UUIDs for distributed-friendly IDs
- use `TIMESTAMP WITH TIME ZONE` where supported
- enforce `NOT NULL` on essential fields
- add soft-delete support if required later
- keep audit fields in each core entity
- do not store large files in DB; store paths or object storage references

## 7. Final Recommended Core Tables

Minimum viable schema:
- users
- roles
- user_roles
- teams
- team_members
- projects
- project_members
- issues
- comments
- attachments
- issue_history
- notifications

Optional:
- labels
- issue_label_mapping
- sprints
- sprint_issues

```markdown name=03-folder-structure.md
# Folder Structure for TaskFlow

## 1. Proposed Project Layout

```text
taskflow/
├── pom.xml
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── taskflow/
│   │   │           ├── TaskFlowApplication.java
│   │   │           ├── config/
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   ├── OpenApiConfig.java
│   │   │           │   ├── JwtAuthenticationFilter.java
│   │   │           │   └── AppProperties.java
│   │   │           ├── constants/
│   │   │           │   ├── AppConstants.java
│   │   │           │   ├── ErrorMessages.java
│   │   │           │   └── Roles.java
│   │   │           ├── controller/
│   │   │           │   ├── AuthController.java
│   │   │           │   ├── UserController.java
│   │   │           │   ├── TeamController.java
│   │   │           │   ├── ProjectController.java
│   │   │           │   ├── IssueController.java
│   │   │           │   ├── CommentController.java
│   │   │           │   └── DashboardController.java
│   │   │           ├── dto/
│   │   │           │   ├── auth/
│   │   │           │   │   ├── LoginRequest.java
│   │   │           │   │   ├── RegisterRequest.java
│   │   │           │   │   └── AuthResponse.java
│   │   │           │   ├── user/
│   │   │           │   │   ├── UserDto.java
│   │   │           │   │   └── UpdateUserRequest.java
│   │   │           │   ├── team/
│   │   │           │   │   ├── TeamDto.java
│   │   │           │   │   └── CreateTeamRequest.java
│   │   │           │   ├── project/
│   │   │           │   │   ├── ProjectDto.java
│   │   │           │   │   └── CreateProjectRequest.java
│   │   │           │   ├── issue/
│   │   │           │   │   ├── IssueDto.java
│   │   │           │   │   ├── CreateIssueRequest.java
│   │   │           │   │   ├── UpdateIssueRequest.java
│   │   │           │   │   └── IssueFilterRequest.java
│   │   │           │   └── comment/
│   │   │           │       ├── CommentDto.java
│   │   │           │       └── CreateCommentRequest.java
│   │   │           ├── entity/
│   │   │           │   ├── User.java
│   │   │           │   ├── Role.java
│   │   │           │   ├── Team.java
│   │   │           │   ├── Project.java
│   │   │           │   ├── Issue.java
│   │   │           │   ├── Comment.java
│   │   │           │   ├── Attachment.java
│   │   │           │   ├── Notification.java
│   │   │           │   └── IssueHistory.java
│   │   │           ├── enums/
│   │   │           │   ├── IssueType.java
│   │   │           │   ├── IssueStatus.java
│   │   │           │   ├── Priority.java
│   │   │           │   └── ProjectStatus.java
│   │   │           ├── exception/
│   │   │           │   ├── ApiException.java
│   │   │           │   ├── GlobalExceptionHandler.java
│   │   │           │   └── ResourceNotFoundException.java
│   │   │           ├── mapper/
│   │   │           │   ├── UserMapper.java
│   │   │           │   ├── TeamMapper.java
│   │   │           │   ├── ProjectMapper.java
│   │   │           │   ├── IssueMapper.java
│   │   │           │   └── CommentMapper.java
│   │   │           ├── repository/
│   │   │           │   ├── UserRepository.java
│   │   │           │   ├── RoleRepository.java
│   │   │           │   ├── TeamRepository.java
│   │   │           │   ├── ProjectRepository.java
│   │   │           │   ├── IssueRepository.java
│   │   │           │   ├── CommentRepository.java
│   │   │           │   ├── AttachmentRepository.java
│   │   │           │   ├── NotificationRepository.java
│   │   │           │   └── IssueHistoryRepository.java
│   │   │           ├── security/
│   │   │           │   ├── JwtTokenProvider.java
│   │   │           │   ├── CustomUserDetailsService.java
│   │   │           │   └── UserPrincipal.java
│   │   │           ├── service/
│   │   │           │   ├── AuthService.java
│   │   │           │   ├── UserService.java
│   │   │           │   ├── TeamService.java
│   │   │           │   ├── ProjectService.java
│   │   │           │   ├── IssueService.java
│   │   │           │   ├── CommentService.java
│   │   │           │   ├── NotificationService.java
│   │   │           │   └── DashboardService.java
│   │   │           ├── util/
│   │   │           │   ├── JwtUtil.java
│   │   │           │   ├── DateUtil.java
│   │   │           │   └── ProjectKeyGenerator.java
│   │   │           ├── validation/
│   │   │           │   ├── ValidIssueStatus.java
│   │   │           │   └── ValidProjectKey.java
│   │   │           └── event/
│   │   │               ├── IssueCreatedEvent.java
│   │   │               ├── IssueUpdatedEvent.java
│   │   │               └── NotificationEvent.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/
│   │           └── migration/
│   │               └── V1__init_schema.sql
│   └── test/
│       └── java/
│           └── com/
│               └── taskflow/
│                   ├── controller/
│                   ├── service/
│                   └── repository/