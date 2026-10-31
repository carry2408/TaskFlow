package com.vr.taskflow.mapper;

import com.vr.taskflow.dto.team.TeamDto;
import com.vr.taskflow.dto.user.UserDto;
import com.vr.taskflow.entity.Team;
import com.vr.taskflow.entity.TeamMember;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TeamMapper {

    private final UserMapper userMapper;

    public TeamMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public TeamDto toDto(Team team) {
        return toDto(team, List.of());
    }

    public TeamDto toDto(Team team, List<TeamMember> members) {
        if (team == null) {
            return null;
        }

        UserDto leadDto = userMapper.toDto(team.getLeadUser());
        List<UserDto> memberDtos = members == null ? List.of() :
                members.stream()
                        .map(tm -> userMapper.toDto(tm.getUser()))
                        .toList();

        return new TeamDto(
                team.getId(),
                team.getName(),
                team.getDescription(),
                leadDto,
                team.getCreatedAt(),
                team.getUpdatedAt(),
                memberDtos
        );
    }
}

