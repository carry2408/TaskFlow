package com.vr.taskflow.repository;

import com.vr.taskflow.entity.Label;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LabelRepository extends JpaRepository<Label, Long> {

    Optional<Label> findByName(String name);

    boolean existsByName(String name);

    @Query(value = "SELECT l.* FROM labels l INNER JOIN issue_labels il ON l.id = il.label_id WHERE il.issue_id = :issueId", nativeQuery = true)
    List<Label> findLabelsByIssueId(@Param("issueId") Long issueId);
}

