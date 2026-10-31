package com.vr.taskflow.dto.issue;

import com.vr.taskflow.enums.IssueStatus;
import com.vr.taskflow.enums.IssueType;
import com.vr.taskflow.enums.Priority;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateIssueRequest(

        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        String description,

        IssueType issueType,

        Priority priority,

        IssueStatus status,

        Long assigneeId,

        LocalDate dueDate
) {}

