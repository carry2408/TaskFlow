# Development Rules for TaskFlow

## 1. Purpose

This document defines the required development standards for the TaskFlow project. All code, pull requests, tests, and documentation must follow these rules.

This is a project-level quality baseline for:
- maintainability
- consistency
- security
- scalability
- team collaboration

---

## 2. Engineering Principles

### 2.1 Simplicity first
- Prefer the simplest solution that solves the problem correctly.
- Avoid unnecessary abstractions, premature optimization, or over-engineering.
- Do not add libraries or patterns without a clear need.

### 2.2 Readability over cleverness
- Code must be easy to understand by another developer.
- Avoid cryptic names, hidden logic, or overly compact implementations.
- Write code that explains itself.

### 2.3 Explicit is better than implicit
- Avoid magic values and hidden behavior.
- Prefer explicit validation, mapping, and error handling.
- Use constants for repeated business values.

### 2.4 Build for maintainability
- Keep modules separated by responsibility.
- Keep business logic in services.
- Keep persistence logic in repositories.
- Keep controllers focused on HTTP concerns.

---

## 3. Project Structure Rules

### 3.1 Layered architecture
The application must follow this structure:

- `controller` for REST endpoints
- `service` for business logic
- `repository` for data access
- `entity` for persistence models
- `dto` for API request/response contracts
- `mapper` for DTO/entity conversion
- `config` for framework configuration
- `security` for authentication and authorization
- `exception` for custom errors
- `util` for reusable helper methods
- `validation` for custom validation logic

### 3.2 Package rules
- One responsibility per package.
- No business logic inside controllers.
- No direct database access from controllers or DTO classes.
- No cross-layer bypassing.

### 3.3 Naming rules
- Use clear domain-based naming.
- Use English names only.
- Use nouns for entities and verbs for services.
- Use consistent suffixes:
  - `Controller`
  - `Service`
  - `Repository`
  - `Dto`
  - `Mapper`
  - `Exception`

---

## 4. Java and Spring Rules

### 4.1 Java standards
- Use Java 17 or 21 as required by project version.
- Prefer final classes where practical.
- Prefer immutable DTOs where possible.
- Use Lombok only when it improves clarity and is accepted by the project.

### 4.2 Spring Boot rules
- Use Spring Boot conventions over custom framework behavior.
- Use dependency injection via constructors.
- Avoid manual bean creation in service classes.
- Use configuration classes for application setup.
- Use `@Transactional` only on service methods that modify data.

### 4.3 Persistence rules
- Entities must be mapped with JPA annotations.
- Do not expose entities directly as REST responses.
- Use DTOs between controller and service layers.
- Use fetch strategies intentionally, not by default assumptions.
- Avoid N+1 queries in list endpoints.
- Add indexes for frequently queried fields.

---

## 5. API Design Rules

### 5.1 REST conventions
- Use plural nouns for resource names.
- Use consistent HTTP methods:
  - GET for retrieval
  - POST for creation
  - PUT/PATCH for updates
  - DELETE for deletion
- Use resource-oriented endpoints:
  - `/api/projects`
  - `/api/projects/{id}/issues`
  - `/api/issues/{id}/comments`

### 5.2 Response rules
- Return consistent JSON formats.
- Use DTOs for every API payload.
- Do not return raw entities from controllers.
- Use standard success and error structures.

### 5.3 Error handling
- Centralize exception handling with `@ControllerAdvice` or a global handler.
- Never leak stack traces or internal implementation details.
- Return meaningful validation errors.
- Use custom exceptions for business-level failures.

### 5.4 Validation
- Validate all incoming request payloads.
- Use bean validation annotations:
  - `@NotNull`
  - `@NotBlank`
  - `@Size`
  - `@Email`
  - `@Valid`
- Reject invalid data at API boundary.

---

## 6. Security Rules

### 6.1 Authentication
- Use JWT or secure token-based authentication.
- Never store plain-text passwords.
- Passwords must be hashed using a strong algorithm.
- Do not expose sensitive user data in responses.

### 6.2 Authorization
- Enforce role-based access control.
- Access checks must happen in service layer or security layer.
- Users must never access data outside authorized projects or teams.

### 6.3 Security best practices
- Validate all user input.
- Sanitize file uploads.
- Use environment-based configuration for secrets.
- Do not commit `.env`, credentials, or private keys.
- Use HTTPS in production.
- Filter and restrict file upload types.

---

## 7. Database Rules

### 7.1 Schema rules
- Each business entity must have a dedicated table.
- Use foreign keys for relationships.
- Do not store computed values in base tables unless needed.
- Use explicit naming for columns and tables.
- Prefer descriptive names over abbreviated names.

### 7.2 Audit rules
- Add `created_at` and `updated_at` for all mutable entities.
- Add audit entries for important changes such as:
  - status changes
  - issue assignment
  - priority updates
  - project member changes

### 7.3 Query rules
- Use repository methods for database access.
- Prefer query methods and custom repository logic over raw SQL unless justified.
- Index fields used in filtering, sorting, and joins.

### 7.4 Data integrity
- Enforce not-null constraints on essential fields.
- Use unique constraints where required.
- Validate business rules before saving the entity.

---

## 8. Testing Rules

### 8.1 Required tests
Every feature must include:
- unit tests for business logic
- integration tests for controller/service flows
- repository tests for critical queries when needed

### 8.2 Coverage expectations
- New business logic should be tested before merge.
- Critical flows must be covered:
  - authentication
  - issue creation
  - project assignment
  - status transition
  - user authorization

### 8.3 Test standards
- Test names must describe the scenario clearly.
- Keep tests deterministic and isolated.
- Avoid testing framework behavior instead of business logic.
- Use real validation paths when possible.

---

## 9. Branching and Git Rules

### 9.1 Branch naming
Use branch names in this format:

- `feature/<short-description>`
- `bugfix/<short-description>`
- `hotfix/<short-description>`
- `chore/<short-description>`

Examples:
- `feature/project-dashboard`
- `bugfix/issue-status-validation`

### 9.2 Commit rules
- Keep commits small and focused.
- One logical change per commit.
- Write clear commit messages.
- Example:
  - `feat: add issue status update workflow`
  - `fix: resolve user role authorization issue`

### 9.3 Pull request rules
- PRs must have a clear title and summary.
- Include:
  - what changed
  - why it changed
  - how it was tested
- Do not merge without review.
- Do not merge if tests are failing.

---

## 10. Code Review Rules

### 10.1 Review checklist
Reviewers must check:
- correctness
- security
- performance impact
- readability
- test coverage
- adherence to project architecture

### 10.2 Do not merge if
- logic is unclear
- tests are missing for critical behavior
- security controls are weak
- database design is wrong
- API contracts are undocumented or inconsistent

---

## 11. Documentation Rules

### 11.1 Required docs
Every feature must include:
- purpose
- acceptance criteria
- API contract if applicable
- configuration notes if required

### 11.2 README requirements
The project README must include:
- project overview
- setup instructions
- environment variables
- run commands
- database setup
- testing commands
- architecture summary

---

## 12. Performance Rules

- Avoid blocking operations in request handlers.
- Use pagination for large collections.
- Optimize expensive queries before merging.
- Avoid fetching unnecessary records.
- Use caching only when justified and measured.
- Prefer efficient joins and indexed queries.

---

## 13. Deployment and Environment Rules

- Use environment-specific configuration files.
- Never commit secrets.
- Use Docker for local and test environments when applicable.
- Use production-safe settings only in deployment configurations.
- Keep local development setup reproducible.

---

## 14. Required Before Merge

Before merging code, confirm:
- code compiles successfully
- tests pass
- no lint or formatting issues remain
- API contracts remain consistent
- security checks are in place
- feature behavior matches the task description
- code follows project architecture

---

## 15. Final Quality Standard

All team members must follow this rule:

If code is unclear, untested, insecure, or not aligned with the architecture, it is not ready for production.

This project must be built with disciplined engineering, not just working code.

---

## 16. Summary

The most important project rules are:
- keep architecture clear
- validate inputs
- secure every API
- test critical business logic
- keep code readable
- use consistent conventions
- review changes rigorously

These rules are mandatory for all development work in TaskFlow.