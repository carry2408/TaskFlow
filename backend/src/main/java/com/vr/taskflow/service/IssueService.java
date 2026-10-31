package com.vr.taskflow.service;

import com.vr.taskflow.constants.ErrorMessages;
import com.vr.taskflow.dto.issue.CreateIssueRequest;
import com.vr.taskflow.dto.issue.IssueDto;
import com.vr.taskflow.dto.issue.IssueHistoryDto;
import com.vr.taskflow.dto.issue.UpdateIssueRequest;
import com.vr.taskflow.entity.Issue;
import com.vr.taskflow.entity.IssueHistory;
import com.vr.taskflow.entity.Project;
import com.vr.taskflow.entity.User;
import com.vr.taskflow.enums.IssueStatus;
import com.vr.taskflow.enums.Priority;
import com.vr.taskflow.exception.ApiException;
import com.vr.taskflow.exception.ResourceNotFoundException;
import com.vr.taskflow.mapper.IssueMapper;
import com.vr.taskflow.repository.IssueHistoryRepository;
import com.vr.taskflow.repository.IssueRepository;
import com.vr.taskflow.repository.ProjectRepository;
import com.vr.taskflow.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final IssueHistoryRepository issueHistoryRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final IssueMapper issueMapper;

    public IssueService(IssueRepository issueRepository,
                        IssueHistoryRepository issueHistoryRepository,
                        ProjectRepository projectRepository,
                        UserRepository userRepository,
                        IssueMapper issueMapper) {
        this.issueRepository = issueRepository;
        this.issueHistoryRepository = issueHistoryRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.issueMapper = issueMapper;
    }

    @Transactional
    public IssueDto createIssue(Long projectId, Long reporterId, CreateIssueRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.PROJECT_NOT_FOUND));

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter user not found"));

        User assignee = null;
        if (request.assigneeId() != null) {
            assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found"));
        }

        Issue issue = new Issue();
        issue.setProject(project);
        issue.setReporter(reporter);
        issue.setAssignee(assignee);
        issue.setTitle(request.title().trim());
        issue.setDescription(request.description());
        issue.setIssueType(request.issueType());
        issue.setPriority(request.priority() != null ? request.priority() : Priority.MEDIUM);
        issue.setStatus(IssueStatus.TO_DO);
        issue.setDueDate(request.dueDate());

        Issue saved = issueRepository.save(issue);

        recordHistory(saved, reporter, "issue", null, "Created");
        return issueMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public IssueDto getIssueById(Long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NOT_FOUND));
        return issueMapper.toDto(issue);
    }

    @Transactional(readOnly = true)
    public Page<IssueDto> getIssuesByProject(Long projectId, IssueStatus status, Pageable pageable) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException(ErrorMessages.PROJECT_NOT_FOUND);
        }

        Page<Issue> page = status != null
                ? issueRepository.findByProjectIdAndStatus(projectId, status, pageable)
                : issueRepository.findByProjectId(projectId, pageable);

        return page.map(issueMapper::toDto);
    }

    @Transactional
    public IssueDto updateIssue(Long issueId, Long modifierId, UpdateIssueRequest request) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NOT_FOUND));

        User modifier = userRepository.findById(modifierId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND));

        if (request.title() != null && !request.title().isBlank() && !request.title().equals(issue.getTitle())) {
            recordHistory(issue, modifier, "title", issue.getTitle(), request.title().trim());
            issue.setTitle(request.title().trim());
        }

        if (request.description() != null && !Objects.equals(request.description(), issue.getDescription())) {
            recordHistory(issue, modifier, "description", issue.getDescription(), request.description());
            issue.setDescription(request.description());
        }

        if (request.issueType() != null && request.issueType() != issue.getIssueType()) {
            recordHistory(issue, modifier, "issueType", issue.getIssueType().name(), request.issueType().name());
            issue.setIssueType(request.issueType());
        }

        if (request.priority() != null && request.priority() != issue.getPriority()) {
            recordHistory(issue, modifier, "priority", issue.getPriority().name(), request.priority().name());
            issue.setPriority(request.priority());
        }

        if (request.status() != null && request.status() != issue.getStatus()) {
            recordHistory(issue, modifier, "status", issue.getStatus().name(), request.status().name());
            issue.setStatus(request.status());
            if (request.status() == IssueStatus.DONE) {
                issue.setResolvedAt(LocalDateTime.now());
            } else {
                issue.setResolvedAt(null);
            }
        }

        if (request.assigneeId() != null) {
            Long oldAssigneeId = issue.getAssignee() != null ? issue.getAssignee().getId() : null;
            if (!Objects.equals(oldAssigneeId, request.assigneeId())) {
                User newAssignee = userRepository.findById(request.assigneeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found"));
                String oldName = issue.getAssignee() != null ? issue.getAssignee().getFullName() : "Unassigned";
                recordHistory(issue, modifier, "assignee", oldName, newAssignee.getFullName());
                issue.setAssignee(newAssignee);
            }
        }

        if (request.dueDate() != null && !Objects.equals(request.dueDate(), issue.getDueDate())) {
            recordHistory(issue, modifier, "dueDate", String.valueOf(issue.getDueDate()), String.valueOf(request.dueDate()));
            issue.setDueDate(request.dueDate());
        }

        Issue updated = issueRepository.save(issue);
        return issueMapper.toDto(updated);
    }

    @Transactional
    public IssueDto transitionStatus(Long issueId, Long modifierId, IssueStatus newStatus) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.ISSUE_NOT_FOUND));

        User modifier = userRepository.findById(modifierId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorMessages.USER_NOT_FOUND));

        if (issue.getStatus() == newStatus) {
            return issueMapper.toDto(issue);
        }

        recordHistory(issue, modifier, "status", issue.getStatus().name(), newStatus.name());
        issue.setStatus(newStatus);
        if (newStatus == IssueStatus.DONE) {
            issue.setResolvedAt(LocalDateTime.now());
        } else {
            issue.setResolvedAt(null);
        }

        return issueMapper.toDto(issueRepository.save(issue));
    }

    @Transactional(readOnly = true)
    public List<IssueHistoryDto> getIssueHistory(Long issueId) {
        if (!issueRepository.existsById(issueId)) {
            throw new ResourceNotFoundException(ErrorMessages.ISSUE_NOT_FOUND);
        }
        return issueHistoryRepository.findAllByIssueIdWithUser(issueId).stream()
                .map(issueMapper::toHistoryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<IssueDto> searchAndFilterIssues(com.vr.taskflow.dto.issue.IssueFilterRequest filter, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Issue> spec = com.vr.taskflow.specification.IssueSpecification.filter(filter);
        return issueRepository.findAll(spec, pageable).map(issueMapper::toDto);
    }

    private void recordHistory(Issue issue, User modifier, String field, String oldVal, String newVal) {
        IssueHistory history = new IssueHistory(issue, modifier, field, oldVal, newVal);
        issueHistoryRepository.save(history);
    }
}
