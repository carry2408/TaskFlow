package com.vr.taskflow.dto.issue;

import com.vr.taskflow.enums.IssueStatus;
import com.vr.taskflow.enums.IssueType;
import com.vr.taskflow.enums.Priority;

import java.time.LocalDate;

public record IssueFilterRequest(
        String query,
        Long projectId,
        Long assigneeId,
        Long reporterId,
        IssueStatus status,
        Priority priority,
        IssueType issueType,
        LocalDate dueDateFrom,
        LocalDate dueDateTo
) {}

