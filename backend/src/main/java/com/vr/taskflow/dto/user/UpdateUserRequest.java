package com.vr.taskflow.dto.user;

import jakarta.validation.constraints.Size;

public record UpdateUserRequest(

        @Size(max = 150, message = "Full name must not exceed 150 characters")
        String fullName,

        @Size(max = 255, message = "Avatar URL must not exceed 255 characters")
        String avatarUrl,

        @Size(min = 8, message = "Password must be at least 8 characters if provided")
        String newPassword
) {}

