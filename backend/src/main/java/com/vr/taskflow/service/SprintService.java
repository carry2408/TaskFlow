package com.vr.taskflow.service;

import com.vr.taskflow.constants.ErrorMessages;
import com.vr.taskflow.dto.issue.IssueDto;
import com.vr.taskflow.dto.sprint.CreateSprintRequest;
import com.vr.taskflow.dto.sprint.SprintDto;
import com.vr.taskflow.entity.Issue;
import com.vr.taskflow.entity.Project;
import com.vr.taskflow.entity.Sprint;
import com.vr.taskflow.exception.ApiException;
import com.vr.taskflow.exception.ResourceNotFoundException;
import com.vr.taskflow.mapper.IssueMapper;
import com.vr.taskflow.repository.IssueRepository;
import com.vr.taskflow.repository.ProjectRepository;
import com.vr.taskflow.repository.SprintRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final IssueMapper issueMapper;
    private final JdbcTemplate jdbcTemplate;

    public SprintService(SprintRepository sprintRepository,
                         ProjectRepository projectRepository,
                         IssueRepository issueRepository,
                         IssueMapper issueMapper,
                         JdbcTemplate jdbcTemplate) {
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
        this.issueMapper = issueMapper;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public SprintDto createSprint(Long projectId, CreateSprintRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROJECT_NOT_FOUND));

        if (request.endDate().isBefore(request.startDate())) {
            throw new ApiException("End date cannot be before start date", HttpStatus.BAD_REQUEST);
        }

        Sprint sprint = new Sprint(project, request.name().trim(), request.goal(), request.startDate(), request.endDate(), "PLANNED");
        Sprint saved = sprintRepository.save(sprint);

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SprintDto> getProjectSprints(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException(ErrorMessages.PROJECT_NOT_FOUND);
        }
        return sprintRepository.findByProjectIdOrderByStartDateDesc(projectId).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public SprintDto updateSprintStatus(Long sprintId, String status) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found"));

        String normalized = status.toUpperCase().trim();
        if (!List.of("PLANNED", "ACTIVE", "CLOSED").contains(normalized)) {
            throw new ApiException("Invalid sprint status. Must be PLANNED, ACTIVE, or CLOSED", HttpStatus.BAD_REQUEST);
        }

        sprint.setStatus(normalized);
        return mapToDto(sprintRepository.save(sprint));
    }

    @Transactional
    public void assignIssueToSprint(Long sprintId, Long issueId) {
        if (!sprintRepository.existsById(sprintId)) {
            throw new ResourceNotFoundException("Sprint not found");
        }
        if (!issueRepository.existsById(issueId)) {
            throw new ResourceNotFoundException(ErrorMessages.ISSUE_NOT_FOUND);
        }

        String checkSql = "SELECT COUNT(*) FROM sprint_issues WHERE sprint_id = ? AND issue_id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, sprintId, issueId);
        if (count != null && count > 0) {
            return;
        }

        String insertSql = "INSERT INTO sprint_issues (sprint_id, issue_id) VALUES (?, ?)";
        jdbcTemplate.update(insertSql, sprintId, issueId);
    }

    @Transactional
    public void removeIssueFromSprint(Long sprintId, Long issueId) {
        String deleteSql = "DELETE FROM sprint_issues WHERE sprint_id = ? AND issue_id = ?";
        jdbcTemplate.update(deleteSql, sprintId, issueId);
    }

    @Transactional(readOnly = true)
    public List<IssueDto> getSprintIssues(Long sprintId) {
        if (!sprintRepository.existsById(sprintId)) {
            throw new ResourceNotFoundException("Sprint not found");
        }

        String sql = "SELECT issue_id FROM sprint_issues WHERE sprint_id = ?";
        List<Long> issueIds = jdbcTemplate.queryForList(sql, Long.class, sprintId);
        if (issueIds.isEmpty()) {
            return List.of();
        }

        return issueRepository.findAllById(issueIds).stream()
                .map(issueMapper::toDto)
                .toList();
    }

    private SprintDto mapToDto(Sprint s) {
        return new SprintDto(
                s.getId(),
                s.getProject().getId(),
                s.getName(),
                s.getGoal(),
                s.getStartDate(),
                s.getEndDate(),
                s.getStatus(),
                s.getCreatedAt()
        );
    }
}

