package com.vr.taskflow.dto.issue;

import com.vr.taskflow.enums.IssueType;
import com.vr.taskflow.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateIssueRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        String description,

        @NotNull(message = "Issue type is required")
        IssueType issueType,

        Priority priority,

        Long assigneeId,

        LocalDate dueDate
) {}

