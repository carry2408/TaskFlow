package com.vr.taskflow.service;

import com.vr.taskflow.constants.ErrorMessages;
import com.vr.taskflow.dto.team.CreateTeamRequest;
import com.vr.taskflow.dto.team.TeamDto;
import com.vr.taskflow.dto.user.UserDto;
import com.vr.taskflow.entity.Team;
import com.vr.taskflow.entity.TeamMember;
import com.vr.taskflow.entity.User;
import com.vr.taskflow.exception.ApiException;
import com.vr.taskflow.exception.ResourceNotFoundException;
import com.vr.taskflow.mapper.TeamMapper;
import com.vr.taskflow.mapper.UserMapper;
import com.vr.taskflow.repository.TeamMemberRepository;
import com.vr.taskflow.repository.TeamRepository;
import com.vr.taskflow.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final TeamMapper teamMapper;
    private final UserMapper userMapper;

    public TeamService(TeamRepository teamRepository,
                       TeamMemberRepository teamMemberRepository,
                       UserRepository userRepository,
                       TeamMapper teamMapper,
                       UserMapper userMapper) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
        this.teamMapper = teamMapper;
        this.userMapper = userMapper;
    }

    @Transactional
    public TeamDto createTeam(CreateTeamRequest request) {
        if (teamRepository.existsByName(request.name())) {
            throw new ApiException("Team name already exists", HttpStatus.CONFLICT);
        }

        User leadUser = userRepository.findById(request.leadUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Lead user not found"));

        Team team = new Team();
        team.setName(request.name().trim());
        team.setDescription(request.description());
        team.setLeadUser(leadUser);

        Team savedTeam = teamRepository.save(team);

        TeamMember leadMembership = new TeamMember(savedTeam, leadUser);
        teamMemberRepository.save(leadMembership);

        return teamMapper.toDto(savedTeam, List.of(leadMembership));
    }

    @Transactional(readOnly = true)
    public TeamDto getTeamById(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.TEAM_NOT_FOUND));
        List<TeamMember> members = teamMemberRepository.findAllByTeamIdWithUser(teamId);
        return teamMapper.toDto(team, members);
    }

    @Transactional(readOnly = true)
    public Page<TeamDto> getAllTeams(Pageable pageable) {
        return teamRepository.findAll(pageable).map(teamMapper::toDto);
    }

    @Transactional
    public TeamDto updateTeam(Long teamId, CreateTeamRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.TEAM_NOT_FOUND));

        if (!team.getName().equals(request.name()) && teamRepository.existsByName(request.name())) {
            throw new ApiException("Team name already exists", HttpStatus.CONFLICT);
        }

        User leadUser = userRepository.findById(request.leadUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Lead user not found"));

        team.setName(request.name().trim());
        team.setDescription(request.description());
        team.setLeadUser(leadUser);

        Team updatedTeam = teamRepository.save(team);
        List<TeamMember> members = teamMemberRepository.findAllByTeamIdWithUser(teamId);
        return teamMapper.toDto(updatedTeam, members);
    }

    @Transactional
    public void deleteTeam(Long teamId) {
        if (!teamRepository.existsById(teamId)) {
            throw new ResourceNotFoundException(ErrorMessages.TEAM_NOT_FOUND);
        }
        teamRepository.deleteById(teamId);
    }

    @Transactional
    public void addMember(Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.TEAM_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND));

        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new ApiException(ErrorMessages.USER_ALREADY_TEAM_MEMBER, HttpStatus.CONFLICT);
        }

        TeamMember teamMember = new TeamMember(team, user);
        teamMemberRepository.save(teamMember);
    }

    @Transactional
    public void removeMember(Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.TEAM_NOT_FOUND));

        if (team.getLeadUser().getId().equals(userId)) {
            throw new ApiException("Cannot remove the team lead from the team", HttpStatus.BAD_REQUEST);
        }

        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new ResourceNotFoundException("User is not a member of this team");
        }

        teamMemberRepository.deleteByTeamIdAndUserId(teamId, userId);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getTeamMembers(Long teamId) {
        if (!teamRepository.existsById(teamId)) {
            throw new ResourceNotFoundException(ErrorMessages.TEAM_NOT_FOUND);
        }
        return teamMemberRepository.findAllByTeamIdWithUser(teamId).stream()
                .map(tm -> userMapper.toDto(tm.getUser()))
                .toList();
    }
}

