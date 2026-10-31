package com.vr.taskflow.dto.team;

import com.vr.taskflow.dto.user.UserDto;

import java.time.LocalDateTime;
import java.util.List;

public record TeamDto(
        Long id,
        String name,
        String description,
        UserDto leadUser,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<UserDto> members
) {}

