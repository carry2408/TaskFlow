# TaskFlow — Modern Jira-like Project Management System

TaskFlow is a production-grade project and issue tracking platform for software and IT teams. Built with a **Spring Boot 3 (Java 21)** backend and a high-performance **React (Vite + Tailwind CSS)** enterprise dark UI.

---

## Architecture Overview

```
TaskFlow/
├── backend/            # Spring Boot 3.3.5 (Java 21) REST API
│   ├── src/main/java/  # Layered architecture (Controllers, Services, Repositories, Entities)
│   ├── src/main/resources/db/migration/  # Flyway schema migrations (16 tables)
│   └── docker-compose.yml                # PostgreSQL 16 (port 5433) + Redis 7 (port 6379)
└── frontend/           # React 18 + Vite + Tailwind CSS + Lucide React
    ├── src/api/        # Centralized Axios client and API modules
    ├── src/components/ # Enterprise dark UI components, layout, and modals
    ├── src/context/    # AuthContext (JWT) and Toast notification context
    └── src/pages/      # Dashboard, Projects, Issues, Kanban Board, Sprints, Teams, Labels, Users
```

---

## Quickstart Guide

### 1. Start Database & Cache Containers
From the `backend` directory:
```bash
cd backend
docker-compose up -d
```
- PostgreSQL: `localhost:5433`
- Redis: `localhost:6379`

### 2. Start the Backend API
```bash
cd backend
# Using Maven wrapper (requires Java 21)
./mvnw spring-boot:run
```
- Server URL: `http://localhost:8080`
- Swagger / OpenAPI Docs: `http://localhost:8080/swagger-ui.html`

### 3. Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## Features & Pages

1. **Authentication & Roles**: Secure JWT-based authentication with 6 roles (`ADMIN`, `PROJECT_MANAGER`, `DEVELOPER`, `QA`, `MEMBER`, `VIEWER`).
2. **Executive Engineering Dashboard**: Aggregated issue metrics, active projects, and items assigned to the current user.
3. **Projects Directory & Details**: Full project lifecycle, team association, and project member management with granular roles.
4. **Issue Management & Search**: CRUD for Tasks, Stories, Bugs, Epics, Sub-tasks with multi-field search and status transitions (`TO_DO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `BLOCKED`).
5. **Interactive Kanban Board**: Column-level counts, status update drop-downs, priority badges, and quick-access issue cards.
6. **Sprint Planning**: Iteration planning, sprint lifecycle (`PLANNED` -> `ACTIVE` -> `CLOSED`), and issue assignment.
7. **Discussion & Attachments**: Comment threads on issues and multipart file attachment upload/download.
8. **Audit Trail**: Real-time logging of field changes in issue history.
9. **Teams & Labels**: Cross-cutting tags and department groupings.
10. **In-App Notifications**: Real-time unread counter and read-all capabilities.

