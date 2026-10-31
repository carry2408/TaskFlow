package com.vr.taskflow.service;

import com.vr.taskflow.dto.dashboard.DashboardSummaryDto;
import com.vr.taskflow.enums.IssueStatus;
import com.vr.taskflow.repository.IssueRepository;
import com.vr.taskflow.repository.ProjectRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final JdbcTemplate jdbcTemplate;

    public DashboardService(ProjectRepository projectRepository,
                            IssueRepository issueRepository,
                            JdbcTemplate jdbcTemplate) {
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getGlobalDashboard() {
        long totalProjects = projectRepository.count();
        long totalIssues = issueRepository.count();

        String statusQuery = "SELECT status, COUNT(*) FROM issues GROUP BY status";
        Map<String, Long> issuesByStatus = new HashMap<>();
        jdbcTemplate.query(statusQuery, rs -> {
            issuesByStatus.put(rs.getString(1), rs.getLong(2));
        });

        String priorityQuery = "SELECT priority, COUNT(*) FROM issues GROUP BY priority";
        Map<String, Long> issuesByPriority = new HashMap<>();
        jdbcTemplate.query(priorityQuery, rs -> {
            issuesByPriority.put(rs.getString(1), rs.getLong(2));
        });

        long openIssues = issuesByStatus.getOrDefault(IssueStatus.TO_DO.name(), 0L);
        long inProgressIssues = issuesByStatus.getOrDefault(IssueStatus.IN_PROGRESS.name(), 0L)
                + issuesByStatus.getOrDefault(IssueStatus.IN_REVIEW.name(), 0L);
        long resolvedIssues = issuesByStatus.getOrDefault(IssueStatus.DONE.name(), 0L);

        String overdueQuery = "SELECT COUNT(*) FROM issues WHERE due_date < ? AND status != 'DONE'";
        Long overdueIssues = jdbcTemplate.queryForObject(overdueQuery, Long.class, LocalDate.now());
        if (overdueIssues == null) {
            overdueIssues = 0L;
        }

        return new DashboardSummaryDto(
                totalProjects,
                totalIssues,
                openIssues,
                inProgressIssues,
                resolvedIssues,
                overdueIssues,
                issuesByStatus,
                issuesByPriority
        );
    }
}

