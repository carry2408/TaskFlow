package com.vr.taskflow.repository;

import com.vr.taskflow.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    @Query("SELECT a FROM Attachment a JOIN FETCH a.uploadedBy WHERE a.issue.id = :issueId")
    List<Attachment> findAllByIssueIdWithUser(@Param("issueId") Long issueId);
}

