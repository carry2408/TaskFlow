package com.vr.taskflow.mapper;

import com.vr.taskflow.dto.project.ProjectDto;
import com.vr.taskflow.entity.Project;
import com.vr.taskflow.entity.ProjectMember;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProjectMapper {

    private final UserMapper userMapper;
    private final TeamMapper teamMapper;

    public ProjectMapper(UserMapper userMapper, TeamMapper teamMapper) {
        this.userMapper = userMapper;
        this.teamMapper = teamMapper;
    }

    public ProjectDto toDto(Project project) {
        return toDto(project, List.of());
    }

    public ProjectDto toDto(Project project, List<ProjectMember> members) {
        if (project == null) {
            return null;
        }

        List<ProjectDto.ProjectMemberDto> memberDtos = members == null ? List.of() :
                members.stream()
                        .map(pm -> new ProjectDto.ProjectMemberDto(
                                userMapper.toDto(pm.getUser()),
                                pm.getRoleInProject(),
                                pm.getJoinedAt()
                        ))
                        .toList();

        return new ProjectDto(
                project.getId(),
                project.getName(),
                project.getProjectKey(),
                project.getDescription(),
                project.getStatus(),
                userMapper.toDto(project.getLeadUser()),
                project.getTeam() == null ? null : teamMapper.toDto(project.getTeam()),
                project.getCreatedAt(),
                project.getUpdatedAt(),
                memberDtos
        );
    }
}

