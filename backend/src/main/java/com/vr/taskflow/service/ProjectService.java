package com.vr.taskflow.service;

import com.vr.taskflow.constants.ErrorMessages;
import com.vr.taskflow.dto.project.CreateProjectRequest;
import com.vr.taskflow.dto.project.ProjectDto;
import com.vr.taskflow.entity.Project;
import com.vr.taskflow.entity.ProjectMember;
import com.vr.taskflow.entity.Team;
import com.vr.taskflow.entity.User;
import com.vr.taskflow.enums.ProjectStatus;
import com.vr.taskflow.exception.ApiException;
import com.vr.taskflow.exception.ResourceNotFoundException;
import com.vr.taskflow.mapper.ProjectMapper;
import com.vr.taskflow.repository.ProjectMemberRepository;
import com.vr.taskflow.repository.ProjectRepository;
import com.vr.taskflow.repository.TeamRepository;
import com.vr.taskflow.repository.UserRepository;
import com.vr.taskflow.util.ProjectKeyGenerator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final ProjectMapper projectMapper;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectMemberRepository projectMemberRepository,
                          UserRepository userRepository,
                          TeamRepository teamRepository,
                          ProjectMapper projectMapper) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.projectMapper = projectMapper;
    }

    @Transactional
    public ProjectDto createProject(CreateProjectRequest request) {
        String key = request.projectKey();
        if (key == null || key.isBlank()) {
            key = ProjectKeyGenerator.generateKey(request.name());
        } else {
            key = key.trim().toUpperCase();
        }

        if (projectRepository.existsByProjectKey(key)) {
            throw new ApiException(ErrorMessages.DUPLICATE_PROJECT_KEY, HttpStatus.CONFLICT);
        }

        User lead = userRepository.findById(request.leadUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Lead user not found"));

        Team team = null;
        if (request.teamId() != null) {
            team = teamRepository.findById(request.teamId())
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.TEAM_NOT_FOUND));
        }

        Project project = new Project();
        project.setName(request.name().trim());
        project.setProjectKey(key);
        project.setDescription(request.description());
        project.setStatus(request.status() != null ? request.status() : ProjectStatus.ACTIVE);
        project.setLeadUser(lead);
        project.setTeam(team);

        Project saved = projectRepository.save(project);

        ProjectMember leadMembership = new ProjectMember(saved, lead, "OWNER");
        projectMemberRepository.save(leadMembership);

        return projectMapper.toDto(saved, List.of(leadMembership));
    }

    @Transactional(readOnly = true)
    public ProjectDto getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROJECT_NOT_FOUND));
        List<ProjectMember> members = projectMemberRepository.findAllByProjectIdWithUser(projectId);
        return projectMapper.toDto(project, members);
    }

    @Transactional(readOnly = true)
    public Page<ProjectDto> getProjects(ProjectStatus status, Long teamId, Pageable pageable) {
        Page<Project> page;
        if (status != null && teamId != null) {
            page = projectRepository.findByStatusAndTeamId(status, teamId, pageable);
        } else if (status != null) {
            page = projectRepository.findByStatus(status, pageable);
        } else if (teamId != null) {
            page = projectRepository.findByTeamId(teamId, pageable);
        } else {
            page = projectRepository.findAll(pageable);
        }
        return page.map(projectMapper::toDto);
    }

    @Transactional
    public ProjectDto updateProject(Long projectId, CreateProjectRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROJECT_NOT_FOUND));

        User lead = userRepository.findById(request.leadUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Lead user not found"));

        Team team = null;
        if (request.teamId() != null) {
            team = teamRepository.findById(request.teamId())
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.TEAM_NOT_FOUND));
        }

        project.setName(request.name().trim());
        project.setDescription(request.description());
        if (request.status() != null) {
            project.setStatus(request.status());
        }
        project.setLeadUser(lead);
        project.setTeam(team);

        Project updated = projectRepository.save(project);
        List<ProjectMember> members = projectMemberRepository.findAllByProjectIdWithUser(projectId);
        return projectMapper.toDto(updated, members);
    }

    @Transactional
    public void addMember(Long projectId, Long userId, String roleInProject) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROJECT_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND));

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ApiException(ErrorMessages.USER_ALREADY_PROJECT_MEMBER, HttpStatus.CONFLICT);
        }

        ProjectMember member = new ProjectMember(project, user, roleInProject == null ? "MEMBER" : roleInProject);
        projectMemberRepository.save(member);
    }

    @Transactional
    public void removeMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROJECT_NOT_FOUND));

        if (project.getLeadUser().getId().equals(userId)) {
            throw new ApiException("Cannot remove project lead from project", HttpStatus.BAD_REQUEST);
        }

        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ResourceNotFoundException(ErrorMessages.USER_NOT_PROJECT_MEMBER);
        }

        projectMemberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }
}

