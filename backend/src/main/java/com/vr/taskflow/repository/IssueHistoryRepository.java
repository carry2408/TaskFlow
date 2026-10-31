package com.vr.taskflow.repository;

import com.vr.taskflow.entity.IssueHistory;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IssueHistoryRepository extends JpaRepository<IssueHistory, Long> {

    @Query("SELECT ih FROM IssueHistory ih JOIN FETCH ih.changedBy WHERE ih.issue.id = :issueId ORDER BY ih.createdAt DESC")
    List<IssueHistory> findAllByIssueIdWithUser(@Param("issueId") Long issueId);
}

