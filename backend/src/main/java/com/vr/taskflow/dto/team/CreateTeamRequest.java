package com.vr.taskflow.dto.team;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTeamRequest(

        @NotBlank(message = "Team name is required")
        @Size(max = 150, message = "Team name must not exceed 150 characters")
        String name,

        String description,

        @NotNull(message = "Lead user ID is required")
        Long leadUserId
) {}

