# TaskFlow — Backend

TaskFlow is a production-grade, Jira-inspired issue and project tracking system built with **Spring Boot 3.3.5** and **Java 21**.

---

## Tech Stack & Architecture

- **Language:** Java 21 (Temurin / Microsoft OpenJDK 21)
- **Framework:** Spring Boot 3.3.5
- **Security:** Spring Security 6 with stateless JWT Bearer authentication
- **Database:** PostgreSQL (Flyway migration engine with 16 relational tables)
- **Caching:** Redis 7 (Spring Cache Manager with Jackson JSON serializer)
- **Documentation:** OpenAPI 3 / Swagger UI (`/swagger-ui.html`)
- **Containerization:** Docker & Docker Compose

---

## Prerequisites & Setup

### 1. Database & Cache via Docker
Run PostgreSQL and Redis containers locally:
```bash
docker-compose up -d
```

### 2. Environment Variables
Copy and configure environment settings if necessary:
```bash
cp .env.example .env
```
Default ports:
- PostgreSQL: `5432` (`taskflow_db`, `taskflow_user` / `taskflow_pass`)
- Redis: `6379`

### 3. Build & Run Application
```bash
# Compile and build
./mvnw clean compile

# Run application
./mvnw spring-boot:run
```
The application will launch on `http://localhost:8080`.

---

## Core API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (returns JWT token and roles)
- `POST /api/auth/login` — Sign in with credentials (returns JWT token)

### User Management (`/api/users`)
- `GET /api/users/me` — Current authenticated user profile
- `PUT /api/users/me` — Update name, avatar, or password
- `GET /api/users` — Paginated user directory (*Admin only*)

### Team Management (`/api/teams`)
- `POST /api/teams` — Create a team (*Admin / Project Manager*)
- `GET /api/teams` — List teams (paginated)
- `GET /api/teams/{id}` — Team details with members
- `PUT /api/teams/{id}` — Update team details
- `DELETE /api/teams/{id}` — Delete team (*Admin only*)
- `POST /api/teams/{id}/members/{userId}` — Add member to team
- `DELETE /api/teams/{id}/members/{userId}` — Remove member from team
- `GET /api/teams/{id}/members` — List members of team

### Project Management (`/api/projects`)
- `POST /api/projects` — Create project with auto-generated project key
- `GET /api/projects` — Query projects with optional `status` and `teamId` filters
- `GET /api/projects/{id}` — Project details and member team
- `PUT /api/projects/{id}` — Update project metadata
- `POST /api/projects/{id}/members/{userId}` — Assign member to project
- `DELETE /api/projects/{id}/members/{userId}` — Remove member from project

### Issue Management (`/api/issues`, `/api/projects/{id}/issues`)
- `POST /api/projects/{projectId}/issues` — Create an issue (Story, Task, Bug, Epic, Sub-task)
- `GET /api/projects/{projectId}/issues` — List project issues (filter by status, paginated)
- `GET /api/issues/{id}` — Issue details with reporter, assignee, priority
- `PUT /api/issues/{id}` — Update issue fields (automatically records audit history)
- `PATCH /api/issues/{id}/status` — Move issue across workflow (`TO_DO` -> `IN_PROGRESS` -> `IN_REVIEW` -> `DONE` -> `BLOCKED`)
- `GET /api/issues/{id}/history` — Full audit trail of issue modifications
- `GET /api/issues/search` — Multi-attribute issue search (keyword query, priority, type, status, project, assignee, dates)

### Discussion Comments (`/api/issues/{id}/comments`, `/api/comments/{id}`)
- `POST /api/issues/{issueId}/comments` — Add comment to issue
- `GET /api/issues/{issueId}/comments` — Retrieve issue discussion thread
- `PUT /api/comments/{id}` — Edit comment (author only)
- `DELETE /api/comments/{id}` — Delete comment (author or admin)

### Labels (`/api/labels`, `/api/issues/{id}/labels`)
- `POST /api/labels` — Create shared label
- `GET /api/labels` — List all available labels
- `GET /api/issues/{issueId}/labels` — List labels assigned to issue
- `POST /api/issues/{issueId}/labels/{labelId}` — Attach label to issue
- `DELETE /api/issues/{issueId}/labels/{labelId}` — Remove label from issue

### Attachments (`/api/issues/{id}/attachments`, `/api/attachments/{id}`)
- `POST /api/issues/{issueId}/attachments` — Upload file attachment (multipart/form-data)
- `GET /api/issues/{issueId}/attachments` — List file attachments for issue
- `GET /api/attachments/{id}/download` — Download attached file

### Sprint Planning (`/api/projects/{id}/sprints`, `/api/sprints/{id}`)
- `POST /api/projects/{projectId}/sprints` — Create sprint iteration
- `GET /api/projects/{projectId}/sprints` — List sprints for project
- `PATCH /api/sprints/{id}/status` — Update sprint lifecycle (`PLANNED`, `ACTIVE`, `CLOSED`)
- `POST /api/sprints/{sprintId}/issues/{issueId}` — Add issue into sprint
- `DELETE /api/sprints/{sprintId}/issues/{issueId}` — Remove issue from sprint
- `GET /api/sprints/{sprintId}/issues` — Get issues assigned to a sprint

### Dashboard & Analytics (`/api/dashboard`)
- `GET /api/dashboard` — Global aggregated analytics (total issues, open/in-progress/resolved/overdue counts, distributions by status and priority)

### Notifications (`/api/notifications`)
- `GET /api/notifications` — List notifications for authenticated user
- `GET /api/notifications/unread-count` — Count unread alerts
- `PATCH /api/notifications/{id}/read` — Mark notification as read
- `PATCH /api/notifications/read-all` — Mark all notifications as read

### API Documentation
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON Spec: `http://localhost:8080/api-docs`

