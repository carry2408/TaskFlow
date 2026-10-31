package com.vr.taskflow.repository;

import com.vr.taskflow.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("SELECT c FROM Comment c JOIN FETCH c.author WHERE c.issue.id = :issueId ORDER BY c.createdAt ASC")
    List<Comment> findAllByIssueIdWithAuthor(@Param("issueId") Long issueId);

    Page<Comment> findByIssueId(Long issueId, Pageable pageable);
}

