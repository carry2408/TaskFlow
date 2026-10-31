package com.vr.taskflow.dto.attachment;

import com.vr.taskflow.dto.user.UserDto;

import java.time.LocalDateTime;

public record AttachmentDto(
        Long id,
        Long issueId,
        Long commentId,
        UserDto uploadedBy,
        String fileName,
        String originalFileName,
        Long fileSize,
        String mimeType,
        LocalDateTime createdAt
) {}

