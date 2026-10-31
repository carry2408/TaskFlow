package com.vr.taskflow.dto.issue;

import com.vr.taskflow.dto.user.UserDto;
import com.vr.taskflow.enums.IssueStatus;
import com.vr.taskflow.enums.IssueType;
import com.vr.taskflow.enums.Priority;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record IssueDto(
        Long id,
        Long projectId,
        String projectKey,
        String projectName,
        UserDto reporter,
        UserDto assignee,
        String title,
        String description,
        IssueType issueType,
        Priority priority,
        IssueStatus status,
        LocalDate dueDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt
) {}

