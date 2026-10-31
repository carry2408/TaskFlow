package com.vr.taskflow.dto.issue;

import com.vr.taskflow.dto.user.UserDto;

import java.time.LocalDateTime;

public record IssueHistoryDto(
        Long id,
        Long issueId,
        UserDto changedBy,
        String fieldName,
        String oldValue,
        String newValue,
        LocalDateTime createdAt
) {}

