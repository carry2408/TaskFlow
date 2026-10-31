package com.vr.taskflow.controller;

import com.vr.taskflow.dto.common.ApiResponse;
import com.vr.taskflow.dto.label.CreateLabelRequest;
import com.vr.taskflow.dto.label.LabelDto;
import com.vr.taskflow.security.UserPrincipal;
import com.vr.taskflow.service.LabelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Labels", description = "Labels and issue categorization endpoints")
@SecurityRequirement(name = "bearerAuth")
public class LabelController {

    private final LabelService labelService;

    public LabelController(LabelService labelService) {
        this.labelService = labelService;
    }

    @PostMapping("/api/labels")
    @Operation(summary = "Create a new label")
    public ResponseEntity<ApiResponse<LabelDto>> createLabel(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateLabelRequest request) {
        LabelDto created = labelService.createLabel(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Label created successfully", created));
    }

    @GetMapping("/api/labels")
    @Operation(summary = "Get all labels")
    public ResponseEntity<ApiResponse<List<LabelDto>>> getAllLabels() {
        List<LabelDto> labels = labelService.getAllLabels();
        return ResponseEntity.ok(ApiResponse.success(labels));
    }

    @GetMapping("/api/issues/{issueId}/labels")
    @Operation(summary = "Get labels attached to an issue")
    public ResponseEntity<ApiResponse<List<LabelDto>>> getLabelsForIssue(@PathVariable Long issueId) {
        List<LabelDto> labels = labelService.getLabelsForIssue(issueId);
        return ResponseEntity.ok(ApiResponse.success(labels));
    }

    @PostMapping("/api/issues/{issueId}/labels/{labelId}")
    @Operation(summary = "Attach label to an issue")
    public ResponseEntity<ApiResponse<Void>> assignLabel(@PathVariable Long issueId, @PathVariable Long labelId) {
        labelService.assignLabelToIssue(issueId, labelId);
        return ResponseEntity.ok(ApiResponse.success("Label assigned to issue successfully"));
    }

    @DeleteMapping("/api/issues/{issueId}/labels/{labelId}")
    @Operation(summary = "Remove label from an issue")
    public ResponseEntity<ApiResponse<Void>> removeLabel(@PathVariable Long issueId, @PathVariable Long labelId) {
        labelService.removeLabelFromIssue(issueId, labelId);
        return ResponseEntity.ok(ApiResponse.success("Label removed from issue successfully"));
    }
}

