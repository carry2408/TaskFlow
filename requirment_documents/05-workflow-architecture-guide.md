# TaskFlow — Complete End-to-End System Architecture & Onboarding Guide

> **Target Audience:** Any new engineer, contributor, or technical evaluator onboarding to the TaskFlow project.  
> **Goal:** Understand the system 0 to 100% across Infrastructure, Database, Backend, Security, Caching, and Frontend layers.

---

## 1. High-Level Architecture

TaskFlow is an enterprise Jira-like project management platform built as a clean, decoupled two-tier client-server application backed by containerized database and cache services:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (PORT 5173)                           │
│  React 18 + Vite + Tailwind CSS (Enterprise Dark UI) + Axios          │
│  - AuthContext (JWT bearer management in localStorage)                 │
│  - App Shell: Sidebar, TopNav, Global Search, Notification Bell        │
│  - Pages: Dashboard, Projects, Issues, Kanban Board, Sprints, Teams   │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ HTTP / JSON via Vite Reverse Proxy (/api/*)
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND API (PORT 8080)                         │
│  Java 21 + Spring Boot 3.3.5                                          │
│  - Security: Spring Security 6, Stateless JWT Filter, BCrypt           │
│  - Controller Layer: REST Endpoints with OpenAPI / Swagger 3 Docs      │
│  - Service Layer: Business rules, transactions (@Transactional)        │
│  - Repository Layer: Spring Data JPA + Specifications + JdbcTemplate   │
│  - Flyway Engine: Auto-applies versioned SQL migrations on startup     │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │ JDBC Pool (Port 5433)           │ Redis (Port 6379)
                   ▼                                 ▼
┌─────────────────────────────────────┐   ┌──────────────────────────────┐
│       POSTGRESQL 16 (DOCKER)        │   │        REDIS 7 (DOCKER)      │
│  16 Normalized Relational Tables    │   │  Spring Cache Manager        │
│  Indexes, Foreign Keys, Audit Logs  │   │  Jackson JSON Serializer     │
└─────────────────────────────────────┘   └──────────────────────────────┘
```

---

## 2. Infrastructure & Docker Setup

All external services run in lightweight Docker containers orchestrated by `backend/docker-compose.yml`.

### Port Allocations
| Service | Container Name | Internal Port | Host Port | Purpose |
|---|---|---|---|---|
| **PostgreSQL 16** | `taskflow_postgres` | `5432` | **`5433`** | Relational primary data store *(mapped to 5433 to prevent conflicts with local Windows PostgreSQL installations)* |
| **Redis 7** | `taskflow_redis` | `6379` | **`6379`** | Cache manager for dashboard metrics & session speedups |
| **Spring Boot API**| Host process | `8080` | `8080` | REST API |
| **Vite Client** | Host process | `5173` | `5173` | React web application |

### Starting the Infrastructure
```bash
cd backend
docker-compose up -d
```
Docker automatically creates two persistent named volumes:
- `backend_taskflow_postgres_data`
- `backend_taskflow_redis_data`

---

## 3. Database Layer & Schema Design

Database migrations are strictly version-controlled using **Flyway** in `backend/src/main/resources/db/migration/`. When Spring Boot boots up, Flyway checks the `flyway_schema_history` table and applies pending migrations automatically.

### Migration Files
1. `V1__init_schema.sql`: Core schema defining 16 tables with constraints and indexes.
2. `V2__seed_admin.sql`: Default administrator seed.

### Entity Relationship & Tables

```
                    ┌───────────┐
                    │   roles   │
                    └─────┬─────┘
                          │ (M:N)
┌───────────┐ 1:M   ┌─────┴──────┐ 1:M   ┌────────────────┐
│   teams   ├───────┤   users    ├───────┤ notifications  │
└─────┬─────┘       └─────┬──────┘       └────────────────┘
      │ (1:M)             │ (1:M)
┌─────┴─────┐             │
│ projects  ├─────────────┼──────────────────────────────┐
└─────┬─────┘             │                              │
      │ (1:M)             ▼ (1:M)                        ▼ (1:M)
┌─────┴─────┐ 1:M   ┌───────────┐ 1:M   ┌───────────┐  ┌─────────────┐
│  sprints  ├───────┤  issues   ├───────┤ comments  │  │ attachments │
└───────────┘       └─────┬─────┘       └───────────┘  └─────────────┘
                          │ (1:M)
                    ┌─────┴──────────┐
                    │  issue_history │ (Audit Trail)
                    └────────────────┘
```

#### Table Definitions:
1. **`users`**: Login credentials (`password_hash` using BCrypt), profile data, `enabled` flag, timestamps.
2. **`roles`**: System roles (`ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `QA`, `MEMBER`, `VIEWER`).
3. **`user_roles`**: Many-to-many junction connecting users to their application roles.
4. **`teams`**: Departmental groups lead by a `lead_user_id`.
5. **`team_members`**: Membership table for users within teams.
6. **`projects`**: Top-level containers with unique `project_key` (e.g. `TSK`, `GW`), `status` (`DRAFT`, `ACTIVE`, `ARCHIVED`), assigned lead, and optional team.
7. **`project_members`**: Explicit project-level permissions (`OWNER`, `MANAGER`, `DEVELOPER`, `QA`, `VIEWER`).
8. **`issues`**: The fundamental work unit (Task, Story, Bug, Epic, Sub-task). Tracks status (`TO_DO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `BLOCKED`), priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), reporter, assignee, and dates.
9. **`labels`** & **`issue_labels`**: Global categorization tags mapped many-to-many with issues.
10. **`comments`**: Real-time conversation thread under an issue.
11. **`attachments`**: Metadata for uploaded files (stored in `backend/uploads/`).
12. **`issue_history`**: Append-only immutable audit trail that records every field modification (`changed_by`, `field_name`, `old_value`, `new_value`, `created_at`).
13. **`sprints`** & **`sprint_issues`**: Iteration lifecycle (`PLANNED`, `ACTIVE`, `CLOSED`) and their scoped issues.
14. **`notifications`**: Targeted user alerts (`ISSUE_ASSIGNED`, `ISSUE_UPDATED`, `COMMENT_ADDED`, `DUE_DATE_REMINDER`, `PROJECT_UPDATE`).

---

## 4. Backend Architecture (Spring Boot 3.3.5, Java 21)

The backend follows clean layered architecture principles. Controllers remain thin, business logic lives inside Services with transactional boundaries, and data access is isolated to Repositories.

### Package Structure (`com.vr.taskflow`)
```
com.vr.taskflow/
├── config/         # SecurityConfig, RedisConfig, OpenApiConfig
├── constants/      # AppConstants (pagination defaults), ErrorMessages
├── controller/     # REST Endpoints (@RestController)
├── dto/            # Immutable Request & Response records (by domain)
├── entity/         # JPA Entities (@Entity, @Table)
├── enums/          # IssueStatus, IssueType, Priority, ProjectStatus
├── exception/      # ApiException, ResourceNotFoundException, GlobalExceptionHandler
├── mapper/         # Entity-to-DTO conversion mappers
├── repository/     # Spring Data JPA Repositories
├── security/       # JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal, CustomUserDetailsService
├── service/        # Domain business logic & transaction boundaries (@Transactional)
├── specification/  # JPA Criteria Specifications for dynamic issue filtering
└── util/           # ProjectKeyGenerator
```

### Security & Authentication Workflow
1. **User Login (`POST /api/auth/login`)**:
   - `AuthService` passes credentials to Spring's `AuthenticationManager`.
   - `DaoAuthenticationProvider` verifies raw password against BCrypt hash in DB via `CustomUserDetailsService`.
   - On success, `JwtTokenProvider` issues a signed HMAC-SHA256 JWT containing the user's ID as subject and 24-hour expiration.
2. **Subsequent API Requests**:
   - Client sends header: `Authorization: Bearer <TOKEN>`.
   - `JwtAuthenticationFilter` intercepts request, extracts and verifies token with secret key.
   - Loads `UserPrincipal`, constructs `UsernamePasswordAuthenticationToken`, and injects it into `SecurityContextHolder`.
   - Controllers enforce role checks using `@PreAuthorize("hasRole('ADMIN')")` or `@AuthenticationPrincipal UserPrincipal currentUser`.

### Global Error Handling
All errors throughout the backend route through [`GlobalExceptionHandler.java`](file:///c:/Users/Veeresh%20V%20Patil/OneDrive/Desktop/Projects%20Works/TaskFlow/backend/src/main/java/com/vr/taskflow/exception/GlobalExceptionHandler.java):
- Standardized JSON responses via `ApiResponse<T>`:
  ```json
  {
    "success": false,
    "message": "Project not found",
    "timestamp": "2026-10-31T17:00:00"
  }
  ```
- Validation failures (e.g. `@NotBlank`, `@Size`) return field-by-field error maps with HTTP 400.

---

## 5. Redis Caching Layer

Configured in [`RedisConfig.java`](file:///c:/Users/Veeresh%20V%20Patil/OneDrive/Desktop/Projects%20Works/TaskFlow/backend/src/main/java/com/vr/taskflow/config/RedisConfig.java):
- Utilizes `LettuceConnectionFactory` connected to port `6379`.
- Keys are serialized as Strings (`StringRedisSerializer`).
- Values are serialized using `GenericJackson2JsonRedisSerializer` to avoid binary Java serialization issues.
- Default Cache TTL: 10 minutes (`Duration.ofMinutes(10)`).

---

## 6. Frontend Architecture (React 18 + Vite + Tailwind CSS)

The frontend is a single-page application built with JavaScript (ES6+), styled with an enterprise dark design system inspired by Jira and Linear.

### Directory Structure (`frontend/src/`)
```
frontend/src/
├── api/
│   ├── client.js       # Central Axios instance with JWT interceptors
│   └── index.js        # Modular service endpoints (projectsApi, issuesApi, etc.)
├── components/
│   ├── layout/         # AppLayout, Sidebar (collapsible), TopNav
│   ├── ui/             # StatusBadge, PriorityIndicator, TypeBadge, Avatar, Button, Input, Modal, Skeleton
│   └── issues/         # CreateIssueModal (modal accessible globally)
├── context/
│   ├── AuthContext.jsx # User state, login, register, logout, token persistence
│   └── ToastContext.jsx# Non-blocking pop-up alerts (success, error, info)
├── pages/
│   ├── AuthPages.jsx       # Login & Register views
│   ├── DashboardPage.jsx   # Metrics, Assigned to Me, Active Projects
│   ├── ProjectsPage.jsx    # Project directory & project creation modal
│   ├── ProjectDetailPage.jsx# Tabs for Issues, Members, and Sprints
│   ├── IssuesPage.jsx      # Multi-filter search (status, project, priority, text)
│   ├── IssueDetailPage.jsx # Sidebar metadata, status picker, comments, attachments, audit trail
│   ├── KanbanBoardPage.jsx # 5-column workflow board with inline transitions
│   ├── SprintsPage.jsx     # Sprint planning, lifecycle transitions, sprint issues
│   ├── TeamsPage.jsx       # Departmental groups, team leads, member management
│   ├── LabelsPage.jsx      # Color-coded categorization tags
│   ├── NotificationsPage.jsx# Alerts, unread indicators, mark-as-read
│   ├── UsersPage.jsx       # Admin-only user directory
│   └── ProfilePage.jsx     # User settings and credential updates
├── routes/
│   └── ProtectedRoute.jsx  # Guards unauthenticated or unauthorized visits
├── App.jsx                 # Route declarations
└── index.css               # Tailwind directives & custom dark scrollbars
```

### Key Frontend Patterns
1. **Vite Reverse Proxy (`vite.config.js`)**:
   ```javascript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:8080',
         changeOrigin: true
       }
     }
   }
   ```
   *Benefit:* The browser sends all requests to `http://localhost:5173/api/*` which Vite forwards to port `8080`. This avoids Cross-Origin Resource Sharing (CORS) header issues in development.

2. **Global Issue Creation**:
   The `CreateIssueModal` is mounted at the `AppLayout` level. Clicking "Create Issue" anywhere in the top navigation or on individual pages triggers the creation modal without route transitions.

3. **Status Transitions & Audit Trail**:
   Changing an issue's status on the Kanban Board or the Issue Details view triggers a backend history recording (`IssueHistory`), providing an audit log of what was changed, by whom, and when.

---

## 7. Developer Cheat-Sheet & Daily Operations

### Resetting & Seeding the Database
To wipe out stale test data and repopulate with realistic projects, issues, comments, sprints, and teams:
```powershell
# From project root:
.\reset-and-seed.ps1
```

### Pre-Configured Test Accounts (Password for all: `admin123`)
| Account | Role | Email |
|---|---|---|
| **System Administrator** | `ADMIN`, `PROJECT_MANAGER` | `admin@taskflow.com` |
| **Sarah Connor** | `PROJECT_MANAGER` | `sarah.pm@taskflow.com` |
| **Alex Mercer** | `DEVELOPER` | `alex.dev@taskflow.com` |
| **Elena Rostova** | `DEVELOPER` | `elena.dev@taskflow.com` |
| **Marcus Vance** | `QA` | `marcus.qa@taskflow.com` |
| **David Kim** | `MEMBER` | `david.kim@taskflow.com` |

### Running the Entire Project Locally

1. **Start Containers:**
   ```bash
   cd backend
   docker-compose up -d
   ```
2. **Start Backend:**
   Run `TaskFlowApplication.java` from IntelliJ IDEA, or:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   - API live at: `http://localhost:8080`
   - Interactive Swagger docs at: `http://localhost:8080/swagger-ui.html`
3. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   - Web application live at: `http://localhost:5173`

