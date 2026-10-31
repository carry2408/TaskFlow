package com.vr.taskflow.dto.project;

import com.vr.taskflow.dto.team.TeamDto;
import com.vr.taskflow.dto.user.UserDto;
import com.vr.taskflow.enums.ProjectStatus;

import java.time.LocalDateTime;
import java.util.List;

public record ProjectDto(
        Long id,
        String name,
        String projectKey,
        String description,
        ProjectStatus status,
        UserDto leadUser,
        TeamDto team,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<ProjectMemberDto> members
) {
    public record ProjectMemberDto(UserDto user, String roleInProject, LocalDateTime joinedAt) {}
}

