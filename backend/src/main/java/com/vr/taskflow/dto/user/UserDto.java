package com.vr.taskflow.dto.user;

import java.time.LocalDateTime;
import java.util.Set;

public record UserDto(
        Long id,
        String username,
        String email,
        String fullName,
        String avatarUrl,
        boolean enabled,
        LocalDateTime createdAt,
        LocalDateTime lastLoginAt,
        Set<String> roles
) {}

