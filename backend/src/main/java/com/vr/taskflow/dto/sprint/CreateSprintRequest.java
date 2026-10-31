package com.vr.taskflow.dto.sprint;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateSprintRequest(

        @NotBlank(message = "Sprint name is required")
        @Size(max = 150, message = "Sprint name must not exceed 150 characters")
        String name,

        String goal,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate
) {}

