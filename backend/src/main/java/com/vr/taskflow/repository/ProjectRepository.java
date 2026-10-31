package com.vr.taskflow.repository;

import com.vr.taskflow.entity.Project;
import com.vr.taskflow.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findByProjectKey(String projectKey);

    boolean existsByProjectKey(String projectKey);

    Page<Project> findByStatus(ProjectStatus status, Pageable pageable);

    Page<Project> findByTeamId(Long teamId, Pageable pageable);

    Page<Project> findByStatusAndTeamId(ProjectStatus status, Long teamId, Pageable pageable);
}

