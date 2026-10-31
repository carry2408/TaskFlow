package com.vr.taskflow.repository;

import com.vr.taskflow.entity.Issue;
import com.vr.taskflow.enums.IssueStatus;
import com.vr.taskflow.enums.IssueType;
import com.vr.taskflow.enums.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long>, JpaSpecificationExecutor<Issue> {

    Page<Issue> findByProjectId(Long projectId, Pageable pageable);

    Page<Issue> findByAssigneeId(Long assigneeId, Pageable pageable);

    Page<Issue> findByProjectIdAndStatus(Long projectId, IssueStatus status, Pageable pageable);

    long countByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, IssueStatus status);

    long countByProjectIdAndAssigneeId(Long projectId, Long assigneeId);

    @Query("SELECT i.status, COUNT(i) FROM Issue i WHERE i.project.id = :projectId GROUP BY i.status")
    List<Object[]> countIssuesByStatusForProject(@Param("projectId") Long projectId);

    @Query("SELECT i.assignee.id, COUNT(i) FROM Issue i WHERE i.project.id = :projectId AND i.assignee IS NOT NULL GROUP BY i.assignee.id")
    List<Object[]> countIssuesByAssigneeForProject(@Param("projectId") Long projectId);
}

