package com.vr.taskflow.controller;

import com.vr.taskflow.dto.common.ApiResponse;
import com.vr.taskflow.dto.issue.IssueDto;
import com.vr.taskflow.dto.sprint.CreateSprintRequest;
import com.vr.taskflow.dto.sprint.SprintDto;
import com.vr.taskflow.service.SprintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Sprints", description = "Sprint planning and iteration endpoints")
@SecurityRequirement(name = "bearerAuth")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @PostMapping("/api/projects/{projectId}/sprints")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Create sprint in project")
    public ResponseEntity<ApiResponse<SprintDto>> createSprint(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateSprintRequest request) {
        SprintDto created = sprintService.createSprint(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Sprint created successfully", created));
    }

    @GetMapping("/api/projects/{projectId}/sprints")
    @Operation(summary = "List all sprints for a project")
    public ResponseEntity<ApiResponse<List<SprintDto>>> getProjectSprints(@PathVariable Long projectId) {
        List<SprintDto> sprints = sprintService.getProjectSprints(projectId);
        return ResponseEntity.ok(ApiResponse.success(sprints));
    }

    @PatchMapping("/api/sprints/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Update sprint lifecycle status (PLANNED, ACTIVE, CLOSED)")
    public ResponseEntity<ApiResponse<SprintDto>> updateStatus(@PathVariable Long id, @RequestParam String status) {
        SprintDto updated = sprintService.updateSprintStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Sprint status updated successfully", updated));
    }

    @PostMapping("/api/sprints/{sprintId}/issues/{issueId}")
    @Operation(summary = "Add issue to sprint")
    public ResponseEntity<ApiResponse<Void>> addIssueToSprint(@PathVariable Long sprintId, @PathVariable Long issueId) {
        sprintService.assignIssueToSprint(sprintId, issueId);
        return ResponseEntity.ok(ApiResponse.success("Issue added to sprint successfully"));
    }

    @DeleteMapping("/api/sprints/{sprintId}/issues/{issueId}")
    @Operation(summary = "Remove issue from sprint")
    public ResponseEntity<ApiResponse<Void>> removeIssueFromSprint(@PathVariable Long sprintId, @PathVariable Long issueId) {
        sprintService.removeIssueFromSprint(sprintId, issueId);
        return ResponseEntity.ok(ApiResponse.success("Issue removed from sprint successfully"));
    }

    @GetMapping("/api/sprints/{sprintId}/issues")
    @Operation(summary = "Get issues in a sprint")
    public ResponseEntity<ApiResponse<List<IssueDto>>> getSprintIssues(@PathVariable Long sprintId) {
        List<IssueDto> issues = sprintService.getSprintIssues(sprintId);
        return ResponseEntity.ok(ApiResponse.success(issues));
    }
}

