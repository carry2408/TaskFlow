1. Created Files

seed-dummy-data.sql

Truncates all tables safely with CASCADE and resets ID sequences.
Re-creates the system Admin user with the exact BCrypt hash for admin123.
Seeds 6 users across all roles (ADMIN, PROJECT_MANAGER, DEVELOPER, QA, MEMBER).
Seeds 3 teams with leads and members.
Seeds 3 active projects (TSK - TaskFlow Web Client, GW - Cloud Gateway, MOB - Mobile App) with assigned members.
Seeds 4 sprints (CLOSED, ACTIVE, PLANNED).
Seeds 10 detailed issues with varied statuses (TO_DO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED), priorities (CRITICAL, HIGH, MEDIUM, LOW), assignees, and due dates.
Seeds labels, issue comments, audit history entries, and in-app notifications.
One-command runner you can execute at any time to wipe the database and re-seed clean data.
reset-and-seed.ps1
2. How to Run the Reset & Seed Any Time

In your terminal or PowerShell from the root folder:

powershell
.\reset-and-seed.ps1
====================================================================
### COMMAND TO EXCUTE IN ROOT FOLDER
powershell
.\reset-and-seed.ps1
===================================================================

(Or directly via docker: Get-Content seed-dummy-data.sql -Raw | docker exec -i taskflow_postgres psql -U taskflow_user -d taskflow_db)

3. Test Credentials

All accounts share the standard password: admin123

Name	Role	Email	Password
System Admin	ADMIN, PROJECT_MANAGER	admin@taskflow.com	admin123
Sarah Connor	PROJECT_MANAGER	sarah.pm@taskflow.com	admin123
Alex Mercer	DEVELOPER	alex.dev@taskflow.com	admin123
Elena Rostova	DEVELOPER	elena.dev@taskflow.com	admin123
Marcus Vance	QA	marcus.qa@taskflow.com	admin123
David Kim	MEMBER	david.kim@taskflow.com	admin123
4. Verified Dashboard Status Right Now

I just tested the seeded data against your live backend API:

Total Projects: 3
Total Issues: 10
In-Progress Work: 3
Resolved Issues: 3
Overdue Tickets: 1
Issues by Status: 3 TO_DO, 2 IN_PROGRESS, 1 IN_REVIEW, 3 DONE, 1 BLOCKED

You can open http://localhost:5173, log in as admin@taskflow.com / admin123, and explore the populated Dashboard, Kanban Board, Projects, Sprints, Teams, and Issues!