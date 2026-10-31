package com.vr.taskflow.mapper;

import com.vr.taskflow.dto.issue.IssueDto;
import com.vr.taskflow.dto.issue.IssueHistoryDto;
import com.vr.taskflow.entity.Issue;
import com.vr.taskflow.entity.IssueHistory;
import org.springframework.stereotype.Component;

@Component
public class IssueMapper {

    private final UserMapper userMapper;

    public IssueMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public IssueDto toDto(Issue issue) {
        if (issue == null) {
            return null;
        }

        return new IssueDto(
                issue.getId(),
                issue.getProject().getId(),
                issue.getProject().getProjectKey(),
                issue.getProject().getName(),
                userMapper.toDto(issue.getReporter()),
                issue.getAssignee() != null ? userMapper.toDto(issue.getAssignee()) : null,
                issue.getTitle(),
                issue.getDescription(),
                issue.getIssueType(),
                issue.getPriority(),
                issue.getStatus(),
                issue.getDueDate(),
                issue.getCreatedAt(),
                issue.getUpdatedAt(),
                issue.getResolvedAt()
        );
    }

    public IssueHistoryDto toHistoryDto(IssueHistory history) {
        if (history == null) {
            return null;
        }

        return new IssueHistoryDto(
                history.getId(),
                history.getIssue().getId(),
                userMapper.toDto(history.getChangedBy()),
                history.getFieldName(),
                history.getOldValue(),
                history.getNewValue(),
                history.getCreatedAt()
        );
    }
}

