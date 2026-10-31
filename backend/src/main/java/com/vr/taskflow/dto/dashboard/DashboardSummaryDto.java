package com.vr.taskflow.dto.dashboard;

import com.vr.taskflow.enums.IssueStatus;
import com.vr.taskflow.enums.Priority;

import java.util.Map;

public record DashboardSummaryDto(
        long totalProjects,
        long totalIssues,
        long openIssues,
        long inProgressIssues,
        long resolvedIssues,
        long overdueIssues,
        Map<String, Long> issuesByStatus,
        Map<String, Long> issuesByPriority
) {}

