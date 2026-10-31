package com.vr.taskflow.dto.project;

import com.vr.taskflow.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateProjectRequest(

        @NotBlank(message = "Project name is required")
        @Size(max = 150, message = "Project name must not exceed 150 characters")
        String name,

        @Pattern(regexp = "^[A-Z0-9]{2,10}$", message = "Project key must be 2-10 uppercase alphanumeric characters")
        String projectKey,

        String description,

        ProjectStatus status,

        @NotNull(message = "Lead user ID is required")
        Long leadUserId,

        Long teamId
) {}

