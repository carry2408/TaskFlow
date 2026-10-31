package com.vr.taskflow.controller;

import com.vr.taskflow.constants.AppConstants;
import com.vr.taskflow.dto.common.ApiResponse;
import com.vr.taskflow.dto.project.CreateProjectRequest;
import com.vr.taskflow.dto.project.ProjectDto;
import com.vr.taskflow.enums.ProjectStatus;
import com.vr.taskflow.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Project management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Create a new project (Admin or Project Manager)")
    public ResponseEntity<ApiResponse<ProjectDto>> createProject(@Valid @RequestBody CreateProjectRequest request) {
        ProjectDto created = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Project created successfully", created));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project details by ID")
    public ResponseEntity<ApiResponse<ProjectDto>> getProjectById(@PathVariable Long id) {
        ProjectDto project = projectService.getProjectById(id);
        return ResponseEntity.ok(ApiResponse.success(project));
    }

    @GetMapping
    @Operation(summary = "Get projects with optional status and team filtering (paginated)")
    public ResponseEntity<ApiResponse<Page<ProjectDto>>> getProjects(
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) Long teamId,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_BY) String sortBy,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_DIR) String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), sort);

        Page<ProjectDto> projects = projectService.getProjects(status, teamId, pageable);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Update project details (Admin or Project Manager)")
    public ResponseEntity<ApiResponse<ProjectDto>> updateProject(@PathVariable Long id,
                                                                 @Valid @RequestBody CreateProjectRequest request) {
        ProjectDto updated = projectService.updateProject(id, request);
        return ResponseEntity.ok(ApiResponse.success("Project updated successfully", updated));
    }

    @PostMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Add member to project")
    public ResponseEntity<ApiResponse<Void>> addMember(@PathVariable Long id,
                                                       @PathVariable Long userId,
                                                       @RequestParam(defaultValue = "MEMBER") String role) {
        projectService.addMember(id, userId, role);
        return ResponseEntity.ok(ApiResponse.success("User added to project successfully"));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Remove member from project")
    public ResponseEntity<ApiResponse<Void>> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        projectService.removeMember(id, userId);
        return ResponseEntity.ok(ApiResponse.success("User removed from project successfully"));
    }
}

