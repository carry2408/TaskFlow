package com.vr.taskflow.controller;

import com.vr.taskflow.constants.AppConstants;
import com.vr.taskflow.dto.common.ApiResponse;
import com.vr.taskflow.dto.issue.CreateIssueRequest;
import com.vr.taskflow.dto.issue.IssueDto;
import com.vr.taskflow.dto.issue.IssueHistoryDto;
import com.vr.taskflow.dto.issue.UpdateIssueRequest;
import com.vr.taskflow.enums.IssueStatus;
import com.vr.taskflow.security.UserPrincipal;
import com.vr.taskflow.service.IssueService;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Issues", description = "Issue CRUD and workflow endpoints")
@SecurityRequirement(name = "bearerAuth")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @PostMapping("/api/projects/{projectId}/issues")
    @Operation(summary = "Create an issue in a project")
    public ResponseEntity<ApiResponse<IssueDto>> createIssue(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateIssueRequest request) {
        IssueDto created = issueService.createIssue(projectId, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Issue created successfully", created));
    }

    @GetMapping("/api/projects/{projectId}/issues")
    @Operation(summary = "Get issues of a project with optional status filter")
    public ResponseEntity<ApiResponse<Page<IssueDto>>> getProjectIssues(
            @PathVariable Long projectId,
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_BY) String sortBy,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_DIR) String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), sort);

        Page<IssueDto> issues = issueService.getIssuesByProject(projectId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(issues));
    }

    @GetMapping("/api/issues/search")
    @Operation(summary = "Search and filter issues across projects")
    public ResponseEntity<ApiResponse<Page<IssueDto>>> searchIssues(
            @ModelAttribute com.vr.taskflow.dto.issue.IssueFilterRequest filter,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = "" + AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_BY) String sortBy,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_DIR) String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, Math.min(size, AppConstants.MAX_PAGE_SIZE), sort);

        Page<IssueDto> results = issueService.searchAndFilterIssues(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/api/issues/{id}")
    @Operation(summary = "Get issue by ID")
    public ResponseEntity<ApiResponse<IssueDto>> getIssueById(@PathVariable Long id) {
        IssueDto issue = issueService.getIssueById(id);
        return ResponseEntity.ok(ApiResponse.success(issue));
    }

    @PutMapping("/api/issues/{id}")
    @Operation(summary = "Update issue fields")
    public ResponseEntity<ApiResponse<IssueDto>> updateIssue(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody UpdateIssueRequest request) {
        IssueDto updated = issueService.updateIssue(id, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Issue updated successfully", updated));
    }

    @PatchMapping("/api/issues/{id}/status")
    @Operation(summary = "Transition issue status")
    public ResponseEntity<ApiResponse<IssueDto>> transitionStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam IssueStatus status) {
        IssueDto updated = issueService.transitionStatus(id, currentUser.getId(), status);
        return ResponseEntity.ok(ApiResponse.success("Issue status updated successfully", updated));
    }

    @GetMapping("/api/issues/{id}/history")
    @Operation(summary = "Get audit history for an issue")
    public ResponseEntity<ApiResponse<List<IssueHistoryDto>>> getIssueHistory(@PathVariable Long id) {
        List<IssueHistoryDto> history = issueService.getIssueHistory(id);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
