package com.vr.taskflow.controller;

import com.vr.taskflow.dto.attachment.AttachmentDto;
import com.vr.taskflow.dto.common.ApiResponse;
import com.vr.taskflow.entity.Attachment;
import com.vr.taskflow.security.UserPrincipal;
import com.vr.taskflow.service.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@Tag(name = "Attachments", description = "File attachments for issues and comments")
@SecurityRequirement(name = "bearerAuth")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping(value = "/api/issues/{issueId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload attachment for an issue")
    public ResponseEntity<ApiResponse<AttachmentDto>> uploadAttachment(
            @PathVariable Long issueId,
            @RequestParam(required = false) Long commentId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AttachmentDto dto = attachmentService.uploadAttachment(issueId, commentId, currentUser.getId(), file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("File uploaded successfully", dto));
    }

    @GetMapping("/api/issues/{issueId}/attachments")
    @Operation(summary = "Get all attachments for an issue")
    public ResponseEntity<ApiResponse<List<AttachmentDto>>> getAttachments(@PathVariable Long issueId) {
        List<AttachmentDto> attachments = attachmentService.getAttachmentsForIssue(issueId);
        return ResponseEntity.ok(ApiResponse.success(attachments));
    }

    @GetMapping("/api/attachments/{id}/download")
    @Operation(summary = "Download attachment file")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long id) {
        Attachment metadata = attachmentService.getAttachmentMetadata(id);
        Resource fileResource = attachmentService.loadFileAsResource(id);

        String contentType = metadata.getMimeType() != null ? metadata.getMimeType() : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getOriginalFileName() + "\"")
                .body(fileResource);
    }
}

