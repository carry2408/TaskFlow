package com.vr.taskflow.controller;

import com.vr.taskflow.dto.comment.CommentDto;
import com.vr.taskflow.dto.comment.CreateCommentRequest;
import com.vr.taskflow.dto.common.ApiResponse;
import com.vr.taskflow.security.UserPrincipal;
import com.vr.taskflow.service.CommentService;
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
@Tag(name = "Comments", description = "Issue discussion comments endpoints")
@SecurityRequirement(name = "bearerAuth")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/api/issues/{issueId}/comments")
    @Operation(summary = "Add comment to an issue")
    public ResponseEntity<ApiResponse<CommentDto>> addComment(
            @PathVariable Long issueId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateCommentRequest request) {
        CommentDto created = commentService.addComment(issueId, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Comment added successfully", created));
    }

    @GetMapping("/api/issues/{issueId}/comments")
    @Operation(summary = "Get all comments for an issue")
    public ResponseEntity<ApiResponse<List<CommentDto>>> getComments(@PathVariable Long issueId) {
        List<CommentDto> comments = commentService.getCommentsByIssue(issueId);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @PutMapping("/api/comments/{id}")
    @Operation(summary = "Update comment")
    public ResponseEntity<ApiResponse<CommentDto>> updateComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateCommentRequest request) {
        CommentDto updated = commentService.updateComment(id, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", updated));
    }

    @DeleteMapping("/api/comments/{id}")
    @Operation(summary = "Delete comment")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        commentService.deleteComment(id, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully"));
    }
}

