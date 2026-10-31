# Development Rules and Coding Standards

## 1. Purpose

This document defines the mandatory development standards for the project. The goal is to keep the codebase clean, consistent, easy to navigate, easy to debug, and ready for future feature expansion.

All contributors must follow these rules.

---

## 2. Core Principles

### 2.1 No unnecessary comments
- Do not add comments for obvious code.
- Do not write comments that restate what the code already says.
- Use comments only when they explain:
  - business intent
  - non-obvious logic
  - security-sensitive logic
  - reason for a workaround or limitation
- Do not add decorative comments, emojis, or filler text.

### 2.2 No emojis or informal markers
- Do not use emojis in code, comments, commit messages, PR descriptions, logs, or documentation.
- Use professional and neutral language only.

### 2.3 Code must be readable and maintainable
- Code should be easy to understand by a teammate in the first pass.
- Prefer clarity over cleverness.
- Avoid over-engineering for immediate needs.
- Keep code simple and explicit.

### 2.4 Code must be easy to debug
- Every function should have a clear responsibility.
- Make failure points obvious.
- Log only what is useful and actionable.
- Do not hide exceptions or swallow errors silently.
- Validate inputs early.

### 2.5 Code must support future features
- Design modules and services to allow extension without rewriting the core.
- Keep responsibilities separated.
- Use abstractions only where they add value.
- Avoid hard-coded logic in multiple places.

---

## 3. Engineering Standards

### 3.1 Naming conventions
Use clear, consistent names.

- Classes: PascalCase
  - Example: `UserService`, `ProjectController`, `IssueMapper`
- Methods: camelCase
  - Example: `createIssue`, `getProjectById`
- Variables: camelCase
  - Example: `projectId`, `assigneeUser`
- Constants: UPPER_SNAKE_CASE
  - Example: `MAX_PAGE_SIZE`, `DEFAULT_STATUS`
- Packages: lower-case dot-separated
  - Example: `com.taskflow.service`, `com.taskflow.controller`

### 3.2 File and package organization
- One responsibility per class.
- Group code by business domain and layer.
- Keep package structure stable.
- Do not mix unrelated logic in the same file.

Recommended structure:
- `controller`
- `service`
- `repository`
- `entity`
- `dto`
- `mapper`
- `config`
- `exception`
- `security`
- `util`
- `enums`

### 3.3 Keep methods small
- Prefer methods with a single responsibility.
- If a method is too long, split it.
- A method should usually fit in a single screen of code.
- Avoid deeply nested conditionals without clear structure.

### 3.4 Prefer explicit logic over clever shortcuts
- Avoid magic values.
- Use constants or enums instead of raw strings where appropriate.
- Use validation and guard clauses early.
- Write code that is obvious to another engineer.

---

## 4. Java and Spring Standards

### 4.1 Spring conventions
- Use constructor injection.
- Prefer final fields for dependency injection.
- Keep services focused on business logic.
- Keep controllers thin.
- Use DTOs for request and response payloads.
- Do not expose entities directly as API responses unless absolutely required.

### 4.2 Exception handling
- Use custom exceptions for domain-level errors.
- Create a global exception handler.
- Return structured API error responses.
- Do not throw raw exceptions from the controller layer.
- Log errors with meaningful context.

### 4.3 Validation
- Validate all incoming request payloads.
- Use Bean Validation annotations where applicable.
- Reject invalid input at the boundary.
- Validate business rules in service layer when needed.

### 4.4 Transactions
- Use transactions for write operations.
- Keep transaction boundaries clear and limited.
- Do not place heavy logic outside transaction boundaries.

### 4.5 Security
- Never expose sensitive data in responses.
- Use role-based access checks.
- Validate authorization at service or controller level.
- Do not bypass security for convenience.

---

## 5. Formatting and Code Style

### 5.1 Formatting
- Follow the project formatter and style rules consistently.
- Use proper indentation and spacing.
- Keep line lengths manageable.
- Do not mix inconsistent naming or formatting patterns.

### 5.2 Imports
- Remove unused imports.
- Organize imports cleanly.
- Do not keep dead code.

### 5.3 Code layout
- Keep class members ordered logically:
  - fields
  - constructors
  - public methods
  - private methods
- Keep related methods together.
- Avoid random ordering.

### 5.4 Linting and static analysis
- Do not ignore warnings that indicate real risks.
- Prefer cleaner, more explicit code over suppressions.
- Keep code build-clean.

---

## 6. Logging and Debugging Rules

### 6.1 Logging
- Logs must be useful and structured.
- Log:
  - business events
  - important state transitions
  - errors and failures
  - suspicious or security-relevant actions
- Do not log secrets, tokens, or sensitive user data.

### 6.2 Debugging
- Prefer deterministic, testable logic.
- Avoid hidden state and implicit behavior.
- Keep logic easy to step through in a debugger.
- Use meaningful variable names and clear branching.

### 6.3 Error handling
- Never silently catch exceptions without action.
- If an exception is caught, either:
  - rethrow it appropriately
  - convert it to a business-safe response
  - log it with context
- Do not suppress critical failures.

---

## 7. Testing Rules

### 7.1 Required coverage
- Write tests for business-critical logic.
- Add unit tests for service behavior.
- Add integration tests for API flows when necessary.
- Prefer testing real behavior over implementation details.

### 7.2 Test quality
- Test names must describe the behavior.
- Keep tests clear and readable.
- Do not write brittle tests.
- Do not duplicate logic in tests.

### 7.3 Bug fixes
- A bug fix must include a test that covers the bug.
- Do not fix the symptom only; fix the root cause.

---

## 8. Database and Persistence Rules

- Keep data models clear and domain-oriented.
- Use proper foreign keys and constraints.
- Keep queries efficient and indexed.
- Avoid N+1 query patterns.
- Do not add database logic in controller classes.
- Use repository layer for persistence concerns and service layer for business logic.

---

## 9. Documentation Rules

- Documentation must be concise and factual.
- Keep README and design docs easy to follow.
- Each major module should have a clear purpose.
- Document integration points and operational assumptions.
- Use professional language only.

---

## 10. Change Management Rules

### 10.1 Scope control
- Do not mix unrelated changes in one commit.
- Keep commits logically grouped.
- Keep PRs focused and understandable.

### 10.2 Refactoring
- Refactor only when it improves clarity or maintainability.
- Do not refactor unrelated code in the same change.

### 10.3 Backward compatibility
- Avoid breaking API contracts unless deliberately planned.
- If a breaking change is required, document it clearly.

---

## 11. Review Standards

Pull requests must be reviewed for:
- readability
- correctness
- test coverage
- maintainability
- security
- future extensibility

A PR is not acceptable if:
- it adds unnecessary comments
- it contains console debugging leftovers
- it uses unclear naming
- it introduces copy-pasted logic without abstraction
- it is difficult to trace or debug

---

## 12. Non-Negotiable Rules

The following are mandatory:
- No unnecessary comments
- No emojis
- No placeholder comments
- No dead code
- No inconsistent naming
- No silent failure
- No poor structure for the sake of speed
- No hidden business logic in controllers
- No undocumented assumptions

---

## 13. Final Standard

The codebase must be:
- professional
- clean
- easy to read
- easy to debug
- easy to extend
- safe and maintainable

If a change makes the code harder to understand, it is not acceptable even if it works.

---

## 14. Summary

We build code for clarity, correctness, and maintainability. Every line should support the project’s long-term health and be understandable to another engineer without extra explanation.
